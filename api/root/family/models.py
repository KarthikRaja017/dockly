# models.py
from datetime import date, datetime, time
import json
from root.auth.auth import auth_required
from flask_restful import Resource
from flask import request, jsonify
from root.db.dbHelper import DBHelper


class InviteFamily(Resource):
    def post(self):
        try:
            data = request.get_json()
            if not data:
                return {"status": 0, "message": "No input data provided"}, 400

            # Validate required fields
            required_fields = [
                "name",
                "relationship",
                "method",
                "permissions",
                "sharedItems",
                "userId",
            ]
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                }, 400

            # Set default values for optional fields
            data.setdefault("email", "")
            data.setdefault("phone", "")
            data.setdefault("accessCode", "")

            # Validate user_id exists in users table
            user = DBHelper.find_one(
                table_name="users", filters={"uid": data["userId"]}
            )
            if not user:
                return {
                    "status": 0,
                    "message": f"User with ID {data['userId']} not found",
                }, 400

            # Insert into family_members
            member_id = DBHelper.insert(
                table_name="family_members",
                name=data["name"],
                relationship=data["relationship"],
                email=data["email"],
                phone=data["phone"],
                access_code=data["accessCode"],
                method=data["method"],
                permissions=data["permissions"],
                shared_items=data["sharedItems"],
                user_id=data["userId"],
            )
            return {
                "status": 1,
                "message": "Family member invited successfully",
                "payload": {"memberId": member_id},
            }, 200
        except Exception as e:
            return {"status": 0, "message": f"Failed to invite member: {str(e)}"}, 500


