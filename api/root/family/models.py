# models.py
import base64
from datetime import date, datetime, time
from email.message import EmailMessage
import json
import re
import smtplib
from root.common import DocklyUsers, Status
from root.utilis import uniqueId
from root.users.models import generate_otp, send_otp_email
from root.config import EMAIL_PASSWORD, EMAIL_SENDER, SMTP_PORT, SMTP_SERVER, WEB_URL
from root.email import generate_invitation_email
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


def sendInviteEmail(inputData, user, rusername, encodedToken):
    inviteLink = f"{WEB_URL}/{rusername}/verify-email?token={encodedToken}"
    u = user["user_name"]
    email_html = generate_invitation_email(
        inputData,
        username=u,
        invite_link=inviteLink,
    )

    msg = send_invitation_email(inputData["email"], inputData["name"], email_html)
    return msg


class AddFamilyMembers(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        # sharedKeys = list(inputData.get("sharedItems", {}).keys())
        sharedComponents = []
        sharedItems = []
        sharedKeys = []

        for key, value in inputData["sharedItems"].items():
            sharedKeys.append(key)
            sharedComponents.extend(value)
        for key in sharedKeys:
            id = DBHelper.find_one(
                "hubs",
                filters={"name": key},
                select_fields=["hid"],
            )
            sharedItems.append(id)

        sharedItemsIds = []
        for i in sharedItems:
            sharedItemsIds.append(i["hid"])

        rname = inputData["name"]

        existingUser = DBHelper.find_one(
            "users",
            filters={"email": inputData["email"]},
            select_fields=["uid", "duser"],
        )

        if existingUser:
            return
        parts = re.split(r"[\s_-]+", rname.strip())
        relationName = parts[0].lower() + "".join(
            word.capitalize() for word in parts[1:]
        )
        rusername = uniqueId(digit=3, isNum=True, prefix=relationName)
        otp = generate_otp()
        uid = uniqueId(digit=5, isNum=True, prefix="USER")
        payload = json.dumps(
            {
                "otp": otp,
                "email": inputData["email"],
                "userId": uid,
                "fuser": user["uid"],
                "duser": DocklyUsers.Guests.value,
            }
        )
        encodedToken = base64.urlsafe_b64encode(payload.encode()).decode()
        docklyUser = DBHelper.insert(
            "users",
            return_column="uid",
            uid=uid,
            email=inputData["email"],
            user_name=rusername,
            is_email_verified=False,
            is_active=Status.ACTIVE.value,
            duser=DocklyUsers.Guests.value,
            splan=0,
        )
        for id in sharedItemsIds:
            shared = DBHelper.insert(
                table_name="users_access_hubs",
                user_id=uid,
                id=f"{uid}-{id}",
                hubs=id,
                is_active=Status.ACTIVE.value,
                return_column="hubs",
            )
        sendInviteEmail(inputData, user, rusername, encodedToken)
        otpResponse = send_otp_email(inputData["email"], otp)
        userId = DBHelper.insert(
            "family_members",
            return_column="user_id",
            user_id=user["uid"],
            name=inputData.get("name", ""),
            relationship=inputData.get("relationship", ""),
            access_code=inputData.get("accessCode", ""),
            method=inputData.get("method", "Email"),
            permissions="",
            shared_items="",
        )

        return {
            "status": 1,
            "message": "Family members added successfully",
            "payload": {},
        }


class AddPet(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "No input data provided"}, 400

        required_fields = [
            "name",
            "species",
            "breed",
            "guardian_email",
            "guardian_contact",
        ]
        missing_fields = [field for field in required_fields if field not in inputData]
        if missing_fields:
            return {
                "status": 0,
                "message": f"Missing required fields: {', '.join(missing_fields)}",
            }, 400

        userId = DBHelper.insert(
            "pets",
            return_column="user_id",
            user_id=uid,
            name=inputData.get("name", ""),
            species=inputData.get("species", ""),
            breed=inputData.get("breed", ""),
            guardian_email=inputData.get("guardian_email", ""),
            guardian_contact=inputData.get("guardian_contact", ""),
        )
        return {
            "status": 1,
            "message": "Pet added successfully",
            "payload": {"userId": userId},
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
            user_id=uid,
            name=contact.get("name", ""),
            role=contact.get("role", ""),
            phone=contact.get("phone", ""),
            added_by=contact.get("addedBy", ""),
            added_time=current_time,
        )
        return {
            "status": 1,
            "message": "Contact added successfully",
            "payload": {"userId": userId},
        }


class AddGuardianEmergencyInfo(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        current_time = datetime.now().isoformat()
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "No input data provided"}, 400
        userId = DBHelper.insert(
            "guardian_emergency_info",
            return_column="user_id",
            user_id=uid,
            name=inputData.get("name", ""),
            relation=inputData.get("relationship", "Grandmother"),
            phone=inputData.get("phone", ""),
            details=inputData.get("details", ""),
            added_by=inputData.get("addedBy", ""),
            added_time=current_time,
        )
        return {
            "status": 1,
            "message": "Guardian emergency info added successfully",
            "payload": {"userId": userId},
        }


class GetPets(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        pets = DBHelper.find_all(
            table_name="pets",
            select_fields=[
                "name",
                "species",
                "breed",
                "guardian_email",
                "guardian_contact",
            ],
            filters={"user_id": uid},
        )
        pet_list = []
        for pet in pets:
            pet_list.append(
                {
                    "name": pet["name"],
                    "species": pet["species"],
                    "breed": pet["breed"] or "N/A",
                    "guardian_email": pet["guardian_email"] or "N/A",
                    "guardian_contact": pet["guardian_contact"] or "N/A",
                }
            )
        return {
            "status": 1,
            "message": "Pets fetched successfully",
            "payload": {"pets": pet_list},
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
                ],
                filters={"user_id": uid},
            )

            def serialize_datetime(dt):
                return dt.isoformat() if isinstance(dt, datetime) else None

            grouped_by_role = {}
            for contact in contacts:
                role = contact["role"].lower()
                section_key = (
                    "emergency"
                    if "emergency" in role
                    else (
                        "school"
                        if "school" in role
                        else (
                            "professional"
                            if any(
                                r in role for r in ["doctor", "dentist", "pediatrician"]
                            )
                            else "other"
                        )
                    )
                )
                if section_key not in grouped_by_role:
                    grouped_by_role[section_key] = []
                grouped_by_role[section_key].append(
                    {
                        "id": contact["id"],
                        "name": contact["name"],
                        "role": contact["role"],
                        "phone": contact["phone"] or "N/A",
                        "added_by": contact["added_by"],
                        "added_time": serialize_datetime(contact["added_time"]),
                    }
                )

            contact_sections = [
                {
                    "title": (
                        "Emergency Services"
                        if key == "emergency"
                        else (
                            "Schools"
                            if key == "school"
                            else (
                                "Professional Services"
                                if key == "professional"
                                else "Other Contacts"
                            )
                        )
                    ),
                    "type": key,
                    "items": items,
                }
                for key, items in grouped_by_role.items()
            ]
            return {
                "status": 1,
                "message": "Emergency contacts fetched successfully",
                "payload": {"contacts": contact_sections},
            }, 200
        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch contacts: {str(e)}"}, 500


class GetGuardianEmergencyInfo(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            emergency_info = DBHelper.find_all(
                table_name="guardian_emergency_info",
                select_fields=["name", "relation", "phone", "details"],
                filters={"user_id": uid},
            )
            info_list = []
            for info in emergency_info:
                info_list.append(
                    {
                        "name": info["name"],
                        "relationship": info["relation"],
                        "phone": info["phone"] or "N/A",
                        "details": info["details"] or "N/A",
                    }
                )
            return {
                "status": 1,
                "message": "Guardian emergency info fetched successfully",
                "payload": {"emergencyInfo": info_list},
            }, 200
        except Exception as e:
            return {
                "status": 0,
                "message": f"Failed to fetch emergency info: {str(e)}",
            }, 500


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
                    "permissions": member["permissions"]["type"],
                    "shared_items": ", ".join(
                        f"{cat}: {item}"
                        for cat, items in member["shared_items"].items()
                        for item in items
                    )
                    or "None",
                }
            )
        return {
            "status": 1,
            "message": "Family members fetched successfully",
            "payload": {"members": familyMembers},
        }


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
        duser = request.args.get("dUser")
        familyMembers = []

        # Define common method to clean relationship
        def clean_relationship(rel):
            return rel.replace("❤", "").replace("👶", "").replace("👴", "")

        if int(duser) == DocklyUsers.PaidMember.value:
            members = DBHelper.find_all(
                table_name="family_members",
                select_fields=["name", "relationship"],
                filters={"user_id": uid},
            )
            currentUser = {
                "name": user.get("user_name", "User"),
                "relationship": "me",
            }
            familyMembers.append(currentUser)
        elif int(duser) == DocklyUsers.Guests.value:
            fuser = request.args.get("fuser")
            members = DBHelper.find_all(
                table_name="family_members",
                select_fields=["name", "relationship", "user_id"],
                filters={"user_id": fuser},
            )

            fuserMember = DBHelper.find_one(
                "users",
                filters={"uid": fuser},
                select_fields=["user_name"],
            )

            relationship = "Owner"

            familyMember = {
                "name": fuserMember.get("user_name", "User"),
                "relationship": relationship,
            }
            familyMembers.append(familyMember)

        for member in members:
            familyMembers.append(
                {
                    "name": member["name"],
                    "relationship": clean_relationship(member["relationship"]),
                }
            )

        # Add current user info at the end

        return {
            "status": 1,
            "message": "Family members fetched successfully",
            "payload": {"members": familyMembers},
        }


