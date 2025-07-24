# import os
# import threading
# import subprocess
# from datetime import timedelta
# from flask import Flask
# from flask_cors import CORS
# from flask_restful import Api
# from flask_jwt_extended import JWTManager
# from flask_socketio import SocketIO, emit
# import eventlet

# # Config and DB
# from root.config import G_SECRET_KEY
# from root.db.db import postgres

# eventlet.monkey_patch()

# # Global instances
# api = Api()
# jwt = JWTManager()
# socketio = SocketIO(
#     cors_allowed_origins=[
#         "http://localhost:3000",
#         "http://localhost:5173",
#         "https://localhost:5173",
#     ],
#     async_mode="eventlet",
# )


# def background_sync(bw_manager):
#     try:
#         if bw_manager.session_key:
#             env = os.environ.copy()
#             env["BW_SESSION"] = bw_manager.session_key
#             result = subprocess.run(
#                 ["bw", "sync"], capture_output=True, text=True, env=env
#             )
#             if result.returncode == 0:
#                 socketio.emit("sync_complete", {"message": "Background sync completed"})
#             else:
#                 socketio.emit("sync_error", {"message": result.stderr})
#     except Exception as e:
#         socketio.emit("sync_error", {"message": str(e)})


# def create_app(test_config=None):
#     app = Flask(__name__, instance_relative_config=True)
#     app.config["SECRET_KEY"] = G_SECRET_KEY
#     app.permanent_session_lifetime = timedelta(minutes=60)

#     # Enable CORS
#     CORS(
#         app,
#         # resources={
#         #     r"/server/api/vault/*": {
#         #         "origins": [
#         #             "http://localhost:3000",
#         #             "http://localhost:5173",
#         #             "https://localhost:5173",
#         #         ],
#         #         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#         #         "allow_headers": ["Content-Type", "Authorization"],
#         #     }
#         # },
#     )

#     # Initialize extensions
#     jwt.init_app(app)
#     socketio.init_app(app)
#     postgres.init_app()

#     # Avoid circular imports
#     from root.vault.models import bw_manager

#     # WebSocket handlers
#     @socketio.on("connect")
#     def handle_connect():
#         print("Client connected")
#         emit("connected", {"message": "Connected to Bitwarden manager"})

#     @socketio.on("disconnect")
#     def handle_disconnect():
#         print("Client disconnected")

#     @socketio.on("request_sync")
#     def handle_sync_request():
#         if bw_manager.is_logged_in:
#             threading.Thread(target=background_sync, args=(bw_manager,)).start()
#         else:
#             emit("sync_error", {"message": "Not logged in"})

#     # Register Blueprints
#     from root.users import users_bp
#     from root.db import db_bp
#     from root.bookmarks import bookmarks_bp
#     from root.general import general_bp
#     from root.google import google_bp
#     from root.microsoft import microsoft_bp
#     from root.settings import settings_bp
#     from root.family import family_bp
#     from root.notes import notes_bp
#     from root.dashboard import dashboard_bp
#     from root.planner import planner_bp
#     from root.notifications import notifications_bp
#     from root.vault import vault_bp

#     app.register_blueprint(users_bp)
#     app.register_blueprint(db_bp)
#     app.register_blueprint(bookmarks_bp)
#     app.register_blueprint(general_bp)
#     app.register_blueprint(google_bp)
#     app.register_blueprint(microsoft_bp)
#     app.register_blueprint(settings_bp)
#     app.register_blueprint(family_bp)
#     app.register_blueprint(notes_bp)
#     app.register_blueprint(dashboard_bp)
#     app.register_blueprint(planner_bp)
#     app.register_blueprint(notifications_bp)
#     app.register_blueprint(vault_bp)

#     return app, socketio


# from datetime import timedelta

# from flask import Flask, app, json, jsonify, request
# from flask_jwt_extended import JWTManager
# from flask_restful import Api
# from flask_cors import CORS
# from root.config import G_SECRET_KEY, WEB_URL
# from root.db.db import postgres
# from pywebpush import webpush, WebPushException
# import psycopg2

# api = Api()
# jwt = JWTManager()

# VAPID_PUBLIC_KEY = "BHjK0K241Jce614Q6OzXnpkEL6TxtBgntijmcIuCSUiTeeFYFp56O38k0naz-sDy5oGhHGiwOCpRFW0o-kCv634"
# VAPID_PRIVATE_KEY = "8vD7GwsTCCiqD_5icIHi88KUYkEOGdCtQ9smAXXPEXk"
# VAPID_CLAIMS = {"sub": "mailto:karthikrajay.cc@gmail.com"}


