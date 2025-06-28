from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required


class GetBoards(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        if not uid:
            return {"status": 0, "message": "User ID is required", "payload": {}}

        boards = []

        # Check for Home
        # home = DBHelper.find_one("homeDetails", filters={"uid": uid})
        # if home:
        #     boards.append(
        #         {
        #             "icon": "home",  # Frontend should map this to <Home />
        #             "title": "Home Management",
        #             "accounts": 8,
        #             "documents": 12,
        #             "items": [
        #                 {"type": "urgent", "text": "Mortgage payment due in 2 days"},
        #                 {"type": "pending", "text": "3 utility bills this week"},
        #             ],
        #         }
        #     )

        # Check for Family
        # family = DBHelper.find_one("familyDetails", filters={"uid": uid})
        # if family:
        #     boards.append(
        #         {
        #             "icon": "users",  # Frontend should map to <Users />
        #             "title": "Family Hub",
        #             "accounts": 4,
        #             "documents": 15,
        #             "items": [
        #                 {"type": "pending", "text": "Emma's school permission slip"},
        #                 {"type": "complete", "text": "All health records updated"},
        #             ],
        #         }
        #     )

        # Check for Finance
        bank = DBHelper.find_one("bankDetails", filters={"uid": uid})
        if bank:
            boards.append(
                {
                    "icon": "dollar",  # Frontend should map to <DollarSign />
                    "title": "Finance",
                    "accounts": 6,
                    "documents": 9,
                    "items": [
                        {"type": "complete", "text": "Credit card autopay active"},
                        {"type": "pending", "text": "Review investment portfolio"},
                    ],
                }
            )

        # Check for Health
        # health = DBHelper.find_one("healthDetails", filters={"uid": uid})
        # if health:
        #     boards.append(
        #         {
        #             "icon": "heart",  # Frontend should map to <Heart />
        #             "title": "Health",
        #             "accounts": 3,
        #             "documents": 7,
        #             "items": [
        #                 {"type": "urgent", "text": "Dental checkup overdue"},
        #                 {"type": "pending", "text": "Prescription refill needed"},
        #             ],
        #         }
        #     )

        return {
            "status": 1,
            "message": "Boards fetched successfully",
            "payload": {
                "username": user.get("username", ""),
                "uid": uid,
                "boards": boards,
            },
        }


class GetUserHubs(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        print(f"uid: {uid}")
        hubs = DBHelper.find_all(
            table_name="users_access_hubs",
            select_fields=[
                "id",
                "hubs",
            ],
            filters={"user_id": uid},
        )
        # utilities = DBHelper.find_all(
        #     table_name="users_access_utilities",
        #     select_fields=[
        #         "id",
        #         "utilities",
        #     ],
        #     filters={"user_id": uid},
        # )
        hub_ids = [row["hubs"] for row in hubs]
        # utilities_ids = [row["utilities"] for row in utilities]

        if not hub_ids:
            return {"status": 1, "payload": {"hubs": []}}

        hubs_details = DBHelper.find_in(
            table_name="hubs",
            select_fields=["hid", "name", "title"],
            field="hid",
            values=hub_ids,
        )
        # print(f"hubs_details: {hubs_details}")

        # utilities_details = DBHelper.find_in(
        #     table_name="utilities",
        #     select_fields=["utid", "name", "title"],
        #     field="utid",
        #     values=utilities_ids,
        # )
        userHubs = []
        userUtilities = []
        for hubs in hubs_details:
            userHubs.append(hubs)

        # for utilities in utilities_details:
        #     userUtilities.append(utilities)

        return {"status": 1, "payload": {"hubs": userHubs, "utilities": userUtilities}}
