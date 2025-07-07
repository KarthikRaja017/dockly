# import re
# import uuid
# from datetime import datetime, time
# from flask import request
# from flask_restful import Resource
# import pytz

# # from root.google.models import extract_datetime_us
# from root.common import GoalStatus, Priority, Status
# from root.utilis import uniqueId
# from root.db.dbHelper import DBHelper
# from dateparser.search import search_dates

# from root.auth.auth import auth_required


# def extract_datetime(text: str, now=None) -> str:
#     ist = pytz.timezone("Asia/Kolkata")
#     now = now or datetime.now(ist)

#     def to_ist_iso(dt: datetime) -> str:
#         return dt.astimezone(ist).replace(microsecond=0).isoformat()

#     def extract_time_manually(text: str) -> time | None:
#         match = re.search(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", text, re.IGNORECASE)
#         if match:
#             hour = int(match.group(1))
#             minute = int(match.group(2) or 0)
#             meridian = match.group(3).lower()
#             if meridian == "pm" and hour != 12:
#                 hour += 12
#             if meridian == "am" and hour == 12:
#                 hour = 0
#             return time(hour, minute)
#         return None

#     # Step 1: Try search_dates (for full datetime matches)
#     results = search_dates(
#         text,
#         settings={
#             "PREFER_DATES_FROM": "future",
#             "RELATIVE_BASE": now,
#             "TIMEZONE": "Asia/Kolkata",
#             "TO_TIMEZONE": "Asia/Kolkata",
#             "RETURN_AS_TIMEZONE_AWARE": True,
#         },
#     )

#     if results:
#         results = sorted(results, key=lambda x: len(x[0]), reverse=True)
#         matched_text, parsed_dt = results[0]
#         parsed_dt = parsed_dt.astimezone(ist)

#         # Handle "only time" (like "10pm") by combining with today's date
#         if re.fullmatch(
#             r"(at\s*)?\d{1,2}(:\d{2})?\s*(am|pm)", matched_text.strip(), re.IGNORECASE
#         ):
#             manual_time = extract_time_manually(matched_text)
#             if manual_time:
#                 parsed_dt = ist.localize(datetime.combine(now.date(), manual_time))

#         return to_ist_iso(parsed_dt)

#     # Step 2: If search_dates fails but there's a time manually
#     manual_time = extract_time_manually(text)
#     if manual_time:
#         parsed_dt = ist.localize(datetime.combine(now.date(), manual_time))
#         return to_ist_iso(parsed_dt)

#     # Step 3: fallback to current time
#     return to_ist_iso(now)


# def extract_datetime_us(text: str, now=None) -> str:
#     detroit_tz = pytz.timezone("America/Detroit")
#     now = now or datetime.now(detroit_tz)

#     def to_us_iso(dt: datetime) -> str:
#         return dt.astimezone(detroit_tz).replace(microsecond=0).isoformat()

#     def extract_time_manually(text: str) -> time | None:
#         match = re.search(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", text, re.IGNORECASE)
#         if match:
#             hour = int(match.group(1))
#             minute = int(match.group(2) or 0)
#             meridian = match.group(3).lower()
#             if meridian == "pm" and hour != 12:
#                 hour += 12
#             if meridian == "am" and hour == 12:
#                 hour = 0
#             return time(hour, minute)
#         return None

#     # Step 1: Try search_dates (for full datetime matches)
#     results = search_dates(
#         text,
#         settings={
#             "PREFER_DATES_FROM": "future",
#             "RELATIVE_BASE": now,
#             "TIMEZONE": "America/Detroit",
#             "TO_TIMEZONE": "America/Detroit",
#             "RETURN_AS_TIMEZONE_AWARE": True,
#         },
#     )

#     if results:
#         results = sorted(results, key=lambda x: len(x[0]), reverse=True)
#         matched_text, parsed_dt = results[0]
#         parsed_dt = parsed_dt.astimezone(detroit_tz)

#         # Handle "only time" (like "10pm") by combining with today's date
#         if re.fullmatch(
#             r"(at\s*)?\d{1,2}(:\d{2})?\s*(am|pm)", matched_text.strip(), re.IGNORECASE
#         ):
#             manual_time = extract_time_manually(matched_text)
#             if manual_time:
#                 parsed_dt = detroit_tz.localize(
#                     datetime.combine(now.date(), manual_time)
#                 )

