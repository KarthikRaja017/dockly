import base64
from collections import Counter, defaultdict

# import datetime
from datetime import datetime, date
from decimal import Decimal
import json
import statistics
import time
from venv import logger
from root.db.dbHelper import DBHelper
from flask import request
from flask_restful import Resource, reqparse
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
        data = request.get_json()
        session = data.get("session")
        token = session.get("token") if session else None
        if not token:
            return {"error": "Missing Authorization header"}, 401

        try:
            data = wait_for_balances(token)
            return data
        except TimeoutError:
            return {
                "status": "PENDING",
                "message": "Still syncing, try again shortly",
            }, 202


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
    print(f"data: {data}")
    return data


def wait_for_balances(token, timeout=10, max_sleep=4):
    start = time.time()
    sleep = 1
    while time.time() - start < timeout:
        data = getBankData(token)
        conn = data["data"]["connections"][0]
        status = conn["status"]
        accounts = conn.get("accounts", [])
        has_balances = any(
            a.get("balance") and a["balance"].get("current") is not None
            for a in accounts
        )
        if status != "SYNCING" and has_balances:
            return data

        time.sleep(sleep)
        sleep = min(max_sleep, sleep * 2)
    return {"status": "PENDING", "message": "Still syncing, try again shortly"}


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
            print(saved)
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
            # limit=500,  # type: ignore
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
        # print(f"accounts: {accounts}")

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

            # Define keyword-based categorization using description
            description_to_budget = {
                # Housing-related (Needs)
                "mortgage": "Needs",
                "rent": "Needs",
                "housing": "Needs",
                # Food-related (reclassified as Dining Out under Wants)
                "groceries": "Wants",  # Reclassified to Dining Out
                "food": "Wants",  # Reclassified to Dining Out
                # Entertainment-related (Wants)
                "subscriptions": "Wants",
                "movie tickets": "Wants",
                "entertainment": "Wants",
                # Shopping-related (Wants)
                "electronics": "Wants",
                "shoes": "Wants",
                "clothing": "Wants",
                "cables": "Wants",
                "healthcare": "Wants",
                # Savings
                "savings": "Savings",
                "transfer to savings": "Savings",
                # Other
                "fee": "Other",
                "service charge": "Other",
                "income": "Other",
                "paycheck": "Other",
                "transfer": "Other",
            }

            # Get all user transactions
            transactions = (
                DBHelper.find_all(
                    table_name="user_bank_transactions",
                    filters={"user_id": uid},
                    select_fields=["amount", "entry_type", "date", "description"],
                )
                or []
            )

            # Filter for current month and debit transactions
            current_month = datetime.now().strftime("%Y-%m")
            filtered = [
                txn
                for txn in transactions
                if txn.get("date")
                and txn["date"].strftime("%Y-%m") == current_month
                and txn.get("entry_type", "").upper() == "DEBIT"
            ]

            if not filtered:
                logger.warning(
                    f"No debit transactions found for user {uid} in {current_month}"
                )
                return {
                    "status": 1,
                    "message": "No transactions found",
                    "budget_categories": {
                        "All Expenses": {
                            "spent": 0.0,
                            "budget": 0.0,
                            "descriptions": {
                                "Needs": {"spent": 0.0, "budget": 0.0, "count": 0},
                                "Wants": {"spent": 0.0, "budget": 0.0, "count": 0},
                                "Savings": {"spent": 0.0, "budget": 0.0, "count": 0},
                                "Other": {"spent": 0.0, "budget": 0.0, "count": 0},
                            },
                            "all_transactions": {
                                "Needs": [],
                                "Wants": [],
                                "Savings": [],
                                "Other": [],
                            },
                        }
                    },
                    "budget_summary": {
                        "Needs": {"spent": 0, "total": 0},
                        "Wants": {"spent": 0, "total": 0},
                        "Savings": {"spent": 0, "total": 0},
                        "Other": {"spent": 0, "total": 0},
                    },
                }

            # Aggregate by Budget Category and track all transactions
            summary = defaultdict(lambda: {"spent": 0.0, "count": 0})
            all_transactions = defaultdict(list)

            for txn in filtered:
                desc = txn.get("description") or "Unknown"
                desc_lower = desc.lower()
                budget_cat = "Other"
                for keyword, cat in description_to_budget.items():
                    if keyword in desc_lower:
                        budget_cat = cat
                        break

                if "savings" in desc_lower and "transfer" in desc_lower:
                    budget_cat = "Savings"

                amount = abs(float(txn.get("amount", 0)))
                summary[budget_cat]["spent"] += amount
                summary[budget_cat]["count"] += 1
                all_transactions[budget_cat].append(
                    {
                        "description": desc,
                        "amount": amount,
                        "date": (
                            txn.get("date").strftime("%Y-%m-%d")
                            if txn.get("date")
                            else "N/A"
                        ),
                    }
                )

            # Set budget as 120% of spent amount, default to 0 if no data
            for cat in ["Needs", "Wants", "Savings", "Other"]:
                if cat not in summary:
                    summary[cat] = {"spent": 0.0, "count": 0}
                summary[cat]["budget"] = round(summary[cat]["spent"] * 1.2, 2)

            all_spent = sum(v["spent"] for v in summary.values())
            all_budget = sum(v["budget"] for v in summary.values())

            # Build structured response with exactly 4 categories
            budget_categories = {
                "All Expenses": {
                    "spent": round(all_spent, 2),
                    "budget": round(all_budget, 2),
                    "descriptions": {
                        cat: {
                            "spent": round(summary[cat]["spent"], 2),
                            "budget": round(summary[cat]["budget"], 2),
                            "count": summary[cat]["count"],
                        }
                        for cat in ["Needs", "Wants", "Savings", "Other"]
                    },
                    "all_transactions": {
                        cat: all_transactions[cat]
                        for cat in ["Needs", "Wants", "Savings", "Other"]
                    },
                }
            }

            return {
                "status": 1,
                "message": "Budget generated from transactions",
                "budget_categories": budget_categories,
                "budget_summary": {
                    "Needs": {
                        "spent": summary["Needs"]["spent"],
                        "total": summary["Needs"]["budget"],
                    },
                    "Wants": {
                        "spent": summary["Wants"]["spent"],
                        "total": summary["Wants"]["budget"],
                    },
                    "Savings": {
                        "spent": summary["Savings"]["spent"],
                        "total": summary["Savings"]["budget"],
                    },
                    "Other": {
                        "spent": summary["Other"]["spent"],
                        "total": summary["Other"]["budget"],
                    },
                },
            }
        except Exception as e:
            logger.error(f"Error generating budget for user {uid}: {str(e)}")
            return {"error": "Internal server error"}, 500


