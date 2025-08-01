# models.py
import base64
from datetime import date, datetime, time, timedelta
from email.message import EmailMessage
import json
import re
import smtplib
import traceback

# from root.planner.models import create_calendar_event, update_calendar_event
from root.files.models import DriveBaseResource
from root.common import DocklyUsers, HubsEnum, Permissions, Status
from root.utilis import (
    create_calendar_event,
    ensure_drive_folder_structure,
    uniqueId,
    update_calendar_event,
)
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
        sharedItems = [
            DBHelper.find_one("hubs", filters={"name": key}, select_fields=["hid"])
            for key in sharedKeys
        ]
        sharedItemsIds = [item["hid"] for item in sharedItems if item]

        otp = generate_otp()
        rname = inputData["name"]

        # Check if the invited email already belongs to a Dockly user
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
                encodedToken = (
                    "<encoded_token>"  # Optional: generate a JWT or invite token
                )
                inviteLink = f"{WEB_URL}/{rusername}/dashboard"

                sendInviteEmail(
                    inputData, user, rusername, encodedToken, inviteLink=inviteLink
                )

                notification = {
                    "sender_id": user["uid"],
                    "receiver_id": existingUser["uid"],  # ✅ receiver_id present
                    "message": f"You have been invited to join {user['user_name']}'s Family Hub '{rusername}'",
                    "task_type": "family_request",
                    "action_required": True,
                    "status": "pending",
                    "hub": HubsEnum.Family.value,
                    "metadata": {
                        "input_data": inputData,
                        "shared_items_ids": sharedItemsIds,
                        "sender_user": user,
                    },
                }

                DBHelper.insert("notifications", return_column="id", **notification)

                return {
                    "status": 1,
                    "message": "Family member invitation sent successfully",
                    "payload": {},
                }

        # ========== INVITE-ONLY FLOW FOR UNREGISTERED EMAIL ==========
        payload = json.dumps(
            {
                "otp": otp,
                "email": inputData["email"],
                "fuser": user["uid"],
                "duser": 5,  # InvitePending type
            }
        )
        encodedToken = base64.urlsafe_b64encode(payload.encode()).decode()
        inviteLink = f"{WEB_URL}/signup?invite_token={encodedToken}"

        DBHelper.insert(
            "notifications",
            return_column="id",
            sender_id=user["uid"],
            # No receiver_id yet because user hasn't signed up
            message=f"You've been invited to join {user['user_name']}'s Family Hub",
            task_type="family_invite",
            status="pending",
            hub=HubsEnum.Family.value,
            metadata={
                "input_data": inputData,
                "shared_items_ids": sharedItemsIds,
                "sender_user": user,
            },
        )

        sendInviteEmail(
            inputData, user, user["user_name"], encodedToken, inviteLink=inviteLink
        )
        send_otp_email(inputData["email"], otp)

        return {
            "status": 1,
            "message": "Family member invitation sent successfully",
            "payload": {},
        }


class GetFamilyMembers(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        duser = request.args.get("dUser")
        fuser = request.args.get("fuser")
        familyMembers = []

        def clean_relationship(rel):
            return (
                rel.replace("❤", "")
                .replace("👶", "")
                .replace("👴", "")
                .replace("🛡", "")
                .strip()
            )

        # Step 0: Preload notifications metadata for enrichment
        notifications = DBHelper.find_all(
            table_name="notifications",
            filters={"sender_id": uid},  # include all (pending or accepted)
            select_fields=["metadata", "status"],  # Added status field
        )

        email_to_metadata = {}
        pending_invites = []  # Store pending invites separately

        for notif in notifications:
            meta = notif.get("metadata", {})
            input_data = meta.get("input_data", {})
            email = input_data.get("email", "")

            if email:
                email_to_metadata[email.lower().strip()] = {
                    "sharedItems": input_data.get("sharedItems", {}),
                    "permissions": input_data.get("permissions", {}),
                }

            # Collect pending invites here instead of separate query
            if notif.get("status") == "pending" and input_data:
                pending_invites.append(
                    {
                        "name": input_data.get("name", "Unknown"),
                        "relationship": clean_relationship(
                            input_data.get("relationship", "Unknown")
                        ),
                        "status": "pending",
                        "email": input_data.get("email", ""),
                        "id": input_data.get("id", ""),
                    }
                )

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
                        {
                            "name": user.get("user_name", "User"),
                            "relationship": "me",
                            "id": uid,
                        }
                    ]
                    + pending_invites  # Include pending invites even without group
                },
            }

        # Step 2: Get all members in that group
        group_members = DBHelper.find_all(
            table_name="family_members",
            select_fields=["name", "relationship", "fm_user_id", "email", "id"],
            filters={"family_group_id": group_id},
        )

        for member in group_members:
            relationship = (
                "me"
                if member["fm_user_id"] == uid
                else clean_relationship(member["relationship"])
            )

            email = member.get("email", "").lower().strip()
            metadata = email_to_metadata.get(email, {})
            sharedItems = metadata.get("sharedItems", {})
            permissions = metadata.get("permissions", {})

            familyMembers.append(
                {
                    "name": member["name"],
                    "relationship": relationship,
                    "email": email,
                    "id": member.get("id", ""),
                    "sharedItems": sharedItems,
                    "permissions": permissions,
                }
            )

        # Step 3: If guest, add the owner
        if duser is not None and fuser:
            try:
                if int(duser) == DocklyUsers.Guests.value:
                    fuserMember = DBHelper.find_one(
                        table_name="users",
                        filters={"uid": fuser},
                        select_fields=["user_name", "email", "id"],
                    )
                    if fuserMember:
                        familyMembers.append(
                            {
                                "name": fuserMember.get("user_name", "User"),
                                "relationship": "Owner",
                                "email": fuserMember.get("email", ""),
                                "id": fuserMember.get("id", ""),
                            }
                        )
            except ValueError:
                pass  # Invalid duser, skip

        # Step 4: Add pending invites (already collected in Step 0)
        familyMembers.extend(pending_invites)

        # Step 5: Remove duplicate emails and hide email from output
        unique_members = []
        seen_emails = set()
        for member in familyMembers:
            email = member.get("email", "").lower().strip()
            if not email or email not in seen_emails:
                seen_emails.add(email)
                member.pop("email", None)
                unique_members.append(member)

        return {
            "status": 1,
            "message": "Family members fetched successfully",
            "payload": {"members": unique_members},
        }


