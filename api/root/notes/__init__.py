from flask import Blueprint
from flask_restful import Api


notes_bp = Blueprint("notes", __name__, url_prefix="/server/api")
notes_api = Api(notes_bp)

from . import __routes__