class UpdateMonthlyBudget(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if not uid:
                return {"error": "Missing user_id"}, 400

            parser = reqparse.RequestParser()
            parser.add_argument(
                "budget_categories",
                type=dict,
                required=True,
                help="Budget categories are required",
            )
            args = parser.parse_args()

            budget_categories = args["budget_categories"]
            if not budget_categories or "All Expenses" not in budget_categories:
                return {"error": "Invalid budget categories format"}, 400

            # Validate that all 4 categories are present
            descriptions = budget_categories.get("All Expenses", {}).get(
                "descriptions", {}
            )
            if not all(
                cat in descriptions for cat in ["Needs", "Wants", "Savings", "Other"]
            ):
                return {"error": "Missing required budget categories"}, 400

            # Here you would typically save to a database
            return {
                "status": 1,
                "message": "Budget updated successfully",
                "budget_categories": budget_categories,
            }
        except Exception as e:
            logger.error(f"Error updating budget for user {uid}: {str(e)}")
            return {"error": "Internal server error"}


# from flask_restful import Resource
# import requests
# import json
# from datetime import datetime
# import logging
# from root.db.dbHelper import DBHelper
# from root.utilis import uniqueId

# # Configuration
# API_SECRET_KEY = (
#     "qltt_04b9cfce7233a7d46d38f12d4d51e4b3497aa5e4e4c391741d3c7df0d775874b7dd8a0f2d"
# )
# GRAPHQL_ENDPOINT = "https://api.quiltt.io/v1/graphql"


# def auth_required(isOptional=False):
#     """Authentication decorator"""

#     def decorator(f):
#         def decorated_function(*args, **kwargs):
#             # Implement your auth logic here
#             return f(*args, **kwargs)

#         return decorated_function

#     return decorator


# # GraphQL Queries
# SPENDING_ACCOUNTS_QUERY = """
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


# def execute_graphql_query(token, query, variables=None):
#     """Execute GraphQL query against Quiltt API"""
#     headers = {
#         "Authorization": f"Bearer {token}",
#         "Content-Type": "application/json",
#     }

#     payload = {"query": query, "variables": variables or {}}

#     response = requests.post(GRAPHQL_ENDPOINT, headers=headers, json=payload)

#     if response.status_code == 200:
#         return response.json()
#     else:
#         raise Exception(f"GraphQL query failed: {response.status_code} {response.text}")


# def wait_for_balances(token, max_attempts=30, delay=2):
#     """Wait for account balances to be available"""
#     for attempt in range(max_attempts):
#         try:
#             result = execute_graphql_query(token, SPENDING_ACCOUNTS_QUERY)

#             if result.get("data"):
#                 connections = result["data"].get("connections", [])

#                 # Check if we have connections with accounts
#                 if connections:
#                     for connection in connections:
#                         if connection.get("accounts"):
#                             return result

#             # If no data yet, wait and retry
#             if attempt < max_attempts - 1:
#                 import time

#                 time.sleep(delay)

#         except Exception as e:
#             logging.error(f"Error waiting for balances: {str(e)}")
#             if attempt < max_attempts - 1:
#                 import time

#                 time.sleep(delay)

#     raise TimeoutError("Timeout waiting for account balances")


# def store_enriched_data(user_id, data):
#     """Store enriched transaction and account data"""
#     try:
#         connections = data.get("data", {}).get("connections", [])
#         transactions = data.get("data", {}).get("transactions", {}).get("nodes", [])

#         # Store connections and institutions
#         for connection in connections:
#             institution = connection.get("institution", {})

#             # Store institution
#             if institution:
#                 DBHelper.insert(
#                     "institutions",
#                     id=institution.get("id"),
#                     name=institution.get("name"),
#                     logo_url=institution.get("logo", {}).get("url"),
#                 )

#             # Store connection
#             DBHelper.insert(
#                 "connections",
#                 id=connection.get("id"),
#                 user_id=user_id,
#                 institution_id=institution.get("id"),
#                 status=connection.get("status"),
#                 features=connection.get("features", []),
#                 externally_managed=connection.get("externallyManaged", False),
#             )

#             # Store accounts
#             for account in connection.get("accounts", []):
#                 DBHelper.insert(
#                     "accounts",
#                     id=account.get("id"),
#                     user_id=user_id,
#                     connection_id=connection.get("id"),
#                     name=account.get("name"),
#                     provider=account.get("provider"),
#                     currency_code=account.get("currencyCode", "USD"),
#                     verified=account.get("verified", False),
#                     transacted_first_on=account.get("transactedFirstOn"),
#                     transacted_last_on=account.get("transactedLastOn"),
#                 )

#                 # Store balance
#                 balance = account.get("balance", {})
#                 if balance:
#                     DBHelper.insert(
#                         "account_balances",
#                         account_id=account.get("id"),
#                         balance_at=balance.get("at"),
#                         current_balance=balance.get("current"),
#                         available_balance=balance.get("available"),
#                         source=balance.get("source", "quiltt"),
#                     )

#         # Store transactions with enrichment data
#         for transaction in transactions:
#             # Store main transaction
#             DBHelper.insert(
#                 "transactions",
#                 id=transaction.get("id"),
#                 user_id=user_id,
#                 amount=transaction.get("amount"),
#                 date=transaction.get("date"),
#                 description=transaction.get("description"),
#                 status=transaction.get("status"),
#                 currency_code=transaction.get("currencyCode", "USD"),
#                 entry_type=transaction.get("entryType"),
#             )

#             # Store enrichment data
#             remote_data = transaction.get("remoteData", {})

#             # Fingoal enrichment
#             if remote_data.get("fingoal", {}).get("enrichment"):
#                 enrichment = remote_data["fingoal"]["enrichment"]
#                 response = enrichment.get("response", {})

#                 DBHelper.insert(
#                     "transaction_enrichments",
#                     transaction_id=transaction.get("id"),
#                     provider="fingoal",
#                     enrichment_data=json.dumps(response),
#                     merchant_name=response.get("merchantName"),
#                     merchant_logo_url=response.get("merchantLogoUrl"),
#                     merchant_address=response.get("merchantAddress1"),
#                     merchant_city=response.get("merchantCity"),
#                     merchant_state=response.get("merchantState"),
#                     merchant_country=response.get("merchantCountry"),
#                     merchant_zip=response.get("merchantZip"),
#                     merchant_phone=response.get("merchantPhoneNumber"),
#                     merchant_latitude=response.get("merchantLatitude"),
#                     merchant_longitude=response.get("merchantLongitude"),
#                     merchant_type=response.get("merchantType"),
#                     is_physical=response.get("isPhysical", False),
#                 )

#         logging.info(f"Stored enriched data for user {user_id}")

#     except Exception as e:
#         logging.error(f"Error storing enriched data: {str(e)}")


# class BankConnect(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         data = request.get_json()
#         currentUser = data.get("currentUser")
#         userId = currentUser.get("uid")
#         email = currentUser.get("email")

#         if not userId:
#             return {"error": "Missing userId"}, 400

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
#                     "uid": existing_user.get("user_id"),
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
#                 logging.error("Quiltt API error:", error_data)
#                 return {
#                     "error": error_data.get("message", "Authentication failed")
#                 }, response.status_code


# class GetBankAccount(Resource):
#     def post(self):
#         data = request.get_json()
#         session = data.get("session")
#         token = session.get("token") if session else None

#         if not token:
#             return {"error": "Missing Authorization header"}, 401

#         try:
#             result = wait_for_balances(token)

#             # Store enriched data in database
#             user_data = DBHelper.find_one(
#                 "user_finance_details",
#                 filters={"profile_id": session.get("userId")},
#                 select_fields=["user_id"],
#             )

#             if user_data:
#                 store_enriched_data(user_data.get("user_id"), result)

#             return result

#         except TimeoutError:
#             return {
#                 "status": "PENDING",
#                 "message": "Still syncing, try again shortly",
#             }, 202
#         except Exception as e:
#             logging.error(f"Error getting bank account: {str(e)}")
#             return {"error": "Internal server error"}, 500


# class GetTransactions(Resource):
#     def post(self):
#         data = request.get_json()
#         session = data.get("session")
#         filters = data.get("filters", {})

#         token = session.get("token") if session else None
#         if not token:
#             return {"error": "Missing Authorization header"}, 401

#         try:
#             # Build dynamic GraphQL query based on filters
#             query = """
#             query GetTransactions($first: Int, $after: String, $accountIds: [ID!]) {
#               transactions(first: $first, after: $after, accountIds: $accountIds) {
#                 nodes {
#                   id
#                   date
#                   description
#                   amount
#                   status
#                   currencyCode
#                   entryType
#                   account {
#                     id
#                     name
#                   }
#                   remoteData {
#                     fingoal {
#                       enrichment {
#                         response {
#                           category
#                           merchantName
#                           merchantLogoUrl
#                           isRecurring
#                         }
#                       }
#                     }
#                   }
#                 }
#                 pageInfo {
#                   hasNextPage
#                   endCursor
#                 }
#               }
#             }
#             """

#             variables = {
#                 "first": filters.get("limit", 50),
#                 "after": filters.get("cursor"),
#                 "accountIds": filters.get("accountIds"),
#             }

#             result = execute_graphql_query(token, query, variables)
#             return result

#         except Exception as e:
#             logging.error(f"Error getting transactions: {str(e)}")
#             return {"error": "Internal server error"}, 500


# class GetBudgets(Resource):
#     def post(self):
#         data = request.get_json()
#         session = data.get("session")

#         token = session.get("token") if session else None
#         if not token:
#             return {"error": "Missing Authorization header"}, 401

#         try:
#             # Get user ID from session
#             user_data = DBHelper.find_one(
#                 "user_finance_details",
#                 filters={"profile_id": session.get("userId")},
#                 select_fields=["user_id"],
#             )

#             if not user_data:
#                 return {"error": "User not found"}, 404

#             user_id = user_data.get("user_id")

#             # Get current month's budget data
#             current_date = datetime.now()
#             month_start = current_date.replace(day=1)

#             # This would be implemented based on your database structure
#             # Return budget summary with spending by category
#             return {
#                 "budget_summary": {
#                     "total_income": 2500.00,
#                     "needs_budget": 1250.00,
#                     "wants_budget": 750.00,
#                     "savings_budget": 500.00,
#                     "needs_spent": 1078.00,
#                     "wants_spent": 645.00,
#                     "savings_achieved": 433.00,
#                 },
#                 "categories": [
#                     {"name": "Housing", "budget": 900, "spent": 850, "type": "needs"},
#                     {"name": "Groceries", "budget": 250, "spent": 228, "type": "needs"},
#                     {
#                         "name": "Dining Out",
#                         "budget": 300,
#                         "spent": 245,
#                         "type": "wants",
#                     },
#                     {
#                         "name": "Entertainment",
#                         "budget": 150,
#                         "spent": 125,
#                         "type": "wants",
#                     },
#                     {"name": "Shopping", "budget": 300, "spent": 275, "type": "wants"},
#                 ],
#             }

#         except Exception as e:
#             logging.error(f"Error getting budgets: {str(e)}")
#             return {"error": "Internal server error"}, 500


# class GetFinancialGoals(Resource):
#     def post(self):
#         data = request.get_json()
#         session = data.get("session")

#         token = session.get("token") if session else None
#         if not token:
#             return {"error": "Missing Authorization header"}, 401

#         try:
#             # Get user ID from session
#             user_data = DBHelper.find_one(
#                 "user_finance_details",
#                 filters={"profile_id": session.get("userId")},
#                 select_fields=["user_id"],
#             )

#             if not user_data:
#                 return {"error": "User not found"}, 404

#             # Return financial goals data
#             return {
#                 "goals": [
#                     {
#                         "id": "emergency-fund",
#                         "name": "Emergency Fund",
#                         "target_amount": 25000.00,
#                         "current_amount": 18500.00,
#                         "progress_percentage": 74,
#                         "status": "ongoing",
#                         "target_date": None,
#                     },
#                     {
#                         "id": "vacation-fund",
#                         "name": "Vacation Fund",
#                         "target_amount": 3000.00,
#                         "current_amount": 1800.00,
#                         "progress_percentage": 60,
#                         "status": "ongoing",
#                         "target_date": "2025-06-01",
#                     },
#                     {
#                         "id": "student-loan",
#                         "name": "Student Loan",
#                         "target_amount": 25000.00,
#                         "current_amount": 8750.00,
#                         "remaining_amount": 16250.00,
#                         "progress_percentage": 35,
#                         "status": "debt",
#                         "goal_type": "debt_payoff",
#                     },
#                 ]
#             }

#         except Exception as e:
#             logging.error(f"Error getting financial goals: {str(e)}")
#             return {"error": "Internal server error"}, 500


# class GetAccountsSummary(Resource):
#     def post(self):
#         data = request.get_json()
#         session = data.get("session")

#         token = session.get("token") if session else None
#         if not token:
#             return {"error": "Missing Authorization header"}, 401

#         try:
#             # Get user ID from session
#             user_data = DBHelper.find_one(
#                 "user_finance_details",
#                 filters={"profile_id": session.get("userId")},
#                 select_fields=["user_id"],
#             )

#             if not user_data:
#                 return {"error": "User not found"}, 404

#             # Return accounts summary
#             return {
#                 "net_worth": {
#                     "total_assets": 72543.87,
#                     "total_liabilities": 25000.00,
#                     "net_worth": 47543.87,
#                     "monthly_cash_flow": -506.55,
#                 },
#                 "account_categories": [
#                     {
#                         "category": "cash",
#                         "name": "Cash Accounts",
#                         "total": 12543.87,
#                         "accounts": [
#                             {
#                                 "id": "chase-checking",
#                                 "name": "Chase Checking",
#                                 "balance": 4856.23,
#                                 "type": "Checking Account",
#                             },
#                             {
#                                 "id": "chase-savings",
#                                 "name": "Chase Savings",
#                                 "balance": 7687.64,
#                                 "type": "Savings Account",
#                             },
#                         ],
#                     },
#                     {
#                         "category": "credit",
#                         "name": "Credit Cards",
#                         "total": -3250.00,
#                         "accounts": [
#                             {
#                                 "id": "visa-card",
#                                 "name": "Visa Card",
#                                 "balance": -1414.58,
#                                 "type": "Credit Card",
#                             },
#                             {
#                                 "id": "amex-card",
#                                 "name": "Amex Card",
#                                 "balance": -1835.42,
#                                 "type": "Credit Card",
#                             },
#                         ],
#                     },
#                     {
#                         "category": "investment",
#                         "name": "Investments",
#                         "total": 60000.00,
#                         "accounts": [
#                             {
#                                 "id": "fidelity-401k",
#                                 "name": "Fidelity 401(k)",
#                                 "balance": 42350.00,
#                                 "type": "Retirement",
#                             },
#                             {
#                                 "id": "vanguard-ira",
#                                 "name": "Vanguard IRA",
#                                 "balance": 17650.00,
#                                 "type": "Retirement",
#                             },
#                         ],
#                     },
#                     {
#                         "category": "loans",
#                         "name": "Loans",
#                         "total": -21750.00,
#                         "accounts": [
#                             {
#                                 "id": "student-loan",
#                                 "name": "Student Loan",
#                                 "balance": -16250.00,
#                                 "type": "Sallie Mae",
#                             },
#                             {
#                                 "id": "auto-loan",
#                                 "name": "Auto Loan",
#                                 "balance": -5500.00,
#                                 "type": "Toyota Financial",
#                             },
#                         ],
#                     },
#                 ],
#             }

#         except Exception as e:
#             logging.error(f"Error getting accounts summary: {str(e)}")
#             return {"error": "Internal server error"}, 500


# Register API resources