#         return to_us_iso(parsed_dt)

#     # Step 2: If search_dates fails but there's a time manually
#     manual_time = extract_time_manually(text)
#     if manual_time:
#         parsed_dt = detroit_tz.localize(datetime.combine(now.date(), manual_time))
#         return to_us_iso(parsed_dt)

#     # Step 3: fallback to current time
#     return to_us_iso(now)


# # Event Resources
# class AddEvents(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         inputData = request.get_json(silent=True)
#         id = inputData.get("id", None)

#         event_data = {
#             "id": id or str(uuid.uuid4()),
#             "user_id": uid,  # ✅ Ensure user_id is included
#             "title": inputData.get("title", ""),
#             "description": inputData.get("description", ""),
#             "time": inputData.get("time", ""),
#             "type": inputData.get("type", ""),
#             "date": inputData.get("date", ""),
#             "status": inputData.get("status", "Yet to Start"),
#         }

#         if id:
#             # Update if ID exists
#             DBHelper.update_one(
#                 table_name="events",
#                 filters={"id": id, "user_id": uid},
#                 updates=event_data,
#             )
#             message = "Event Updated Successfully"
#         else:
#             # Insert new event
#             DBHelper.insert("events", return_column="id", **event_data)
#             message = "Event Added Successfully"

#         return {"status": 1, "message": message, "payload": {}}


# class GetEvents(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         events = DBHelper.find_all(
#             table_name="events",
#             filters={"user_id": uid},
#             select_fields=[
#                 "id",
#                 "title",
#                 "description",
#                 "time",
#                 "type",
#                 "date",
#                 "status",
#             ],
#         )
#         user_events = []
#         for event in events:
#             user_events.append(
#                 {
#                     "id": event["id"],
#                     "title": event["title"],
#                     "description": event["description"],
#                     "time": event["time"],
#                     "type": event["type"],
#                     "date": event["date"].isoformat() if event["date"] else None,
#                     "status": event["status"],
#                 }
#             )
#         return {
#             "status": 1,
#             "message": "Events fetched successfully",
#             "payload": {"events": user_events},
#         }


# class UpdateEvents(Resource):
#     @auth_required(isOptional=True)
#     def put(self, uid, user, event_id):
#         inputData = request.get_json(silent=True)
#         DBHelper.update_one(
#             table_name="events",
#             filters={"id": event_id, "user_id": uid},
#             updates={
#                 "title": inputData.get("title", ""),
#                 "description": inputData.get("description", ""),
#                 "time": inputData.get("time", ""),
#                 "type": inputData.get("type", ""),
#                 "date": inputData.get("date", ""),
#                 "status": inputData.get("status", "Yet to Start"),
#             },
#         )
#         return {"status": 1, "message": "Event Updated Successfully", "payload": {}}


# class DeleteEvents(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user, event_id):
#         DBHelper.delete_one(
#             table_name="events", filters={"id": event_id, "user_id": uid}
#         )
#         return {"status": 1, "message": "Event Deleted Successfully", "payload": {}}


# # Goal Resources


# class AddWeeklyGoals(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         inputData = request.get_json(silent=True)
#         weakly_goal = inputData.get("weeklyGoal", "")
#         id = uniqueId(digit=8, isNum=True)
#         goal = {
#             "id": id,
#             "user_id": uid,
#             "goal": weakly_goal.get("goal", ""),
#             "date": weakly_goal.get("date", ""),
#             "time": weakly_goal.get("time", ""),
#             "priority": Priority.LOW.value,
#             "goal_status": GoalStatus.YET_TO_START.value,
#             "status": Status.ACTIVE.value,
#         }
#         DBHelper.insert(
#             "goals",
#             return_column="id",
#             **goal,
#         )
#         return {"status": 1, "message": "Weekly Goal Added Successfully", "payload": {}}


# class GetWeeklyGoals(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         goals = []
#         weekly_goals = DBHelper.find_one(
#             table_name="goals",
#             filters={"user_id": uid, "status": Status.ACTIVE.value},
#             select_fields=[
#                 "id",
#                 "goal",
#                 "date",
#                 "time",
#                 "priority",
#                 "goal_status",
#             ],
#         )

