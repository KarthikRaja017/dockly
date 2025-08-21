# import base64
# from collections import Counter, defaultdict

# # import datetime
# from datetime import datetime, date
# from decimal import Decimal
# import json
# import statistics
# import time
# from venv import logger
# from root.db.dbHelper import DBHelper
# from flask import request
# from flask_restful import Resource, reqparse
# import requests

# from root.config import API_SECRET_KEY, AUTH_ENDPOINT
# from root.auth.auth import auth_required
# import random

# API_SECRET_KEY = (
#     "qltt_04b9cfce7233a7d46d38f12d4d51e4b3497aa5e4e4c391741d3c7df0d775874b7dd8a0f2d"
# )


# def uniqueId(digit=15, isNum=True):
#     if isNum:
#         return "".join([str(random.randint(0, 9)) for _ in range(digit)])
#     else:
#         chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
#         return "".join(random.choice(chars) for _ in range(digit))


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
#         data = request.get_json()
#         session = data.get("session")
#         token = session.get("token") if session else None
#         if not token:
#             return {"error": "Missing Authorization header"}, 401

#         try:
#             data = getBankData(token)
#             return data
#         except TimeoutError:
#             return {
#                 "status": "PENDING",
#                 "message": "Still syncing, try again shortly",
#             }, 202


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
#     # print(f"data: {data}")
#     return data


# def wait_for_balances(token, timeout=10, max_sleep=4):
#     start = time.time()
#     sleep = 1
#     while time.time() - start < timeout:
#         data = getBankData(token)
#         conn = data["data"]["connections"][0]
#         status = conn["status"]
#         accounts = conn.get("accounts", [])
#         has_balances = any(
#             a.get("balance") and a["balance"].get("current") is not None
#             for a in accounts
#         )
#         if status != "SYNCING" and has_balances:
#             return data

#         time.sleep(sleep)
#         sleep = min(max_sleep, sleep * 2)
#     return {"status": "PENDING", "message": "Still syncing, try again shortly"}


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
#             print(saved)
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
#             # limit=500,  # type: ignore
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
#         # print(f"accounts: {accounts}")

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
#                     "total": 0,
#                     "items": [],
#                 }
#             sections[section]["total"] += balance
#             sections[section]["items"].append(item)

#         assets = sum(
#             float(acc["current_balance"] or 0)
#             for acc in accounts
#             if float(acc["current_balance"] or 0) >= 0
#         )
#         liabilities = sum(
#             abs(float(acc["current_balance"] or 0))
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
#                 "total_balance": assets - liabilities,
#                 "assets": assets,
#                 "liabilities": liabilities,
#             },
#         }


# class GetTotalBalance(Resource):
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

#         assets = sum(
#             float(acc["current_balance"] or 0)
#             for acc in accounts
#             if float(acc["current_balance"] or 0) >= 0
#         )
#         liabilities = sum(
#             abs(float(acc["current_balance"] or 0))
#             for acc in accounts
#             if float(acc["current_balance"] or 0) < 0
#         )

#         # print(f"Assets for user {uid}: {assets}")
#         # print(f"Liabilities for user {uid}: {liabilities}")

#         return {
#             "status": 1,
#             "message": "Account balances retrieved",
#             "assets": assets,
#             "liabilities": liabilities,
#             "total_balance": assets - liabilities,
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


# class AddFinanceGoal(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         data = request.get_json(silent=True)
#         id = uniqueId(digit=15, isNum=True)

#         goal = {
#             "id": id,
#             "user_id": uid,
#             "name": data.get("name", ""),  # type: ignore
#             "goal_status": data.get(
#                 "goal_status", 0
#             ),  # 0 = YET_TO_START # type: ignore
#             "target_amount": data.get("target_amount", 0),  # type: ignore
#             "saved_amount": data.get("saved_amount", 0),  # type: ignore
#             "deadline": data.get("deadline", None),  # Format: YYYY-MM-DD # type: ignore
#             "is_active": 1,
#         }

#         DBHelper.insert("finance_goals", return_column="id", **goal)

#         return {
#             "status": 1,
#             "message": "Finance Goal Added Successfully",
#             "payload": goal,
#         }


# class GetFinanceGoal(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         goals = DBHelper.find_all(
#             "finance_goals",
#             {"user_id": uid, "is_active": 1},  # fetch only active goals
#             select_fields=[
#                 "id",
#                 "name",
#                 "goal_status",
#                 "target_amount",
#                 "saved_amount",
#                 "deadline",
#                 "created_at",
#                 "updated_at",
#             ],
#         )

