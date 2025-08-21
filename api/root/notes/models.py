from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required


class AddNotes(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        note_id = inputData.get("id")  # This will be None if not passed

        if inputData.get("editing") and note_id:
            # UPDATE note
            DBHelper.update_one(
                table_name="sticky_notes",
                filters={"id": note_id, "user_id": uid},
                updates={
                    "title": inputData.get("title", ""),
                    "description": inputData.get("description", ""),
                    "reminder_date": inputData.get("reminderDate", ""),
                    "status": inputData.get("status", 0),
                },
            )
            return {"status": 1, "message": "Note updated successfully", "payload": {}}
        else:
            # INSERT new note
            DBHelper.insert(
                "sticky_notes",
                user_id=uid,
                title=inputData.get("title", ""),
                description=inputData.get("description", ""),
                reminder_date=inputData.get("reminderDate", ""),
                status=inputData.get("status", 0),
            )
            return {"status": 1, "message": "Note added successfully", "payload": {}}


class GetNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        notes = DBHelper.find_all(
            table_name="sticky_notes",
            filters={"user_id": uid},
            select_fields=["title", "description", "reminder_date", "status", "id"],
        )
        user_notes = []
        for note in notes:
            user_notes.append(
                {
                    "title": note["title"],
                    "description": note["description"],
                    "reminderDate": note["reminder_date"].isoformat(),
                    "status": note["status"],
                    "id": note["id"],
                }
            )
        return {
            "status": 1,
            "message": "Notes fetched successfully",
            "payload": {"notes": user_notes},
        }
