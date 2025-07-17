# import base64
# from collections import Counter, defaultdict

# # import datetime
# from datetime import datetime, date
# from decimal import Decimal
# import json
# import statistics
# from root.db.dbHelper import DBHelper
# from flask import request
# from flask_restful import Resource
# import requests

# from root.config import API_SECRET_KEY, AUTH_ENDPOINT
# from root.auth.auth import auth_required

# API_SECRET_KEY = (
#     "qltt_04b9cfce7233a7d46d38f12d4d51e4b3497aa5e4e4c391741d3c7df0d775874b7dd8a0f2d"
# )

# GRAPHQL_ENDPOINT = "https://api.quiltt.io/v1/graphql"


# class BankConnect(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         data = request.get_json()
#         currentUser = data.get("currentUser")
#         userId = currentUser.get("uid")
#         email = currentUser.get("email")
#         # email = "dockly3@gmail.com" # for testing

#         if not userId:
#             return {"error": "Missing userId"}

#         existing_user = DBHelper.find_one(
#             "user_finance_details",
#             filters={"user_id": uid},
#             select_fields=["profile_id", "isfinanceuser"],
#         )

#         if existing_user:
#             profile_id = existing_user.get("profile_id")

#             response = requests.post(
#                 "https://auth.quiltt.io/v1/users/sessions",
#                 headers={
#                     "Authorization": f"Bearer {API_SECRET_KEY}",
#                     "Content-Type": "application/json",
#                 },
#                 json={"userId": profile_id},
#             )

#             if response.status_code in [200, 201, 202]:
#                 result = response.json()
#                 return {
#                     "uid": existing_user.get("uid"),
#                     "token": result.get("token"),
#                     "userId": result.get("userId"),
#                     "expiresAt": result.get("expiresAt"),
#                     "is_finance_user": True,
#                 }
#             else:
#                 error_data = response.json()
#                 return {
#                     "error": error_data.get("message", "Authentication failed")
#                 }, response.status_code
#         else:
#             response = requests.post(
#                 "https://auth.quiltt.io/v1/users/sessions",
#                 headers={
#                     "Authorization": f"Bearer {API_SECRET_KEY}",
#                     "Content-Type": "application/json",
#                 },
#                 json={"email": email},
#             )

#             if response.status_code in [200, 201, 202]:
#                 result = response.json()
#                 token = result.get("token")
#                 profile_id = result.get("userId")
#                 expires_at = result.get("expiresAt")

#                 userId = DBHelper.insert(
#                     "user_finance_details",
#                     return_column="user_id",
#                     user_id=uid,
#                     expiresat=expires_at,
#                     profile_id=profile_id,
#                     isfinanceuser=1,
#                 )

#                 return {
#                     "uid": userId,
#                     "token": token,
#                     "profile_id": profile_id,
#                     "expiresAt": expires_at,
#                     "is_finance_user": True,
#                 }
#             else:
#                 error_data = response.json()
#                 print("Quiltt API error:", error_data)
#                 return {
#                     "error": error_data.get("message", "Authentication failed")
#                 }, response.status_code


# query = """
# query SpendingAccountsWithTransactionsQuery {
#   connections {
#     id
#     status
#     institution {
#       id
#       name
#       logo {
#         url
#       }
#     }
#     accounts(sort: LAST_TRANSACTED_ON_ASC) {
#       balance {
#         at
#         current
#         id
#         available
#         source
#       }
#       currencyCode
#       name
#       id
#       provider
#       transactedFirstOn
#       transactedLastOn
#       verified
#     }
#     features
#     externallyManaged
#   }
#   transactions {
#     nodes {
#       id
#       date
#       description
#       amount
#       status
#       currencyCode
#       entryType

#       remoteData {
#         mx {
#           transaction {
#             timestamp
#             response {
#               id
#             }
#           }
#         }
#         fingoal {
#           enrichment {
#             id
#             timestamp
#             response {
#               accountid
#               amountnum
#               category
#               categoryId
#               clientId
#               container
#               date
#               detailCategoryId
#               guid
#               highLevelCategoryId
#               isPhysical
#               isRecurring
#               merchantAddress1
#               merchantCity
#               merchantCountry
#               merchantLatitude
#               merchantLogoUrl
#               merchantLongitude
#               merchantName
#               merchantPhoneNumber
#               merchantState
#               merchantType
#               merchantZip
#               originalDescription
#               type
#               transactionid
#               transactionTags
#               subType
#               simpleDescription
#               receiptDate
#               requestId
#               sourceId
#               uid
#             }
#           }
#         }
#         finicity {
#           transaction {
#             id
#             timestamp
#             response {
#               accountId
#               amount
#               checkNum
#               commissionAmount
#               createdDate
#               currencySymbol
#               customerId
#               description
#               effectiveDate
#               escrowAmount
#               feeAmount
#               firstEffectiveDate
#               id
#               incomeType
#               investmentTransactionType
#               interestAmount
#             }
#           }
#         }
#       }
#     }
#   }
# }
# """


