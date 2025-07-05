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

        txns = DBHelper.find_all(
            table_name="user_bank_transactions",
            filters={"user_id": user_id},
            select_fields=["description", "date", "amount"],
        )

        # Group by normalized description
        grouped = defaultdict(list)
        for txn in txns:
            desc = txn["description"].lower().strip()
            grouped[desc].append(txn)

        recurring = []

        for desc, items in grouped.items():
            if len(items) < 2:
                continue  # need at least 2 occurrences to detect pattern

            # Sort by date
            items.sort(
                key=lambda x: (
                    x["date"]
                    if isinstance(x["date"], (datetime, date))
                    else datetime.strptime(x["date"], "%Y-%m-%d")
                )
            )
            date_diffs = []

            for i in range(1, len(items)):
                d1 = items[i - 1]["date"]
                d2 = items[i]["date"]

                # Convert to datetime if it's a date
                if isinstance(d1, date) and not isinstance(d1, datetime):
                    d1 = datetime.combine(d1, datetime.min.time())
                if isinstance(d2, date) and not isinstance(d2, datetime):
                    d2 = datetime.combine(d2, datetime.min.time())

                diff = (d2 - d1).days
                date_diffs.append(diff)

            if not date_diffs:
                continue

            most_common_diff = Counter(date_diffs).most_common(1)[0]
            if most_common_diff[1] < 2:
                continue

            # classify frequency
            gap = most_common_diff[0]
            if 27 <= gap <= 32:
                frequency = "Monthly"
            elif 6 <= gap <= 8:
                frequency = "Weekly"
            else:
                continue

            last_txn = items[-1]

            recurring.append(
                {
                    "description": desc.title(),
                    "amount": (
                        float(last_txn["amount"])
                        if isinstance(last_txn["amount"], Decimal)
                        else last_txn["amount"]
                    ),
                    "last_date": (
                        last_txn["date"].isoformat()
                        if isinstance(last_txn["date"], (date, datetime))
                        else last_txn["date"]
                    ),
                    "frequency": frequency,
                }
            )

        return {"recurring_transactions": recurring}

    def post(self):
        data = request.get_json()
        user_id = data.get("user_id")

        if not user_id:
            return {"error": "Missing user_id"}, 400

        transactions = DBHelper.find_all(
            table_name="user_bank_transactions",
            filters={"user_id": user_id},
            select_fields=["transaction_id", "date", "description", "amount"],
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
                    "total_balance": 0,
                    "negative_balance": 0,
                    "items": [],
                }
            if balance >= 0:
                sections[section]["total_balance"] += balance
            else:
                sections[section]["negative_balance"] += balance
            sections[section]["items"].append(item)

        total_balance = sum(
            float(acc["current_balance"] or 0)
            for acc in accounts
            if float(acc["current_balance"] or 0) >= 0
        )
        negative_balance = sum(
            float(acc["current_balance"] or 0)
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
                "total_balance": total_balance,
                "negative_balance": negative_balance,
            },
        }


class getTotalBalance(Resource):
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

        total_balance = sum(
            float(acc["current_balance"] or 0)
            for acc in accounts
            if float(acc["current_balance"] or 0) >= 0
        )
        negative_balance = sum(
            float(acc["current_balance"] or 0)
            for acc in accounts
            if float(acc["current_balance"] or 0) < 0
        )
        print(f"Total balance (positive) for user {uid}: {total_balance}")
        print(f"Negative balance for user {uid}: {negative_balance}")

        return {
            "status": 1,
            "message": "Account balances retrieved",
            "total_balance": total_balance,
            "negative_balance": negative_balance,
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
