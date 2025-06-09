import base64
import json
from root.db.dbHelper import DBHelper
from flask import request
from flask_restful import Resource
import requests

from root.config import API_SECRET_KEY, AUTH_ENDPOINT
from root.auth.auth import auth_required

API_SECRET_KEY = (
    "qltt_04b9cfce7233a7d46d38f12d4d51e4b3497aa5e4e4c391741d3c7df0d775874b7dd8a0f2d"
)

GRAPHQL_ENDPOINT = "https://api.quiltt.io/v1/graphql"


class BankConnect(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json()
        currentUser = data.get("currentUser")
        userId = currentUser.get("uid")
        email = currentUser.get("email")
        # email = "dockly3@gmail.com" # for testing

        if not userId:
            return {"error": "Missing userId"}

        existing_user = DBHelper.find_one(
            "bankDetails",
            filters={"uid": uid},
            select_fields=["profile_id", "isfinanceuser"],
        )

        if existing_user:
            profile_id = existing_user.get("profile_id")

            response = requests.post(
                "https://auth.quiltt.io/v1/users/sessions",
                headers={
                    "Authorization": f"Bearer {API_SECRET_KEY}",
                    "Content-Type": "application/json",
                },
                json={"userId": profile_id},
            )

            if response.status_code in [200, 201, 202]:
                result = response.json()
                return {
                    "uid": existing_user.get("uid"),
                    "token": result.get("token"),
                    "userId": result.get("userId"),
                    "expiresAt": result.get("expiresAt"),
                    "is_finance_user": True,
                }
            else:
                error_data = response.json()
                return {
                    "error": error_data.get("message", "Authentication failed")
                }, response.status_code
        else:
            response = requests.post(
                "https://auth.quiltt.io/v1/users/sessions",
                headers={
                    "Authorization": f"Bearer {API_SECRET_KEY}",
                    "Content-Type": "application/json",
                },
                json={"email": email},
            )

            if response.status_code in [200, 201, 202]:
                result = response.json()
                token = result.get("token")
                profile_id = result.get("userId")
                expires_at = result.get("expiresAt")

                userId = DBHelper.insert(
                    "bankDetails",
                    return_column="uid",
                    uid=uid,
                    email=email,
                    profile_id=profile_id,
                    isfinanceuser=True,
                )

                return {
                    "uid": userId,
                    "token": token,
                    "profile_id": profile_id,
                    "expiresAt": expires_at,
                    "is_finance_user": True,
                }
            else:
                error_data = response.json()
                print("Quiltt API error:", error_data)
                return {
                    "error": error_data.get("message", "Authentication failed")
                }, response.status_code


query = """
query SpendingAccountsWithTransactionsQuery {
  connections {
    id
    status
    institution {
      id
      name
      logo {
        url
      }
    }
    accounts(sort: LAST_TRANSACTED_ON_ASC) {
      balance {
        at
        current
        id
        available
        source
      }
      currencyCode
      name
      id
      provider
      transactedFirstOn
      transactedLastOn
      verified
    }
    features
    externallyManaged
  }
  transactions {
    nodes {
      id
      date
      description
      amount
      status
      currencyCode
      entryType
    }
  }
  
}
"""


class GetBankAccount(Resource):
    def post(self):
        # Get token from query params or headers
        data = request.get_json()
        session = data.get("session")
        token = session.get("token")  # e.g., "Bearer <user_token>"
        if not token:
            return {"error": "Missing Authorization header"}, 401

        headers = {
            "Authorization": token,
            "Content-Type": "application/json",
        }

        response = requests.post(
            GRAPHQL_ENDPOINT, json={"query": query}, headers=headers
        )

        data = response.json()

        if "errors" in data:
            return {"error": data["errors"]}, 400

        return data


class SaveBankAccount(Resource):
    def post(self):
        data = request.get_json()
