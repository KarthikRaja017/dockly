from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    verify_jwt_in_request,
)
from functools import wraps

# from root import mongo
from root.db.dbHelper import DBHelper
from root.config import G_ACCESS_EXPIRES
from psycopg2.extras import RealDictRow

# mdb = mongo.db


def auth_required(amac=None, isOptional=False):
    def _decorator(fn):
        @jwt_required(optional=isOptional)
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request(optional=isOptional)

            uid = get_jwt_identity()

            if isOptional and not uid:
                return fn(*args, **kwargs, uid=None, user=None)

            user = getAuthUser(uid)

            if not user or "email" not in user:
                return {
                    "status": 0,
                    "message": "Invalid Access. Please login again.",
                    "payload": {"redirectUrl": "/user/login", "logout": True},
                }, 403

            return fn(*args, **kwargs, uid=uid, user=user)

        return wrapper

    return _decorator


def validateAccess(uid, user, amac):
    if not user or not (user and "_id" in user and "ut" in user):
        return False

    if user["ut"] == "sa":
        return True

    if (
        user.get("amac", None)
        and user["ut"] in ["aa", "a"]
        and (amac not in user["amac"])
    ):
        return False

    # if not isCouncilUserType(user["ut"]):
    #     return False

    return True


def getAuthUser(uid, fields=None):
    selectFields = ["uid", "email", "user_name", "duser"]

    if fields:
        if isinstance(fields, dict):
            if "retriveAll" in fields:
                selectFields = ["uid", "email", "user_name", "duser"]
            else:
                selectFields = [field for field, value in fields.items() if value == 1]

    user_data = DBHelper.find_one(
        "users", filters={"uid": uid}, select_fields=selectFields
    )

    user_settings = DBHelper.find_one(
        "user_preferences",
        filters={"user_id": uid},
        select_fields=[
            "theme",
            "language",
            "email_notifications",
            "push_notifications",
            "reminder_days_before",
        ],
    )

    session_data = DBHelper.find_one(
        "user_sessions",
        filters={"user_id": uid},
        select_fields=["ip_address", "session_token"],
    )

    if not user_data:
        return None

    user_data = dict(user_data) if isinstance(user_data, RealDictRow) else user_data

    if session_data is None:
        session_data = {}

    merged_data = {
        **user_data,
        **(user_settings or {}),
        "session_data": (
            dict(session_data)
            if isinstance(session_data, RealDictRow)
            else session_data
        ),
    }

    return merged_data


def getAccessTokens(data):
    uid = data.get("uid")
    if not uid:
        raise ValueError("UID is required for token generation")

    accessToken = create_access_token(identity=uid, expires_delta=G_ACCESS_EXPIRES)
    refreshToken = create_refresh_token(identity=uid, expires_delta=G_ACCESS_EXPIRES)

    return {
        "accessToken": accessToken,
        "refreshToken": refreshToken,
    }


class UserObject:
    def __init__(self, uid):
        self.uid = uid

    def to_dict(self):
        return {"uid": self.uid}

    def __repr__(self):
        return f"UserObject(uid={self.uid})"