#         financeGoals = []
#         for goal in goals:
#             financeGoals.append(
#                 {
#                     "id": goal["id"],
#                     "name": goal["name"],
#                     "goal_status": goal["goal_status"],
#                     "target_amount": str(goal["target_amount"]),
#                     "saved_amount": str(goal["saved_amount"]),
#                     "deadline": (
#                         goal["deadline"].strftime("%Y-%m-%d")
#                         if goal["deadline"]
#                         else None
#                     ),
#                     "created_at": goal["created_at"].strftime("%Y-%m-%d %H:%M:%S"),
#                     "updated_at": (
#                         goal["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
#                         if goal["updated_at"]
#                         else None
#                     ),
#                 }
#             )

#         return {
#             "status": 1,
#             "payload": financeGoals,
#         }


# class UpdateFinanceGoal(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         data = request.get_json(silent=True)
#         if data is None:
#             return {"status": 0, "message": "No data provided"}, 400

#         goal_id = data.get("id")
#         if not goal_id:
#             return {"status": 0, "message": "Goal ID is required"}, 400

#         # Only update allowed fields
#         update_data = {}
#         allowed_fields = [
#             "name",
#             "goal_status",
#             "target_amount",
#             "saved_amount",
#             "deadline",
#         ]
#         for field in allowed_fields:
#             if field in data:
#                 update_data[field] = data[field]

#         if not update_data:
#             return ({"status": 0, "message": "No valid fields provided for update"},)

#         # Use positional arguments here
#         updated = DBHelper.update_one(
#             "finance_goals", {"id": goal_id, "user_id": uid}, update_data
#         )

#         if updated:
#             return {"status": 1, "message": "Finance goal updated successfully"}
#         else:
#             return {"status": 0, "message": "Update failed or no matching goal found"}


# class GenerateMonthlyBudget(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         try:
#             if not uid:
#                 return {"error": "Missing user_id"}, 400

#             # Define keyword-based categorization using description
#             description_to_budget = {
#                 # Housing-related (Needs)
#                 "mortgage": "Needs",
#                 "rent": "Needs",
#                 "housing": "Needs",
#                 # Food-related (reclassified as Dining Out under Wants)
#                 "groceries": "Wants",  # Reclassified to Dining Out
#                 "food": "Wants",  # Reclassified to Dining Out
#                 # Entertainment-related (Wants)
#                 "subscriptions": "Wants",
#                 "movie tickets": "Wants",
#                 "entertainment": "Wants",
#                 # Shopping-related (Wants)
#                 "electronics": "Wants",
#                 "shoes": "Wants",
#                 "clothing": "Wants",
#                 "cables": "Wants",
#                 "healthcare": "Wants",
#                 # Savings
#                 "savings": "Savings",
#                 "transfer to savings": "Savings",
#                 # Other
#                 "fee": "Other",
#                 "service charge": "Other",
#                 "income": "Other",
#                 "paycheck": "Other",
#                 "transfer": "Other",
#             }

#             # Get all user transactions
#             transactions = (
#                 DBHelper.find_all(
#                     table_name="user_bank_transactions",
#                     filters={"user_id": uid},
#                     select_fields=["amount", "entry_type", "date", "description"],
#                 )
#                 or []
#             )

#             # Filter for current month and debit transactions
#             current_month = datetime.now().strftime("%Y-%m")
#             filtered = [
#                 txn
#                 for txn in transactions
#                 if txn.get("date")
#                 and txn["date"].strftime("%Y-%m") == current_month
#                 and txn.get("entry_type", "").upper() == "DEBIT"
#             ]

#             if not filtered:
#                 logger.warning(
#                     f"No debit transactions found for user {uid} in {current_month}"
#                 )
#                 return {
#                     "status": 1,
#                     "message": "No transactions found",
#                     "budget_categories": {
#                         "All Expenses": {
#                             "spent": 0.0,
#                             "budget": 0.0,
#                             "descriptions": {
#                                 "Needs": {"spent": 0.0, "budget": 0.0, "count": 0},
#                                 "Wants": {"spent": 0.0, "budget": 0.0, "count": 0},
#                                 "Savings": {"spent": 0.0, "budget": 0.0, "count": 0},
#                                 "Other": {"spent": 0.0, "budget": 0.0, "count": 0},
#                             },
#                             "all_transactions": {
#                                 "Needs": [],
#                                 "Wants": [],
#                                 "Savings": [],
#                                 "Other": [],
#                             },
#                         }
#                     },
#                     "budget_summary": {
#                         "Needs": {"spent": 0, "total": 0},
#                         "Wants": {"spent": 0, "total": 0},
#                         "Savings": {"spent": 0, "total": 0},
#                         "Other": {"spent": 0, "total": 0},
#                     },
#                 }

