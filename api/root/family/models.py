# models.py
import base64
from datetime import date, datetime, time
from email.message import EmailMessage
import json
import re
import smtplib
from root.common import DocklyUsers, HubsEnum, Permissions, Status
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


def sendInviteEmail(inputData, user, rusername, encodedToken, inviteLink):
    if not inviteLink:
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

        if inputData["email"] == user["email"]:
            return {
                "status": 0,
                "message": "You cannot add yourself as a family member.",
                "payload": {},
            }

        # Check for existing family member
        family_member_exists = DBHelper.find_one(
            "family_members",
            filters={"email": inputData["email"], "user_id": uid},
            select_fields=["id"],
        )

        if family_member_exists:
            return {
                "status": 0,
                "message": "Family member with this email already exists in your family hub.",
                "payload": {},
            }

        # Prepare shared item IDs
        sharedKeys = list(inputData["sharedItems"].keys())
        sharedComponents = [val for v in inputData["sharedItems"].values() for val in v]
        sharedItems = [
            DBHelper.find_one("hubs", filters={"name": key}, select_fields=["hid"])
            for key in sharedKeys
        ]
        sharedItemsIds = [item["hid"] for item in sharedItems if item]

        otp = generate_otp()
        rname = inputData["name"]

        existingUser = DBHelper.find_one(
            "users",
            filters={"email": inputData["email"]},
            select_fields=["uid", "duser", "user_name"],
        )

        # ========== EXISTING USER FLOW ==========
        if existingUser:
            if existingUser["duser"] == DocklyUsers.Guests.value:
                return {
                    "status": 0,
                    "message": "This email is already registered as a guest.",
                }

            if existingUser["duser"] == DocklyUsers.PaidMember.value:
                rusername = existingUser["user_name"]
                encodedToken = "<encoded_token>"  # Create a real token if needed
                inviteLink = f"{WEB_URL}/{rusername}/dashboard"

                sendInviteEmail(
                    inputData, user, rusername, encodedToken, inviteLink=inviteLink
                )
                # family_member_ids = get_connected_family_member_ids(uid)
                # print(f"family_member_ids: {family_member_ids}")
                # ✅ Create notification
                notification = {
                    "sender_id": user["uid"],
                    "receiver_id": existingUser["uid"],
                    "message": f"You have been invited to join {user['user_name']}'s Family Hub '{rusername}'",
                    "task_type": "family_request",
                    "action_required": True,
                    "status": "pending",
                    "hub": HubsEnum.Family.value,
                    "metadata": {
                        "input_data": inputData,
                        "shared_items_ids": sharedItemsIds,
                        "sender_user": user,
                        # "familyMembers_ids": family_member_ids,
                    },
                }

                notification_id = DBHelper.insert(
                    "notifications", return_column="id", **notification
                )

                # ✅ Emit real-time socket notification
                # try:
                #     from app import socketio  # adjust import path as needed

                #     socketio.emit(
                #         "family_invite",
                #         {
                #             "to": existingUser["uid"],
                #             "message": notification["message"],
                #             "notification_id": notification_id,
                #             "metadata": notification["metadata"],
                #         },
                #     )
                # except Exception as e:
                #     print(f"Socket emit error: {e}")

                return {
                    "status": 1,
                    "message": "Family member invitation sent successfully",
                    "payload": {},
                }

        # ========== NEW GUEST USER FLOW ==========
        # Generate unique guest username
        parts = re.split(r"[\s_-]+", rname.strip())
        relationName = parts[0].lower() + "".join(
            word.capitalize() for word in parts[1:]
        )
        rusername = uniqueId(digit=3, isNum=True, prefix=relationName)

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

        DBHelper.insert(
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
            DBHelper.insert(
                table_name="users_access_hubs",
                user_id=uid,
                id=f"{uid}-{id}",
                hubs=id,
                is_active=Status.ACTIVE.value,
                return_column="hubs",
            )

        userId = DBHelper.insert(
            "family_members",
            return_column="user_id",
            user_id=user["uid"],
            name=inputData.get("name", ""),
            relationship=inputData.get("relationship", ""),
            access_code=inputData.get("accessCode", ""),
            method=inputData.get("method", "Email"),
            email=inputData.get("email", ""),
        )
        # print(f"userId: {userId}")

        for id in sharedItemsIds:
            DBHelper.insert(
                "family_hubs_access_mapping",
                return_column="id",
                user_id=user["uid"],
                family_member_id=userId,
                hubs=id,
                permissions=Permissions.Read.value,
            )

        sendInviteEmail(inputData, user, rusername, encodedToken, inviteLink=True)
        send_otp_email(inputData["email"], otp)

        return {
            "status": 1,
            "message": "Family member added successfully",
            "payload": {},
        }


class GetFamilyMembers(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        duser = request.args.get("dUser")
        fuser = request.args.get("fuser")
        familyMembers = []

        def clean_relationship(rel):
            return rel.replace("❤", "").replace("👶", "").replace("👴", "")

        # Step 1: Get family group id of the user
        gid = DBHelper.find_one(
            table_name="family_members",
            select_fields=["family_group_id"],
            filters={"user_id": uid},
        )

        group_id = gid.get("family_group_id") if gid else None
        if not group_id:
            return {
                "status": 1,
                "message": "No family group found",
                "payload": {
                    "members": [
                        {"name": user.get("user_name", "User"), "relationship": "me"}
                    ]
                },
            }

        # Step 2: Get all members in that group
        group_members = DBHelper.find_all(
            table_name="family_members",
            select_fields=["name", "relationship", "fm_user_id", "email"],
            filters={"family_group_id": group_id},
        )

        for member in group_members:
            relationship = (
                "me"
                if member["fm_user_id"] == uid
                else clean_relationship(member["relationship"])
            )
            familyMembers.append(
                {
                    "name": member["name"],
                    "relationship": relationship,
                    "email": member.get("email", ""),
                }
            )

        # Step 3: If guest, add the owner
        if int(duser) == DocklyUsers.Guests.value and fuser:
            fuserMember = DBHelper.find_one(
                table_name="users",
                filters={"uid": fuser},
                select_fields=["user_name", "email"],
            )
            if fuserMember:
                familyMembers.append(
                    {
                        "name": fuserMember.get("user_name", "User"),
                        "relationship": "Owner",
                        "email": fuserMember.get("email", ""),
                    }
                )

        # Step 4: Add pending invites
        notifications = DBHelper.find_all(
            table_name="notifications",
            filters={"sender_id": uid, "status": "pending"},
            select_fields=["metadata"],
        )

        for notification in notifications:
            metadata = notification.get("metadata", {})
            if metadata:
                input_data = metadata.get("input_data", {})
                familyMembers.append(
                    {
                        "name": input_data.get("name", "Unknown"),
                        "relationship": clean_relationship(
                            input_data.get("relationship", "Unknown")
                        ),
                        "status": "pending",
                        "email": input_data.get("email", ""),
                    }
                )

        # Step 5: Remove duplicate emails
        unique_members = []
        seen_emails = set()
        for member in familyMembers:
            email = member.get("email", "").lower().strip()
            if not email or email not in seen_emails:
                seen_emails.add(email)
                # Remove email from final output if you don't want to expose it
                member.pop("email", None)
                unique_members.append(member)

        # Step 6: Fallback - if no members found, return the current user
        # print(f"unique_membyyyyyyyyyyyyyyyyyyyers: {unique_members}")
        # if not unique_members:
        #     print(f"unique_members: {unique_members}")
        #     unique_members.append(
        #         {"name": user.get("user_name", "User"), "relationship": "me"}
        #     )

        return {
            "status": 1,
            "message": "Family members fetched successfully",
            "payload": {"members": unique_members},
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


class UpdateNote(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        data = request.get_json(force=True)

        note_id = data.get("id")
        title = data.get("title", "").strip()
        description = data.get("description", "").strip()
        category_id = data.get("category_id")

        if not note_id or not title or not description or not category_id:
            return {"status": 0, "message": "Missing required fields"}, 422

        try:
            DBHelper.update(
                table_name="notes_lists",
                filters={"id": note_id, "user_id": uid},
                update_fields={
                    "title": title,
                    "description": description,
                    "category_id": category_id,
                    "updated_at": datetime.now().isoformat(),
                },
            )
            return {"status": 1, "message": "Note updated successfully"}
        except Exception as e:
            return {"status": 0, "message": f"Update failed: {str(e)}"}


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


def get_connected_family_member_ids(uid: str) -> list:
    """
    Returns a unique list of all family member IDs connected to the given user:
    - Members this user has added (sent invites)
    - Members who added this user (received invites)
    - Includes the current user (uid) as well
    """

    sent_invites = DBHelper.find_all(
        table_name="family_members",
        select_fields=["fm_user_id"],
        filters={"user_id": uid},
    )

    received_invites = DBHelper.find_all(
        table_name="family_members",
        select_fields=["user_id"],
        filters={"fm_user_id": uid},
    )

    # Extract ids
    sent_ids = [m["fm_user_id"] for m in sent_invites if m.get("fm_user_id")]
    received_ids = [m["user_id"] for m in received_invites if m.get("user_id")]

    # Combine and deduplicate, including current user
    all_ids = list(set(sent_ids + received_ids + [uid]))
    return all_ids


class GetGuardianEmergencyInfo(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            family_member_ids = get_connected_family_member_ids(uid)
            # 3. Fetch emergency info for all family members
            emergency_info = DBHelper.find_in(
                table_name="guardian_emergency_info",
                select_fields=["name", "relation", "phone", "details", "user_id"],
                field="user_id",
                values=family_member_ids,
            )

            # 4. Format the response
            info_list = []
            for info in emergency_info:
                info_list.append(
                    {
                        "name": info["name"],
                        "relationship": info["relation"],
                        "phone": info["phone"] or "N/A",
                        "details": info["details"] or "N/A",
                        "user_id": info[
                            "user_id"
                        ],  # Optional: to know whose info this is
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


# models.py (Update GetGuardianEmergencyInfo)


class GetFamilyTasks(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        familyMembers = DBHelper.find_all(
            table_name="family_members",
            select_fields=["fm_user_id"],
            filters={"user_id": uid},
        )
        familyMembersIds = [member["fm_user_id"] for member in familyMembers]
        familyMembersIds.append(uid)
        familyMembersTasks = DBHelper.find_in(
            table_name="sharedtasks",
            select_fields=[
                "task",
                "assigned_to",
                "due_date",
                "completed",
                "added_by",
                "added_time",
            ],
            field="user_id",
            values=[familyMembersIds],  # or uids variable
        )
        task_list = []
        for task in familyMembersTasks:
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
            # 1. Fetch both sent and received invites
            sent_invites = DBHelper.find_all(
                table_name="family_members",
                select_fields=["fm_user_id"],
                filters={"user_id": uid},
            )
            received_invites = DBHelper.find_all(
                table_name="family_members",
                select_fields=["user_id"],
                filters={"fm_user_id": uid},
            )

            # 2. Combine and deduplicate
            family_member_ids = [m["fm_user_id"] for m in sent_invites] + [
                m["user_id"] for m in received_invites
            ]
            family_member_ids = list(set(family_member_ids + [uid]))

            # 3. Fetch notes from all those UIDs
            select_fields = [
                "id",
                "title",
                "description",
                "category_id",
                "created_at",
                "updated_at",
            ]
            notes_raw = DBHelper.find_in(
                table_name="notes_lists",
                select_fields=select_fields,
                field="user_id",
                values=family_member_ids,
            )

            # 4. Format results
            notes = []
            for note in notes_raw:
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
        sent_invites = DBHelper.find_all(
            table_name="family_members",
            select_fields=["fm_user_id"],
            filters={"user_id": uid},
        )
        received_invites = DBHelper.find_all(
            table_name="family_members",
            select_fields=["user_id"],
            filters={"fm_user_id": uid},
        )

        # Extract IDs
        familyMembersIds = [m["fm_user_id"] for m in sent_invites] + [
            m["user_id"] for m in received_invites
        ]
        familyMembersIds = list(set(familyMembersIds + [uid]))

        # Fetch projects for all related user IDs
        projects = DBHelper.find_in(
            table_name="projects",
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
            field="uid",
            values=familyMembersIds,
        )

        formatted = [
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
            for p in projects
        ]

        return {
            "status": 1,
            "message": "Projects fetched successfully",
            "payload": {"projects": formatted},
        }


class AddTask(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)

        DBHelper.insert(
            table_name="tasks",
            return_column="uid",
            uid=uid,
            project_id=data.get("project_id"),
            title=data.get("title"),
            due_date=data.get("due_date"),
            assignee=data.get("assignee"),
            type=data.get("type"),
            completed=data.get("completed", False),
        )

        return {"status": 1, "message": "Task added successfully"}


class GetTasks(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        project_id = request.args.get("project_id")

        sent_invites = DBHelper.find_all(
            table_name="family_members",
            select_fields=["fm_user_id"],
            filters={"user_id": uid},
        )
        received_invites = DBHelper.find_all(
            table_name="family_members",
            select_fields=["user_id"],
            filters={"fm_user_id": uid},
        )

        familyMembersIds = [m["fm_user_id"] for m in sent_invites] + [
            m["user_id"] for m in received_invites
        ]
        familyMembersIds = list(set(familyMembersIds + [uid]))

        tasks = DBHelper.find_in(
            table_name="tasks",
            select_fields=[
                "task_id",
                "title",
                "due_date",
                "assignee",
                "type",
                "completed",
                "project_id",  # ✅ Now included
            ],
            field="uid",
            values=familyMembersIds,
        )

        # Filter only tasks for the requested project
        tasks = [t for t in tasks if str(t.get("project_id")) == str(project_id)]

        formatted_tasks = [
            {
                "task_id": t["task_id"],
                "title": t["title"],
                "due_date": t["due_date"].isoformat() if t["due_date"] else None,
                "assignee": t["assignee"],
                "type": t["type"],
                "completed": t["completed"],
            }
            for t in tasks
        ]

        return {
            "status": 1,
            "message": "Tasks fetched",
            "payload": {"tasks": formatted_tasks},
        }


class UpdateTask(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        task_id = data.get("task_id")

        if not task_id:
            return {"status": 0, "message": "Task ID is required"}, 400

        # Update only the provided fields
        updates = {
            "title": data.get("title"),
            "due_date": data.get("due_date"),
            "assignee": data.get("assignee"),
            "type": data.get("type"),
            "completed": data.get("completed"),
            "updated_at": datetime.utcnow(),
        }

        # Remove keys with None values to avoid overwriting
        updates = {k: v for k, v in updates.items() if v is not None}

        DBHelper.update_one(
            table_name="tasks",
            filters={"task_id": task_id, "uid": uid},
            updates=updates,
        )

        return {"status": 1, "message": "Task updated successfully"}


class AddPersonalInfo(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        # logger.debug(
        #     f"Received POST /add/personal-info with data: {request.get_json()}"
        # )
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                # logger.error("No input data provided")
                return {"status": 0, "message": "No input data provided"}, 400

            personal_info = inputData.get("personal_info", {})
            if not personal_info:
                # logger.error("No personal info data provided")
                return {"status": 0, "message": "No personal info data provided"}, 400

            # Validate required fields
            required_fields = ["addedBy"]
            missing_fields = [
                field for field in required_fields if field not in personal_info
            ]
            if missing_fields:
                # logger.error(f"Missing fields: {missing_fields}")
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                }, 400

            # Validate user_id exists in users table
            user_check = DBHelper.find_one(table_name="users", filters={"uid": uid})
            if not user_check:
                # logger.error(f"Invalid userId: {uid}")
                return {"status": 0, "message": f"User with ID {uid} not found"}, 400

            current_time = datetime.now().isoformat()

            personal_id = DBHelper.insert(
                table_name="personal_information",
                return_column="id",
                user_id=uid,
                state_id=personal_info.get("stateId", ""),
                passport=personal_info.get("passport", ""),
                license=personal_info.get("license", ""),
                birth_cert=personal_info.get("birthCert", ""),
                primary_contact=personal_info.get("primaryContact", ""),
                primary_phone=personal_info.get("primaryPhone", ""),
                secondary_contact=personal_info.get("secondaryContact", ""),
                secondary_phone=personal_info.get("secondaryPhone", ""),
                emergency_contact=personal_info.get("emergencyContact", ""),
                emergency_phone=personal_info.get("emergencyPhone", ""),
                blood_type=personal_info.get("bloodType", ""),
                height=personal_info.get("height", ""),
                weight=personal_info.get("weight", ""),
                eye_color=personal_info.get("eyeColor", ""),
                physician=personal_info.get("physician", ""),
                physician_phone=personal_info.get("physicianPhone", ""),
                dentist=personal_info.get("dentist", ""),
                dentist_phone=personal_info.get("dentistPhone", ""),
                insurance=personal_info.get("insurance", ""),
                member_id=personal_info.get("memberId", ""),
                group_num=personal_info.get("groupNum", ""),
                last_checkup=personal_info.get("lastCheckup", ""),
                allergies=personal_info.get("allergies", ""),
                medications=personal_info.get("medications", ""),
                notes=personal_info.get("notes", ""),
                ssn=personal_info.get("ssn", ""),
                student_id=personal_info.get("studentId", ""),
                added_by=personal_info.get("addedBy", ""),
                added_time=current_time,
                edited_by=personal_info.get(
                    "editedBy", personal_info.get("addedBy", "")
                ),
                updated_at=current_time,
            )
            # logger.info(f"Personal info added for user_id: {uid}, id: {personal_id}")
            return {
                "status": 1,
                "message": "Personal information added successfully",
                "payload": {"id": personal_id},
            }, 200
        except Exception as e:
            # logger.error(f"Error adding personal info: {str(e)}")
            return {
                "status": 0,
                "message": f"Failed to add personal info: {str(e)}",
            }, 500


class GetPersonalInfo(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        # logger.debug(f"Received GET /get/personal-info for user_id: {uid}")
        try:
            personal_info = DBHelper.find_one(
                table_name="personal_information",
                select_fields=[
                    "id",
                    "state_id",
                    "passport",
                    "license",
                    "birth_cert",
                    "primary_contact",
                    "primary_phone",
                    "secondary_contact",
                    "secondary_phone",
                    "emergency_contact",
                    "emergency_phone",
                    "blood_type",
                    "height",
                    "weight",
                    "eye_color",
                    "physician",
                    "physician_phone",
                    "dentist",
                    "dentist_phone",
                    "insurance",
                    "member_id",
                    "group_num",
                    "last_checkup",
                    "allergies",
                    "medications",
                    "notes",
                    "ssn",
                    "student_id",
                    "added_by",
                    "added_time",
                    "edited_by",
                    "updated_at",
                ],
                filters={"user_id": uid},
            )

            if not personal_info:
                # logger.info(f"No personal info found for user_id: {uid}")
                return {
                    "status": 1,
                    "message": "No personal information found",
                    "payload": {},
                }, 200

            def serialize_datetime(dt):
                return dt.isoformat() if isinstance(dt, (datetime, date)) else None

            response_data = {
                "id": personal_info["id"],
                "stateId": personal_info["state_id"] or "",
                "passport": personal_info["passport"] or "",
                "license": personal_info["license"] or "",
                "birthCert": personal_info["birth_cert"] or "",
                "primaryContact": personal_info["primary_contact"] or "",
                "primaryPhone": personal_info["primary_phone"] or "",
                "secondaryContact": personal_info["secondary_contact"] or "",
                "secondaryPhone": personal_info["secondary_phone"] or "",
                "emergencyContact": personal_info["emergency_contact"] or "",
                "emergencyPhone": personal_info["emergency_phone"] or "",
                "bloodType": personal_info["blood_type"] or "",
                "height": personal_info["height"] or "",
                "weight": personal_info["weight"] or "",
                "eyeColor": personal_info["eye_color"] or "",
                "physician": personal_info["physician"] or "",
                "physicianPhone": personal_info["physician_phone"] or "",
                "dentist": personal_info["dentist"] or "",
                "dentistPhone": personal_info["dentist_phone"] or "",
                "insurance": personal_info["insurance"] or "",
                "memberId": personal_info["member_id"] or "",
                "groupNum": personal_info["group_num"] or "",
                "lastCheckup": serialize_datetime(personal_info["last_checkup"]),
                "allergies": personal_info["allergies"] or "",
                "medications": personal_info["medications"] or "",
                "notes": personal_info["notes"] or "",
                "ssn": personal_info["ssn"] or "",
                "studentId": personal_info["student_id"] or "",
                "addedBy": personal_info["added_by"] or "",
                "addedTime": serialize_datetime(personal_info["added_time"]),
                "editedBy": personal_info["edited_by"] or "",
                "updatedAt": serialize_datetime(personal_info["updated_at"]),
            }

            return {
                "status": 1,
                "message": "Personal information fetched successfully",
                "payload": response_data,
            }, 200
        except Exception as e:
            # logger.error(f"Error fetching personal info: {str(e)}")
            return {
                "status": 0,
                "message": f"Failed to fetch personal info: {str(e)}",
            }, 500


class UpdatePersonalInfo(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        # logger.debug(
        #     f"Received PUT /update/personal-info with data: {request.get_json()}"
        # )
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                # logger.error("No input data provided")
                return {"status": 0, "message": "No input data provided"}, 400

            personal_info = inputData.get("personal_info", {})
            if not personal_info:
                # logger.error("No personal info data provided")
                return {"status": 0, "message": "No personal info data provided"}, 400

            # Validate required fields
            required_fields = ["id", "addedBy"]
            missing_fields = [
                field for field in required_fields if field not in personal_info
            ]
            if missing_fields:
                # logger.error(f"Missing fields: {missing_fields}")
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                }, 400

            # Validate user_id and record id exist
            user_check = DBHelper.find_one(table_name="users", filters={"uid": uid})
            if not user_check:
                # logger.error(f"Invalid userId: {uid}")
                return {"status": 0, "message": f"User with ID {uid} not found"}, 400

            record_check = DBHelper.find_one(
                table_name="personal_information",
                filters={"id": personal_info["id"], "user_id": uid},
            )
            if not record_check:
                # logger.error(
                #     f"No personal info record found for id: {personal_info['id']} and user_id: {uid}"
                # )
                return {"status": 0, "message": "Personal info record not found"}, 404

            current_time = datetime.now().isoformat()

            DBHelper.update_one(
                table_name="personal_information",
                filters={"id": personal_info["id"], "user_id": uid},
                updates={
                    "state_id": personal_info.get("stateId", ""),
                    "passport": personal_info.get("passport", ""),
                    "license": personal_info.get("license", ""),
                    "birth_cert": personal_info.get("birthCert", ""),
                    "primary_contact": personal_info.get("primaryContact", ""),
                    "primary_phone": personal_info.get("primaryPhone", ""),
                    "secondary_contact": personal_info.get("secondaryContact", ""),
                    "secondary_phone": personal_info.get("secondaryPhone", ""),
                    "emergency_contact": personal_info.get("emergencyContact", ""),
                    "emergency_phone": personal_info.get("emergencyPhone", ""),
                    "blood_type": personal_info.get("bloodType", ""),
                    "height": personal_info.get("height", ""),
                    "weight": personal_info.get("weight", ""),
                    "eye_color": personal_info.get("eyeColor", ""),
                    "physician": personal_info.get("physician", ""),
                    "physician_phone": personal_info.get("physicianPhone", ""),
                    "dentist": personal_info.get("dentist", ""),
                    "dentist_phone": personal_info.get("dentistPhone", ""),
                    "insurance": personal_info.get("insurance", ""),
                    "member_id": personal_info.get("memberId", ""),
                    "group_num": personal_info.get("groupNum", ""),
                    "last_checkup": personal_info.get("lastCheckup", ""),
                    "allergies": personal_info.get("allergies", ""),
                    "medications": personal_info.get("medications", ""),
                    "notes": personal_info.get("notes", ""),
                    "ssn": personal_info.get("ssn", ""),
                    "student_id": personal_info.get("studentId", ""),
                    "edited_by": personal_info.get(
                        "editedBy", personal_info.get("addedBy", "")
                    ),
                    "updated_at": current_time,
                },
            )
            # logger.info(
            #     f"Personal info updated for user_id: {uid}, id: {personal_info['id']}"
            # )
            return {
                "status": 1,
                "message": "Personal information updated successfully",
                "payload": {"id": personal_info["id"]},
            }, 200
        except Exception as e:
            # logger.error(f"Error updating personal info: {str(e)}")
            return {
                "status": 0,
                "message": f"Failed to update personal info: {str(e)}",
            }, 500


class AddSchoolInfo(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        # logger.debug(f"Received POST /add/school-info with data: {request.get_json()}")
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                # logger.error("No input data provided")
                return {"status": 0, "message": "No input data provided"}, 400

            school_info = inputData.get("school_info", {})
            if not school_info:
                # logger.error("No school info data provided")
                return {"status": 0, "message": "No school info data provided"}, 400

            # Validate required fields (based on the UI and existing patterns)
            required_fields = [
                "schoolName",
                "gradeLevel",
                "studentId",
                "graduationYear",
                "homeroomTeacher",
                "guidanceCounselor",
                "currentGpa",
                "attendanceRate",
                "schoolAddress",
                "notes",
            ]
            missing_fields = [
                field for field in required_fields if field not in school_info
            ]
            if missing_fields:
                # logger.error(f"Missing fields: {missing_fields}")
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                }, 400

            current_time = datetime.now().isoformat()

            school_id = DBHelper.insert(
                "school_info",
                return_column="id",
                user_id=uid,
                school_name=school_info.get("schoolName", ""),
                grade_level=school_info.get("gradeLevel", ""),
                student_id=school_info.get("studentId", ""),
                graduation_year=school_info.get("graduationYear", ""),
                homeroom_teacher=school_info.get("homeroomTeacher", ""),
                guidance_counselor=school_info.get("guidanceCounselor", ""),
                current_gpa=school_info.get("currentGpa", ""),
                attendance_rate=school_info.get("attendanceRate", ""),
                school_address=school_info.get("schoolAddress", ""),
                notes=school_info.get("notes", ""),
                added_time=current_time,
                edited_by=school_info.get("editedBy", school_info.get("addedBy", "")),
                updated_at=current_time,
            )
            # logger.info(
            #     f"School info added: {school_info.get('schoolName')}, id: {school_id}"
            # )
            return {
                "status": 1,
                "message": "School info added successfully",
                "payload": {"id": school_id},
            }, 200
        except Exception as e:
            # logger.error(f"Error adding school info: {str(e)}")
            return {"status": 0, "message": f"Failed to add school info: {str(e)}"}, 500


class AddActivities(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        # logger.debug(f"Received POST /add/activities with data: {request.get_json()}")
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                # logger.error("No input data provided")
                return {"status": 0, "message": "No input data provided"}, 400

            activity = inputData.get("activity", {})
            if not activity:
                # logger.error("No activity data provided")
                return {"status": 0, "message": "No activity data provided"}, 400

            # Validate required fields (based on the UI and existing patterns)
            required_fields = ["title", "schedule", "details", "links"]
            missing_fields = [
                field for field in required_fields if field not in activity
            ]
            if missing_fields:
                # logger.error(f"Missing fields: {missing_fields}")
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                }, 400

            current_time = datetime.now().isoformat()

            activity_id = DBHelper.insert(
                "activities",
                return_column="id",
                user_id=uid,
                title=activity.get("title", ""),
                schedule=activity.get("schedule", ""),
                details=json.dumps(activity.get("details", [])),
                links=json.dumps(activity.get("links", [])),
                added_time=current_time,
                edited_by=activity.get("editedBy", activity.get("addedBy", "")),
                updated_at=current_time,
            )
            # logger.info(f"Activity added: {activity.get('title')}, id: {activity_id}")
            return {
                "status": 1,
                "message": "Activity added successfully",
                "payload": {"id": activity_id},
            }, 200
        except Exception as e:
            # logger.error(f"Error adding activity: {str(e)}")
            return {"status": 0, "message": f"Failed to add activity: {str(e)}"}, 500


class GetSchoolInfo(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        # logger.debug(f"Received GET /get/school-info for user_id: {uid}")
        try:
            # Fetch school info
            school_info = DBHelper.find_one(
                table_name="school_info",
                select_fields=[
                    "id",
                    "school_name",
                    "grade_level",
                    "student_id",
                    "graduation_year",
                    "homeroom_teacher",
                    "guidance_counselor",
                    "current_gpa",
                    "attendance_rate",
                    "school_address",
                    "notes",
                    "added_time",
                    "updated_at",
                ],
                filters={"user_id": uid},
            )

            if not school_info:
                # logger.info(f"No school info found for user_id: {uid}")
                return {
                    "status": 1,
                    "message": "No school information found",
                    "payload": {},
                }, 200

            # Fetch activities
            activities = DBHelper.find_all(
                table_name="activities",
                select_fields=[
                    "id",
                    "title",
                    "schedule",
                    "details",
                    "links",
                    "added_time",
                    "updated_at",
                ],
                filters={"user_id": uid},
            )

            def serialize_datetime(dt):
                return dt.isoformat() if isinstance(dt, (datetime, date)) else None

            # Process school info
            response_school_info = {
                "id": school_info["id"],
                "schoolName": school_info["school_name"] or "",
                "gradeLevel": school_info["grade_level"] or "",
                "studentId": school_info["student_id"] or "",
                "graduationYear": school_info["graduation_year"] or "",
                "homeroomTeacher": school_info["homeroom_teacher"] or "",
                "guidanceCounselor": school_info["guidance_counselor"] or "",
                "currentGpa": (
                    str(school_info["current_gpa"])
                    if school_info["current_gpa"]
                    else ""
                ),
                "attendanceRate": school_info["attendance_rate"] or "",
                "schoolAddress": school_info["school_address"] or "",
                "notes": school_info["notes"] or "",
                "addedTime": serialize_datetime(school_info["added_time"]),
                "updatedAt": serialize_datetime(school_info["updated_at"]),
            }

            # Process activities
            response_activities = []
            for activity in activities:
                # Handle details and links as lists if already parsed, otherwise assume they are JSON strings
                details = (
                    activity["details"]
                    if isinstance(activity["details"], list)
                    else json.loads(activity["details"]) if activity["details"] else []
                )
                links = (
                    activity["links"]
                    if isinstance(activity["links"], list)
                    else json.loads(activity["links"]) if activity["links"] else []
                )
                response_activities.append(
                    {
                        "id": activity["id"],
                        "title": activity["title"] or "",
                        "schedule": activity["schedule"] or "",
                        "details": details,
                        "links": links,
                        "addedTime": serialize_datetime(activity["added_time"]),
                        "updatedAt": serialize_datetime(activity["updated_at"]),
                    }
                )

            return {
                "status": 1,
                "message": "School information and activities fetched successfully",
                "payload": {
                    "schoolInfo": response_school_info,
                    "activities": response_activities,
                },
            }, 200
        except Exception as e:
            # logger.error(f"Error fetching school info: {str(e)}")
            return {
                "status": 0,
                "message": f"Failed to fetch school info: {str(e)}",
            }, 500
