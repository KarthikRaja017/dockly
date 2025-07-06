from flask import request
from flask_restful import Resource
from root.common import Permissions
from root.utilis import uniqueId
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required


class GetNotifications(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        notifications = DBHelper.find_all(
            table_name="notifications",
            filters={"receiver_id": uid, "status": "pending"},
            select_fields=[
                "message",
                "action_required",
                "task_type",
                "id",
                "hub",
                "created_at",
            ],
        )
        user_notifications = []
        for notification in notifications:
            user_notifications.append(
                {
                    "message": notification["message"],
                    "actionRequired": notification["action_required"],
                    "taskType": notification["task_type"],
                    "id": notification["id"],
                    "hub": notification.get("hub", None),
                }
            )
        return {
            "status": 1,
            "message": "Notifications fetched successfully",
            "payload": {"notifications": user_notifications},
        }


class RespondNotification(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        notification = DBHelper.find_one(
            table_name="notifications",
            filters={"id": inputData.get("id"), "receiver_id": uid},
            select_fields=[
                "sender_id",
                "metadata",
                "task_type",
            ],
        )

        gid = DBHelper.find_one(
            table_name="family_members",
            filters={"user_id": notification.get("sender_id")},
            select_fields=["family_group_id"],
        )

        if not gid:
            gid = uniqueId(digit=5, isNum=True, prefix="G")
        else:
            gid = gid.get("family_group_id")

        if notification.get("task_type") == "family_request":
            userMetaData = notification.get("metadata", {})
            userResponseData = userMetaData.get("input_data", {})
            sharedItemsIds = userMetaData.get("shared_items_ids", [])
            senderUser = userMetaData.get("sender_user", {})
            # aid = uniqueId(digit=7, isNum=True)
            fid = DBHelper.insert(
                "family_members",
                return_column="id",
                user_id=user["uid"],
                name=senderUser.get("user_name", ""),
                relationship=userResponseData.get("relationship", ""),
                access_code=userResponseData.get("accessCode", ""),
                method=userResponseData.get("method", "Email"),
                email=senderUser.get("email", ""),
                fm_user_id=senderUser.get("uid", ""),
                family_group_id=gid,
                # access_mapping_code=aid,
                # permissions="",
                # shared_items="",
            )
            fid = DBHelper.insert(
                "family_members",
                return_column="id",
                user_id=notification.get("sender_id"),
                name=userResponseData.get("name", ""),
                relationship=userResponseData.get("relationship", ""),
                access_code=userResponseData.get("accessCode", ""),
                method=userResponseData.get("method", "Email"),
                email=userResponseData.get("email", ""),
                fm_user_id=user["uid"],
                family_group_id=gid,
                # access_mapping_code=aid,
                # permissions="",
                # shared_items="",
            )
            for id in sharedItemsIds:
                aid = DBHelper.insert(
                    "family_hubs_access_mapping",
                    return_column="id",
                    # id=aid,
                    user_id=user["uid"],
                    family_member_id=fid,
                    hubs=id,
                    permissions=Permissions.Read.value,
                )
            DBHelper.update_one(
                table_name="notifications",
                filters={"id": inputData.get("id"), "receiver_id": uid},
                updates={"status": "responded"},
                return_fields=["id"],
            )
        return {
            "status": 1,
            "message": "Notification response recorded successfully",
            "payload": {
                "id": inputData.get("id"),
                "response": inputData.get("response"),
            },
        }