#         for goal in weekly_goals:
#             goals.append(
#                 {
#                     "id": goal["id"],
#                     "goal": goal["goal"],
#                     "date": goal["date"].isoformat() if goal["date"] else None,
#                     "time": goal["time"],
#                     "priority": goal["priority"],
#                     "goal_status": goal["goal_status"],
#                 }
#             )

#         return {
#             "status": 1,
#             "message": "Weekly Goals fetched successfully",
#             "payload": {"goals": goals},
#         }


# # class AddGoals(Resource):
# #     @auth_required(isOptional=True)
# #     def post(self, uid, user):
# #         inputData = request.get_json(silent=True)
# #         id = inputData.get("id", None)
# #         if id:
# #             DBHelper.update_one(
# #                 table_name='goals',
# #                 filters={'id': id, 'user_id': uid},
# #                 updates={
# #                     'title': inputData.get("title", ""),
# #                     'description': inputData.get("description", ""),
# #                     'date': inputData.get("date", ""),
# #                     'status': inputData.get("status", "Yet to Start")
# #                 }
# #             )
# #             return {
# #                 "status": 1,
# #                 "message": "Goal Updated Successfully",
# #                 "payload": {}
# #             }
# #         else:
# #             DBHelper.insert(
# #                 'goals',
# #                 return_column='id',
# #                 user_id=uid,
# #                 id=inputData.get("id", str(uuid.uuid4())),
# #                 title=inputData.get("title", ""),
# #                 description=inputData.get("description", ""),
# #                 date=inputData.get("date", ""),
# #                 status=inputData.get("status", "Yet to Start")
# #             )
# #             return {
# #                 "status": 1,
# #                 "message": "Goal Added Successfully",
# #                 "payload": {}
# #             }


# class GetGoals(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         goals = DBHelper.find_all(
#             table_name="goals",
#             filters={"user_id": uid},
#             select_fields=["id", "title", "goal", "date", "status"],
#         )
#         user_goals = []
#         for goal in goals:
#             user_goals.append(
#                 {
#                     "id": goal["id"],
#                     "title": goal["title"],
#                     "goal": goal["description"],
#                     "date": goal["date"].isoformat() if goal["date"] else None,
#                     "status": goal["status"],
#                 }
#             )
#         # print(f"user_goals: {user_goals}")
#         return {
#             "status": 1,
#             "message": "Goals fetched successfully",
#             "payload": {"goals": user_goals},
#         }


# class UpdateGoals(Resource):
#     @auth_required(isOptional=True)
#     def put(self, uid, user, goal_id):
#         inputData = request.get_json(silent=True)
#         DBHelper.update_one(
#             table_name="goals",
#             filters={"id": goal_id, "user_id": uid},
#             updates={
#                 "title": inputData.get("title", ""),
#                 "goal": inputData.get("description", ""),
#                 "date": inputData.get("date", ""),
#                 "status": inputData.get("status", "Yet to Start"),
#             },
#         )
#         return {"status": 1, "message": "Goal Updated Successfully", "payload": {}}


# class DeleteGoals(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user, goal_id):
#         DBHelper.delete_one(table_name="goals", filters={"id": goal_id, "user_id": uid})
#         return {"status": 1, "message": "Goal Deleted Successfully", "payload": {}}


# # Todo Resources
# class AddTodos(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         inputData = request.get_json(silent=True)
#         print(f"==>> Received inputData for Todo: {inputData}")

#         if not inputData:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         id = inputData.get("id", str(uuid.uuid4()))
#         text = inputData.get("text", "")
#         completed = inputData.get("completed", False)
#         priority = inputData.get("priority", "medium")

#         todo_data = {
#             "id": id,
#             "user_id": uid,
#             # 'title': text,  # Map text to title
#             # 'completed': completed,
#             "priority": priority,
#             "date": datetime.now().isoformat(),  # Use current time as default
#             "status": inputData.get("status", "Yet to Start"),
#         }

