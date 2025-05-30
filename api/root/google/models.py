from datetime import datetime, timedelta
import json
from flask import make_response, redirect, request, session
from flask_jwt_extended import create_access_token
from flask_restful import Resource
from root.config import API_URL

import requests

from root.auth.auth import auth_required

CLIENT_ID = "52380704783-9r3c0t19grths574i6pstsanmtt0dc39.apps.googleusercontent.com"
CLIENT_SECRET = "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"
REDIRECT_URI = f"{API_URL}/auth/callback/google"
SCOPE = "email profile https://www.googleapis.com/auth/calendar"


class AddGoogleCalendar(Resource):
    def get(self):
        username = request.args.get("username")
        uid = request.args.get("uid")
        session["username"] = username
        session["uid"] = uid
        auth_url = (
            "https://accounts.google.com/o/oauth2/v2/auth"
            f"?response_type=code"
            f"&client_id={CLIENT_ID}"
            f"&redirect_uri={REDIRECT_URI}"
            f"&scope={SCOPE.replace(' ', '%20')}"
            f"&access_type=offline"
            f"&prompt=consent"
        )
       
        return make_response(redirect(auth_url))


users = {}
tokens = {}


class GoogleCallback(Resource):
    def get(self):
        code = request.args.get("code")
        if not code:
            return

        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        token_response = requests.post(token_url, data=token_data)

        if token_response.status_code != 200:
            return

        token_json = token_response.json()
        access_token = token_json.get("access_token")
        refresh_token = token_json.get("refresh_token")

        # Get user info from Google
        user_info_response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if user_info_response.status_code != 200:
            return

        user_info = user_info_response.json()

        # Get or create user
        email = user_info.get("email")
        user = next((u for u in users.values() if u["email"] == email), None)

        if not user:
            user_id = session.get("uid")
            users[user_id] = {
                "id": user_id,
                "email": email,
                "name": user_info.get("name"),
                "picture": user_info.get("picture"),
            }
            user = users[user_id]

        # Store Google tokens
        tokens[user["id"]] = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": datetime.now()
            + timedelta(seconds=token_json.get("expires_in", 3600)),
        }

        # Create JWT token
        jwt_token = create_access_token(
            identity=user["id"],
            additional_claims={
                "email": user["email"],
                "name": user["name"],
                "picture": user["picture"],
            },
        )
        username = session.get("username", user["name"])
        redirect_url = (
            f"http://localhost:3000/{username}/oauth/callback?token={jwt_token}"
        )
        return redirect(redirect_url)