# class GetBankAccount(Resource):
#     def post(self):
#         # Get token from query params or headers
#         data = request.get_json()
#         session = data.get("session")
#         token = session.get("token")  # e.g., "Bearer <user_token>"
#         if not token:
#             return {"error": "Missing Authorization header"}, 401

#         data = getBankData(token)
#         if "errors" in data:
#             return {"error": data["errors"]}, 400

#         return data


# class SaveBankAccount(Resource):
#     def post(self):
#         data = request.get_json()


# def getBankData(token):
#     headers = {
#         "Authorization": token,
#         "Content-Type": "application/json",
#     }

#     response = requests.post(GRAPHQL_ENDPOINT, json={"query": query}, headers=headers)

#     data = response.json()
#     return data


# class SaveBankTransactions(Resource):
#     def post(self):
#         try:
#             data = request.get_json()
#             session = data.get("session")
#             user_id = data.get("user_id")

#             if not session or "token" not in session:
#                 return {"error": "Missing session or token"}, 400

#             if not user_id:
#                 return {"error": "Missing user_id"}, 400

#             token = session.get("token")
#             result = getBankData(token)

#             if "errors" in result:
#                 return {"error": result["errors"]}, 400

#             transactions = (
#                 result.get("data", {}).get("transactions", {}).get("nodes", [])
#             )

#             # ✅ Ensure user exists in users table
#             user_exists = DBHelper.find_one("users", filters={"uid": user_id})
#             if not user_exists:
#                 DBHelper.insert("users", uid=user_id)

#             saved = 0
#             for txn in transactions:
#                 DBHelper.insert_ignore_duplicates(
#                     table_name="user_bank_transactions",
#                     unique_key="transaction_id",
#                     user_id=user_id,  # ✅ now inserting with correct foreign key
#                     transaction_id=txn.get("id"),
#                     date=txn.get("date"),
#                     description=txn.get("description"),
#                     amount=txn.get("amount"),
#                     status=txn.get("status"),
#                     currency_code=txn.get("currencyCode"),
#                     entry_type=txn.get("entryType"),
#                 )
#                 saved += 1

#             return {"message": "Transactions saved successfully", "count": saved}

#         except Exception as e:
#             print("❌ Internal error in SaveBankTransactions:", e)
#             return {"error": str(e)}, 500


# class GetSavedTransactions(Resource):
#     def post(self):
#         data = request.get_json()
#         user_id = data.get("user_id")

#         if not user_id:
#             return {"error": "Missing user_id"}, 400

#         transactions = DBHelper.find_all(
#             table_name="user_bank_transactions",
#             filters={"user_id": user_id},
#             select_fields=[
#                 "transaction_id",
#                 "date",
#                 "description",
#                 "amount",
#                 "status",
#                 "currency_code",
#                 "entry_type",
#             ],
#         )

#         # ✅ Convert `date` and `Decimal` fields before returning
#         for txn in transactions:
#             if isinstance(txn.get("date"), (datetime, date)):
#                 txn["date"] = txn["date"].isoformat()
#             if isinstance(txn.get("amount"), Decimal):
#                 txn["amount"] = float(txn["amount"])

#         return {"transactions": transactions}


# class RecurringTransactions(Resource):
#     def post(self):
#         data = request.get_json()
#         user_id = data.get("user_id")

#         if not user_id:
#             return {"error": "Missing user_id"}, 400

#         transactions = DBHelper.find_all(
#             table_name="user_bank_transactions",
#             filters={"user_id": user_id},
#             select_fields=["transaction_id", "date", "description", "amount"],
#             limit=500,
#         )

#         # Step 1: Group by description
#         grouped = defaultdict(list)
#         for txn in transactions:
#             grouped[txn["description"].strip().lower()].append(txn)

#         recurring = []
#         for desc, txns in grouped.items():
#             if len(txns) < 2:
#                 continue

#             # Sort by date
#             dates = sorted(
#                 [
#                     (
#                         t["date"]
#                         if isinstance(t["date"], datetime)
#                         else datetime.combine(t["date"], datetime.min.time())
#                     )
#                     for t in txns
#                 ]
#             )

#             intervals = [(dates[i] - dates[i - 1]).days for i in range(1, len(dates))]

#             if not intervals:
#                 continue

