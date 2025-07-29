from flask import request
from flask_restful import Resource
from root.files.models import DriveBaseResource
from root.utilis import ensure_drive_folder_structure
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required


class GetBoards(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        if not uid:
            return {"status": 0, "message": "User ID is required", "payload": {}}

        boards = []

        # Check for Home
        # home = DBHelper.find_one("homeDetails", filters={"uid": uid})
        # if home:
        #     boards.append(
        #         {
        #             "icon": "home",  # Frontend should map this to <Home />
        #             "title": "Home Management",
        #             "accounts": 8,
        #             "documents": 12,
        #             "items": [
        #                 {"type": "urgent", "text": "Mortgage payment due in 2 days"},
        #                 {"type": "pending", "text": "3 utility bills this week"},
        #             ],
        #         }
        #     )

        # Check for Family
        # family = DBHelper.find_one("familyDetails", filters={"uid": uid})
        # if family:
        #     boards.append(
        #         {
        #             "icon": "users",  # Frontend should map to <Users />
        #             "title": "Family Hub",
        #             "accounts": 4,
        #             "documents": 15,
        #             "items": [
        #                 {"type": "pending", "text": "Emma's school permission slip"},
        #                 {"type": "complete", "text": "All health records updated"},
        #             ],
        #         }
        #     )

        # Check for Finance
        bank = DBHelper.find_one("bankDetails", filters={"uid": uid})
        if bank:
            boards.append(
                {
                    "icon": "dollar",  # Frontend should map to <DollarSign />
                    "title": "Finance",
                    "accounts": 6,
                    "documents": 9,
                    "items": [
                        {"type": "complete", "text": "Credit card autopay active"},
                        {"type": "pending", "text": "Review investment portfolio"},
                    ],
                }
            )

        # Check for Health
        # health = DBHelper.find_one("healthDetails", filters={"uid": uid})
        # if health:
        #     boards.append(
        #         {
        #             "icon": "heart",  # Frontend should map to <Heart />
        #             "title": "Health",
        #             "accounts": 3,
        #             "documents": 7,
        #             "items": [
        #                 {"type": "urgent", "text": "Dental checkup overdue"},
        #                 {"type": "pending", "text": "Prescription refill needed"},
        #             ],
        #         }
        #     )

        return {
            "status": 1,
            "message": "Boards fetched successfully",
            "payload": {
                "username": user.get("username", ""),
                "uid": uid,
                "boards": boards,
            },
        }


class GetUserHubs(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        # print(f"uid: {uid}")
        hubs = DBHelper.find_all(
            table_name="users_access_hubs",
            select_fields=[
                "id",
                "hubs",
            ],
            filters={"user_id": uid},
        )
        # utilities = DBHelper.find_all(
        #     table_name="users_access_utilities",
        #     select_fields=[
        #         "id",
        #         "utilities",
        #     ],
        #     filters={"user_id": uid},
        # )
        hub_ids = [row["hubs"] for row in hubs]
        # utilities_ids = [row["utilities"] for row in utilities]

        if not hub_ids:
            return {"status": 1, "payload": {"hubs": []}}

        hubs_details = DBHelper.find_in(
            table_name="hubs",
            select_fields=["hid", "name", "title"],
            field="hid",
            values=hub_ids,
        )
        # print(f"hubs_details: {hubs_details}")

        # utilities_details = DBHelper.find_in(
        #     table_name="utilities",
        #     select_fields=["utid", "name", "title"],
        #     field="utid",
        #     values=utilities_ids,
        # )
        userHubs = []
        userUtilities = []
        for hubs in hubs_details:
            userHubs.append(hubs)

        # for utilities in utilities_details:
        #     userUtilities.append(utilities)

        return {"status": 1, "payload": {"hubs": userHubs, "utilities": userUtilities}}


class GetConnectedAccounts(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        accounts = DBHelper.find_all(
            table_name="connected_accounts",
            select_fields=["provider", "email", "user_object"],
            filters={"user_id": uid},
        )
        connectedAccounts = []
        for account in accounts:
            connectedAccounts.append(
                {
                    "provider": account.get("provider"),
                    "email": account.get("email"),
                    "user_object": account.get("user_object"),
                }
            )

        return {
            "status": 1,
            "payload": {"connectedAccounts": connectedAccounts},
            "message": "accounts fetched successfully",
        }


from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload
import io
from werkzeug.utils import secure_filename


class UploadDocklyRootFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]
            service = self.get_drive_service(uid)
            if not service:
                return {"status": 0, "message": "Drive not connected"}, 401

            folder_data = ensure_drive_folder_structure(service)
            dockly_root_id = folder_data["root"]

            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [dockly_root_id],
            }

            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
            )
            uploaded = (
                service.files()
                .create(
                    body=file_metadata, media_body=media, fields="id, name, webViewLink"
                )
                .execute()
            )

            return {
                "status": 1,
                "message": "Uploaded to DOCKLY root",
                "payload": {"file": uploaded},
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Upload failed: {str(e)}"}, 500