#         try:
#             DBHelper.insert("todos", return_column="id", **todo_data)
#             print(f"==>> Inserted new Todo with id: {id}")
#             return {
#                 "status": 1,
#                 "message": "Todo Added Successfully",
#                 "payload": {
#                     "todo": {
#                         "id": id,
#                         "text": text,
#                         # "completed": completed,
#                         "priority": priority,
#                     }
#                 },
#             }
#         except Exception as e:
#             print(f"==>> Error in AddTodos: {e}")
#             return {
#                 "status": 0,
#                 "message": "Something went wrong while adding the todo.",
#                 "payload": {},
#             }


# # class AddTodos(Resource):
# #     @auth_required(isOptional=True)
# #     def post(self, uid, user):
# #         inputData = request.get_json(silent=True)
# #         id = inputData.get("id", None)
# #         if id:
# #             DBHelper.update_one(
# #                 table_name='todos',
# #                 filters={'id': id, 'user_id': uid},
# #                 updates={
# #                     'title': inputData.get("title", ""),
# #                     'priority': inputData.get("priority", ""),
# #                     'date': inputData.get("date", ""),
# #                     'status': inputData.get("status", "Yet to Start")
# #                 }
# #             )
# #             return {
# #                 "status": 1,
# #                 "message": "Todo Updated Successfully",
# #                 "payload": {}
# #             }
# #         else:
# #             DBHelper.insert(
# #                 'todos',
# #                 return_column='id',
# #                 user_id=uid,
# #                 id=inputData.get("id", str(uuid.uuid4())),
# #                 title=inputData.get("title", ""),
# #                 priority=inputData.get("priority", ""),
# #                 date=inputData.get("date", ""),
# #                 status=inputData.get("status", "Yet to Start")
# #             )
# #             return {
# #                 "status": 1,
# #                 "message": "Todo Added Successfully",
# #                 "payload": {}
# #             }


# class GetTodos(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         todos = DBHelper.find_all(
#             table_name="todos",
#             filters={"user_id": uid},
#             select_fields=["id", "title", "priority", "date", "status"],
#         )
#         user_todos = []
#         for todo in todos:
#             user_todos.append(
#                 {
#                     "id": todo["id"],
#                     "title": todo["title"],
#                     "priority": todo["priority"],
#                     "date": todo["date"].isoformat() if todo["date"] else None,
#                     "status": todo["status"],
#                 }
#             )
#         print(user_todos)
#         return {
#             "status": 1,
#             "message": "Todos fetched successfully",
#             "payload": {"todos": user_todos},
#         }


# class UpdateTodos(Resource):
#     @auth_required(isOptional=True)
#     def put(self, uid, user, todo_id):
#         inputData = request.get_json(silent=True)
#         DBHelper.update_one(
#             table_name="todos",
#             filters={"id": todo_id, "user_id": uid},
#             updates={
#                 "title": inputData.get("title", ""),
#                 "priority": inputData.get("priority", ""),
#                 "date": inputData.get("date", ""),
#                 "status": inputData.get("status", "Yet to Start"),
#             },
#         )
#         return {"status": 1, "message": "Todo Updated Successfully", "payload": {}}


# class DeleteTodos(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user, todo_id):
#         DBHelper.delete_one(table_name="todos", filters={"id": todo_id, "user_id": uid})
#         return {"status": 1, "message": "Todo Deleted Successfully", "payload": {}}


# # Note Resources
# class AddNote(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         inputData = request.get_json(silent=True)
#         print(f"==>> inputData: {inputData}")

#         if not inputData:
#             return {"status": 0, "message": "Invalid input data.", "payload": {}}

#         note_text = inputData.get("text", "")
#         parsed_time_str = extract_datetime_us(note_text)
#         print(f"==>> note_text: {note_text}")
#         print(f"==>> parsed_time_str: {parsed_time_str}")

#         # Determine date: from extracted time or fallback to input
#         if parsed_time_str:
#             try:
#                 parsed_time = datetime.fromisoformat(parsed_time_str)
#                 parsed_time = parsed_time.astimezone(pytz.timezone("America/Detroit"))
#                 note_date = parsed_time.isoformat()
#             except Exception as e:
#                 print(f"==>> Time parse error: {e}")
#                 note_date = None
#         else:
#             note_date = inputData.get("date", None)

#         note_id = inputData.get("id", str(uuid.uuid4()))
#         title = inputData.get("title", "")
#         description = inputData.get("description", "") or note_text
#         status = inputData.get("status", "Yet to Start")

