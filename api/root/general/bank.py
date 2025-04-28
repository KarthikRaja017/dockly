import base64
import json
from flask import request
from flask_restful import Resource
import requests

from root.config import API_SECRET_KEY, AUTH_ENDPOINT
from root.auth.auth import auth_required

API_SECRET_KEY = (
    "qltt_04b9cfce7233a7d46d38f12d4d51e4b3497aa5e4e4c391741d3c7df0d775874b7dd8a0f2d"
)


class SignInBank(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):

        data = request.get_json()
        profile_id = data.get("profileId")

        if not profile_id:
            return {"error": "Missing profileId"}

        response = requests.post(
            "https://auth.quiltt.io/v1/users/sessions",
            headers={
                "Authorization": f"Bearer {API_SECRET_KEY}",
                "Content-Type": "application/json",
            },
            json={"userId": profile_id},
        )

        if response.status_code in [200, 201, 202]:
            print(f"response: {response}")
            result = response.json()
            return {
                    "token": result.get("token"),
                    "userId": result.get("userId"),
                    "expiresAt": result.get("expiresAt"),
                },
            

        else:
            error_data = response.json()
            print("Quiltt API error:", error_data)
            return {"error": error_data.get("message", "Authentication failed")}


class SignUpBank(Resource):
    def post(self):
        data = request.get_json()
        email = data.get("email")

        if not email:
            return {"error": "Missing email"}

        response = requests.post(
            "https://auth.quiltt.io/v1/users/sessions",
            headers={
                "Authorization": f"Bearer {API_SECRET_KEY}",
                "Content-Type": "application/json",
            },
            json={"email": email},
        )

        if response.status_code in [200, 201, 202]:
            print(f"response: {response}")
            result = response.json()
            return {
                "token": result.get("token"),
                "userId": result.get("userId"),
                "expiresAt": result.get("expiresAt"),
            }

        else:
            error_data = response.json()
            print("Quiltt API error:", error_data)
            return {"error": error_data.get("message", "Authentication failed")}
