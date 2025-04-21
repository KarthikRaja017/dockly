from flask_restful import Resource
from root.db.db import init_tables_from_json


class CreateTables(Resource):
    def post(self):
        result = init_tables_from_json()
        return result