def send_pet_email(
    email, pet_name, species, breed, contact, added_by="Family Hub Team"
):
    try:
        msg = EmailMessage()
        msg["Subject"] = f"Pet Addition Notification for {pet_name}"
        msg["From"] = EMAIL_SENDER
        msg["To"] = email

        message_body = f"""
Dear Guardian,

{pet_name} ({species}, {breed}) has been added to our Family Hub.
Contact: {contact}
Email: {email}

Best regards,
{added_by}
        """.strip()

        msg.set_content(message_body)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)

        return {"status": 1, "email": email}
    except Exception as e:
        return {"status": 0, "email": email, "error": str(e)}


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

        family_group_id = inputData.get("family_group_id")
        if not family_group_id:
            gid = DBHelper.find_one(
                "family_members",
                filters={"user_id": uid},
                select_fields=["family_group_id"],
            )
            family_group_id = gid.get("family_group_id") if gid else None

        if not family_group_id:
            return {"status": 0, "message": "Missing family group ID"}, 400

        pet_id = DBHelper.insert(
            "pets",
            return_column="user_id",
            user_id=uid,
            name=inputData.get("name", ""),
            species=inputData.get("species", ""),
            breed=inputData.get("breed", ""),
            guardian_email=inputData.get("guardian_email", ""),
            guardian_contact=inputData.get("guardian_contact", ""),
            family_group_id=family_group_id,
        )

        # Send email to guardian
        email_result = send_pet_email(
            email=inputData.get("guardian_email", ""),
            pet_name=inputData.get("name", ""),
            species=inputData.get("species", ""),
            breed=inputData.get("breed", ""),
            contact=inputData.get("guardian_contact", ""),
            added_by=user.get("name") if user else "Family Hub Team",
        )

        if email_result.get("status") != 1:
            return {
                "status": 1,
                "message": f"Pet added successfully, but failed to send email: {email_result.get('error')}",
                "payload": {"userId": pet_id},
            }

        return {
            "status": 1,
            "message": "Pet added successfully and email sent.",
            "payload": {"userId": pet_id},
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
        fuser = request.args.get("fuser")  # from query param
        if not fuser:
            # Fallback to current user's family_group_id
            gid = DBHelper.find_one(
                table_name="family_members",
                select_fields=["family_group_id"],
                filters={"user_id": uid},
            )
            fuser = gid.get("family_group_id") if gid else None

        if not fuser:
            return {"status": 0, "message": "Missing family_group_id (fuser)"}, 400

        pets = DBHelper.find_all(
            table_name="pets",
            select_fields=[
                "name",
                "species",
                "breed",
                "guardian_email",
                "guardian_contact",
            ],
            filters={"family_group_id": fuser},
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


def get_category_name(category_id):
    cat = DBHelper.find_one(
        table_name="notes_categories",
        filters={"id": category_id},
        select_fields=["name"],  # Only get the 'name' field
    )

    return cat["name"] if cat else ""


class AddNotes(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            inputData = request.get_json(force=True)
        except Exception as e:
            return {"status": 0, "message": f"Invalid JSON: {str(e)}"}, 422

        title = inputData.get("title", "").strip()
        description = inputData.get("description", "").strip()
        category_id = inputData.get("category_id")
        hub = inputData.get("hub", "").strip().upper()  # ✅ Add this

        # Validate all fields
        if not title or not description or not category_id or not hub:
            return {
                "status": 0,
                "message": "Fields title, description, category_id, and hub are required.",
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
                hub=hub,  # ✅ Save hub here
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
                    "hub": hub,
                },
            }
        except Exception as e:
            return {"status": 0, "message": f"Failed to add note: {str(e)}"}, 500


class EmailSender:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.smtp_user = EMAIL_SENDER
        self.smtp_password = EMAIL_PASSWORD

    def send_note_email(self, recipient_email, note):
        msg = EmailMessage()
        msg["Subject"] = f"Shared Note: {note['title']}"
        msg["From"] = self.smtp_user
        msg["To"] = recipient_email

        hub_name = note.get("hub", "FAMILY")
        created = note.get("created_at") or ""
        if created:
            created = created.split("T")[0]

        msg.set_content(
            f"""
Hi there!

I wanted to share this note with you:

Title: {note['title']}
Description: {note['description']}
Hub: {hub_name}
Created: {created}

Best regards!
""".strip()
        )

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return True, "Email sent successfully"
        except Exception as e:
            return False, str(e)


class ShareNote(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(force=True)
        except Exception as e:
            return {"status": 0, "message": f"Invalid JSON: {str(e)}"}, 400

        email = data.get("email")
        note = data.get("note")

        if not email or not note:
            return {
                "status": 0,
                "message": "Both 'email' and 'note' are required.",
            }, 422

        email_sender = EmailSender()
        success, message = email_sender.send_note_email(email, note)

        if success:
            return {"status": 1, "message": "Note shared via email."}
        else:
            return {"status": 0, "message": f"Failed to send email: {message}"}, 500


class GetNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid=None, user=None):
        try:
            # 1. Get all family member IDs
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

            family_member_ids = [m["fm_user_id"] for m in sent_invites] + [
                m["user_id"] for m in received_invites
            ]
            family_member_ids = list(set(family_member_ids + [uid]))

            # 2. Get hub from query param (safe handling)
            hub = request.args.get("hub")
            if hub:
                hub = hub.strip().upper()
                if hub == "UNDEFINED":
                    hub = None  # Treat invalid 'undefined' string as None
            else:
                hub = None

            # 3. Prepare filters
            extra_filters = {"is_active": True}
            if hub:
                extra_filters["hub"] = hub

            # 4. Fetch notes
            select_fields = [
                "id",
                "title",
                "description",
                "category_id",
                "created_at",
                "updated_at",
                "hub",
            ]
            notes_raw = DBHelper.find_in(
                table_name="notes_lists",
                select_fields=select_fields,
                field="user_id",
                values=family_member_ids,
                extra_filters=extra_filters,
            )

            # 5. Format notes and include category_name
            notes = []
            for note in notes_raw:
                notes.append(
                    {
                        "id": note["id"],
                        "title": note["title"],
                        "description": note["description"],
                        "category_id": note["category_id"],
                        "category_name": get_category_name(note["category_id"]),
                        "hub": note.get("hub", "FAMILY"),
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


class UpdateNote(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        data = request.get_json(force=True)

        note_id = data.get("id")
        title = data.get("title", "").strip()
        description = data.get("description", "").strip()
        category_id = data.get("category_id")
        hub = data.get("hub", "").strip().upper()  # ✅ NEW: get hub from frontend

        if not note_id or not title or not description or not category_id or not hub:
            return {
                "status": 0,
                "message": "Missing required fields: id, title, description, category_id, or hub",
            }, 422

        try:
            DBHelper.update(
                table_name="notes_lists",
                filters={"id": note_id, "user_id": uid},
                update_fields={
                    "title": title,
                    "description": description,
                    "category_id": category_id,
                    "hub": hub,  # ✅ NEW: update hub
                    "updated_at": datetime.now().isoformat(),
                },
            )
            return {"status": 1, "message": "Note updated successfully"}
        except Exception as e:
            return {"status": 0, "message": f"Update failed: {str(e)}"}


class DeleteNote(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        note_id = request.args.get("id")

        if not note_id:
            return {"status": 0, "message": "Note ID is required", "payload": {}}

        try:
            # DBHelper.delete_all("note", {"id": note_id, "user_id": uid})
            DBHelper.update_one(
                "notes_lists",
                filters={"id": note_id},
                updates={"is_active": False},
            )
            return {"status": 1, "message": "Note deleted successfully"}
        except Exception as e:
            return {"status": 0, "message": "Failed to delete note", "error": str(e)}


class AddNoteCategory(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            data = request.get_json(force=True)
            name = data.get("name", "").strip()
            icon = data.get("icon", "📁")
            now = datetime.now().isoformat()

            if not name:
                return {"status": 0, "message": "Category name is required"}, 400

            # generate custom ID
            nid = uniqueId(digit=3, isNum=True)

            # ✅ insert with pinned=True
            DBHelper.insert(
                "notes_categories",
                id=nid,
                user_id=uid,
                name=name,
                icon=icon,
                pinned=True,  # ✅ store pinned
                created_at=now,
                updated_at=now,
            )

            return {
                "status": 1,
                "message": "Category added",
                "payload": {"id": nid},  # ✅ match frontend expectation
            }
        except Exception as e:
            return {"status": 0, "message": f"Failed to add category: {str(e)}"}, 500


class UpdateNoteCategory(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            data = request.get_json(force=True)
            category_id = data.get("id")
            pinned = data.get("pinned")

            if category_id is None or pinned is None:
                return {"status": 0, "message": "Missing id or pinned value"}, 400

            DBHelper.update_one(
                table_name="notes_categories",
                filters={"id": category_id, "user_id": uid},
                updates={"pinned": pinned},
            )

            return {"status": 1, "message": "Category pin updated"}
        except Exception as e:
            return {"status": 0, "message": str(e)}, 500


class GetNoteCategories(Resource):
    @auth_required(isOptional=True)
    def get(self, uid=None, user=None):
        try:
            categories = DBHelper.find_all(
                "notes_categories",
                filters={"user_id": uid, "is_active": True},
                select_fields=["id", "name", "icon", "pinned"],
            )

            notesCategories = []
            for category in categories:
                notesCategories.append(
                    {
                        "title": category["name"],
                        "icon": category["icon"],
                        "id": category["id"],
                        "pinned": category["pinned"],
                    }
                )
            # print(f"==>> notesCategories: {notesCategories}")

            return {"status": 1, "payload": notesCategories}

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch categories: {str(e)}"}


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
                    "source": input_data.get("source", "familyhub"),
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
                source=input_data.get("source", "familyhub"),
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
                "source",
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
                "source": p["source"],
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

        # Fetch the project title
        project = DBHelper.find_one(
            "projects", filters={"project_id": data.get("project_id"), "uid": uid}
        )
        if not project:
            return {"status": 0, "message": "Project not found"}

        title = data.get("title")
        due_date_str = data.get("due_date")  # Format: 'YYYY-MM-DD'

        # Set up all-day event times
        event_title = f"{project['title']} - {title}"
        start_dt = datetime.strptime(due_date_str, "%Y-%m-%d")
        end_dt = start_dt + timedelta(days=1)  # All-day ends at midnight next day

        # Create Google Calendar event
        calendar_event_id = create_calendar_event(uid, event_title, start_dt, end_dt)

        # Save task with calendar_event_id
        DBHelper.insert(
            table_name="tasks",
            return_column="uid",
            uid=uid,
            project_id=data.get("project_id"),
            title=title,
            due_date=due_date_str,
            assignee=data.get("assignee"),
            type=data.get("type"),
            completed=data.get("completed", False),
            calendar_event_id=calendar_event_id,
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

        task = DBHelper.find_one("tasks", filters={"task_id": task_id, "uid": uid})
        if not task:
            return {"status": 0, "message": "Task not found"}

        updates = {
            "title": data.get("title"),
            "due_date": data.get("due_date"),
            "assignee": data.get("assignee"),
            "type": data.get("type"),
            "completed": data.get("completed"),
            "updated_at": datetime.utcnow(),
        }
        updates = {k: v for k, v in updates.items() if v is not None}

        try:
            # ───── Get event details ─────
            new_title = updates.get("title", task["title"])
            new_due_date_str = updates.get("due_date", task["due_date"])
            start_dt = datetime.strptime(new_due_date_str, "%Y-%m-%d")
            end_dt = start_dt + timedelta(days=1)

            project = DBHelper.find_one(
                "projects", filters={"project_id": task["project_id"], "uid": uid}
            )
            event_title = f"{project['title']} - {new_title}"

            calendar_event_id = task.get("calendar_event_id")
            print("Existing calendar_event_id:", calendar_event_id)

            if calendar_event_id:
                try:
                    # ✅ Attempt to update existing event
                    update_calendar_event(
                        uid, calendar_event_id, event_title, start_dt, end_dt
                    )
                    print("Google Calendar event updated")
                except Exception as e:
                    print(
                        "⚠ Failed to update existing calendar event. Creating new one."
                    )
                    # 🔁 If update fails (event might have been deleted), create new event
                    new_event_id = create_calendar_event(
                        uid, event_title, start_dt, end_dt
                    )
                    updates["calendar_event_id"] = new_event_id
            else:
                print("No existing calendar_event_id. Creating new one.")
                new_event_id = create_calendar_event(uid, event_title, start_dt, end_dt)
                updates["calendar_event_id"] = new_event_id

        except Exception as e:
            print("Google Calendar Sync Error:", str(e))

        # Update task in DB
        DBHelper.update_one(
            table_name="tasks",
            filters={"task_id": task_id, "uid": uid},
            updates=updates,
        )

        return {"status": 1, "message": "Task updated successfully"}


class AddPersonalInfo(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                return {"status": 0, "message": "No input data provided"}, 400

            personal_info = inputData.get("personal_info", {})
            if not personal_info:
                return {"status": 0, "message": "No personal info data provided"}, 400

            required_fields = ["addedBy", "userId"]
            missing_fields = [
                field for field in required_fields if field not in personal_info
            ]
            if missing_fields:
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                }, 400

            current_time = datetime.now().isoformat()
            fm_user_id = personal_info["userId"]

            personal_id = DBHelper.insert(
                table_name="personal_information",
                return_column="id",
                user_id=uid,
                family_member_user_id=fm_user_id,
                first_name=personal_info.get("firstName", ""),
                middle_name=personal_info.get("middleName", ""),
                last_name=personal_info.get("lastName", ""),
                preferred_name=personal_info.get("preferredName", ""),
                nicknames=personal_info.get("nicknames", ""),
                relationship=personal_info.get("relationship", ""),
                date_of_birth=personal_info.get("dateOfBirth") or None,
                age=personal_info.get("age", ""),
                birthplace=personal_info.get("birthplace", ""),
                gender=personal_info.get("gender", ""),
                phone_number=personal_info.get("phoneNumber", ""),
                primary_email=personal_info.get("primaryEmail", ""),
                additional_emails=personal_info.get("additionalEmails", ""),
                same_as_primary=personal_info.get("sameAsPrimary", False),
                birth_cert_number=personal_info.get("birthCertNumber", ""),
                state_id=personal_info.get("stateId", ""),
                passport=personal_info.get("passport", ""),
                license=personal_info.get("license", ""),
                birth_cert=personal_info.get("birthCert", ""),
                primary_contact=personal_info.get("primaryContact", ""),
                primary_phone=personal_info.get("primaryContactPhone", ""),
                secondary_contact=personal_info.get("secondaryContact", ""),
                secondary_phone=personal_info.get("secondaryContactPhone", ""),
                emergency_contact=personal_info.get("emergencyContact", ""),
                emergency_phone=personal_info.get("emergencyPhone", ""),
                blood_type=personal_info.get("bloodType", ""),
                height=personal_info.get("height", ""),
                weight=personal_info.get("weight", ""),
                eye_color=personal_info.get("eyeColor", ""),
                insurance=personal_info.get("insurance", ""),
                member_id=personal_info.get("memberId", ""),
                group_num=personal_info.get("groupNum", ""),
                last_checkup=personal_info.get("lastCheckup") or None,
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

            return {
                "status": 1,
                "message": "Personal information added successfully",
                "payload": {"id": personal_id},
            }, 200
        except Exception as e:
            return {
                "status": 0,
                "message": f"Failed to add personal info: {str(e)}",
            }, 500


class GetPersonalInfo(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            fm_user_id = request.args.get("userId") or uid
            personal_info = DBHelper.find_one(
                table_name="personal_information",
                select_fields=[
                    "id",
                    "first_name",
                    "middle_name",
                    "last_name",
                    "preferred_name",
                    "nicknames",
                    "relationship",
                    "date_of_birth",
                    "age",
                    "birthplace",
                    "gender",
                    "phone_number",
                    "primary_email",
                    "additional_emails",
                    "same_as_primary",
                    "birth_cert_number",
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
                filters={"family_member_user_id": fm_user_id},
            )

            if not personal_info:
                return {
                    "status": 1,
                    "message": "No personal information found",
                    "payload": {},
                }, 200

            def serialize_datetime(dt):
                return dt.isoformat() if isinstance(dt, (datetime, date)) else ""

            response_data = {
                "id": personal_info["id"],
                "firstName": personal_info["first_name"] or "",
                "middleName": personal_info["middle_name"] or "",
                "lastName": personal_info["last_name"] or "",
                "preferredName": personal_info["preferred_name"] or "",
                "nicknames": personal_info["nicknames"] or "",
                "relationship": personal_info["relationship"] or "",
                "dateOfBirth": (
                    str(personal_info["date_of_birth"])
                    if personal_info["date_of_birth"]
                    else None
                ),
                "age": personal_info["age"] or "",
                "birthplace": personal_info["birthplace"] or "",
                "gender": personal_info["gender"] or "",
                "phoneNumber": personal_info["phone_number"] or "",
                "primaryEmail": personal_info["primary_email"] or "",
                "additionalEmails": personal_info["additional_emails"] or "",
                "sameAsPrimary": personal_info["same_as_primary"] or False,
                "birthCertNumber": personal_info["birth_cert_number"] or "",
                "stateId": personal_info["state_id"] or "",
                "passport": personal_info["passport"] or "",
                "license": personal_info["license"] or "",
                "birthCert": personal_info["birth_cert"] or "",
                "primaryContact": personal_info["primary_contact"] or "",
                "primaryContactPhone": personal_info["primary_phone"] or "",
                "secondaryContact": personal_info["secondary_contact"] or "",
                "secondaryContactPhone": personal_info["secondary_phone"] or "",
                "emergencyContact": personal_info["emergency_contact"] or "",
                "emergencyPhone": personal_info["emergency_phone"] or "",
                "bloodType": personal_info["blood_type"] or "",
                "height": personal_info["height"] or "",
                "weight": personal_info["weight"] or "",
                "eyeColor": personal_info["eye_color"] or "",
                "insurance": personal_info["insurance"] or "",
                "memberId": personal_info["member_id"] or "",
                "groupNum": personal_info["group_num"] or "",
                "lastCheckup": serialize_datetime(personal_info["last_checkup"])
                or None,
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
            return {
                "status": 0,
                "message": f"Failed to fetch personal info: {str(e)}",
            }, 500


class UpdatePersonalInfo(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            fm_user_id = request.args.get("userId") or uid
            inputData = request.get_json(silent=True)
            if not inputData:
                return {"status": 0, "message": "No input data provided"}, 400

            personal_info = inputData.get("personal_info", {})
            if not personal_info:
                return {"status": 0, "message": "No personal info data provided"}, 400

            required_fields = ["addedBy"]
            missing_fields = [
                field for field in required_fields if field not in personal_info
            ]
            if missing_fields:
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                }, 400

            user_check = DBHelper.find_one(table_name="users", filters={"uid": uid})
            if not user_check:
                return {"status": 0, "message": f"User with ID {uid} not found"}, 400

            record_check = DBHelper.find_one(
                table_name="personal_information",
                filters={"family_member_user_id": fm_user_id, "user_id": uid},
            )
            if not record_check:
                return {"status": 0, "message": "Personal info record not found"}, 404

            personal_id = record_check["id"]

            if not record_check:
                return {"status": 0, "message": "Personal info record not found"}, 404

            current_time = datetime.now().isoformat()

            updates = {}
            field_map = {
                "firstName": "first_name",
                "middleName": "middle_name",
                "lastName": "last_name",
                "preferredName": "preferred_name",
                "nicknames": "nicknames",
                "relationship": "relationship",
                "dateOfBirth": "date_of_birth",
                "age": "age",
                "birthplace": "birthplace",
                "gender": "gender",
                "phoneNumber": "phone_number",
                "primaryEmail": "primary_email",
                "additionalEmails": "additional_emails",
                "sameAsPrimary": "same_as_primary",
                "birthCertNumber": "birth_cert_number",
                "stateId": "state_id",
                "passport": "passport",
                "license": "license",
                "birthCert": "birth_cert",
                "primaryContact": "primary_contact",
                "primaryContactPhone": "primary_phone",
                "secondaryContact": "secondary_contact",
                "secondaryContactPhone": "secondary_phone",
                "emergencyContact": "emergency_contact",
                "emergencyPhone": "emergency_phone",
                "bloodType": "blood_type",
                "height": "height",
                "weight": "weight",
                "eyeColor": "eye_color",
                "insurance": "insurance",
                "memberId": "member_id",
                "groupNum": "group_num",
                "lastCheckup": "last_checkup",
                "allergies": "allergies",
                "medications": "medications",
                "notes": "notes",
                "ssn": "ssn",
                "studentId": "student_id",
            }

            for input_key, db_key in field_map.items():
                if input_key in personal_info:
                    updates[db_key] = personal_info[input_key]

            updates["edited_by"] = personal_info.get(
                "editedBy", personal_info.get("addedBy", "")
            )
            updates["updated_at"] = current_time

            DBHelper.update_one(
                table_name="personal_information",
                filters={"id": personal_id},
                updates=updates,
            )

            return {
                "status": 1,
                "message": "Personal information updated successfully",
                "payload": {"id": personal_id},
            }, 200
        except Exception as e:
            print(traceback.format_exc())
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


class AddProvider(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                return {"status": 0, "message": "No input data provided"}, 400

            provider = inputData.get("provider", {})
            if not provider:
                return {"status": 0, "message": "No provider data provided"}, 400

            required_fields = ["providerTitle", "providerName", "addedBy", "userId"]
            missing_fields = [f for f in required_fields if f not in provider]
            if missing_fields:
                return {
                    "status": 0,
                    "message": f"Missing fields: {', '.join(missing_fields)}",
                }, 400

            now = datetime.now().isoformat()

            provider_id = DBHelper.insert(
                table_name="healthcare_providers",
                return_column="id",
                user_id=uid,
                family_member_user_id=provider["userId"],
                provider_title=provider["providerTitle"],
                provider_name=provider["providerName"],
                provider_phone=provider.get("providerPhone", ""),
                added_by=provider["addedBy"],
                added_time=now,
                edited_by=provider.get("editedBy", provider["addedBy"]),
                updated_at=now,
            )

            return {
                "status": 1,
                "message": "Provider added",
                "payload": {"id": provider_id},
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to add provider: {str(e)}"}, 500


class GetProviders(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            user_id = request.args.get("userId")
            if not user_id:
                return {"status": 0, "message": "User ID is required"}, 400

            providers = DBHelper.find_all(
                table_name="healthcare_providers",
                filters={"family_member_user_id": user_id},
            )

            # Convert datetime objects to ISO strings
            for provider in providers:
                for key in ["added_time", "updated_at"]:
                    if provider.get(key) and isinstance(provider[key], datetime):
                        provider[key] = provider[key].isoformat()

            return {"status": 1, "payload": providers}, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch providers: {str(e)}"}, 500


class UpdateProvider(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                return {"status": 0, "message": "No input data provided"}, 400

            provider = inputData.get("provider", {})
            if not provider:
                return {"status": 0, "message": "No provider data provided"}, 400

            required_fields = [
                "id",
                "providerTitle",
                "providerName",
                "addedBy",
                "userId",
            ]
            missing = [f for f in required_fields if f not in provider]
            if missing:
                return {
                    "status": 0,
                    "message": f"Missing fields: {', '.join(missing)}",
                }, 400

            record = DBHelper.find_one(
                "healthcare_providers",
                {"id": provider["id"], "family_member_user_id": provider["userId"]},
            )
            if not record:
                return {"status": 0, "message": "Provider record not found"}, 404

            now = datetime.now().isoformat()

            DBHelper.update_one(
                table_name="healthcare_providers",
                filters={"id": provider["id"]},
                updates={
                    "provider_title": provider["providerTitle"],
                    "provider_name": provider["providerName"],
                    "provider_phone": provider.get("providerPhone", ""),
                    "edited_by": provider.get("editedBy", provider["addedBy"]),
                    "updated_at": now,
                },
            )

            return {
                "status": 1,
                "message": "Provider updated",
                "payload": {"id": provider["id"]},
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to update provider: {str(e)}"}, 500


class GetFamilyMemberUserId(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        member_id = request.args.get("memberId")
        if not member_id:
            return {"status": 0, "message": "Missing memberId"}, 400

        member = DBHelper.find_one(
            table_name="family_members",
            filters={"id": member_id},
            select_fields=["fm_user_id"],
        )

        if not member:
            return {"status": 0, "message": "Family member not found"}, 404

        return {"status": 1, "payload": {"userId": member["fm_user_id"]}}


class AddAccountPassword(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                return {"status": 0, "message": "No input data provided"}, 400

            account = inputData.get("account", {})
            if not account:
                return {"status": 0, "message": "No account data provided"}, 400

            required_fields = ["category", "title", "addedBy", "userId"]
            missing_fields = [f for f in required_fields if f not in account]
            if missing_fields:
                return {
                    "status": 0,
                    "message": f"Missing fields: {', '.join(missing_fields)}",
                }, 400

            now = datetime.now().isoformat()

            account_id = DBHelper.insert(
                table_name="account_passwords",
                return_column="id",
                user_id=uid,
                family_member_user_id=account["userId"],
                category=account["category"],
                title=account["title"],
                username=account.get("username", ""),
                password=account.get("password", ""),
                url=account.get("url", ""),
                added_by=account["addedBy"],
                added_time=now,
                edited_by=account.get("editedBy", account["addedBy"]),
                updated_at=now,
            )

            return {
                "status": 1,
                "message": "Account added successfully",
                "payload": {"id": account_id},
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to add account: {str(e)}"}, 500


class GetAccountPasswords(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            user_id = request.args.get("userId")
            if not user_id:
                return {"status": 0, "message": "Missing userId"}, 400

            results = DBHelper.find_all(
                table_name="account_passwords",
                filters={"family_member_user_id": user_id},
            )
            for r in results:
                for key in r:
                    if isinstance(r[key], datetime):
                        r[key] = r[key].isoformat()

            return {
                "status": 1,
                "message": "Accounts fetched successfully",
                "payload": results,
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch accounts: {str(e)}"}, 500


class UpdateAccountPassword(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                return {"status": 0, "message": "No input data provided"}, 400

            account = inputData.get("account", {})
            if not account or "id" not in account:
                return {"status": 0, "message": "Missing account ID or data"}, 400

            update_fields = {
                "category": account.get("category"),
                "title": account.get("title"),
                "username": account.get("username"),
                "password": account.get("password"),
                "url": account.get("url"),
                "edited_by": account.get("editedBy", uid),
                "updated_at": datetime.now().isoformat(),
            }

            # Remove any None values (e.g., if field wasn't updated)
            update_fields = {k: v for k, v in update_fields.items() if v is not None}

            DBHelper.update_one(
                table_name="account_passwords",
                filters={"id": account["id"]},
                updates=update_fields,
            )

            return {"status": 1, "message": "Account updated successfully"}, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to update account: {str(e)}"}, 500


from werkzeug.utils import secure_filename
from googleapiclient.http import MediaIoBaseUpload
import io


def get_or_create_subfolder(service, folder_name: str, parent_id: str):
    """Check if a folder with name exists under parent, else create it"""
    query = (
        f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' "
        f"and '{parent_id}' in parents and trashed = false"
    )

    response = service.files().list(q=query, fields="files(id, name)").execute()
    folders = response.get("files", [])

    if folders:
        return folders[0]["id"]

    # Folder not found, so create it
    metadata = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id],
    }
    created_folder = service.files().create(body=metadata, fields="id").execute()
    return created_folder["id"]


class UploadDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]
            hub = request.form.get("hub", "").capitalize()
            doc_type = request.form.get("docType", "").strip()

            if not hub or hub not in ["Home", "Family", "Finance", "Health"]:
                return {"status": 0, "message": "Invalid or missing hub name"}, 400

            if hub == "Family" and doc_type != "EstateDocuments":
                return {
                    "status": 0,
                    "message": "Missing or invalid docType for Family hub",
                }, 400

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }, 401

            # Step 1: Get or create DOCKLY > Family
            folder_data = ensure_drive_folder_structure(service)
            family_folder_id = folder_data["subfolders"].get("Family")
            if not family_folder_id:
                return {"status": 0, "message": "Family folder not found"}, 404

            # Step 2: Create/get Estate Documents folder inside Family
            estate_folder_id = get_or_create_subfolder(
                service, "Estate Documents", parent_id=family_folder_id
            )

            # Step 3: Upload to Estate Documents
            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [estate_folder_id],
            }

            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
            )

            uploaded_file = (
                service.files()
                .create(
                    body=file_metadata, media_body=media, fields="id, name, webViewLink"
                )
                .execute()
            )

            return {
                "status": 1,
                "message": "File uploaded successfully",
                "payload": {"file": uploaded_file},
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to upload file: {str(e)}"}, 500


class GetFamilyDriveFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected",
                    "payload": {},
                }, 401

            folder_data = ensure_drive_folder_structure(service)
            family_folder_id = folder_data["subfolders"].get("Family")
            if not family_folder_id:
                return {
                    "status": 0,
                    "message": "Family folder not found",
                    "payload": {},
                }, 404

            # 🔥 Get or create "Estate Documents" subfolder inside Family
            estate_folder_id = get_or_create_subfolder(
                service, "Estate Documents", parent_id=family_folder_id
            )

            # 🔍 Fetch only files from Estate Documents folder
            query = f"'{estate_folder_id}' in parents and trashed = false"
            results = (
                service.files()
                .list(q=query, fields="files(id, name, webViewLink)", spaces="drive")
                .execute()
            )
            files = results.get("files", [])

            return {
                "status": 1,
                "message": "Estate documents fetched successfully",
                "payload": {"files": files},
            }, 200

        except Exception as e:
            return {
                "status": 0,
                "message": f"Failed to fetch estate documents: {str(e)}",
            }, 500


class DeleteDriveFile(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        file_id = request.args.get("file_id")
        if not file_id:
            return {"status": 0, "message": "Missing file_id"}, 400

        service = self.get_drive_service(uid)
        if not service:
            return {"status": 0, "message": "Drive not connected"}, 401

        try:
            service.files().delete(fileId=file_id).execute()
            return {"status": 1, "message": "File deleted"}
        except Exception as e:
            return {"status": 0, "message": f"Delete failed: {str(e)}"}, 500


class UploadDocumentRecordFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]

            service = self.get_drive_service(uid)
            if not service:
                return {"status": 0, "message": "Google Drive not connected"}, 401

            # Resolve "DOCKLY" > "Family" > "Documents and Records"
            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            family_id = get_or_create_subfolder(service, "Family", root_id)
            documents_id = get_or_create_subfolder(
                service, "Documents and Records", family_id
            )

            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [documents_id],
            }

            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
                resumable=True,
            )

            uploaded_file = (
                service.files()
                .create(
                    body=file_metadata,
                    media_body=media,
                    fields="id, name, mimeType, size, modifiedTime, webViewLink",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": "File uploaded successfully",
                "payload": {"file": uploaded_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Upload failed: {str(e)}"}, 500


class GetDocumentRecordsFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            service = self.get_drive_service(uid)
            if not service:
                return {"status": 0, "message": "Google Drive not connected"}, 401

            # Navigate: DOCKLY → Family → Documents and Records
            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            family_id = get_or_create_subfolder(service, "Family", root_id)
            documents_id = get_or_create_subfolder(
                service, "Documents and Records", family_id
            )

            query = f"'{documents_id}' in parents and trashed = false"
            results = (
                service.files()
                .list(
                    q=query,
                    fields="files(id, name, mimeType, size, modifiedTime, webViewLink)",
                    spaces="drive",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": "Files fetched successfully",
                "payload": {"files": results.get("files", [])},
            }

        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Failed to fetch files: {str(e)}"}, 500


class UploadMedicalRecordFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]

            service = self.get_drive_service(uid)
            if not service:
                return {"status": 0, "message": "Google Drive not connected"}, 401

            # Navigate: DOCKLY > Family > Medical Records
            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            family_id = get_or_create_subfolder(service, "Family", root_id)
            medical_id = get_or_create_subfolder(service, "Medical Records", family_id)

            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [medical_id],
            }

            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
                resumable=True,
            )

            uploaded_file = (
                service.files()
                .create(
                    body=file_metadata,
                    media_body=media,
                    fields="id, name, mimeType, size, modifiedTime, webViewLink",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": "Medical file uploaded successfully",
                "payload": {"file": uploaded_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Upload failed: {str(e)}"}, 500


class GetMedicalRecordFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            service = self.get_drive_service(uid)
            if not service:
                return {"status": 0, "message": "Google Drive not connected"}, 401

            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            family_id = get_or_create_subfolder(service, "Family", root_id)
            medical_id = get_or_create_subfolder(service, "Medical Records", family_id)

            query = f"'{medical_id}' in parents and trashed = false"
            results = (
                service.files()
                .list(
                    q=query,
                    fields="files(id, name, mimeType, size, modifiedTime, webViewLink)",
                    spaces="drive",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": "Medical files fetched successfully",
                "payload": {"files": results.get("files", [])},
            }

        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Failed to fetch files: {str(e)}"}, 500


class AddBeneficiary(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                return {"status": 0, "message": "No input data provided"}, 400

            beneficiary = inputData.get("beneficiary", {})
            required_fields = ["userId", "account", "primary_beneficiary", "addedBy"]
            missing = [f for f in required_fields if f not in beneficiary]
            if missing:
                return {
                    "status": 0,
                    "message": f"Missing fields: {', '.join(missing)}",
                }, 400

            now = datetime.now().isoformat()

            beneficiary_id = DBHelper.insert(
                table_name="beneficiaries",
                return_column="id",
                user_id=uid,
                account=beneficiary["account"],
                primary_beneficiary=beneficiary["primary_beneficiary"],
                secondary_beneficiary=beneficiary.get("secondary_beneficiary", ""),
                created_at=now,
                updated_at=now,
            )

            return {
                "status": 1,
                "message": "Beneficiary added",
                "payload": {"id": beneficiary_id},
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to add beneficiary: {str(e)}"}, 500


class GetBeneficiaries(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            user_id = request.args.get("userId")
            if not user_id:
                return {"status": 0, "message": "User ID is required"}, 400

            beneficiaries = DBHelper.find_all(
                table_name="beneficiaries",
                filters={"user_id": user_id},
            )

            for b in beneficiaries:
                updated_at = b.pop("updated_at", None)
                created_at = b.pop("created_at", None)

                b["updated"] = updated_at.strftime("%Y-%m-%d") if updated_at else ""
                b["created"] = created_at.strftime("%Y-%m-%d") if created_at else ""

            return {"status": 1, "payload": beneficiaries}, 200

        except Exception as e:
            return {
                "status": 0,
                "message": f"Failed to fetch beneficiaries: {str(e)}",
            }, 500


class UpdateBeneficiary(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            beneficiary = inputData.get("beneficiary", {})

            required_fields = [
                "id",
                "userId",
                "account",
                "primary_beneficiary",
                "addedBy",
            ]
            missing = [f for f in required_fields if f not in beneficiary]
            if missing:
                return {
                    "status": 0,
                    "message": f"Missing fields: {', '.join(missing)}",
                }, 400

            record = DBHelper.find_one(
                "beneficiaries",
                {"id": beneficiary["id"], "user_id": beneficiary["userId"]},
            )
            if not record:
                return {"status": 0, "message": "Beneficiary not found"}, 404

            now = datetime.now().isoformat()

            DBHelper.update_one(
                table_name="beneficiaries",
                filters={"id": beneficiary["id"]},
                updates={
                    "account": beneficiary["account"],
                    "primary_beneficiary": beneficiary["primary_beneficiary"],
                    "secondary_beneficiary": beneficiary.get(
                        "secondary_beneficiary", ""
                    ),
                    "updated": beneficiary.get("updated", ""),
                    "updated_at": now,
                },
            )

            return {"status": 1, "message": "Beneficiary updated"}, 200

        except Exception as e:
            return {
                "status": 0,
                "message": f"Failed to update beneficiary: {str(e)}",
            }, 500


class AddDevice(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(silent=True)
            if not data:
                return {"status": 0, "message": "No input data provided"}, 400

            device = data.get("device", {})
            if not device:
                return {"status": 0, "message": "No device data provided"}, 400

            required_fields = ["deviceName", "deviceModel", "userId", "addedBy"]
            missing = [field for field in required_fields if field not in device]
            if missing:
                return {
                    "status": 0,
                    "message": f"Missing fields: {', '.join(missing)}",
                }, 400

            now = datetime.now().isoformat()

            device_id = DBHelper.insert(
                table_name="user_devices",
                return_column="id",
                user_id=uid,
                family_member_user_id=device["userId"],
                device_name=device["deviceName"],
                device_model=device["deviceModel"],
                added_by=device["addedBy"],
                added_time=now,
                edited_by=device.get("editedBy", device["addedBy"]),
                updated_at=now,
            )

            return {
                "status": 1,
                "message": "Device added successfully",
                "payload": {"id": device_id},
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to add device: {str(e)}"}, 500


class GetDevices(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            user_id = request.args.get("userId")
            if not user_id:
                return {"status": 0, "message": "Missing userId"}, 400

            results = DBHelper.find_all(
                table_name="user_devices", filters={"family_member_user_id": user_id}
            )

            for device in results:
                for key in device:
                    if isinstance(device[key], datetime):
                        device[key] = device[key].isoformat()

            return {
                "status": 1,
                "message": "Devices fetched successfully",
                "payload": results,
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch devices: {str(e)}"}, 500


class UpdateDevice(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            data = request.get_json(silent=True)
            if not data:
                return {"status": 0, "message": "No input data provided"}, 400

            device = data.get("device", {})
            if not device or "id" not in device:
                return {"status": 0, "message": "Missing device ID or data"}, 400

            update_fields = {
                "device_name": device.get("deviceName"),
                "device_model": device.get("deviceModel"),
                "edited_by": device.get("editedBy", uid),
                "updated_at": datetime.now().isoformat(),
            }

            update_fields = {k: v for k, v in update_fields.items() if v is not None}

            DBHelper.update_one(
                table_name="user_devices",
                filters={"id": device["id"]},
                updates=update_fields,
            )

            return {"status": 1, "message": "Device updated successfully"}, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to update device: {str(e)}"}, 500