#             # Check if intervals are close to 7 or 30 days
#             median_interval = statistics.median(intervals)
#             if 6 <= median_interval <= 8 or 28 <= median_interval <= 32:
#                 recurring.append(
#                     {
#                         "description": desc.title(),
#                         "amount": f"${abs(txns[-1]['amount']):.2f}",
#                         "last_date": dates[-1].strftime("%Y-%m-%d"),
#                         "frequency": "Monthly" if median_interval > 15 else "Weekly",
#                     }
#                 )

#         return {"recurring_transactions": recurring}


# class AddAccounts(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         input_data = request.get_json()

#         accounts = input_data.get("accounts", [])
#         print(f"accounts: {accounts}")

#         # ✅ 1. Delete existing accounts for the user
#         DBHelper.delete_all("bank_accounts", filters={"user_id": uid})

#         # ✅ 2. Insert new accounts
#         inserted_ids = []
#         for acc in accounts:
#             account_id = DBHelper.insert(
#                 "bank_accounts",
#                 return_column="id",
#                 user_id=uid,
#                 name=acc.get("name"),
#                 provider=acc.get("provider"),
#                 access_token=acc.get("session", {}).get("token"),
#                 current_balance=acc.get("balance", {}).get("current"),
#                 currency=acc.get("currencyCode"),
#                 transacted_first=acc.get("transactedFirstOn"),
#                 transacted_last=acc.get("transactedLastOn"),
#             )
#             inserted_ids.append(account_id)

#         return {
#             "status": 1,
#             "message": "Accounts refreshed successfully",
#             "account_ids": inserted_ids,
#         }


# # class GetAccounts(Resource):
# #     @auth_required(isOptional=True)
# #     def post(self, uid, user):
# #         accounts = DBHelper.find_all(
# #             "bank_accounts",
# #             filters={"user_id": uid},
# #             select_fields=[
# #                 "id",
# #                 "name",
# #                 "provider",
# #                 "current_balance",
# #                 "currency",
# #                 "transacted_first",
# #                 "transacted_last",
# #             ],
# #         )

# #         def classify(acc):
# #             name = (acc.get("name") or "").lower()
# #             provider = (acc.get("provider") or "").lower()

# #             if (
# #                 "loan" in name
# #                 or "loan" in provider
# #                 or "mortgage" in name
# #                 or "mortgage" in provider
# #             ):
# #                 return "Loans"
# #             elif (
# #                 "credit" in name
# #                 or "card" in provider
# #                 or "amex" in provider
# #                 or "visa" in provider
# #             ):
# #                 return "Credit Cards"
# #             elif (
# #                 "investment" in name
# #                 or "401" in name
# #                 or "fidelity" in provider
# #                 or "vanguard" in provider
# #             ):
# #                 return "Investments"
# #             else:
# #                 return "Cash Accounts"

# #         COLOR_MAP = {
# #             "Loans": "#ef4444",
# #             "Credit Cards": "#1e40af",
# #             "Investments": "#8b5cf6",
# #             "Cash Accounts": "#3b82f6",
# #         }

# #         sections = {}

# #         for acc in accounts:
# #             section = classify(acc)
# #             item = {
# #                 "name": acc["name"],
# #                 "type": acc["provider"],
# #                 "value": float(acc["current_balance"] or 0),
# #                 "color": COLOR_MAP.get(section, "#3b82f6"),
# #             }

# #             if section not in sections:
# #                 sections[section] = {
# #                     "title": section,
# #                     "total": 0,
# #                     "items": [],
# #                 }
# #             sections[section]["total"] += item["value"]
# #             sections[section]["items"].append(item)

# #         total_balance = sum(float(acc["current_balance"] or 0) for acc in accounts)

# #         ordered_titles = ["Cash Accounts", "Credit Cards", "Investments", "Loans"]
# #         ordered_sections = [
# #             sections[title] for title in ordered_titles if title in sections
# #         ]

# #         return {
# #             "status": 1,
# #             "message": "Accounts grouped",
# #             "payload": {
# #                 "sections": ordered_sections,
# #                 "total_balance": total_balance,
# #             },
# #         }


# # class getTotalBalance(Resource):
# #     @auth_required(isOptional=True)
# #     def post(self, uid, user):
# #         accounts = DBHelper.find_all(
# #             "bank_accounts",
# #             filters={"user_id": uid},
# #             select_fields=[
# #                 "id",
# #                 "current_balance",
# #             ],
# #         )

# #         sections = {}

# #         for acc in accounts:

# #             item = {
# #                 "value": float(acc["current_balance"] or 0),
# #             }

# #         total_balance = sum(float(acc["current_balance"] or 0) for acc in accounts)
# #         print(f"Total balance for user {uid}: {total_balance}")

# #         return {
# #             "status": 1,
# #             "message": "Accounts grouped",
# #             "total_balance": total_balance,
# #         }


