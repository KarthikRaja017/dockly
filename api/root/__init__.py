from datetime import timedelta
import os

from flask import Flask
from flask_jwt_extended import JWTManager
from flask_restful import Api
from flask_cors import CORS
from root.config import G_SECRET_KEY
from root.db.db import postgres

api = Api()
jwt = JWTManager()


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)
    # app.config["JWT_SECRET_KEY"] = G_JWT_ACCESS_SECRET_KEY
    # app.config["JWT_ACCESS_TOKEN_EXPIRES"] = G_ACCESS_EXPIRES
    # app.config["JWT_REFRESH_TOKEN_EXPIRES"] = G_REFRESH_EXPIRES
    # mongo.init_app(app)
    postgres.init_app()
    # jwt.init_app(app)
    app.secret_key = G_SECRET_KEY
    from root.users import users_bp
    app.register_blueprint(users_bp)
    from root.db import db_bp
    app.register_blueprint(db_bp)
    from root.bookmarks import bookmarks_bp
    app.register_blueprint(bookmarks_bp)
    from root.general import general_bp
    app.register_blueprint(general_bp)
    app.permanent_session_lifetime = timedelta(minutes=60)
    # initialize_firebase()

    return app