#             # Aggregate by Budget Category and track all transactions
#             summary = defaultdict(lambda: {"spent": 0.0, "count": 0})
#             all_transactions = defaultdict(list)

#             for txn in filtered:
#                 desc = txn.get("description") or "Unknown"
#                 desc_lower = desc.lower()
#                 budget_cat = "Other"
#                 for keyword, cat in description_to_budget.items():
#                     if keyword in desc_lower:
#                         budget_cat = cat
#                         break

#                 if "savings" in desc_lower and "transfer" in desc_lower:
#                     budget_cat = "Savings"

#                 amount = abs(float(txn.get("amount", 0)))
#                 summary[budget_cat]["spent"] += amount
#                 summary[budget_cat]["count"] += 1
#                 all_transactions[budget_cat].append(
#                     {
#                         "description": desc,
#                         "amount": amount,
#                         "date": (
#                             txn.get("date").strftime("%Y-%m-%d")
#                             if txn.get("date")
#                             else "N/A"
#                         ),
#                     }
#                 )

#             # Set budget as 120% of spent amount, default to 0 if no data
#             for cat in ["Needs", "Wants", "Savings", "Other"]:
#                 if cat not in summary:
#                     summary[cat] = {"spent": 0.0, "count": 0}
#                 summary[cat]["budget"] = round(summary[cat]["spent"] * 1.2, 2)

#             all_spent = sum(v["spent"] for v in summary.values())
#             all_budget = sum(v["budget"] for v in summary.values())

#             # Build structured response with exactly 4 categories
#             budget_categories = {
#                 "All Expenses": {
#                     "spent": round(all_spent, 2),
#                     "budget": round(all_budget, 2),
#                     "descriptions": {
#                         cat: {
#                             "spent": round(summary[cat]["spent"], 2),
#                             "budget": round(summary[cat]["budget"], 2),
#                             "count": summary[cat]["count"],
#                         }
#                         for cat in ["Needs", "Wants", "Savings", "Other"]
#                     },
#                     "all_transactions": {
#                         cat: all_transactions[cat]
#                         for cat in ["Needs", "Wants", "Savings", "Other"]
#                     },
#                 }
#             }

#             return {
#                 "status": 1,
#                 "message": "Budget generated from transactions",
#                 "budget_categories": budget_categories,
#                 "budget_summary": {
#                     "Needs": {
#                         "spent": summary["Needs"]["spent"],
#                         "total": summary["Needs"]["budget"],
#                     },
#                     "Wants": {
#                         "spent": summary["Wants"]["spent"],
#                         "total": summary["Wants"]["budget"],
#                     },
#                     "Savings": {
#                         "spent": summary["Savings"]["spent"],
#                         "total": summary["Savings"]["budget"],
#                     },
#                     "Other": {
#                         "spent": summary["Other"]["spent"],
#                         "total": summary["Other"]["budget"],
#                     },
#                 },
#             }
#         except Exception as e:
#             logger.error(f"Error generating budget for user {uid}: {str(e)}")
#             return {"error": "Internal server error"}, 500


# class UpdateMonthlyBudget(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         try:
#             if not uid:
#                 return {"error": "Missing user_id"}, 400

#             parser = reqparse.RequestParser()
#             parser.add_argument(
#                 "budget_categories",
#                 type=dict,
#                 required=True,
#                 help="Budget categories are required",
#             )
#             args = parser.parse_args()

#             budget_categories = args["budget_categories"]
#             if not budget_categories or "All Expenses" not in budget_categories:
#                 return {"error": "Invalid budget categories format"}, 400

#             # Validate that all 4 categories are present
#             descriptions = budget_categories.get("All Expenses", {}).get(
#                 "descriptions", {}
#             )
#             if not all(
#                 cat in descriptions for cat in ["Needs", "Wants", "Savings", "Other"]
#             ):
#                 return {"error": "Missing required budget categories"}, 400