# class GetAccounts(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         accounts = DBHelper.find_all(
#             "bank_accounts",
#             filters={"user_id": uid},
#             select_fields=[
#                 "id",
#                 "name",
#                 "provider",
#                 "current_balance",
#                 "currency",
#                 "transacted_first",
#                 "transacted_last",
#             ],
#         )

#         def classify(acc):
#             name = (acc.get("name") or "").lower()
#             provider = (acc.get("provider") or "").lower()

#             if (
#                 "loan" in name
#                 or "loan" in provider
#                 or "mortgage" in name
#                 or "mortgage" in provider
#             ):
#                 return "Loans"
#             elif (
#                 "credit" in name
#                 or "card" in provider
#                 or "amex" in provider
#                 or "visa" in provider
#             ):
#                 return "Credit Cards"
#             elif (
#                 "investment" in name
#                 or "401" in name
#                 or "fidelity" in provider
#                 or "vanguard" in provider
#             ):
#                 return "Investments"
#             else:
#                 return "Cash Accounts"

#         COLOR_MAP = {
#             "Loans": "#ef4444",
#             "Credit Cards": "#1e40af",
#             "Investments": "#8b5cf6",
#             "Cash Accounts": "#3b82f6",
#         }

#         sections = {}

#         for acc in accounts:
#             section = classify(acc)
#             balance = float(acc["current_balance"] or 0)
#             item = {
#                 "name": acc["name"],
#                 "type": acc["provider"],
#                 "value": balance,
#                 "color": COLOR_MAP.get(section, "#3b82f6"),
#             }

#             if section not in sections:
#                 sections[section] = {
#                     "title": section,
#                     "total_balance": 0,
#                     "negative_balance": 0,
#                     "items": [],
#                 }
#             if balance >= 0:
#                 sections[section]["total_balance"] += balance
#             else:
#                 sections[section]["negative_balance"] += balance
#             sections[section]["items"].append(item)

#         total_balance = sum(
#             float(acc["current_balance"] or 0)
#             for acc in accounts
#             if float(acc["current_balance"] or 0) >= 0
#         )
#         negative_balance = sum(
#             float(acc["current_balance"] or 0)
#             for acc in accounts
#             if float(acc["current_balance"] or 0) < 0
#         )

#         ordered_titles = ["Cash Accounts", "Credit Cards", "Investments", "Loans"]
#         ordered_sections = [
#             sections[title] for title in ordered_titles if title in sections
#         ]

#         return {
#             "status": 1,
#             "message": "Accounts grouped",
#             "payload": {
#                 "sections": ordered_sections,
#                 "total_balance": total_balance,
#                 "negative_balance": negative_balance,
#             },
#         }


# class getTotalBalance(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         accounts = DBHelper.find_all(
#             "bank_accounts",
#             filters={"user_id": uid},
#             select_fields=[
#                 "id",
#                 "current_balance",
#             ],
#         )

#         total_balance = sum(
#             float(acc["current_balance"] or 0)
#             for acc in accounts
#             if float(acc["current_balance"] or 0) >= 0
#         )
#         negative_balance = sum(
#             float(acc["current_balance"] or 0)
#             for acc in accounts
#             if float(acc["current_balance"] or 0) < 0
#         )
#         print(f"Total balance (positive) for user {uid}: {total_balance}")
#         print(f"Negative balance for user {uid}: {negative_balance}")

#         return {
#             "status": 1,
#             "message": "Account balances retrieved",
#             "total_balance": total_balance,
#             "negative_balance": negative_balance,
#         }


# class GetIncomeExpense(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         transactions = DBHelper.find_all(
#             table_name="user_bank_transactions",
#             filters={"user_id": uid},
#             select_fields=["amount"],
#         )

#         income_total = 0.0
#         expense_total = 0.0

#         for txn in transactions:
#             amount = txn.get("amount")
#             if isinstance(amount, Decimal):
#                 amount = float(amount)

#             if amount is not None:
#                 if amount >= 0:
#                     income_total += amount
#                 else:
#                     expense_total += abs(amount)
#         # print(f"Income total: {income_total}, Expense total: {expense_total}")
#         return {
#             "income_total": income_total,
#             "expense_total": expense_total,
#         }


import base64
from collections import Counter, defaultdict

# import datetime
from datetime import datetime, date
from decimal import Decimal
import json
import statistics
from root.db.dbHelper import DBHelper
from flask import request
from flask_restful import Resource
import requests

from root.config import API_SECRET_KEY, AUTH_ENDPOINT
from root.auth.auth import auth_required
import random

API_SECRET_KEY = (
    "qltt_04b9cfce7233a7d46d38f12d4d51e4b3497aa5e4e4c391741d3c7df0d775874b7dd8a0f2d"
)