# models.py (Update GetGuardianEmergencyInfo)


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


class SendInvitation(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        form_data = request.json.get("formData")
        shared_items_list = request.json.get("sharedItemsList", "")
        email = form_data["email"]
        name = form_data["name"]
        # username = user["user_name"]
        username = "Karthik raja"
        invite_link = f"{WEB_URL}/satheesh/verify-email"
        otp = generate_otp()
        # otpResponse = send_otp_email(email, otp)
        email_html = generate_invitation_email(
            form_data,
            shared_items_list,
            username=username,
            invite_link=invite_link,
        )

        msg = send_invitation_email(email, name, email_html)

        return {"message": "Invitation sent!"}


def send_invitation_email(
    email, name, email_html, invite_subject="Invitation to Join Family Hub"
):
    msg = EmailMessage()
    msg["Subject"] = f"{invite_subject} - {name}"
    msg["From"] = EMAIL_SENDER  # e.g., 'no-reply@familyhub.com'
    msg["To"] = email

    # Add the HTML version
    msg.add_alternative(email_html, subtype="html")

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.send_message(msg)


class AddNotes(Resource):
    @auth_required(isOptional=True)  # This decorator injects uid and user
    def post(self, uid=None, user=None):  # ✅ Accept injected args here
        try:
            inputData = request.get_json(force=True)
        except Exception as e:
            return {"status": 0, "message": f"Invalid JSON: {str(e)}"}, 422

        title = inputData.get("title", "").strip()
        description = inputData.get("description", "").strip()
        category_id = inputData.get("category_id")

        if not title or not description or not category_id:
            return {
                "status": 0,
                "message": "Fields title, description, and category_id are required.",
            }, 422

        now = datetime.now().isoformat()

        try:
            new_note_id = DBHelper.insert(
                "notes_lists",
                return_column="user_id",
                user_id=uid,
                title=title,
                description=description,
                category_id=category_id,
                created_at=now,
                updated_at=now,
            )
            return {
                "status": 1,
                "message": "Note added successfully",
                "payload": {
                    "id": new_note_id,
                    "title": title,
                    "description": description,
                    "category_id": category_id,
                },
            }
        except Exception as e:
            return {"status": 0, "message": f"Failed to add note: {str(e)}"}, 500


class GetNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid=None, user=None):
        try:
            # ✅ Fetch only the notes for the current user
            select_fields = [
                "id",
                "title",
                "description",
                "category_id",
                "created_at",
                "updated_at",
            ]
            user_notes = DBHelper.find(
                "notes_lists", filters={"user_id": uid}, select_fields=select_fields
            )

            notes = []
            for note in user_notes:
                notes.append(
                    {
                        "id": note["id"],
                        "title": note["title"],
                        "description": note["description"],
                        "category_id": note["category_id"],
                        "created_at": (
                            note["created_at"].isoformat()
                            if isinstance(note["created_at"], datetime)
                            else note["created_at"]
                        ),
                        "updated_at": (
                            note["updated_at"].isoformat()
                            if isinstance(note["updated_at"], datetime)
                            else note["updated_at"]
                        ),
                    }
                )

            return {
                "status": 1,
                "message": "Notes fetched successfully",
                "payload": notes,
            }

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch notes: {str(e)}"}, 500


