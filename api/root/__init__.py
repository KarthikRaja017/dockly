from datetime import timedelta

from flask import Flask, redirect, request, send_from_directory, session
from flask_jwt_extended import JWTManager
from flask_restful import Api
from flask_cors import CORS
import urllib.parse

import requests
from root.config import G_SECRET_KEY
from root.db.db import postgres

api = Api()
jwt = JWTManager()
CLIENT_ID = "52380704783-9r3c0t19grths574i6pstsanmtt0dc39.apps.googleusercontent.com"
CLIENT_SECRET= "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"
REDIRECT_URI = "http://localhost:5000/auth/google/callback"
SCOPE = "https://www.googleapis.com/auth/calendar"

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)
    postgres.init_app()
    jwt.init_app(app)
    app.secret_key = G_SECRET_KEY
#     base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../web"))

# # Launch the frontend
#     subprocess.Popen(["yarn.cmd", "start"], cwd=base_dir, shell=True)
    from root.users import users_bp
    app.register_blueprint(users_bp)
    from root.db import db_bp
    app.register_blueprint(db_bp)
    from root.bookmarks import bookmarks_bp
    app.register_blueprint(bookmarks_bp)
    from root.general import general_bp
    app.register_blueprint(general_bp)
    from root.google import google_bp
    app.register_blueprint(google_bp)
    app.permanent_session_lifetime = timedelta(minutes=60)
    # initialize_firebase()
    
    @app.route('/auth/google/initiate')
    def google_auth_initiate():
        username = request.args.get('username')
        print(f"username: {username}")
        session['username'] = username  # store temporarily for later use

        auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": CLIENT_ID,
            "redirect_uri": REDIRECT_URI,
            "response_type": "code",
            "scope": SCOPE,
            "access_type": "offline",
            "prompt": "consent",
            "state": username,  # optionally store state for validation
        }
        url = f"{auth_url}?{urllib.parse.urlencode(params)}"
        print(f"url: {url}")
        return redirect(url)
    @app.route('/auth/google/callback')
    def google_auth_callback():
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
        print(f"token_response: {token_response}")
        tokens = token_response.json()

        # ✅ Store token for the user (in DB or session)
        # Example: save_to_db(username, tokens)

        # ✅ Redirect to frontend calendar page
        return redirect(f"http://localhost:3001/{username}/calendar")

    return app
