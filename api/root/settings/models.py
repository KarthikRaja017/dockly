from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper

from root.auth.auth import auth_required


class AddNotifications(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json()
        notifications = input_data.get("notifications", [])
        if notifications:
            user_notifications = DBHelper.insert(
                "user_settings",
                return_column="user_id",
                user_id=uid,
                theme="light",
                language="en",
                email_notifications=notifications.get("email_notifications", False),
                push_notifications=notifications.get("push_notifications", False),
                reminder_days_before=notifications.get("reminder_days_before", 0),
            )

            return {
                "status": 1,
                "message": "Notifications added successfully",
                "payload": {"userNotifications": user_notifications},
            }