#         print(
#             f"==>> Final note data: id={note_id}, title={title}, description={description}, date={note_date}, status={status}"
#         )

#         try:
#             DBHelper.insert(
#                 "notes",
#                 return_column="id",
#                 user_id=uid,
#                 id=note_id,
#                 title=title,
#                 description=description,
#                 date=note_date,
#                 status=status,
#             )
#             return {"status": 1, "message": "Note Added Successfully", "payload": {}}
#         except Exception as e:
#             print(f"==>> DB Insert Error: {e}")
#             return {"status": 0, "message": "Error saving note", "payload": {}}


# # class AddNote(Resource):
# #     @auth_required(isOptional=True)
# #     def post(self, uid, user):
# #         inputData = request.get_json(silent=True)
# #         print(f"==>> inputData: {inputData}")
# #         note_text = inputData.get("text", "")
# #         print(f"==>> note_text: {note_text}")
# #         parsed_time_str = extract_datetime_us(note_text)
# #         if not parsed_time_str:
# #             return {
# #                 "status": 0,
# #                 "message": "No time detected in the note text.",
# #                 "payload": {},
# #             }
# #         parsed_time = datetime.fromisoformat(parsed_time_str)

# #         # Use Detroit timezone
# #         detroit_tz = pytz.timezone("America/Detroit")
# #         parsed_time = parsed_time.astimezone(detroit_tz)
# #         id = inputData.get("id", None)
# #         # if id:
# #         # DBHelper.update_one(
# #         #     table_name='notes',
# #         #     filters={'id': id, 'user_id': uid},
# #         #     updates={
# #         #         'title': inputData.get("title", ""),
# #         #         'description': inputData.get("description", ""),
# #         #         'date': parsed_time.isoformat() ,
# #         #         'status': inputData.get("status", "Yet to Start")
# #         #     }
# #         # )
# #         DBHelper.insert(
# #             'notes',
# #             return_column='id',
# #             user_id=uid,
# #             id=inputData.get("id", str(uuid.uuid4())),
# #             title="",
# #             description=inputData.get("text", ""),
# #             date=parsed_time.isoformat(),  # ✅ Fix here
# #             status="Yet to Start"
# #         )

# #         return {
# #             "status": 1,
# #             "message": "Note updated Successfully",
# #             "payload": {}
# #         }


# #         DBHelper.insert(
# #             'notes',
# #             return_column='id',
# #             user_id=uid,
# #             id=inputData.get("id", str(uuid.uuid4())),
# #             title=inputData.get("title", ""),
# #             description=inputData.get("description", ""),
# #             date=inputData.get("date") or None,  # ✅ Fix here
# #             status=inputData.get("status", "Yet to Start")
# #         )
# #         return {
# #             "status": 1,
# #             "message": "Note Added Successfully",
# #             "payload": {}
# #         }


# class GetNotes(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         notes = DBHelper.find_all(
#             table_name="notes",
#             filters={"user_id": uid},
#             select_fields=["id", "title", "description", "date", "status"],
#         )
#         user_notes = []
#         for note in notes:
#             user_notes.append(
#                 {
#                     "id": note["id"],
#                     "title": note["title"],
#                     "description": note["description"],
#                     "date": note["date"].isoformat() if note["date"] else None,
#                     "status": note["status"],
#                 }
#             )
#         return {
#             "status": 1,
#             "message": "Notes fetched successfully",
#             "payload": {"notes": user_notes},
#         }


# class UpdateNotes(Resource):
#     @auth_required(isOptional=True)
#     def put(self, uid, user, note_id):
#         inputData = request.get_json(silent=True)
#         DBHelper.update_one(
#             table_name="notes",
#             filters={"id": note_id, "user_id": uid},
#             updates={
#                 "title": inputData.get("title", ""),
#                 "description": inputData.get("description", ""),
#                 "date": inputData.get("date", ""),
#                 "status": inputData.get("status", "Yet to Start"),
#             },
#         )
#         return {"status": 1, "message": "Note Updated Successfully", "payload": {}}


# class DeleteNotes(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user, note_id):
#         DBHelper.delete_one(table_name="notes", filters={"id": note_id, "user_id": uid})
#         return {"status": 1, "message": "Note Deleted Successfully", "payload": {}}


from datetime import timedelta, datetime
from flask import request
from flask_restful import Resource

