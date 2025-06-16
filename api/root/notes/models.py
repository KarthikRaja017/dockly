from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required


class AddNotes(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        id = inputData.get("id", None)
        if id:
            DBHelper.update_one(
                table_name="stickynotes",
                filters={"id": id, "user_id": uid},
                updates={
                    "title": inputData.get("title", ""),
                    "description": inputData.get("description", ""),
                    "reminder_date": inputData.get("reminderDate", ""),
                    "status": inputData.get("status", 0),
                },
            )
            return {"status": 1, "message": "Notes Updated Successfully", "payload": {}}
        else:
            user_id = DBHelper.insert(
                "stickynotes",
                return_column="user_id",
                user_id=uid,
                title=inputData.get("title", ""),
                description=inputData.get("description", ""),
                reminder_date=inputData.get("reminderDate", ""),
                status=inputData.get("status", 0),
            )
            return {"status": 1, "message": "Notes Added Succefully", "payload": {}}


class GetNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        notes = DBHelper.find_all(
            table_name="stickynotes",
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