def uniqueId(digit=15, isNum=True):
    if isNum:
        return "".join([str(random.randint(0, 9)) for _ in range(digit)])
    else:
        chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        return "".join(random.choice(chars) for _ in range(digit))


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
            "user_finance_details",
            filters={"user_id": uid},
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
                    "user_finance_details",
                    return_column="user_id",
                    user_id=uid,
                    expiresat=expires_at,
                    profile_id=profile_id,
                    isfinanceuser=1,
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
      
      remoteData {
        mx {
          transaction {
            timestamp
            response {
              id
            }
          }
        }
        fingoal {
          enrichment {
            id
            timestamp
            response {
              accountid
              amountnum
              category
              categoryId
              clientId
              container
              date
              detailCategoryId
              guid
              highLevelCategoryId
              isPhysical
              isRecurring
              merchantAddress1
              merchantCity
              merchantCountry
              merchantLatitude
              merchantLogoUrl
              merchantLongitude
              merchantName
              merchantPhoneNumber
              merchantState
              merchantType
              merchantZip
              originalDescription
              type
              transactionid
              transactionTags
              subType
              simpleDescription
              receiptDate
              requestId
              sourceId
              uid
            }
          }
        }
        finicity {
          transaction {
            id
            timestamp
            response {
              accountId
              amount
              checkNum
              commissionAmount
              createdDate
              currencySymbol
              customerId
              description
              effectiveDate
              escrowAmount
              feeAmount
              firstEffectiveDate
              id
              incomeType
              investmentTransactionType
              interestAmount
            }
          }
        }
      }
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

        data = getBankData(token)
        if "errors" in data:
            return {"error": data["errors"]}, 400

        return data


class SaveBankAccount(Resource):
    def post(self):
        data = request.get_json()


def getBankData(token):
    headers = {
        "Authorization": token,
        "Content-Type": "application/json",
    }

    response = requests.post(GRAPHQL_ENDPOINT, json={"query": query}, headers=headers)

    data = response.json()
    return data


class SaveBankTransactions(Resource):
    def post(self):
        try:
            data = request.get_json()
            session = data.get("session")
            user_id = data.get("user_id")

            if not session or "token" not in session:
                return {"error": "Missing session or token"}, 400

            if not user_id:
                return {"error": "Missing user_id"}, 400

            token = session.get("token")
            result = getBankData(token)

            if "errors" in result:
                return {"error": result["errors"]}, 400

            transactions = (
                result.get("data", {}).get("transactions", {}).get("nodes", [])
            )

            # ✅ Ensure user exists in users table
            user_exists = DBHelper.find_one("users", filters={"uid": user_id})
            if not user_exists:
                DBHelper.insert("users", uid=user_id)

            saved = 0
            for txn in transactions:
                DBHelper.insert_ignore_duplicates(
                    table_name="user_bank_transactions",
                    unique_key="transaction_id",
                    user_id=user_id,  # ✅ now inserting with correct foreign key
                    transaction_id=txn.get("id"),
                    date=txn.get("date"),
                    description=txn.get("description"),
                    amount=txn.get("amount"),
                    status=txn.get("status"),
                    currency_code=txn.get("currencyCode"),
                    entry_type=txn.get("entryType"),
                )
                saved += 1

            return {"message": "Transactions saved successfully", "count": saved}

        except Exception as e:
            print("❌ Internal error in SaveBankTransactions:", e)
            return {"error": str(e)}, 500


class GetSavedTransactions(Resource):
    def post(self):
        data = request.get_json()
        user_id = data.get("user_id")

        if not user_id:
            return {"error": "Missing user_id"}, 400

        transactions = DBHelper.find_all(
            table_name="user_bank_transactions",
            filters={"user_id": user_id},
            select_fields=[
                "transaction_id",
                "date",
                "description",
                "amount",
                "status",
                "currency_code",
                "entry_type",
            ],
        )

        # ✅ Convert `date` and `Decimal` fields before returning
        for txn in transactions:
            if isinstance(txn.get("date"), (datetime, date)):
                txn["date"] = txn["date"].isoformat()
            if isinstance(txn.get("amount"), Decimal):
                txn["amount"] = float(txn["amount"])

        return {"transactions": transactions}