class AddProject(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        project_id = input_data.get("project_id")

        if project_id:

            DBHelper.update_one(
                table_name="projects",
                filters={"project_id": project_id, "uid": uid},
                updates={
                    "title": input_data.get("title"),
                    "description": input_data.get("description"),
                    "due_date": input_data.get("due_date"),
                    "meta": input_data.get("meta", []),
                    "progress": input_data.get("progress", 0),
                    "updated_at": datetime.utcnow(),
                },
            )
            return {"status": 1, "message": "Project updated successfully"}
        else:
            # Create new project
            # generated_id = str(uuid.uuid4())
            generated_id = uniqueId(digit=5, isNum=True)
            DBHelper.insert(
                table_name="projects",
                return_column="project_id",
                project_id=generated_id,
                uid=uid,
                title=input_data.get("title"),
                description=input_data.get("description"),
                due_date=input_data.get("due_date"),
                meta=input_data.get("meta", []),
                progress=input_data.get("progress", 0),
            )
            return {
                "status": 1,
                "message": "Project added successfully",
                "payload": {"project_id": generated_id},
            }


class GetProjects(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        projects = DBHelper.find_all(
            table_name="projects",
            filters={"uid": uid},
            select_fields=[
                "project_id",
                "title",
                "description",
                "due_date",
                "meta",
                "progress",
                "created_at",
                "updated_at",
            ],
        )

        formatted = []
        for p in projects:
            formatted.append(
                {
                    "project_id": p["project_id"],
                    "title": p["title"],
                    "description": p["description"],
                    "due_date": p["due_date"].isoformat() if p["due_date"] else None,
                    "meta": p["meta"],
                    "progress": p["progress"],
                    "created_at": p["created_at"].isoformat(),
                    "updated_at": p["updated_at"].isoformat(),
                }
            )

        return {
            "status": 1,
            "message": "Projects fetched successfully",
            "payload": {"projects": formatted},
        }
