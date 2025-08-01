from datetime import datetime, timedelta
import json
from flask import redirect, request, session
from flask_jwt_extended import create_access_token
from flask_restful import Resource
import requests
from urllib.parse import quote
import urllib.parse
from root.db.dbHelper import DBHelper
from root.config import API_URL, WEB_URL

MS_AUTHORITY = "https://login.microsoftonline.com/common"
MS_REDIRECT_URI = f"{API_URL}/auth/callback"
MS_SCOPES = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "https://graph.microsoft.com/User.Read",
    "https://graph.microsoft.com/Mail.Read",
    "https://graph.microsoft.com/Calendars.ReadWrite",
    "https://graph.microsoft.com/Calendars.ReadWrite.Shared",
    "https://graph.microsoft.com/Files.ReadWrite",
    "https://graph.microsoft.com/Files.ReadWrite.All",
]
MS_CLIENT_ID = ""
MS_CLIENT_SECRET = ""
# MS_CLIENT_ID = "98fa92ef-f5ba-4765-bd81-9ce209dda01b"
# MS_CLIENT_SECRET = "t028Q~LKm28gtsK09sXZxKxTMr4F8L~hcdkUXa0Q"


class AddMicrosoftAccount(Resource):
    def get(self):
        # state = str(uuid.uuid4())
        uid = request.args.get("userId")
        username = request.args.get("username")
        session["username"] = username
        session["uid"] = uid
        stateData = json.dumps({"uid": uid, "username": username})
        state = quote(stateData)
        # Build authorization URL
        auth_url = f"{MS_AUTHORITY}/oauth2/v2.0/authorize"
        params = {
            "client_id": MS_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": MS_REDIRECT_URI,
            "scope": " ".join(MS_SCOPES),
            "state": state,
            "prompt": "select_account",
            "response_mode": "query",  # Ensure response comes as query parameters
        }

        # Redirect to Microsoft login
        auth_uri = f"{auth_url}?{'&'.join([f'{k}={requests.utils.quote(str(v))}' for k, v in params.items()])}"
        return redirect(auth_uri)


user_accounts = {}


class MicrosoftCallback(Resource):
    def get(self):
        error = request.args.get("error")
        if error:
            error_description = request.args.get("error_description", "Unknown error")
            return {
                "status": 0,
                "message": "error",
                "payload": {"error": error, "error_description": error_description},
            }

        state = request.args.get("state")
        if state:
            try:
                decoded_state = urllib.parse.unquote(state)
                stateData = json.loads(decoded_state)
                uid = stateData.get("uid")
                username = stateData.get("username")
            except Exception as e:
                return {
                    "status": 0,
                    "message": "error",
                    "payload": {"error": "Failed to parse state", "details": str(e)},
                }
        else:
            return {
                "status": 0,
                "message": "error",
                "payload": {"error": "Missing state parameter"},
            }

        code = request.args.get("code")
        if not code:
            return {
                "status": 0,
                "message": "error",
                "payload": {"error": "No authorization code received"},
            }

        token_url = f"{MS_AUTHORITY}/oauth2/v2.0/token"
        token_data = {
            "client_id": MS_CLIENT_ID,
            "client_secret": MS_CLIENT_SECRET,
            "code": code,
            "redirect_uri": MS_REDIRECT_URI,
            "grant_type": "authorization_code",
            "scope": " ".join(MS_SCOPES),
        }

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        token_response = requests.post(token_url, data=token_data, headers=headers)

        if token_response.status_code != 200:
            return {
                "status": 0,
                "message": "error",
                "payload": {
                    "error": "Failed to obtain access token",
                    "details": token_response.json(),
                    "status_code": token_response.status_code,
                },
            }

        tokens = token_response.json()
        graph_headers = {
            "Authorization": f"Bearer {tokens['access_token']}",
            "Accept": "application/json",
        }

        user_response = requests.get(
            "https://graph.microsoft.com/v1.0/me", headers=graph_headers
        )

        if user_response.status_code != 200:
            return {
                "status": 0,
                "message": "error",
                "payload": {
                    "error": "Failed to get user information",
                    "details": user_response.json(),
                    "status_code": user_response.status_code,
                },
            }

        user_info = user_response.json()
        expires_in = tokens.get("expires_in", 3600)
        tokens["expires_at"] = datetime.now().timestamp() + expires_in
        expires_at_dt = datetime.now() + timedelta(seconds=expires_in)

        account_id = user_info.get("id")
        email = user_info.get("mail") or user_info.get("userPrincipalName")
        display_name = user_info.get("displayName")

        muser = {
            "id": account_id,
            "email": email,
            "name": display_name,
            "provider": "outlook",
            "tokens": tokens,
        }

        user_accounts[account_id] = muser

        # Check if user already connected with Microsoft
        existing_account = DBHelper.find_one(
            "connected_accounts",
            filters={
                "user_id": uid,
                "provider": "outlook",
                "access_token": tokens["access_token"],
            },
            select_fields=["id"],
        )

        # Get user profile picture
        photo_response = requests.get(
            "https://graph.microsoft.com/v1.0/me/photo/$value", headers=graph_headers
        )
        if photo_response.status_code == 200:
            import base64

            picture_data = base64.b64encode(photo_response.content).decode("utf-8")
            picture_url = f"data:image/jpeg;base64,{picture_data}"
        else:
            picture_url = None

        if not existing_account:
            DBHelper.insert(
                "connected_accounts",
                user_id=uid,
                email=email,
                provider="outlook",
                access_token=tokens["access_token"],
                refresh_token=tokens.get("refresh_token", ""),
                is_active=1,
                scopes=" ".join(MS_SCOPES),
                expires_at=expires_at_dt,
                user_object=json.dumps(muser),
                connected_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
        else:
            DBHelper.update(
                "connected_accounts",
                filters={"id": existing_account["id"]},
                update_fields={
                    "email": email,
                    "access_token": tokens["access_token"],
                    "refresh_token": tokens.get("refresh_token", ""),
                    "expires_at": expires_at_dt,
                    "user_object": json.dumps(muser),
                    "updated_at": datetime.utcnow(),
                },
            )

        jwtToken = create_access_token(
            identity=muser["id"],
            additional_claims={
                "email": muser["email"],
                "name": muser["name"],
                "picture": picture_url,
                "provider": "outlook",
            },
        )

        return redirect(f"{WEB_URL}/{username}/oauth/callback?token={jwtToken}")
