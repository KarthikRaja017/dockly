from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required



class CurrentUser(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        print(f"uid: {uid}")
        if not uid:
            return {"status": 0, "msg": "Not logged in", "payload": {}}

        userid = user.get("id")

        fields = ["mobile","email"]
        data = DBHelper.find_one("users", filters={"id": userid}, select_fields=fields)

        if not data:
            return {"status": 0, "msg": "User not found", "payload": {}}

        return {"status": 1, "msg": "Success", "payload": data}

        