from root.google.models import SCOPE, extract_datetime
from root.db.dbHelper import DBHelper
from root.common import GoalStatus, Priority, Status
from root.utilis import uniqueId
from root.auth.auth import auth_required
from google.oauth2.credentials import Credentials
from root.config import CLIENT_ID, CLIENT_SECRET, uri
from googleapiclient.discovery import build
from google.auth.exceptions import GoogleAuthError


class AddWeeklyGoals(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        id = uniqueId(digit=15, isNum=True)
        goal = {
            "id": id,
            "user_id": uid,
            "goal": data.get("goal", ""),
            "date": data.get("date", ""),
            "time": data.get("time", ""),
            "priority": Priority.LOW.value,
            "goal_status": GoalStatus.YET_TO_START.value,
            "status": Status.ACTIVE.value,
        }
        DBHelper.insert("weekly_goals", return_column="id", **goal)
        try:
            start_dt = datetime.strptime(
                f"{data.get('date', '')} {data.get('time', '')}", "%Y-%m-%d %I:%M %p"
            )
        except ValueError:
            return {"status": 0, "message": "Invalid date/time format", "payload": {}}
        create_calendar_event(uid, data.get("goal", ""), start_dt)
        return {
            "status": 1,
            "message": "Weekly Goal Added Successfully",
            "payload": goal,
        }


class AddEvents(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        print(f"inputData: {inputData}")
        id = inputData.get("id", None)
        unid = uniqueId(digit=15, isNum=True)

        title = inputData.get("title", "")
        date = inputData.get("date", "")
        time = inputData.get("time", "")

        if id:
            DBHelper.update_one(
                table_name="events",
                filters={"id": id, "user_id": uid},
                updates={"title": title, "time": time, "date": date},
            )
            message = "Event Updated Successfully"
        else:
            DBHelper.insert(
                "events",
                return_column="id",
                user_id=uid,
                id=unid,
                title=title,
                time=time,
                date=date,
                is_active=1,
            )
            message = "Event Added Successfully"

        # Convert to datetime
        try:
            start_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %I:%M %p")
        except ValueError:
            return {"status": 0, "message": "Invalid date/time format", "payload": {}}
        create_calendar_event(uid, title, start_dt)
        # try:
        #     create_calendar_event(uid, title, start_dt)
        # except GoogleAuthError as e:
        #     return {
        #         "status": 0,
        #         "message": "No Gmail or OutLook account connected. Please connect your account. But it is Stored in Our Dockly",
        #         "payload": {"error": str(e)},
        #     }
        # except Exception as e:
        #     print("Unexpected calendar error:", e)

        return {"status": 1, "message": message, "payload": {}}


class GetWeeklyGoals(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        goals = DBHelper.find_all(
            "weekly_goals",
            {"user_id": uid},
            select_fields=[
                "id",
                "goal",
                "date",
                "time",
                "priority",
                "goal_status",
                "status",
            ],
        )
        return {"status": 1, "payload": goals}


class AddWeeklyTodos(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        id = uniqueId(digit=15, isNum=True)

        todo = {
            "id": id,
            "user_id": uid,
            "text": data.get("text", ""),
            "date": data.get("date", ""),
            "time": data.get("time", ""),
            "priority": data.get("priority", "medium"),
            "completed": False,
        }
        DBHelper.insert("weekly_todos", return_column="id", **todo)
        try:
            start_dt = datetime.strptime(
                f"{data.get('date', '')} {data.get('time', '')}", "%Y-%m-%d %I:%M %p"
            )
        except ValueError:
            return {"status": 0, "message": "Invalid date/time format", "payload": {}}
        create_calendar_event(uid, data.get("text", ""), start_dt)
        return {
            "status": 1,
            "message": "Weekly todo Added Successfully",
            "payload": todo,
        }


class GetWeeklyTodos(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        # todos = DBHelper.find_all("weekly_todos", {"uid": uid})
        todos = DBHelper.find_all(
            "weekly_todos",
            {"user_id": uid},
            select_fields=["id", "text", "date", "time", "completed", "priority"],
        )
        return {"status": 1, "payload": todos}


def create_calendar_event(user_id, title, start_dt, end_dt=None, attendees=None):
    user_cred = DBHelper.find_one(
        "connected_accounts",
        filters={"user_id": user_id},
        select_fields=["access_token", "refresh_token", "email"],
    )
    if not user_cred:
        raise Exception("No connected Google account found.")

    creds = Credentials(
        token=user_cred["access_token"],
        refresh_token=user_cred["refresh_token"],
        token_uri=uri,
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        scopes=SCOPE.split(),
    )

    service = build("calendar", "v3", credentials=creds)

    if end_dt is None:
        end_dt = start_dt + timedelta(hours=1)

    event = {
        "summary": title,
        "start": {"dateTime": start_dt.isoformat(), "timeZone": "Asia/Kolkata"},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": "Asia/Kolkata"},
        "attendees": attendees or [],
        "guestsCanModify": True,
        "guestsCanInviteOthers": True,
        "guestsCanSeeOtherGuests": True,
    }

    return service.events().insert(calendarId="primary", body=event).execute()


class AddWeeklyFocus(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        print(f"==>> data: {data}")
        id = uniqueId(digit=15, isNum=True)

        focus = {
            "id": id,
            "user_id": uid,
            "focus": data.get("focus", ""),
        }
        DBHelper.insert("weekly-focus", return_column="id", **focus)
        return {
            "status": 1,
            "message": "Weekly focus Added Successfully",
            "payload": focus,
        }


class GetWeeklyFocus(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        # todos = DBHelper.find_all("weekly_todos", {"uid": uid})
        focus = DBHelper.find_all(
            "weekly-focus",
            {"user_id": uid},
            select_fields=["id", "focus"],
        )
        return {"status": 1, "payload": focus}


class AddSmartNote(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        full_text = inputData.get("note", "")
        members = inputData.get("members", "")
        uid = inputData.get("userId", "")
        frontend_timing = inputData.get("timing")
        source = inputData.get("source", "planner")  # default source

        if frontend_timing:
            try:
                parsed_datetime = datetime.fromisoformat(frontend_timing)
            except Exception as e:
                print("Invalid frontend timing:", e)
                parsed_datetime = extract_datetime(full_text)
        else:
            parsed_datetime = extract_datetime(full_text)

        DBHelper.insert(
            "smartnotes",
            user_id=uid,
            note=full_text,
            timing=parsed_datetime,
            members=members,
            source=source,
        )

        try:
            create_calendar_event(
                user_id=uid,
                title=full_text,
                start_dt=parsed_datetime,
            )
        except Exception as e:
            print("Failed to create calendar event:", e)

        return {
            "status": 1,
            "message": "Smart Note Added Successfully",
            "payload": {
                "parsedTiming": parsed_datetime.isoformat(),
            },
        }


class GetSmartNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        source = request.args.get("source")
        filters = {"user_id": uid}
        if source:
            filters["source"] = source

        notes = DBHelper.find_all(
            table_name="smartnotes",
            filters=filters,
            select_fields=["id", "note", "timing", "members", "created_at"],
        )

        user_notes = []
        for note in notes:
            user_notes.append(
                {
                    "id": note["id"],
                    "note": note["note"],
                    "timing": note["timing"].isoformat() if note["timing"] else None,
                    "members": note["members"],
                    "created_at": (
                        note["created_at"].isoformat() if note["created_at"] else None
                    ),
                }
            )

        return {
            "status": 1,
            "message": "Smart Notes fetched successfully",
            "payload": {"notes": user_notes},
        }


class FrequentNotes(Resource):
    def get(self, uid):
        source = request.args.get("source")
        filters = {"user_id": uid}
        if source:
            filters["source"] = source

        notes = DBHelper.find_all(
            table_name="smartnotes", filters=filters, select_fields=["note"]
        )

        note_counts = {}
        for note in notes:
            text = note["note"].strip()
            note_counts[text] = note_counts.get(text, 0) + 1

        if not note_counts:
            return [], 200

        sorted_notes = sorted(note_counts.items(), key=lambda x: x[1], reverse=True)
        top_notes = [note[0] for note in sorted_notes[:3]]

        if len(top_notes) < 3:
            all_notes = list(note_counts.keys())
            for n in all_notes:
                if n not in top_notes:
                    top_notes.append(n)
                    if len(top_notes) == 3:
                        break

        return top_notes, 200
