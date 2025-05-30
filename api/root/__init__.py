from datetime import timedelta

from flask import Flask, redirect, request, send_from_directory, session
from flask_jwt_extended import JWTManager
from flask_restful import Api
from flask_cors import CORS
import urllib.parse
from urllib.parse import urlencode
import requests
from root.config import G_SECRET_KEY
from root.db.db import postgres

api = Api()
jwt = JWTManager()


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
    

    return app