# def create_app(test_config=None):
#     app = Flask(__name__, instance_relative_config=True)
#     app.secret_key = G_SECRET_KEY
#     CORS(app)
#     postgres.init_app()
#     jwt.init_app(app)
#     #     base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../web"))

#     # # Launch the frontend
#     #     subprocess.Popen(["yarn.cmd", "start"], cwd=base_dir, shell=True)
#     from root.users import users_bp

#     app.register_blueprint(users_bp)
#     from root.db import db_bp

#     app.register_blueprint(db_bp)
#     from root.bookmarks import bookmarks_bp

#     app.register_blueprint(bookmarks_bp)
#     from root.general import general_bp

#     app.register_blueprint(general_bp)
#     from root.google import google_bp

#     app.register_blueprint(google_bp)
#     from root.microsoft import microsoft_bp

#     app.register_blueprint(microsoft_bp)
#     from root.settings import settings_bp

#     from root.family import family_bp

#     app.register_blueprint(family_bp)

#     app.register_blueprint(settings_bp)

#     from root.notes import notes_bp

#     app.register_blueprint(notes_bp)
#     from root.dashboard import dashboard_bp

#     app.register_blueprint(dashboard_bp)
#     from root.planner import planner_bp

#     app.register_blueprint(planner_bp)
#     from root.notifications import notifications_bp

#     app.register_blueprint(notifications_bp)
#     from root.home import home_bp

#     app.register_blueprint(home_bp)
#     app.permanent_session_lifetime = timedelta(minutes=60)
#     # initialize_firebase()
#     conn = postgres.get_connection()
#     subscriptions = []

#     @app.route("/vapidPublicKey")
#     def get_public_key():
#         return jsonify({"publicKey": VAPID_PUBLIC_KEY})

#     @app.route("/subscribe", methods=["POST"])
#     def subscribe():
#         data = request.get_json()
#         endpoint = data["endpoint"]
#         auth = data["keys"]["auth"]
#         p256dh = data["keys"]["p256dh"]

#         with conn.cursor() as cur:
#             cur.execute(
#                 "INSERT INTO subscriptions (endpoint, auth, p256dh) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
#                 (endpoint, auth, p256dh),
#             )
#             conn.commit()

#         if data not in subscriptions:
#             subscriptions.append(data)

#         return jsonify({"status": "subscribed"}), 201

#     @app.route("/notify", methods=["POST"])
#     def notify():
#         data = request.get_json()
#         payload = {
#             "title": "Dockly Notification",
#             "body": data.get("message", "You have a new update on Dockly!"),
#             "url": WEB_URL,  # 👈 Open this when notification is clicked
#             "icon": f"{WEB_URL}/logoBlue.png",
#         }

#         with conn.cursor() as cur:
#             cur.execute("SELECT endpoint, auth, p256dh FROM subscriptions")
#             rows = cur.fetchall()

#         for row in rows:
#             sub = {"endpoint": row[0], "keys": {"auth": row[1], "p256dh": row[2]}}
#             try:
#                 webpush(
#                     subscription_info=sub,
#                     data=json.dumps(payload),
#                     vapid_private_key=VAPID_PRIVATE_KEY,
#                     vapid_claims=VAPID_CLAIMS,
#                 )
#             except WebPushException as e:
#                 print(f"Push failed: {e}")

#         return jsonify({"status": "Notification sent"})

#     return app

from datetime import timedelta

from flask import Flask, app, json, jsonify, request
from flask_jwt_extended import JWTManager
from flask_restful import Api
from flask_cors import CORS
from root.config import G_SECRET_KEY, WEB_URL
from root.db.db import postgres

api = Api()
jwt = JWTManager()


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.secret_key = G_SECRET_KEY
    CORS(app)
    postgres.init_app()
    jwt.init_app(app)
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
    from root.microsoft import microsoft_bp

    app.register_blueprint(microsoft_bp)
    from root.settings import settings_bp

    from root.family import family_bp

    app.register_blueprint(family_bp)

    app.register_blueprint(settings_bp)

    from root.notes import notes_bp

    app.register_blueprint(notes_bp)
    from root.dashboard import dashboard_bp

    app.register_blueprint(dashboard_bp)
    from root.planner import planner_bp

    app.register_blueprint(planner_bp)
    from root.notifications import notifications_bp

    app.register_blueprint(notifications_bp)
    from root.home import home_bp

    app.register_blueprint(home_bp)
    from root.files import google_drive_bp

    app.register_blueprint(google_drive_bp)
    app.permanent_session_lifetime = timedelta(minutes=60)
    # initialize_firebase()

    return app