class RecurringTransactions(Resource):
    def post(self):
        data = request.get_json()
        user_id = data.get("user_id")

        if not user_id:
            return {"error": "Missing user_id"}, 400

        transactions = DBHelper.find_all(
            table_name="user_bank_transactions",
            filters={"user_id": user_id},
            select_fields=["transaction_id", "date", "description", "amount"],
            limit=500,  # type: ignore
        )

        # Step 1: Group by description
        grouped = defaultdict(list)
        for txn in transactions:
            grouped[txn["description"].strip().lower()].append(txn)

        recurring = []
        for desc, txns in grouped.items():
            if len(txns) < 2:
                continue

            # Sort by date
            dates = sorted(
                [
                    (
                        t["date"]
                        if isinstance(t["date"], datetime)
                        else datetime.combine(t["date"], datetime.min.time())
                    )
                    for t in txns
                ]
            )

            intervals = [(dates[i] - dates[i - 1]).days for i in range(1, len(dates))]

            if not intervals:
                continue

            # Check if intervals are close to 7 or 30 days
            median_interval = statistics.median(intervals)
            if 6 <= median_interval <= 8 or 28 <= median_interval <= 32:
                recurring.append(
                    {
                        "description": desc.title(),
                        "amount": f"${abs(txns[-1]['amount']):.2f}",
                        "last_date": dates[-1].strftime("%Y-%m-%d"),
                        "frequency": "Monthly" if median_interval > 15 else "Weekly",
                    }
                )

        return {"recurring_transactions": recurring}