class AddFamilyMembers(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        userId = DBHelper.insert(
            "family_members",
            return_column="user_id",
            user_id=uid,
            name=inputData.get("name", ""),
            relationship=inputData.get("relationship", ""),
            email=inputData.get("email", ""),
            phone=inputData.get("phone", ""),
            access_code=inputData.get("accessCode", ""),
            method=inputData.get("method", "Email"),
            permissions=json.dumps(
                inputData.get(
                    "permissions",
                    {
                        "type": "Full Access",
                        "allowAdd": True,
                        "allowEdit": True,
                        "allowDelete": True,
                        "allowInvite": True,
                        "notify": True,
                    },
                )
            ),
            shared_items=json.dumps(
                inputData.get(
                    "sharedItems",
                    {
                        "Home Management": [
                            "Property Information",
                            "Mortgage & Loans",
                            "Home Maintenance",
                            "Utilities",
                            "Insurance",
                        ]
                    },
                )
            ),
        )
        return {
            "status": 1,
            "message": "Family members added successfully",
            "payload": {},
        }


class AddContacts(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "No input data provided"}, 400

        contact = inputData.get("contacts", {})
        if not contact:
            return {"status": 0, "message": "No contact data provided"}, 400

        # Validate required fields
        required_fields = ["name", "role", "phone", "addedBy"]
        missing_fields = [field for field in required_fields if field not in contact]
        if missing_fields:
            return {
                "status": 0,
                "message": f"Missing required fields: {', '.join(missing_fields)}",
            }, 400
        current_time = datetime.now().isoformat()

        userId = DBHelper.insert(
            "contacts",
            return_column="user_id",
            user_id=uid,  # Use authenticated uid for user_id
            name=contact.get("name", ""),
            role=contact.get("role", ""),
            phone=contact.get("phone", ""),
            added_by=contact.get("addedBy", ""),  # Use addedBy from payload
            added_time=current_time,
            edited_by=contact.get("editedBy", contact.get("addedBy", "")),
            edited_time=current_time,
        )
        return {
            "status": 1,
            "message": "Contact added successfully",
            "payload": {"userId": userId},
        }


class AddSchoolChurch(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                return {"status": 0, "message": "No input data provided"}, 400

            school = inputData.get("school_church", {})
            if not school:
                return {"status": 0, "message": "No schedule data provided"}, 400

            # Validate required fields
            required_fields = ["name", "type", "date", "time", "place", "addedBy"]
            missing_fields = [field for field in required_fields if field not in school]
            if missing_fields:
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                }, 400

            # Validate type
            if school.get("type") not in ["school", "church"]:
                return {
                    "status": 0,
                    "message": "Type must be 'school' or 'church'",
                }, 400

            current_time = datetime.now().isoformat()

            schedule_id = DBHelper.insert(
                "school_church",
                return_column="id",
                user_id=uid,
                name=school.get("name", ""),
                type=school.get("type", ""),
                date=school.get("date", ""),
                time=school.get("time", ""),
                place=school.get("place", ""),
                added_by=school.get("addedBy", ""),
                added_time=current_time,
                edited_by=school.get("editedBy", school.get("addedBy", "")),
                updated_at=current_time,
            )
            return {
                "status": 1,
                "message": "School/Church added successfully",
                "payload": {"id": schedule_id},
            }, 200
        except Exception as e:
            return {"status": 0, "message": f"Failed to add schedule: {str(e)}"}, 500


class AddFamilyGuidelines(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "No input data provided"}, 400

        guideline = inputData.get("guidelines", {})
        if not guideline:
            return {"status": 0, "message": "No guideline data provided"}, 400

        # Validate required fields
        required_fields = ["title", "description", "addedBy"]
        missing_fields = [field for field in required_fields if field not in guideline]
        if missing_fields:
            return {
                "status": 0,
                "message": f"Missing required fields: {', '.join(missing_fields)}",
            }, 400
        current_time = datetime.now().isoformat()

        userId = DBHelper.insert(
            "familyguidelines",
            return_column="user_id",
            user_id=uid,  # Use authenticated uid for user_id
            title=guideline.get("title", ""),
            description=guideline.get("description", ""),
            added_by=guideline.get("addedBy", ""),
            added_time=current_time,
            edited_by=guideline.get("editedBy", guideline.get("addedBy", "")),
            updated_at=current_time,
        )
        return {
            "status": 1,
            "message": "Family guideline added successfully",
            "payload": {"userId": userId},
        }


class mealplanning(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "No input data provided"}, 400

        meal = inputData.get("mealplanning", {})
        if not meal:
            return {"status": 0, "message": "No meal data provided"}, 400

        # Validate required fields
        required_fields = ["meal_type", "date", "time", "addedBy"]
        missing_fields = [field for field in required_fields if field not in meal]
        if missing_fields:
            return {
                "status": 0,
                "message": f"Missing required fields: {', '.join(missing_fields)}",
            }, 400
        current_time = datetime.now().isoformat()

        userId = DBHelper.insert(
            "mealplanning",
            return_column="user_id",
            user_id=uid,
            meal_type=meal.get("meal_type", ""),
            meal_date=meal.get("date", ""),
            meal_time=meal.get("time", ""),
            description=meal.get("description", ""),
            added_by=meal.get("addedBy", ""),
            created_at=current_time,
            edited_by=meal.get("editedBy", meal.get("addedBy", "")),
            updated_at=current_time,
        )
        return {
            "status": 1,
            "message": "Meal added successfully",
            "payload": {"userId": userId},
        }


class addsharedtasks(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "No input data provided"}, 400

        task = inputData.get("sharedtasks", {})
        if not task:
            return {"status": 0, "message": "No task data provided"}, 400

        # Validate required fields
        required_fields = ["title", "assignedTo", "dueDate", "addedBy"]
        missing_fields = [field for field in required_fields if field not in task]
        if missing_fields:
            return {
                "status": 0,
                "message": f"Missing required fields: {', '.join(missing_fields)}",
            }, 400
        current_time = datetime.now().isoformat()
        userId = DBHelper.insert(
            "sharedtasks",
            return_column="user_id",
            user_id=uid,  # Use authenticated uid for user_id
            task=task.get("title", ""),
            assigned_to=task.get("assignedTo", ""),
            due_date=task.get("dueDate", ""),
            completed=task.get("completed", False),
            added_by=task.get("addedBy", ""),
            added_time=current_time,
            edited_by=task.get("editedBy", task.get("addedBy", "")),
            updated_at=current_time,
        )

        return {
            "status": 1,
            "message": "Task added successfully",
            "payload": {"userId": userId},
        }


class addcustomsection(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "No input data provided"}, 400

        section = inputData.get("customSection", {})
        if not section:
            return {"status": 0, "message": "No section data provided"}, 400

        # Validate required fields
        required_fields = ["title", "addedBy"]
        missing_fields = [field for field in required_fields if field not in section]
        if missing_fields:
            return {
                "status": 0,
                "message": f"Missing required fields: {', '.join(missing_fields)}",
            }, 400
        current_time = datetime.now().isoformat()

        userId = DBHelper.insert(
            "customsection",
            return_column="user_id",
            user_id=uid,  # Use authenticated uid for user_id
            title=section.get("title", ""),
            created_at=current_time,
        )
        return {
            "status": 1,
            "message": "Custom section added successfully",
            "payload": {"userId": userId},
        }


class GetFamilyMembers(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        members = DBHelper.find_all(
            table_name="family_members",
            select_fields=[
                "name",
                "relationship",
                "email",
                "phone",
                "method",
                "permissions",
                "shared_items",
            ],
            filters={"user_id": uid},
        )
        familyMembers = []
        for member in members:
            familyMembers.append(
                {
                    "name": member["name"],
                    "relationship": member["relationship"]
                    .replace("❤", "")
                    .replace("👶", "")
                    .replace("👴", ""),
                    "contact": member["email"] or member["phone"] or "N/A",
                    "method": member["method"],
                    " permissions": member["permissions"]["type"],
                    "shared_items": ", ".join(
                        f"{cat}: {item}"
                        for cat, items in member["shared_items"].items()
                        for item in items
                    )
                    or "None",
                }
            )
        # print(familyMembers)
        return {
            "status": 1,
            "message": "Family members fetched successfully",
            "payload": {"members": familyMembers},
        }


class GetContacts(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            contacts = DBHelper.find_all(
                table_name="contacts",
                select_fields=[
                    "id",
                    "name",
                    "role",
                    "phone",
                    "added_by",
                    "added_time",
                    "edited_by",
                    "edited_time",
                ],
                filters={"user_id": uid},
            )

            def serialize_datetime(dt):
                return dt.isoformat() if isinstance(dt, datetime) else None

            contact_list = []
            for contact in contacts:
                contact_list.append(
                    {
                        "id": contact["id"],
                        "name": contact["name"],
                        "role": contact["role"],
                        "phone": contact["phone"] or "N/A",
                        "added_by": contact["added_by"],
                        "added_time": serialize_datetime(contact["added_time"]),
                        "edited_by": contact["edited_by"] or "N/A",
                        "edited_time": serialize_datetime(contact["edited_time"]),
                    }
                )

            return {
                "status": 1,
                "message": "Emergency contacts fetched successfully",
                "payload": {"contacts": contact_list},
            }, 200
        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch contacts: {str(e)}"}, 500


class GetSchedules(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        tasks = DBHelper.find_all(
            table_name="school_church",
            select_fields=[
                "name",
                "type",
                "date",
                "time",
                "place",
                "added_by",
                "added_time",
            ],
            filters={"user_id": uid},
        )
        schedule_list = []
        for task in tasks:
            schedule_list.append(
                {
                    "name": task["name"],
                    "type": task["type"],
                    "date": (
                        task["date"].isoformat()
                        if isinstance(task["date"], (datetime, date))
                        else None
                    ),
                    "time": task["time"],
                    "place": task["place"],
                    "added_by": task["added_by"],
                    "added_time": (
                        task["added_time"].isoformat()
                        if isinstance(task["added_time"], datetime)
                        else None
                    ),
                }
            )
            # print(schedule_list)
        return {
            "status": 1,
            "message": "Schedules fetched successfully",
            "payload": {"schedules": schedule_list},
        }


class GetFamilyTasks(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        tasks = DBHelper.find_all(
            table_name="sharedtasks",
            select_fields=[
                "task",
                "assigned_to",
                "due_date",
                "completed",
                "added_by",
                "added_time",
            ],
            filters={"user_id": uid},
        )

        task_list = []
        for task in tasks:
            task_list.append(
                {
                    "task": task["task"],
                    "assigned_to": task["assigned_to"],
                    "due_date": (
                        task["due_date"].isoformat()
                        if isinstance(task["due_date"], (datetime, date))
                        else None
                    ),
                    "completed": task["completed"],
                    "added_by": task["added_by"],
                    "added_time": (
                        task["added_time"].isoformat()
                        if isinstance(task["added_time"], datetime)
                        else None
                    ),
                }
            )

        return {
            "status": 1,
            "message": "Family tasks fetched successfully",
            "payload": {"shared_tasks": task_list},
        }


class GetMealPlanning(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        tasks = DBHelper.find_all(
            table_name="mealplanning",
            select_fields=[
                "meal_type",
                "meal_date",
                "meal_time",
                "description",
                "added_by",
                "created_at",
            ],
            filters={"user_id": uid},
        )
        meal_list = []
        for task in tasks:
            meal_list.append(
                {
                    "meal_type": task["meal_type"],
                    "meal_date": (
                        task["meal_date"].isoformat()
                        if isinstance(task["meal_date"], (datetime, date))
                        else str(task["meal_date"])
                    ),
                    "meal_time": (
                        task["meal_time"].isoformat()
                        if isinstance(task["meal_time"], time)
                        else str(task["meal_time"])
                    ),
                    "description": task["description"],
                    "added_by": task["added_by"],
                    "created_at": (
                        task["created_at"].isoformat()
                        if isinstance(task["created_at"], datetime)
                        else str(task["created_at"])
                    ),
                }
            )

        # print(meal_list)
        return {
            "status": 1,
            "message": "Meal planning fetched successfully",
            "payload": {"meal_planning": meal_list},
        }


class GetFamilyGuidelines(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        guidelines = DBHelper.find_all(
            table_name="familyguidelines",
            select_fields=["title", "description", "added_by", "added_time"],
            filters={"user_id": uid},
        )
        guideline_list = []
        for guideline in guidelines:
            guideline_list.append(
                {
                    "title": guideline["title"],
                    "description": guideline["description"],
                    "addedBy": guideline["added_by"],
                    "addedTime": (
                        guideline["added_time"].isoformat()
                        if isinstance(guideline["added_time"], datetime)
                        else None
                    ),
                }
            )

        return {
            "status": 1,
            "message": "Family guidelines fetched successfully",
            "payload": {"guidelines": guideline_list},
        }
