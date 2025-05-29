
from flask import redirect, request, session
from flask_restful import Resource
import urllib.parse

import requests

CLIENT_ID = "52380704783-9r3c0t19grths574i6pstsanmtt0dc39.apps.googleusercontent.com"
CLIENT_SECRET= "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"
REDIRECT_URI = "http://localhost:5000/auth/google/callback"
SCOPE = "https://www.googleapis.com/auth/calendar"

class AddGoogle(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        username = inputData.get('username')
        print(f"username: {username}")
        session['username'] = username

        auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": CLIENT_ID,
            "redirect_uri": REDIRECT_URI,
            "response_type": "code",
            "scope": SCOPE,
            "access_type": "offline",
            "prompt": "consent",
            "state": username,  
        }
        url = f"{auth_url}?{urllib.parse.urlencode(params)}"
        print(f"url: {url}")
        return redirect(url)

class GoogleCallback(Resource):
    def get(self):
        code = request.args.get('code')
        username = request.args.get('state') or session.get('username')

        # Exchange code for token
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        token_response = requests.post(token_url, data=data)
        tokens = token_response.json()

        # ✅ Store token for the user (in DB or session)
        # Example: save_to_db(username, tokens)

        # ✅ Redirect to frontend calendar page
        return redirect(f"http://localhost:3001/{username}/calendar")