#             # Here you would typically save to a database
#             return {
#                 "status": 1,
#                 "message": "Budget updated successfully",
#                 "budget_categories": budget_categories,
#             }
#         except Exception as e:
#             logger.error(f"Error updating budget for user {uid}: {str(e)}")
#             return {"error": "Internal server error"}


import base64
from collections import Counter, defaultdict

# import datetime
from datetime import datetime, date
from decimal import Decimal
import json
import statistics
import time
from venv import logger

from yaml import safe_load
from root.db.dbHelper import DBHelper
import logging
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
            data = getBankData(token)
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
    # print(f"data: {data}")
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
#             print(saved)
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
logger = logging.getLogger(__name__)

BUDGET_CATEGORIES = ["Savings", "Wants", "Needs", "Others"]

DESCRIPTION_TO_CATEGORY = {
    "Savings Transfer from Checking": "Savings",
    "Loan Payment": "Savings",
    "Transfer to Savings": "Savings",
    "Mortgage Payment": "Savings",
    "Wells Fargo Mortgage": "Savings",
    "Paycheck": "Savings",
    "Credit Card Payment": "Savings",
    "Transfer": "Wants",
    "Netflix": "Wants",
    "Wendy’s": "Wants",
    "El Torito Grill": "Wants",
    "Toys R Us": "Wants",
    "Pizza Hut": "Wants",
    "Old Navy": "Wants",
    "In-N-Out Burger": "Wants",
    "Payment": "Wants",
    "Bath & Body Works": "Wants",
    "Sports Authority": "Wants",
    "Big Bob’s Burgers": "Wants",
    "Donation": "Wants",
    "Apple iTunes": "Wants",
    "Best Buy": "Wants",
    "Fee": "Needs",
    "Late Fee": "Needs",
    "Interest Charge": "Needs",
    "ExxonMobil": "Needs",
    "United Healthcare": "Needs",
    "Lowe’s": "Needs",
    "Gold’s Gym": "Needs",
    "Comcast": "Needs",
    "Children’s Hospital": "Needs",
    "Ralph’s": "Needs",
    "Transfer From Savings": "Others",
    "IRA credit 219": "Savings",
    "SAVINGS debit 229": "Others",
    "SAVINGS debit 232": "Needs",
    "REMOTE ONLINE DEPOSIT": "Savings",
    "Autoloan credit 202": "Wants",
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
    "fee": "Needs",
    "service charge": "Others",
    "income": "Savings",
    "paycheck": "Others",
    "transfer": "Others",
    "CHECKING debit 230": "Needs",
    "ROCKET SURGERY PAYROLL": "Wants"
}



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

            transactions = result.get("data", {}).get("transactions", {}).get("nodes", [])

            user_exists = DBHelper.find_one("users", filters={"uid": user_id})
            if not user_exists:
                DBHelper.insert("users", uid=user_id)

            saved = 0
            for txn in transactions:
                desc = (txn.get("description") or "Unknown").strip()
                budget_cat = DESCRIPTION_TO_CATEGORY.get(desc, "Others")

                # Insert into user_bank_transactions
                DBHelper.insert_ignore_duplicates(
                    table_name="user_bank_transactions",
                    unique_key="transaction_id",
                    user_id=user_id,
                    transaction_id=txn.get("id"),
                    date=txn.get("date"),
                    description=desc,
                    amount=txn.get("amount"),
                    status=txn.get("status"),
                    currency_code=txn.get("currencyCode"),
                    entry_type=txn.get("entryType"),
                )

                # Check if transaction already exists in user_bank_transactions_with_category
                existing = DBHelper.find_one(
                    table_name="user_bank_transactions_with_category",
                    filters={"user_id": user_id, "transaction_id": txn.get("id")},
                    select_fields=["transaction_id"]
                )

                if not existing:
                    # Insert into user_bank_transactions_with_category
                    DBHelper.insert(
                        table_name="user_bank_transactions_with_category",
                        user_id=user_id,
                        transaction_id=txn.get("id"),
                        category=budget_cat,
                        description=desc,
                        amount=abs(float(txn.get("amount", 0))),
                        date=txn.get("date"),
                        entry_type=txn.get("entryType"),
                        currency_code=txn.get("currencyCode"),
                        status=txn.get("status"),
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )

                saved += 1
                
            logger.info(f"Saved {saved} transactions for user {user_id}")
            logger.debug(f"Transaction details: {transactions}")

            return {"message": "Transactions saved successfully", "count": saved}
        except Exception as e:
            logger.error(f"Internal error in SaveBankTransactions: {str(e)}")
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
            "goal_status": data.get( # type: ignore
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
class UpdateTransactionCategory(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            data = request.get_json()
            uid = data.get('uid')
            transaction_id = data.get('transaction_id')
            category = data.get('category')

            if not uid or not transaction_id or not category:
                return {"error": "Missing uid, transaction_id, or category"}, 400

            if category not in BUDGET_CATEGORIES:
                return {"error": f"Invalid category. Must be one of {BUDGET_CATEGORIES}"}, 400

            # Check if the transaction exists in user_bank_transactions_with_category
            existing = DBHelper.find_one(
                table_name="user_bank_transactions_with_category",
                filters={"user_id": uid, "transaction_id": transaction_id},
                select_fields=["id"]
            )

            if not existing:
                # Optionally, insert a new record if the transaction doesn't exist
                # This assumes the transaction exists in user_bank_transactions and needs to be categorized
                transaction = DBHelper.find_one(
                    table_name="user_bank_transactions",
                    filters={"user_id": uid, "transaction_id": transaction_id},
                    select_fields=["date", "description", "amount", "status", "currency_code", "entry_type"]
                )
                if not transaction:
                    return {"error": "Transaction not found"}, 404

                DBHelper.insert(
                    table_name="user_bank_transactions_with_category",
                    user_id=uid,
                    transaction_id=transaction_id,
                    category=category,
                    date=transaction.get("date"),
                    description=transaction.get("description"),
                    amount=transaction.get("amount"),
                    status=transaction.get("status"),
                    currency_code=transaction.get("currency_code"),
                    entry_type=transaction.get("entry_type"),
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
            else:
                # Update the category in user_bank_transactions_with_category
                DBHelper.update_one(
                    table_name="user_bank_transactions_with_category",
                    filters={"user_id": uid, "transaction_id": transaction_id},
                    updates={"category": category, "updated_at": datetime.now()}
                )

            logger.info(f"Transaction {transaction_id} category updated to {category} for user {uid}")
            return {"status": 1, "message": "Transaction category updated successfully"}
        except Exception as e:
            logger.error(f"Error updating transaction category for user {uid}: {str(e)}")
            return {"error": f"Internal server error: {str(e)}"}, 500
class GenerateMonthlyBudget(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            data = request.get_json() or {}
            uid_from_body = data.get('uid')
            if not uid:
                uid = uid_from_body
            if not uid:
                return {"error": "Missing user_id"}, 400

            # Fetch all transactions for the user (no limit or date/entry_type filter)
            transactions = DBHelper.find_all(
                table_name="user_bank_transactions_with_category",
                filters={"user_id": uid},
                select_fields=["transaction_id", "amount", "entry_type", "date", "description", "category"],
            ) or []

            logger.info(f"Fetched {len(transactions)} transactions for user {uid}")

            if not transactions:
                logger.warning(f"No transactions found for user {uid}")
                return {
                    "status": 1,
                    "message": "No transactions found",
                    "budget_categories": {
                        "All Expenses": {
                            "spent": 0.0,
                            "budget": 0.0,
                            "descriptions": {
                                "Needs": {"spent": 0.0, "budget": 0.0, "count": 0, "transactions": []},
                                "Wants": {"spent": 0.0, "budget": 0.0, "count": 0, "transactions": []},
                                "Savings": {"spent": 0.0, "budget": 0.0, "count": 0, "transactions": []},
                                "Others": {"spent": 0.0, "budget": 0.0, "count": 0, "transactions": []},
                            },
                            "all_transactions": {
                                "Needs": [],
                                "Wants": [],
                                "Savings": [],
                                "Others": [],
                            },
                        }
                    },
                    "budget_summary": {
                        "Needs": {"spent": 0.0, "total": 0.0},
                        "Wants": {"spent": 0.0, "total": 0.0},
                        "Savings": {"spent": 0.0, "total": 0.0},
                        "Others": {"spent": 0.0, "total": 0.0},
                    },
                    "spending_by_category": [
                        {"name": "Groceries", "spent": 0.0, "budget": 0.0, "type": "Needs", "icon": "DollarOutlined"},
                        {"name": "Housing", "spent": 0.0, "budget": 0.0, "type": "Needs", "icon": "HomeOutlined"},
                        {"name": "Entertainment", "spent": 0.0, "budget": 0.0, "type": "Wants", "icon": "GiftOutlined"},
                        {"name": "Shopping", "spent": 0.0, "budget": 0.0, "type": "Wants", "icon": "ShoppingOutlined"},
                        {"name": "Dining Out", "spent": 0.0, "budget": 0.0, "type": "Wants", "icon": "ShoppingOutlined"},
                    ],
                }

            # Aggregate by category across all transactions
            summary = defaultdict(lambda: {"spent": 0.0, "count": 0})
            all_transactions = defaultdict(list)

            for txn in transactions:
                budget_cat = txn.get("category", "Others")
                if budget_cat not in ["Needs", "Wants", "Savings", "Others"]:
                    budget_cat = "Others"

                amount = float(txn.get("amount", 0)) if isinstance(txn.get("amount"), Decimal) else float(txn.get("amount", 0))
                amount = abs(amount)

                summary[budget_cat]["spent"] += amount
                summary[budget_cat]["count"] += 1
                all_transactions[budget_cat].append(
                    {
                        "transaction_id": txn.get("transaction_id", ""),
                        "description": txn.get("description", "Unknown"),
                        "amount": amount,
                        "category": budget_cat,
                        "date": (
                            txn.get("date").strftime("%Y-%m-%d")
                            if txn.get("date")
                            else "N/A"
                        ),
                    }
                )

            # Set budget as 120% of spent amount across all records
            for cat in ["Needs", "Wants", "Savings", "Others"]:
                if cat not in summary:
                    summary[cat] = {"spent": 0.0, "count": 0}
                summary[cat]["budget"] = round(summary[cat]["spent"] * 1.2, 2)

            all_spent = sum(v["spent"] for v in summary.values())
            all_budget = sum(v["budget"] for v in summary.values())

            # Build response with all transactions
            budget_categories = {
                "All Expenses": {
                    "spent": round(all_spent, 2),
                    "budget": round(all_budget, 2),
                    "descriptions": {
                        cat: {
                            "spent": round(summary[cat]["spent"], 2),
                            "budget": round(summary[cat]["budget"], 2),
                            "count": summary[cat]["count"],
                            "transactions": all_transactions[cat],
                        }
                        for cat in ["Needs", "Wants", "Savings", "Others"]
                    },
                    "all_transactions": {
                        cat: all_transactions[cat]
                        for cat in ["Needs", "Wants", "Savings", "Others"]
                    },
                }
            }

            spending_by_category = [
                {"name": "Groceries", "spent": round(summary["Needs"]["spent"] * 0.7, 2), "budget": round(summary["Needs"]["budget"] * 0.7, 2), "type": "Needs", "icon": "DollarOutlined"},
                {"name": "Housing", "spent": round(summary["Needs"]["spent"] * 0.3, 2), "budget": round(summary["Needs"]["budget"] * 0.3, 2), "type": "Needs", "icon": "HomeOutlined"},
                {"name": "Entertainment", "spent": round(summary["Wants"]["spent"] * 0.3, 2), "budget": round(summary["Wants"]["budget"] * 0.3, 2), "type": "Wants", "icon": "GiftOutlined"},
                {"name": "Shopping", "spent": round(summary["Wants"]["spent"] * 0.4, 2), "budget": round(summary["Wants"]["budget"] * 0.4, 2), "type": "Wants", "icon": "ShoppingOutlined"},
                {"name": "Dining Out", "spent": round(summary["Wants"]["spent"] * 0.3, 2), "budget": round(summary["Wants"]["budget"] * 0.3, 2), "type": "Wants", "icon": "ShoppingOutlined"},
            ]

            logger.info(f"Monthly budget generated successfully for user {uid} with {len(transactions)} transactions")
            return {
                "status": 1,
                "message": "Budget generated from all transactions",
                "budget_categories": {
                    "Needs": budget_categories["All Expenses"]["descriptions"]["Needs"],
                    "Wants": budget_categories["All Expenses"]["descriptions"]["Wants"],
                    "Savings": budget_categories["All Expenses"]["descriptions"]["Savings"],
                    "Others": budget_categories["All Expenses"]["descriptions"]["Others"],
                },
                "budget_summary": {
                    "Needs": {"spent": summary["Needs"]["spent"], "total": summary["Needs"]["budget"]},
                    "Wants": {"spent": summary["Wants"]["spent"], "total": summary["Wants"]["budget"]},
                    "Savings": {"spent": summary["Savings"]["spent"], "total": summary["Savings"]["budget"]},
                    "Others": {"spent": summary["Others"]["spent"], "total": summary["Others"]["budget"]},
                },
                "spending_by_category": spending_by_category,
            }
        except Exception as e:
            logger.error(f"Error generating budget for user {uid}: {str(e)}")
            return {"error": f"Internal server error: {str(e)}"}, 500
class UpdateMonthlyBudget(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            data = request.get_json()
            uid = data.get('uid')
            if not uid:
                return {"error": "Missing user_id"}, 400

            budget_categories = data.get('budget_categories', {})
            current_month = datetime.now().strftime("%Y-%m")

            for cat, details in budget_categories.items():
                budget = safe_load(details.get('budget', 0.0))
                existing = DBHelper.find_one(
                    table_name="user_monthly_budgets",
                    filters={"user_id": uid, "month": current_month, "category": cat},
                    select_fields=["id"]
                )
                if existing:
                    DBHelper.update_one(
                        table_name="user_monthly_budgets",
                        filters={"user_id": uid, "month": current_month, "category": cat},
                        updates={"budget": budget, "updated_at": datetime.now()}
                    )
                else:
                    DBHelper.insert(
                        table_name="user_monthly_budgets",
                        user_id=uid,
                        month=current_month,
                        category=cat,
                        budget=budget,
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )

            logger.info(f"Budget updated successfully for user {uid}")
            return {"status": 1, "message": "Budget updated successfully"}
        except Exception as e:
            logger.error(f"Error updating monthly budget for user {uid}: {str(e)}")
            return {"error": f"Internal server error: {str(e)}"}, 500
# class GenerateMonthlyBudget(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         try:
#             if not uid:
#                 return {"error": "Missing user_id"}, 400

#             # Define keyword-based categorization using description
#             description_to_budget = {
#                 # Housing-related (Needs)
#                 "mortgage": "Needs",
#                 "rent": "Needs",
#                 "housing": "Needs",
#                 # Food-related (reclassified as Dining Out under Wants)
#                 "groceries": "Wants",  # Reclassified to Dining Out
#                 "food": "Wants",  # Reclassified to Dining Out
#                 # Entertainment-related (Wants)
#                 "subscriptions": "Wants",
#                 "movie tickets": "Wants",
#                 "entertainment": "Wants",
#                 # Shopping-related (Wants)
#                 "electronics": "Wants",
#                 "shoes": "Wants",
#                 "clothing": "Wants",
#                 "cables": "Wants",
#                 "healthcare": "Wants",
#                 # Savings
#                 "savings": "Savings",
#                 "transfer to savings": "Savings",
#                 # Other
#                 "fee": "Other",
#                 "service charge": "Other",
#                 "income": "Other",
#                 "paycheck": "Other",
#                 "transfer": "Other",
#             }

#             # Get all user transactions
#             transactions = (
#                 DBHelper.find_all(
#                     table_name="user_bank_transactions",
#                     filters={"user_id": uid},
#                     select_fields=["amount", "entry_type", "date", "description"],
#                 )
#                 or []
#             )

#             # Filter for current month and debit transactions
#             current_month = datetime.now().strftime("%Y-%m")
#             filtered = [
#                 txn
#                 for txn in transactions
#                 if txn.get("date")
#                 and txn["date"].strftime("%Y-%m") == current_month
#                 and txn.get("entry_type", "").upper() == "DEBIT"
#             ]

#             if not filtered:
#                 logger.warning(
#                     f"No debit transactions found for user {uid} in {current_month}"
#                 )
#                 return {
#                     "status": 1,
#                     "message": "No transactions found",
#                     "budget_categories": {
#                         "All Expenses": {
#                             "spent": 0.0,
#                             "budget": 0.0,
#                             "descriptions": {
#                                 "Needs": {"spent": 0.0, "budget": 0.0, "count": 0},
#                                 "Wants": {"spent": 0.0, "budget": 0.0, "count": 0},
#                                 "Savings": {"spent": 0.0, "budget": 0.0, "count": 0},
#                                 "Other": {"spent": 0.0, "budget": 0.0, "count": 0},
#                             },
#                             "all_transactions": {
#                                 "Needs": [],
#                                 "Wants": [],
#                                 "Savings": [],
#                                 "Other": [],
#                             },
#                         }
#                     },
#                     "budget_summary": {
#                         "Needs": {"spent": 0, "total": 0},
#                         "Wants": {"spent": 0, "total": 0},
#                         "Savings": {"spent": 0, "total": 0},
#                         "Other": {"spent": 0, "total": 0},
#                     },
#                 }

#             # Aggregate by Budget Category and track all transactions
#             summary = defaultdict(lambda: {"spent": 0.0, "count": 0})
#             all_transactions = defaultdict(list)

#             for txn in filtered:
#                 desc = txn.get("description") or "Unknown"
#                 desc_lower = desc.lower()
#                 budget_cat = "Other"
#                 for keyword, cat in description_to_budget.items():
#                     if keyword in desc_lower:
#                         budget_cat = cat
#                         break

#                 if "savings" in desc_lower and "transfer" in desc_lower:
#                     budget_cat = "Savings"

#                 amount = abs(float(txn.get("amount", 0)))
#                 summary[budget_cat]["spent"] += amount
#                 summary[budget_cat]["count"] += 1
#                 all_transactions[budget_cat].append(
#                     {
#                         "description": desc,
#                         "amount": amount,
#                         "date": (
#                             txn.get("date").strftime("%Y-%m-%d")
#                             if txn.get("date")
#                             else "N/A"
#                         ),
#                     }
#                 )

#             # Set budget as 120% of spent amount, default to 0 if no data
#             for cat in ["Needs", "Wants", "Savings", "Other"]:
#                 if cat not in summary:
#                     summary[cat] = {"spent": 0.0, "count": 0}
#                 summary[cat]["budget"] = round(summary[cat]["spent"] * 1.2, 2)

#             all_spent = sum(v["spent"] for v in summary.values())
#             all_budget = sum(v["budget"] for v in summary.values())

#             # Build structured response with exactly 4 categories
#             budget_categories = {
#                 "All Expenses": {
#                     "spent": round(all_spent, 2),
#                     "budget": round(all_budget, 2),
#                     "descriptions": {
#                         cat: {
#                             "spent": round(summary[cat]["spent"], 2),
#                             "budget": round(summary[cat]["budget"], 2),
#                             "count": summary[cat]["count"],
#                         }
#                         for cat in ["Needs", "Wants", "Savings", "Other"]
#                     },
#                     "all_transactions": {
#                         cat: all_transactions[cat]
#                         for cat in ["Needs", "Wants", "Savings", "Other"]
#                     },
#                 }
#             }

#             return {
#                 "status": 1,
#                 "message": "Budget generated from transactions",
#                 "budget_categories": budget_categories,
#                 "budget_summary": {
#                     "Needs": {
#                         "spent": summary["Needs"]["spent"],
#                         "total": summary["Needs"]["budget"],
#                     },
#                     "Wants": {
#                         "spent": summary["Wants"]["spent"],
#                         "total": summary["Wants"]["budget"],
#                     },
#                     "Savings": {
#                         "spent": summary["Savings"]["spent"],
#                         "total": summary["Savings"]["budget"],
#                     },
#                     "Other": {
#                         "spent": summary["Other"]["spent"],
#                         "total": summary["Other"]["budget"],
#                     },
#                 },
#             }
#         except Exception as e:
#             logger.error(f"Error generating budget for user {uid}: {str(e)}")
#             return {"error": "Internal server error"}, 500


# class UpdateMonthlyBudget(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         try:
#             if not uid:
#                 return {"error": "Missing user_id"}, 400

#             parser = reqparse.RequestParser()
#             parser.add_argument(
#                 "budget_categories",
#                 type=dict,
#                 required=True,
#                 help="Budget categories are required",
#             )
#             args = parser.parse_args()

#             budget_categories = args["budget_categories"]
#             if not budget_categories or "All Expenses" not in budget_categories:
#                 return {"error": "Invalid budget categories format"}, 400

#             # Validate that all 4 categories are present
#             descriptions = budget_categories.get("All Expenses", {}).get(
#                 "descriptions", {}
#             )
#             if not all(
#                 cat in descriptions for cat in ["Needs", "Wants", "Savings", "Other"]
#             ):
#                 return {"error": "Missing required budget categories"}, 400

#             # Here you would typically save to a database
#             return {
#                 "status": 1,
#                 "message": "Budget updated successfully",
#                 "budget_categories": budget_categories,
#             }
#         except Exception as e:
#             logger.error(f"Error updating budget for user {uid}: {str(e)}")
#             return {"error": "Internal server error"}