class AddAccounts(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json()

        accounts = input_data.get("accounts", [])
        print(f"accounts: {accounts}")

        # ✅ 1. Delete existing accounts for the user
        DBHelper.delete_all("bank_accounts", filters={"user_id": uid})

        # ✅ 2. Insert new accounts
        inserted_ids = []
        for acc in accounts:
            account_id = DBHelper.insert(
                "bank_accounts",
                return_column="id",
                user_id=uid,
                name=acc.get("name"),
                provider=acc.get("provider"),
                access_token=acc.get("session", {}).get("token"),
                current_balance=acc.get("balance", {}).get("current"),
                currency=acc.get("currencyCode"),
                transacted_first=acc.get("transactedFirstOn"),
                transacted_last=acc.get("transactedLastOn"),
            )
            inserted_ids.append(account_id)

        return {
            "status": 1,
            "message": "Accounts refreshed successfully",
            "account_ids": inserted_ids,
        }


# class GetAccounts(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         accounts = DBHelper.find_all(
#             "bank_accounts",
#             filters={"user_id": uid},
#             select_fields=[
#                 "id",
#                 "name",
#                 "provider",
#                 "current_balance",
#                 "currency",
#                 "transacted_first",
#                 "transacted_last",
#             ],
#         )

#         def classify(acc):
#             name = (acc.get("name") or "").lower()
#             provider = (acc.get("provider") or "").lower()

#             if (
#                 "loan" in name
#                 or "loan" in provider
#                 or "mortgage" in name
#                 or "mortgage" in provider
#             ):
#                 return "Loans"
#             elif (
#                 "credit" in name
#                 or "card" in provider
#                 or "amex" in provider
#                 or "visa" in provider
#             ):
#                 return "Credit Cards"
#             elif (
#                 "investment" in name
#                 or "401" in name
#                 or "fidelity" in provider
#                 or "vanguard" in provider
#             ):
#                 return "Investments"
#             else:
#                 return "Cash Accounts"

#         COLOR_MAP = {
#             "Loans": "#ef4444",
#             "Credit Cards": "#1e40af",
#             "Investments": "#8b5cf6",
#             "Cash Accounts": "#3b82f6",
#         }

#         sections = {}

#         for acc in accounts:
#             section = classify(acc)
#             item = {
#                 "name": acc["name"],
#                 "type": acc["provider"],
#                 "value": float(acc["current_balance"] or 0),
#                 "color": COLOR_MAP.get(section, "#3b82f6"),
#             }

#             if section not in sections:
#                 sections[section] = {
#                     "title": section,
#                     "total": 0,
#                     "items": [],
#                 }
#             sections[section]["total"] += item["value"]
#             sections[section]["items"].append(item)

#         total_balance = sum(float(acc["current_balance"] or 0) for acc in accounts)

#         ordered_titles = ["Cash Accounts", "Credit Cards", "Investments", "Loans"]
#         ordered_sections = [
#             sections[title] for title in ordered_titles if title in sections
#         ]

#         return {
#             "status": 1,
#             "message": "Accounts grouped",
#             "payload": {
#                 "sections": ordered_sections,
#                 "total_balance": total_balance,
#             },
#         }


# class getTotalBalance(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         accounts = DBHelper.find_all(
#             "bank_accounts",
#             filters={"user_id": uid},
#             select_fields=[
#                 "id",
#                 "current_balance",
#             ],
#         )

#         sections = {}

#         for acc in accounts:

#             item = {
#                 "value": float(acc["current_balance"] or 0),
#             }

#         total_balance = sum(float(acc["current_balance"] or 0) for acc in accounts)
#         print(f"Total balance for user {uid}: {total_balance}")

#         return {
#             "status": 1,
#             "message": "Accounts grouped",
#             "total_balance": total_balance,
#         }


class GetAccounts(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        accounts = DBHelper.find_all(
            "bank_accounts",
            filters={"user_id": uid},
            select_fields=[
                "id",
                "name",
                "provider",
                "current_balance",
                "currency",
                "transacted_first",
                "transacted_last",
            ],
        )

        def classify(acc):
            name = (acc.get("name") or "").lower()
            provider = (acc.get("provider") or "").lower()

            if (
                "loan" in name
                or "loan" in provider
                or "mortgage" in name
                or "mortgage" in provider
            ):
                return "Loans"
            elif (
                "credit" in name
                or "card" in provider
                or "amex" in provider
                or "visa" in provider
            ):
                return "Credit Cards"
            elif (
                "investment" in name
                or "401" in name
                or "fidelity" in provider
                or "vanguard" in provider
            ):
                return "Investments"
            else:
                return "Cash Accounts"

        COLOR_MAP = {
            "Loans": "#ef4444",
            "Credit Cards": "#1e40af",
            "Investments": "#8b5cf6",
            "Cash Accounts": "#3b82f6",
        }

        sections = {}

        for acc in accounts:
            section = classify(acc)
            balance = float(acc["current_balance"] or 0)
            item = {
                "name": acc["name"],
                "type": acc["provider"],
                "value": balance,
                "color": COLOR_MAP.get(section, "#3b82f6"),
            }

            if section not in sections:
                sections[section] = {
                    "title": section,
                    "total": 0,
                    "items": [],
                }
            sections[section]["total"] += balance
            sections[section]["items"].append(item)

        assets = sum(
            float(acc["current_balance"] or 0)
            for acc in accounts
            if float(acc["current_balance"] or 0) >= 0
        )
        liabilities = sum(
            abs(float(acc["current_balance"] or 0))
            for acc in accounts
            if float(acc["current_balance"] or 0) < 0
        )

        ordered_titles = ["Cash Accounts", "Credit Cards", "Investments", "Loans"]
        ordered_sections = [
            sections[title] for title in ordered_titles if title in sections
        ]

        return {
            "status": 1,
            "message": "Accounts grouped",
            "payload": {
                "sections": ordered_sections,
                "total_balance": assets - liabilities,
                "assets": assets,
                "liabilities": liabilities,
            },
        }


class GetTotalBalance(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        accounts = DBHelper.find_all(
            "bank_accounts",
            filters={"user_id": uid},
            select_fields=[
                "id",
                "current_balance",
            ],
        )

        assets = sum(
            float(acc["current_balance"] or 0)
            for acc in accounts
            if float(acc["current_balance"] or 0) >= 0
        )
        liabilities = sum(
            abs(float(acc["current_balance"] or 0))
            for acc in accounts
            if float(acc["current_balance"] or 0) < 0
        )

        # print(f"Assets for user {uid}: {assets}")
        # print(f"Liabilities for user {uid}: {liabilities}")

        return {
            "status": 1,
            "message": "Account balances retrieved",
            "assets": assets,
            "liabilities": liabilities,
            "total_balance": assets - liabilities,
        }


class GetIncomeExpense(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        transactions = DBHelper.find_all(
            table_name="user_bank_transactions",
            filters={"user_id": uid},
            select_fields=["amount"],
        )

        income_total = 0.0
        expense_total = 0.0

        for txn in transactions:
            amount = txn.get("amount")
            if isinstance(amount, Decimal):
                amount = float(amount)

            if amount is not None:
                if amount >= 0:
                    income_total += amount
                else:
                    expense_total += abs(amount)
        # print(f"Income total: {income_total}, Expense total: {expense_total}")
        return {
            "income_total": income_total,
            "expense_total": expense_total,
        }


class AddFinanceGoal(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        id = uniqueId(digit=15, isNum=True)

        goal = {
            "id": id,
            "user_id": uid,
            "name": data.get("name", ""),  # type: ignore
            "goal_status": data.get(
                "goal_status", 0
            ),  # 0 = YET_TO_START # type: ignore
            "target_amount": data.get("target_amount", 0),  # type: ignore
            "saved_amount": data.get("saved_amount", 0),  # type: ignore
            "deadline": data.get("deadline", None),  # Format: YYYY-MM-DD # type: ignore
            "is_active": 1,
        }

        DBHelper.insert("finance_goals", return_column="id", **goal)

        return {
            "status": 1,
            "message": "Finance Goal Added Successfully",
            "payload": goal,
        }


class GetFinanceGoal(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        goals = DBHelper.find_all(
            "finance_goals",
            {"user_id": uid, "is_active": 1},  # fetch only active goals
            select_fields=[
                "id",
                "name",
                "goal_status",
                "target_amount",
                "saved_amount",
                "deadline",
                "created_at",
                "updated_at",
            ],
        )

        financeGoals = []
        for goal in goals:
            financeGoals.append(
                {
                    "id": goal["id"],
                    "name": goal["name"],
                    "goal_status": goal["goal_status"],
                    "target_amount": str(goal["target_amount"]),
                    "saved_amount": str(goal["saved_amount"]),
                    "deadline": (
                        goal["deadline"].strftime("%Y-%m-%d")
                        if goal["deadline"]
                        else None
                    ),
                    "created_at": goal["created_at"].strftime("%Y-%m-%d %H:%M:%S"),
                    "updated_at": (
                        goal["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
                        if goal["updated_at"]
                        else None
                    ),
                }
            )

        return {
            "status": 1,
            "payload": financeGoals,
        }


class UpdateFinanceGoal(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        if data is None:
            return {"status": 0, "message": "No data provided"}, 400

        goal_id = data.get("id")
        if not goal_id:
            return {"status": 0, "message": "Goal ID is required"}, 400

        # Only update allowed fields
        update_data = {}
        allowed_fields = [
            "name",
            "goal_status",
            "target_amount",
            "saved_amount",
            "deadline",
        ]
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        if not update_data:
            return ({"status": 0, "message": "No valid fields provided for update"},)

        # Use positional arguments here
        updated = DBHelper.update_one(
            "finance_goals", {"id": goal_id, "user_id": uid}, update_data
        )

        if updated:
            return {"status": 1, "message": "Finance goal updated successfully"}
        else:
            return {"status": 0, "message": "Update failed or no matching goal found"}


class GenerateMonthlyBudget(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if not uid:
                return {"error": "Missing user_id"}, 400

            current_month = datetime.now().strftime("%Y-%m")  # e.g., "2025-07"
            transactions = DBHelper.find_all(
                table_name="user_bank_transactions",
                filters={"user_id": uid},
                select_fields=["description", "amount", "date"],
            )
            # Filter transactions for the current month
            transactions = [
                txn
                for txn in transactions
                if txn.get("date")
                and txn.get("date").strftime("%Y-%m") == current_month
            ]

            description_transactions = defaultdict(list)
            for txn in transactions:
                description = txn.get("description", "").strip()
                amount = float(txn.get("amount", 0))
                if amount < 0:  # Consider only expenses
                    date_str = txn.get("date")
                    if date_str and isinstance(date_str, (date, datetime)):
                        txn_date = (
                            date_str
                            if isinstance(date_str, datetime)
                            else datetime.combine(date_str, datetime.min.time())
                        )
                        description_transactions[description].append(
                            {
                                "date": txn_date,
                                "amount": abs(amount),
                            }
                        )

            budget_categories = {
                "All Expenses": {"spent": 0, "budget": 0, "descriptions": {}}
            }
            for desc, txns in description_transactions.items():
                if (
                    len(txns) > 5
                ):  # Only include descriptions repeated more than 5 times
                    total_spent = sum(t["amount"] for t in txns)
                    count = len(txns)
                    budget_categories["All Expenses"]["spent"] += total_spent
                    budget_categories["All Expenses"]["budget"] += (
                        total_spent * 1.2
                    )  # 20% buffer
                    budget_categories["All Expenses"]["descriptions"][desc] = {
                        "spent": total_spent,
                        "count": count,
                        "budget": total_spent * 1.2,
                    }

            total_budget = budget_categories["All Expenses"]["budget"]
            needs_budget = total_budget  # All expenses considered needs for simplicity
            savings_budget = total_budget * 0.2 if total_budget > 0 else 0

            return {
                "status": 1,
                "message": "Monthly budget generated",
                "budget_categories": budget_categories,
                "budget_summary": {
                    "Needs": {
                        "spent": budget_categories["All Expenses"]["spent"],
                        "total": needs_budget,
                    },
                    "Savings": {"spent": 0, "total": savings_budget},
                },
                "total_budget": total_budget,
            }
        except Exception as e:
            print(f"Error in GenerateMonthlyBudget: {e}")
            return {"error": str(e)}, 500


class UpdateMonthlyBudget(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if not uid:
                return {"error": "Missing user_id"}, 400

            data = request.get_json()
            if not data or "budget_categories" not in data:
                return {"error": "Missing budget_categories data"}, 400

            budget_categories = data["budget_categories"]
            # Placeholder: Save to database or update existing logic
            return {
                "status": 1,
                "message": "Budget updated successfully",
                "budget_categories": budget_categories,
            }
        except Exception as e:
            print(f"Error in UpdateMonthlyBudget: {e}")
            return {"error": str(e)}
