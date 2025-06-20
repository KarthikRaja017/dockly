from datetime import timedelta

from flask import Flask
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
    app.permanent_session_lifetime = timedelta(minutes=60)
    # initialize_firebase()

    return app
