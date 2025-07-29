# from flask import request
# from flask_restful import Resource
# import logging
# from datetime import datetime, date
# from root.db.dbHelper import DBHelper
# from root.auth.auth import auth_required
# import random
# import string

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)


# class AddMaintenanceTask(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         name = input_data.get("name", "").strip()
#         date = input_data.get("date", "").strip()
#         if not name or not date:
#             return {"status": 0, "message": "Name and date are required", "payload": {}}

#         task_data = {
#             "user_id": uid,
#             "name": name,
#             "date": date,  # Expect YYYY-MM-DD
#             "completed": False,
#             "created_at": datetime.now().isoformat(),
#             "updated_at": datetime.now().isoformat(),
#         }

#         try:
#             inserted_id = DBHelper.insert(
#                 "home_maintenance", return_column="id", **task_data
#             )
#             task_data["id"] = inserted_id
#             return {
#                 "status": 1,
#                 "message": "Maintenance Task Added Successfully",
#                 "payload": {"task": task_data},
#             }
#         except Exception as e:
#             logger.error(f"Error adding maintenance task: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error adding maintenance task: {str(e)}",
#                 "payload": {},
#             }


# class GetMaintenanceTasks(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         try:
#             tasks = DBHelper.find_all(
#                 table_name="home_maintenance",
#                 filters={"user_id": uid},
#                 select_fields=[
#                     "id",
#                     "name",
#                     "date",
#                     "completed",
#                     "created_at",
#                     "updated_at",
#                 ],
#             )
#             user_tasks = [
#                 {
#                     "id": str(task["id"]),
#                     "name": task["name"],
#                     "date": (
#                         task["date"].strftime("%Y-%m-%d") if task["date"] else "No Date"
#                     ),
#                     "completed": task["completed"],
#                     "created_at": (
#                         task["created_at"].isoformat() if task["created_at"] else None
#                     ),
#                     "updated_at": (
#                         task["updated_at"].isoformat() if task["updated_at"] else None
#                     ),
#                 }
#                 for task in tasks
#             ]
#             return {
#                 "status": 1,
#                 "message": "Maintenance Tasks fetched successfully",
#                 "payload": {"tasks": user_tasks},
#             }
#         except Exception as e:
#             logger.error(f"Error fetching maintenance tasks: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error fetching maintenance tasks: {str(e)}",
#                 "payload": {},
#             }


# class UpdateMaintenanceTask(Resource):
#     @auth_required(isOptional=True)
#     def put(self, uid, user, task_id):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         updates = {}
#         if "name" in input_data and input_data["name"].strip():
#             updates["name"] = input_data["name"].strip()
#         if "date" in input_data and input_data["date"].strip():
#             updates["date"] = input_data["date"]
#         if "completed" in input_data:
#             updates["completed"] = input_data["completed"]
#         updates["updated_at"] = datetime.now().isoformat()

#         if not updates:
#             return {"status": 0, "message": "No valid updates provided", "payload": {}}

#         try:
#             result = DBHelper.update_one(
#                 table_name="home_maintenance",
#                 filters={"id": int(task_id), "user_id": uid},
#                 updates=updates,
#                 return_fields=[
#                     "id",
#                     "name",
#                     "date",
#                     "completed",
#                     "created_at",
#                     "updated_at",
#                 ],
#             )
#             if result:
#                 updated_task = {
#                     "id": str(result["id"]),
#                     "name": result["name"],
#                     "date": (
#                         result["date"].strftime("%Y-%m-%d")
#                         if result["date"]
#                         else "No Date"
#                     ),
#                     "completed": result["completed"],
#                     "created_at": (
#                         result["created_at"].isoformat()
#                         if result["created_at"]
#                         else None
#                     ),
#                     "updated_at": (
#                         result["updated_at"].isoformat()
#                         if result["updated_at"]
#                         else None
#                     ),
#                 }
#                 return {
#                     "status": 1,
#                     "message": "Maintenance Task Updated Successfully",
#                     "payload": {"task": updated_task},
#                 }
#             else:
#                 return {
#                     "status": 0,
#                     "message": "Task not found or not authorized",
#                     "payload": {},
#                 }
#         except Exception as e:
#             logger.error(f"Error updating maintenance task: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error updating maintenance task: {str(e)}",
#                 "payload": {},
#             }


# class DeleteMaintenanceTask(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user, task_id):
#         try:
#             task = DBHelper.find_one(
#                 table_name="home_maintenance",
#                 filters={"id": int(task_id), "user_id": uid},
#                 select_fields=["id"],
#             )
#             if not task:
#                 return {
#                     "status": 0,
#                     "message": "Task not found or not authorized",
#                     "payload": {},
#                 }

#             DBHelper.delete_all(
#                 table_name="home_maintenance",
#                 filters={"id": int(task_id), "user_id": uid},
#             )
#             return {
#                 "status": 1,
#                 "message": "Maintenance Task Deleted Successfully",
#                 "payload": {},
#             }
#         except Exception as e:
#             logger.error(f"Error deleting maintenance task: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error deleting maintenance task: {str(e)}",
#                 "payload": {},
#             }


# class DeleteAllMaintenanceTasks(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user):
#         try:
#             DBHelper.delete_all(
#                 table_name="home_maintenance",
#                 filters={"user_id": uid},
#             )
#             return {
#                 "status": 1,
#                 "message": "All Maintenance Tasks Deleted Successfully",
#                 "payload": {},
#             }
#         except Exception as e:
#             logger.error(f"Error deleting all maintenance tasks: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error deleting all maintenance tasks: {str(e)}",
#                 "payload": {},
#             }


# class AddUtility(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         type = input_data.get("type", "").strip()
#         account_number = input_data.get("accountNumber", "").strip()
#         monthly_cost = input_data.get("monthlyCost")
#         provider_url = input_data.get("providerUrl", "").strip()

#         if not type or not account_number or not monthly_cost or not provider_url:
#             return {
#                 "status": 0,
#                 "message": "Type, account number, monthly cost, and provider URL are required",
#                 "payload": {},
#             }

#         try:
#             monthly_cost = float(monthly_cost)
#             if monthly_cost < 0:
#                 return {
#                     "status": 0,
#                     "message": "Monthly cost must be non-negative",
#                     "payload": {},
#                 }
#         except (ValueError, TypeError):
#             return {
#                 "status": 0,
#                 "message": "Invalid monthly cost format",
#                 "payload": {},
#             }

#         utility_data = {
#             "user_id": uid,
#             "type": type,
#             "account_number": account_number,
#             "monthly_cost": monthly_cost,
#             "provider_url": provider_url,
#             "created_at": datetime.now().isoformat(),
#             "updated_at": datetime.now().isoformat(),
#             "is_active": 1,
#         }

#         try:
#             inserted_id = DBHelper.insert(
#                 "utility", return_column="utid", **utility_data
#             )
#             utility_data["utid"] = inserted_id
#             return {
#                 "status": 1,
#                 "message": "Utility Added Successfully",
#                 "payload": {"utility": utility_data},
#             }
#         except Exception as e:
#             logger.error(f"Error adding utility: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error adding utility: {str(e)}",
#                 "payload": {},
#             }


# class GetUtilities(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         try:
#             utilities = DBHelper.find_all(
#                 table_name="utility",
#                 filters={"user_id": uid},
#                 select_fields=[
#                     "utid",
#                     "type",
#                     "account_number",
#                     "monthly_cost",
#                     "provider_url",
#                     "created_at",
#                     "updated_at",
#                     "is_active",
#                 ],
#             )
#             user_utilities = [
#                 {
#                     "id": str(utility["utid"]),
#                     "type": utility["type"],
#                     "accountNumber": utility["account_number"],
#                     "monthlyCost": float(utility["monthly_cost"]),
#                     "providerUrl": utility["provider_url"],
#                     "created_at": (
#                         utility["created_at"].isoformat()
#                         if utility["created_at"]
#                         else None
#                     ),
#                     "updated_at": (
#                         utility["updated_at"].isoformat()
#                         if utility["updated_at"]
#                         else None
#                     ),
#                     "is_active": utility["is_active"],
#                 }
#                 for utility in utilities
#             ]
#             return {
#                 "status": 1,
#                 "message": "Utilities fetched successfully",
#                 "payload": {"utilities": user_utilities},
#             }
#         except Exception as e:
#             logger.error(f"Error fetching utilities: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error fetching utilities: {str(e)}",
#                 "payload": {},
#             }


# class UpdateUtility(Resource):
#     @auth_required(isOptional=True)
#     def put(self, uid, user, utility_id):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         updates = {}
#         if "type" in input_data and input_data["type"].strip():
#             updates["type"] = input_data["type"].strip()
#         if "accountNumber" in input_data and input_data["accountNumber"].strip():
#             updates["account_number"] = input_data["accountNumber"].strip()
#         if "monthlyCost" in input_data:
#             try:
#                 monthly_cost = float(input_data["monthlyCost"])
#                 if monthly_cost < 0:
#                     return {
#                         "status": 0,
#                         "message": "Monthly cost must be non-negative",
#                         "payload": {},
#                     }
#                 updates["monthly_cost"] = monthly_cost
#             except (ValueError, TypeError):
#                 return {
#                     "status": 0,
#                     "message": "Invalid monthly cost format",
#                     "payload": {},
#                 }
#         if "providerUrl" in input_data and input_data["providerUrl"].strip():
#             updates["provider_url"] = input_data["providerUrl"].strip()
#         updates["updated_at"] = datetime.now().isoformat()

#         if not updates:
#             return {"status": 0, "message": "No valid updates provided", "payload": {}}

#         try:
#             result = DBHelper.update_one(
#                 table_name="utility",
#                 filters={"utid": int(utility_id), "user_id": uid, "is_active": 1},
#                 updates=updates,
#                 return_fields=[
#                     "utid",
#                     "type",
#                     "account_number",
#                     "monthly_cost",
#                     "provider_url",
#                     "created_at",
#                     "updated_at",
#                     "is_active",
#                 ],
#             )
#             if result:
#                 updated_utility = {
#                     "id": str(result["utid"]),
#                     "type": result["type"],
#                     "accountNumber": result["account_number"],
#                     "monthlyCost": float(result["monthly_cost"]),
#                     "providerUrl": result["provider_url"],
#                     "created_at": (
#                         result["created_at"].isoformat()
#                         if result["created_at"]
#                         else None
#                     ),
#                     "updated_at": (
#                         result["updated_at"].isoformat()
#                         if result["updated_at"]
#                         else None
#                     ),
#                     "is_active": result["is_active"],
#                 }
#                 return {
#                     "status": 1,
#                     "message": "Utility Updated Successfully",
#                     "payload": {"utility": updated_utility},
#                 }
#             else:
#                 return {
#                     "status": 0,
#                     "message": "Utility not found or not authorized",
#                     "payload": {},
#                 }
#         except Exception as e:
#             logger.error(f"Error updating utility: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error updating utility: {str(e)}",
#                 "payload": {},
#             }


# class DeleteUtility(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user, utility_id):
#         try:
#             logger.info(
#                 f"Attempting to deactivate utility with utid: {utility_id}, user_id: {uid}"
#             )
#             utility = DBHelper.find_one(
#                 table_name="utility",
#                 filters={"utid": int(utility_id), "user_id": uid, "is_active": 1},
#                 select_fields=[
#                     "utid",
#                     "type",
#                     "account_number",
#                     "monthly_cost",
#                     "provider_url",
#                     "is_active",
#                 ],
#             )
#             if not utility:
#                 logger.warning(
#                     f"Utility not found or already inactive: utid={utility_id}, user_id={uid}"
#                 )
#                 return {
#                     "status": 0,
#                     "message": "Utility not found or already inactive",
#                     "payload": {},
#                 }

#             result = DBHelper.update_one(
#                 table_name="utility",
#                 filters={"utid": int(utility_id), "user_id": uid},
#                 updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
#                 return_fields=[
#                     "utid",
#                     "type",
#                     "account_number",
#                     "monthly_cost",
#                     "provider_url",
#                     "is_active",
#                 ],
#             )
#             if result:
#                 logger.info(
#                     f"Utility deactivated successfully: utid={utility_id}, is_active={result['is_active']}"
#                 )
#                 return {
#                     "status": 1,
#                     "message": "Utility Deactivated Successfully",
#                     "payload": {
#                         "utility": {
#                             "utid": str(result["utid"]),
#                             "type": result["type"],
#                             "account_number": result["account_number"],
#                             "monthly_cost": float(result["monthly_cost"]),
#                             "provider_url": result["provider_url"],
#                             "is_active": result["is_active"],
#                         }
#                     },
#                 }
#             else:
#                 logger.warning(
#                     f"Failed to deactivate utility: utid={utility_id}, user_id={uid}"
#                 )
#                 return {
#                     "status": 0,
#                     "message": "Failed to deactivate utility",
#                     "payload": {},
#                 }
#         except Exception as e:
#             logger.error(
#                 f"Error deactivating utility: utid={utility_id}, error={str(e)}"
#             )
#             return {
#                 "status": 0,
#                 "message": f"Error deactivating utility: {str(e)}",
#                 "payload": {},
#             }


# class AddInsurance(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         name = input_data.get("name", "").strip()
#         meta = input_data.get("meta", "").strip()
#         type = input_data.get("type", "").strip()
#         years = input_data.get("years")
#         payment = input_data.get("payment")
#         renewal_date = input_data.get("renewalDate")

#         if not name or not meta or not type or years is None or payment is None:
#             return {
#                 "status": 0,
#                 "message": "Name, policy number, type, years, and payment are required",
#                 "payload": {},
#             }

#         try:
#             years = int(years)
#             if years <= 0:
#                 return {
#                     "status": 0,
#                     "message": "Years must be a positive integer",
#                     "payload": {},
#                 }
#         except (ValueError, TypeError):
#             return {"status": 0, "message": "Invalid years format", "payload": {}}

#         try:
#             payment = float(payment)
#             if payment < 0:
#                 return {
#                     "status": 0,
#                     "message": "Payment must be non-negative",
#                     "payload": {},
#                 }
#         except (ValueError, TypeError):
#             return {"status": 0, "message": "Invalid payment format", "payload": {}}

#         if renewal_date:
#             try:
#                 # Validate date format (YYYY-MM-DD)
#                 datetime.strptime(renewal_date, "%Y-%m-%d")
#             except ValueError:
#                 return {
#                     "status": 0,
#                     "message": "Invalid renewal date format (use YYYY-MM-DD)",
#                     "payload": {},
#                 }

#         insurance_data = {
#             "id": str(datetime.now().timestamp()),  # Generate unique ID
#             "user_id": uid,
#             "name": name,
#             "meta": meta,
#             "type": type,
#             "years": years,
#             "payment": payment,
#             "renewal_date": renewal_date,
#             "created_at": datetime.now().isoformat(),
#             "updated_at": datetime.now().isoformat(),
#         }

#         try:
#             DBHelper.insert("insurance", return_column="id", **insurance_data)
#             return {
#                 "status": 1,
#                 "message": "Insurance Policy Added Successfully",
#                 "payload": {
#                     "insurance": {
#                         "id": insurance_data["id"],
#                         "name": insurance_data["name"],
#                         "meta": insurance_data["meta"],
#                         "type": insurance_data["type"],
#                         "years": insurance_data["years"],
#                         "payment": insurance_data["payment"],
#                         "renewalDate": insurance_data["renewal_date"],
#                     }
#                 },
#             }
#         except Exception as e:
#             logger.error(f"Error adding insurance: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error adding insurance: {str(e)}",
#                 "payload": {},
#             }


# class GetInsurance(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         try:
#             insurances = DBHelper.find_all(
#                 table_name="insurance",
#                 filters={"user_id": uid},
#                 select_fields=[
#                     "id",
#                     "name",
#                     "meta",
#                     "type",
#                     "years",
#                     "payment",
#                     "renewal_date",
#                     "created_at",
#                     "updated_at",
#                 ],
#             )
#             user_insurances = [
#                 {
#                     "id": str(insurance["id"]),
#                     "name": insurance["name"],
#                     "meta": insurance["meta"],
#                     "type": insurance["type"],
#                     "years": insurance["years"],
#                     "payment": float(insurance["payment"]),
#                     "renewalDate": (
#                         insurance["renewal_date"].strftime("%Y-%m-%d")
#                         if insurance["renewal_date"]
#                         else None
#                     ),
#                     "created_at": (
#                         insurance["created_at"].isoformat()
#                         if insurance["created_at"]
#                         else None
#                     ),
#                     "updated_at": (
#                         insurance["updated_at"].isoformat()
#                         if insurance["updated_at"]
#                         else None
#                     ),
#                 }
#                 for insurance in insurances
#             ]
#             return {
#                 "status": 1,
#                 "message": "Insurance Policies fetched successfully",
#                 "payload": {"insurances": user_insurances},
#             }
#         except Exception as e:
#             logger.error(f"Error fetching insurance policies: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error fetching insurance policies: {str(e)}",
#                 "payload": {},
#             }


# class UpdateInsurance(Resource):
#     @auth_required(isOptional=True)
#     def put(self, uid, user, insurance_id):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         updates = {}
#         if "name" in input_data and input_data["name"].strip():
#             updates["name"] = input_data["name"].strip()
#         if "meta" in input_data and input_data["meta"].strip():
#             updates["meta"] = input_data["meta"].strip()
#         if "type" in input_data and input_data["type"].strip():
#             updates["type"] = input_data["type"].strip()
#         if "years" in input_data:
#             try:
#                 years = int(input_data["years"])
#                 if years <= 0:
#                     return {
#                         "status": 0,
#                         "message": "Years must be a positive integer",
#                         "payload": {},
#                     }
#                 updates["years"] = years
#             except (ValueError, TypeError):
#                 return {"status": 0, "message": "Invalid years format", "payload": {}}
#         if "payment" in input_data:
#             try:
#                 payment = float(input_data["payment"])
#                 if payment < 0:
#                     return {
#                         "status": 0,
#                         "message": "Payment must be non-negative",
#                         "payload": {},
#                     }
#                 updates["payment"] = payment
#             except (ValueError, TypeError):
#                 return {"status": 0, "message": "Invalid payment format", "payload": {}}
#         if "renewalDate" in input_data and input_data["renewalDate"]:
#             try:
#                 datetime.strptime(input_data["renewalDate"], "%Y-%m-%d")
#                 updates["renewal_date"] = input_data["renewalDate"]
#             except ValueError:
#                 return {
#                     "status": 0,
#                     "message": "Invalid renewal date format (use YYYY-MM-DD)",
#                     "payload": {},
#                 }
#         updates["updated_at"] = datetime.now().isoformat()

#         if not updates:
#             return {"status": 0, "message": "No valid updates provided", "payload": {}}

#         try:
#             result = DBHelper.update_one(
#                 table_name="insurance",
#                 filters={"id": insurance_id, "user_id": uid, "is_active": 1},
#                 updates=updates,
#                 return_fields=[
#                     "id",
#                     "name",
#                     "meta",
#                     "type",
#                     "years",
#                     "payment",
#                     "renewal_date",
#                     "created_at",
#                     "updated_at",
#                     "is_active",
#                 ],
#             )
#             if result:
#                 updated_insurance = {
#                     "id": str(result["id"]),
#                     "name": result["name"],
#                     "meta": result["meta"],
#                     "type": result["type"],
#                     "years": result["years"],
#                     "payment": float(result["payment"]),
#                     "renewalDate": (
#                         result["renewal_date"].strftime("%Y-%m-%d")
#                         if result["renewal_date"]
#                         else None
#                     ),
#                     "created_at": (
#                         result["created_at"].isoformat()
#                         if result["created_at"]
#                         else None
#                     ),
#                     "updated_at": (
#                         result["updated_at"].isoformat()
#                         if result["updated_at"]
#                         else None
#                     ),
#                     "is_active": result["is_active"],
#                 }
#                 return {
#                     "status": 1,
#                     "message": "Insurance Policy Updated Successfully",
#                     "payload": {"insurance": updated_insurance},
#                 }
#             else:
#                 return {
#                     "status": 0,
#                     "message": "Insurance policy not found or not authorized",
#                     "payload": {},
#                 }
#         except Exception as e:
#             logger.error(f"Error updating insurance policy: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error updating insurance policy: {str(e)}",
#                 "payload": {},
#             }


# class DeleteInsurance(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user, insurance_id):
#         try:
#             logger.info(
#                 f"Attempting to deactivate insurance with id: {insurance_id}, user_id: {uid}"
#             )
#             insurance = DBHelper.find_one(
#                 table_name="insurance",
#                 filters={"id": insurance_id, "user_id": uid, "is_active": 1},
#                 select_fields=[
#                     "id",
#                     "name",
#                     "meta",
#                     "type",
#                     "years",
#                     "payment",
#                     "renewal_date",
#                     "is_active",
#                 ],
#             )
#             if not insurance:
#                 logger.warning(
#                     f"Insurance not found or already inactive: id={insurance_id}, user_id={uid}"
#                 )
#                 return {
#                     "status": 0,
#                     "message": "Insurance policy not found or already inactive",
#                     "payload": {},
#                 }

#             result = DBHelper.update_one(
#                 table_name="insurance",
#                 filters={"id": insurance_id, "user_id": uid},
#                 updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
#                 return_fields=[
#                     "id",
#                     "name",
#                     "meta",
#                     "type",
#                     "years",
#                     "payment",
#                     "renewal_date",
#                     "is_active",
#                 ],
#             )
#             if result:
#                 logger.info(
#                     f"Insurance deactivated successfully: id={insurance_id}, is_active={result['is_active']}"
#                 )
#                 return {
#                     "status": 1,
#                     "message": "Insurance Policy Deactivated Successfully",
#                     "payload": {
#                         "insurance": {
#                             "id": str(result["id"]),
#                             "name": result["name"],
#                             "meta": result["meta"],
#                             "type": result["type"],
#                             "years": result["years"],
#                             "payment": float(result["payment"]),
#                             "renewalDate": (
#                                 result["renewal_date"].strftime("%Y-%m-%d")
#                                 if result["renewal_date"]
#                                 else None
#                             ),
#                             "is_active": result["is_active"],
#                         }
#                     },
#                 }
#             else:
#                 logger.warning(
#                     f"Failed to deactivate insurance: id={insurance_id}, user_id={uid}"
#                 )
#                 return {
#                     "status": 0,
#                     "message": "Failed to deactivate insurance policy",
#                     "payload": {},
#                 }
#         except Exception as e:
#             logger.error(
#                 f"Error deactivating insurance: id={insurance_id}, error={str(e)}"
#             )
#             return {
#                 "status": 0,
#                 "message": f"Error deactivating insurance: {str(e)}",
#                 "payload": {},
#             }


# class AddProperty(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         address = input_data.get("address", "").strip()
#         purchase_date = input_data.get("purchaseDate", "").strip()
#         purchase_price = input_data.get("purchasePrice")
#         square_footage = input_data.get("squareFootage", "").strip()
#         lot_size = input_data.get("lotSize", "").strip()
#         property_tax_id = input_data.get("propertyTaxId", "").strip()

#         if (
#             not address
#             or not purchase_date
#             or not purchase_price
#             or not square_footage
#             or not lot_size
#             or not property_tax_id
#         ):
#             return {"status": 0, "message": "All fields are required", "payload": {}}

#         try:
#             if isinstance(purchase_price, str):
#                 purchase_price = float(purchase_price.replace("$", "").replace(",", ""))
#             else:
#                 purchase_price = float(purchase_price)
#             if purchase_price < 0:
#                 return {
#                     "status": 0,
#                     "message": "Purchase price must be non-negative",
#                     "payload": {},
#                 }
#         except (ValueError, TypeError, AttributeError):
#             return {
#                 "status": 0,
#                 "message": "Invalid purchase price format",
#                 "payload": {},
#             }

#         try:
#             datetime.strptime(purchase_date, "%Y-%m-%d")
#         except ValueError:
#             return {
#                 "status": 0,
#                 "message": "Invalid purchase date format (use YYYY-MM-DD)",
#                 "payload": {},
#             }

#         # Generate a unique pid
#         property_data = {
#             "pid": str(datetime.now().timestamp()),  # Generate unique pid
#             "user_id": uid,
#             "address": address,
#             "purchase_date": purchase_date,
#             "purchase_price": purchase_price,
#             "square_footage": square_footage,
#             "lot_size": lot_size,
#             "property_tax_id": property_tax_id,
#             "created_at": datetime.now().isoformat(),
#             "updated_at": datetime.now().isoformat(),
#             "is_active": 1,
#         }

#         try:
#             inserted_id = DBHelper.insert(
#                 "property_information", return_column="pid", **property_data
#             )
#             property_data["pid"] = (
#                 inserted_id if inserted_id else property_data["pid"]
#             )  # Use inserted_id if provided, else keep generated pid
#             return {
#                 "status": 1,
#                 "message": "Property Added Successfully",
#                 "payload": {"property": property_data},
#             }
#         except Exception as e:
#             logger.error(f"Error adding property: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error adding property: {str(e)}",
#                 "payload": {},
#             }


# class GetProperties(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         try:
#             properties = DBHelper.find_all(
#                 table_name="property_information",
#                 filters={"user_id": uid, "is_active": 1},
#                 select_fields=[
#                     "pid",
#                     "address",
#                     "purchase_date",
#                     "purchase_price",
#                     "square_footage",
#                     "lot_size",
#                     "property_tax_id",
#                     "created_at",
#                     "updated_at",
#                     "is_active",
#                 ],
#             )
#             # logger.info(f"Fetched properties for user_id {uid}: {properties}")  # Debug log
#             user_properties = [
#                 {
#                     "id": str(property["pid"]),
#                     "address": property["address"] or "N/A",
#                     "purchaseDate": (
#                         property["purchase_date"].strftime("%Y-%m-%d")
#                         if property["purchase_date"]
#                         else "N/A"
#                     ),
#                     "purchasePrice": (
#                         float(property["purchase_price"])
#                         if property["purchase_price"] is not None
#                         else 0.0
#                     ),
#                     "squareFootage": property["square_footage"] or "N/A",
#                     "lotSize": property["lot_size"] or "N/A",
#                     "propertyTaxId": property["property_tax_id"] or "N/A",
#                     "created_at": (
#                         property["created_at"].isoformat()
#                         if property["created_at"]
#                         else None
#                     ),
#                     "updated_at": (
#                         property["updated_at"].isoformat()
#                         if property["updated_at"]
#                         else None
#                     ),
#                     "is_active": property["is_active"],
#                 }
#                 for property in properties
#             ]
#             return {
#                 "status": 1,
#                 "message": "Properties fetched successfully",
#                 "payload": {"properties": user_properties},
#             }
#         except Exception as e:
#             logger.error(f"Error fetching properties for user_id {uid}: {str()}")
#             # return {
#             #     "status": 0,
#             #     "message": f"Error fetching properties: {str(e)}",
#             #     "payload": {}
#             # }


# class UpdateProperty(Resource):
#     @auth_required(isOptional=True)
#     def put(self, uid, user, property_id):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         updates = {}
#         if "address" in input_data and input_data["address"].strip():
#             updates["address"] = input_data["address"].strip()
#         if "purchaseDate" in input_data and input_data["purchaseDate"].strip():
#             try:
#                 datetime.strptime(input_data["purchaseDate"], "%Y-%m-%d")
#                 updates["purchase_date"] = input_data["purchaseDate"]
#             except ValueError:
#                 return {
#                     "status": 0,
#                     "message": "Invalid purchase date format (use YYYY-MM-DD)",
#                     "payload": {},
#                 }
#         if "purchasePrice" in input_data:
#             try:
#                 purchase_price = input_data["purchasePrice"]
#                 if isinstance(purchase_price, str):
#                     purchase_price = float(
#                         purchase_price.replace("$", "").replace(",", "")
#                     )
#                 else:
#                     purchase_price = float(purchase_price)
#                 if purchase_price < 0:
#                     return {
#                         "status": 0,
#                         "message": "Purchase price must be non-negative",
#                         "payload": {},
#                     }
#                 updates["purchase_price"] = purchase_price
#             except (ValueError, TypeError):
#                 return {
#                     "status": 0,
#                     "message": "Invalid purchase price format",
#                     "payload": {},
#                 }
#         if "squareFootage" in input_data and input_data["squareFootage"].strip():
#             updates["square_footage"] = input_data["squareFootage"].strip()
#         if "lotSize" in input_data and input_data["lotSize"].strip():
#             updates["lot_size"] = input_data["lotSize"].strip()
#         if "propertyTaxId" in input_data and input_data["propertyTaxId"].strip():
#             updates["property_tax_id"] = input_data["propertyTaxId"].strip()
#         updates["updated_at"] = datetime.now().isoformat()

#         if not updates:
#             return {"status": 0, "message": "No valid updates provided", "payload": {}}

#         try:
#             logger.info(
#                 f"Updating property with pid {property_id} for user_id {uid}: {updates}"
#             )  # Debug log
#             result = DBHelper.update_one(
#                 table_name="property_information",
#                 filters={"pid": property_id, "user_id": uid, "is_active": 1},
#                 updates=updates,
#                 return_fields=[
#                     "pid",
#                     "address",
#                     "purchase_date",
#                     "purchase_price",
#                     "square_footage",
#                     "lot_size",
#                     "property_tax_id",
#                     "created_at",
#                     "updated_at",
#                     "is_active",
#                 ],
#             )
#             if result:
#                 logger.info(f"Updated property result: {result}")  # Debug log
#                 updated_property = {
#                     "id": str(result["pid"]),
#                     "address": result["address"] or "N/A",
#                     "purchaseDate": (
#                         result["purchase_date"].strftime("%Y-%m-%d")
#                         if result["purchase_date"]
#                         else "N/A"
#                     ),
#                     "purchasePrice": (
#                         float(result["purchase_price"])
#                         if result["purchase_price"] is not None
#                         else 0.0
#                     ),
#                     "squareFootage": result["square_footage"] or "N/A",
#                     "lotSize": result["lot_size"] or "N/A",
#                     "propertyTaxId": result["property_tax_id"] or "N/A",
#                     "created_at": (
#                         result["created_at"].isoformat()
#                         if result["created_at"]
#                         else None
#                     ),
#                     "updated_at": (
#                         result["updated_at"].isoformat()
#                         if result["updated_at"]
#                         else None
#                     ),
#                     "is_active": result["is_active"],
#                 }
#                 return {
#                     "status": 1,
#                     "message": "Property Updated Successfully",
#                     "payload": {"property": updated_property},
#                 }
#             else:
#                 logger.warning(
#                     f"Property not found or not authorized: pid={property_id}, user_id={uid}"
#                 )
#                 return {
#                     "status": 0,
#                     "message": "Property not found or not authorized",
#                     "payload": {},
#                 }
#         except Exception as e:
#             logger.error(f"Error updating property with pid {property_id}: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error updating property: {str(e)}",
#                 "payload": {},
#             }


# class AddMortgage(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         name = input_data.get("name", "").strip()
#         meta = input_data.get("meta", "").strip()
#         amount = input_data.get("amount")
#         interest_rate = input_data.get("interestRate")
#         term = input_data.get("term")

#         if not all(
#             [
#                 name,
#                 meta,
#                 amount is not None,
#                 interest_rate is not None,
#                 term is not None,
#             ]
#         ):
#             return {
#                 "status": 0,
#                 "message": "Name, meta, amount, interest rate, and term are required",
#                 "payload": {},
#             }

#         try:
#             amount = float(amount)
#             interest_rate = float(interest_rate)
#             term = int(term)
#             if amount < 0 or interest_rate < 0 or term <= 0:
#                 return {
#                     "status": 0,
#                     "message": "Amount and interest rate must be non-negative, term must be positive",
#                     "payload": {},
#                 }
#         except (ValueError, TypeError):
#             return {
#                 "status": 0,
#                 "message": "Invalid format for amount, interest rate, or term",
#                 "payload": {},
#             }

#         mortgage_data = {
#             "id": str(datetime.now().timestamp()),
#             "user_id": uid,
#             "name": name,
#             "meta": meta,
#             "amount": amount,
#             "interest_rate": interest_rate,
#             "term": term,
#             "created_at": datetime.now().isoformat(),
#             "updated_at": datetime.now().isoformat(),
#             "is_active": 1,
#         }

#         try:
#             inserted_id = DBHelper.insert(
#                 "mortgages", return_column="id", **mortgage_data
#             )
#             mortgage_data["id"] = inserted_id if inserted_id else mortgage_data["id"]
#             return {
#                 "status": 1,
#                 "message": "Mortgage Added Successfully",
#                 "payload": {"loans": [mortgage_data]},
#             }
#         except Exception as e:
#             logger.error(f"Error adding mortgage: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error adding mortgage: {str(e)}",
#                 "payload": {},
#             }


# class GetMortgages(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         try:
#             mortgages = DBHelper.find_all(
#                 table_name="mortgages",
#                 filters={"user_id": uid, "is_active": 1},
#                 select_fields=[
#                     "id",
#                     "name",
#                     "meta",
#                     "amount",
#                     "interest_rate",
#                     "term",
#                     "created_at",
#                     "updated_at",
#                     "is_active",
#                 ],
#             )
#             user_mortgages = [
#                 {
#                     "id": str(mortgage["id"]),
#                     "name": mortgage["name"],
#                     "meta": mortgage["meta"],
#                     "amount": float(mortgage["amount"]),
#                     "interestRate": float(mortgage["interest_rate"]),
#                     "term": mortgage["term"],
#                     "created_at": (
#                         mortgage["created_at"].isoformat()
#                         if mortgage["created_at"]
#                         else None
#                     ),
#                     "updated_at": (
#                         mortgage["updated_at"].isoformat()
#                         if mortgage["updated_at"]
#                         else None
#                     ),
#                     "is_active": mortgage["is_active"],
#                 }
#                 for mortgage in mortgages
#             ]
#             return {
#                 "status": 1,
#                 "message": "Mortgages fetched successfully",
#                 "payload": {"loans": user_mortgages},
#             }
#         except Exception as e:
#             logger.error(f"Error fetching mortgages: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error fetching mortgages: {str(e)}",
#                 "payload": {},
#             }


# class UpdateMortgage(Resource):
#     @auth_required(isOptional=True)
#     def put(self, uid, user, mortgage_id):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         updates = {}
#         if "name" in input_data and input_data["name"].strip():
#             updates["name"] = input_data["name"].strip()
#         if "meta" in input_data and input_data["meta"].strip():
#             updates["meta"] = input_data["meta"].strip()
#         if "amount" in input_data:
#             try:
#                 amount = float(input_data["amount"])
#                 if amount < 0:
#                     return {
#                         "status": 0,
#                         "message": "Amount must be non-negative",
#                         "payload": {},
#                     }
#                 updates["amount"] = amount
#             except (ValueError, TypeError):
#                 return {"status": 0, "message": "Invalid amount format", "payload": {}}
#         if "interestRate" in input_data:
#             try:
#                 interest_rate = float(input_data["interestRate"])
#                 if interest_rate < 0:
#                     return {
#                         "status": 0,
#                         "message": "Interest rate must be non-negative",
#                         "payload": {},
#                     }
#                 updates["interest_rate"] = interest_rate
#             except (ValueError, TypeError):
#                 return {
#                     "status": 0,
#                     "message": "Invalid interest rate format",
#                     "payload": {},
#                 }
#         if "term" in input_data:
#             try:
#                 term = int(input_data["term"])
#                 if term <= 0:
#                     return {
#                         "status": 0,
#                         "message": "Term must be a positive integer",
#                         "payload": {},
#                     }
#                 updates["term"] = term
#             except (ValueError, TypeError):
#                 return {"status": 0, "message": "Invalid term format", "payload": {}}
#         updates["updated_at"] = datetime.now().isoformat()

#         if not updates:
#             return {"status": 0, "message": "No valid updates provided", "payload": {}}

#         try:
#             result = DBHelper.update_one(
#                 table_name="mortgages",
#                 filters={"id": mortgage_id, "user_id": uid, "is_active": 1},
#                 updates=updates,
#                 return_fields=[
#                     "id",
#                     "name",
#                     "meta",
#                     "amount",
#                     "interest_rate",
#                     "term",
#                     "created_at",
#                     "updated_at",
#                     "is_active",
#                 ],
#             )
#             if result:
#                 updated_mortgage = {
#                     "id": str(result["id"]),
#                     "name": result["name"],
#                     "meta": result["meta"],
#                     "amount": float(result["amount"]),
#                     "interestRate": float(result["interest_rate"]),
#                     "term": result["term"],
#                     "created_at": (
#                         result["created_at"].isoformat()
#                         if result["created_at"]
#                         else None
#                     ),
#                     "updated_at": (
#                         result["updated_at"].isoformat()
#                         if result["updated_at"]
#                         else None
#                     ),
#                     "is_active": result["is_active"],
#                 }
#                 return {
#                     "status": 1,
#                     "message": "Mortgage Updated Successfully",
#                     "payload": {"loans": [updated_mortgage]},
#                 }
#             else:
#                 return {
#                     "status": 0,
#                     "message": "Mortgage not found or not authorized",
#                     "payload": {},
#                 }
#         except Exception as e:
#             logger.error(f"Error updating mortgage: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error updating mortgage: {str(e)}",
#                 "payload": {},
#             }


# class DeleteMortgage(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user, mortgage_id):
#         try:
#             mortgage = DBHelper.find_one(
#                 table_name="mortgages",
#                 filters={"id": mortgage_id, "user_id": uid, "is_active": 1},
#                 select_fields=[
#                     "id",
#                     "name",
#                     "meta",
#                     "amount",
#                     "interest_rate",
#                     "term",
#                     "is_active",
#                 ],
#             )
#             if not mortgage:
#                 logger.warning(
#                     f"Mortgage not found or already inactive: id={mortgage_id}, user_id={uid}"
#                 )
#                 return {
#                     "status": 0,
#                     "message": "Mortgage not found or already inactive",
#                     "payload": {},
#                 }

#             result = DBHelper.update_one(
#                 table_name="mortgages",
#                 filters={"id": mortgage_id, "user_id": uid},
#                 updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
#                 return_fields=[
#                     "id",
#                     "name",
#                     "meta",
#                     "amount",
#                     "interest_rate",
#                     "term",
#                     "is_active",
#                 ],
#             )
#             if result:
#                 logger.info(
#                     f"Mortgage deactivated successfully: id={mortgage_id}, is_active={result['is_active']}"
#                 )
#                 return {
#                     "status": 1,
#                     "message": "Mortgage Deactivated Successfully",
#                     "payload": {
#                         "loans": [
#                             {
#                                 "id": str(result["id"]),
#                                 "name": result["name"],
#                                 "meta": result["meta"],
#                                 "amount": float(result["amount"]),
#                                 "interestRate": float(result["interest_rate"]),
#                                 "term": result["term"],
#                                 "is_active": result["is_active"],
#                             }
#                         ]
#                     },
#                 }
#             else:
#                 logger.warning(
#                     f"Failed to deactivate mortgage: id={mortgage_id}, user_id={uid}"
#                 )
#                 return {
#                     "status": 0,
#                     "message": "Failed to deactivate mortgage",
#                     "payload": {},
#                 }
#         except Exception as e:
#             logger.error(
#                 f"Error deactivating mortgage: id={mortgage_id}, error={str(e)}"
#             )
#             return {
#                 "status": 0,
#                 "message": f"Error deactivating mortgage: {str(e)}",
#                 "payload": {},
#             }


# def uniqueId(digit=15, isNum=True):
#     if isNum:
#         return "".join(random.choices(string.digits, k=digit))
#     else:
#         return "".join(random.choices(string.ascii_letters + string.digits, k=digit))


# class AddPlannerNotes(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         data = request.get_json(silent=True)

#         if not data.get("title"):
#             return {"status": 0, "message": "Title is required", "payload": {}}

#         note = {
#             "id": uniqueId(digit=15, isNum=True),
#             "user_id": uid,
#             "title": data.get("title", ""),
#             "description": data.get("description", ""),
#             "date": data.get("date") or date.today().isoformat(),
#             "status": "Yet to Start",
#         }

#         DBHelper.insert("notes", return_column="id", **note)

#         return {
#             "status": 1,
#             "message": "Note added successfully",
#             "payload": note,
#         }


# class GetPlannerNotes(Resource):
#     @auth_required(isOptional=True)
#     def get(self, uid, user):
#         notes = DBHelper.find_all(
#             "notes",
#             {"user_id": uid},
#             select_fields=[
#                 "id",
#                 "title",
#                 "description",
#                 "date",
#                 "status",
#                 "created_at",
#                 "updated_at",
#             ],
#         )

#         # Convert `date`, `created_at`, and `updated_at` to string
#         for note in notes:
#             if isinstance(note.get("date"), (datetime, date)):
#                 note["date"] = note["date"].isoformat()
#             if isinstance(note.get("created_at"), datetime):
#                 note["created_at"] = note["created_at"].isoformat()
#             if isinstance(note.get("updated_at"), datetime):
#                 note["updated_at"] = note["updated_at"].isoformat()

#         return {"status": 1, "payload": notes}


# class UpdatePlannerNotes(Resource):
#     @auth_required(isOptional=True)
#     def put(self, uid, user):
#         data = request.get_json(silent=True)
#         note_id = data.get("id")

#         if not note_id:
#             return {"status": 0, "message": "Note ID is required", "payload": {}}

#         update_data = {}
#         for field in ["title", "description", "date", "status"]:
#             if data.get(field) is not None:
#                 update_data[field] = data.get(field)

#         if not update_data:
#             return {"status": 0, "message": "No fields to update", "payload": {}}

#         success = DBHelper.update_one(
#             "notes", {"id": note_id, "user_id": uid}, update_data
#         )

#         if success:
#             return {"status": 1, "message": "Note updated successfully"}
#         else:
#             return {"status": 0, "message": "Note not found or update failed"}


# class DeletePlannerNotes(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user):
#         note_id = request.args.get("id")

#         if not note_id:
#             return {"status": 0, "message": "Note ID is required", "payload": {}}

#         try:
#             DBHelper.delete_all("notes", {"id": note_id, "user_id": uid})
#             return {"status": 1, "message": "Note deleted successfully"}
#         except Exception as e:
#             return {"status": 0, "message": "Failed to delete note", "error": str(e)}


from flask import request
from flask_restful import Resource
import logging
from datetime import datetime, date
from root.files.models import DriveBaseResource
from root.utilis import ensure_drive_folder_structure
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
import random
import string


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AddMaintenanceTask(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        name = input_data.get("name", "").strip()
        date = input_data.get("date", "").strip()
        if not name or not date:
            return {"status": 0, "message": "Name and date are required", "payload": {}}

        task_data = {
            "user_id": uid,
            "name": name,
            "date": date,  # Expect YYYY-MM-DD
            "completed": False,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        try:
            inserted_id = DBHelper.insert(
                "home_maintenance", return_column="id", **task_data
            )
            task_data["id"] = inserted_id
            return {
                "status": 1,
                "message": "Maintenance Task Added Successfully",
                "payload": {"task": task_data},
            }
        except Exception as e:
            logger.error(f"Error adding maintenance task: {str(e)}")
            return {
                "status": 0,
                "message": f"Error adding maintenance task: {str(e)}",
                "payload": {},
            }


class GetMaintenanceTasks(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            tasks = DBHelper.find_all(
                table_name="home_maintenance",
                filters={"user_id": uid},
                select_fields=[
                    "id",
                    "name",
                    "date",
                    "completed",
                    "created_at",
                    "updated_at",
                ],
            )
            user_tasks = [
                {
                    "id": str(task["id"]),
                    "name": task["name"],
                    "date": (
                        task["date"].strftime("%Y-%m-%d") if task["date"] else "No Date"
                    ),
                    "completed": task["completed"],
                    "created_at": (
                        task["created_at"].isoformat() if task["created_at"] else None
                    ),
                    "updated_at": (
                        task["updated_at"].isoformat() if task["updated_at"] else None
                    ),
                }
                for task in tasks
            ]
            return {
                "status": 1,
                "message": "Maintenance Tasks fetched successfully",
                "payload": {"tasks": user_tasks},
            }
        except Exception as e:
            logger.error(f"Error fetching maintenance tasks: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching maintenance tasks: {str(e)}",
                "payload": {},
            }


class UpdateMaintenanceTask(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, task_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "name" in input_data and input_data["name"].strip():
            updates["name"] = input_data["name"].strip()
        if "date" in input_data and input_data["date"].strip():
            updates["date"] = input_data["date"]
        if "completed" in input_data:
            updates["completed"] = input_data["completed"]
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="home_maintenance",
                filters={"id": int(task_id), "user_id": uid},
                updates=updates,
                return_fields=[
                    "id",
                    "name",
                    "date",
                    "completed",
                    "created_at",
                    "updated_at",
                ],
            )
            if result:
                updated_task = {
                    "id": str(result["id"]),
                    "name": result["name"],
                    "date": (
                        result["date"].strftime("%Y-%m-%d")
                        if result["date"]
                        else "No Date"
                    ),
                    "completed": result["completed"],
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"]
                        else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"]
                        else None
                    ),
                }
                return {
                    "status": 1,
                    "message": "Maintenance Task Updated Successfully",
                    "payload": {"task": updated_task},
                }
            else:
                return {
                    "status": 0,
                    "message": "Task not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            logger.error(f"Error updating maintenance task: {str(e)}")
            return {
                "status": 0,
                "message": f"Error updating maintenance task: {str(e)}",
                "payload": {},
            }


class DeleteMaintenanceTask(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, task_id):
        try:
            task = DBHelper.find_one(
                table_name="home_maintenance",
                filters={"id": int(task_id), "user_id": uid},
                select_fields=["id"],
            )
            if not task:
                return {
                    "status": 0,
                    "message": "Task not found or not authorized",
                    "payload": {},
                }

            DBHelper.delete_all(
                table_name="home_maintenance",
                filters={"id": int(task_id), "user_id": uid},
            )
            return {
                "status": 1,
                "message": "Maintenance Task Deleted Successfully",
                "payload": {},
            }
        except Exception as e:
            logger.error(f"Error deleting maintenance task: {str(e)}")
            return {
                "status": 0,
                "message": f"Error deleting maintenance task: {str(e)}",
                "payload": {},
            }


class DeleteAllMaintenanceTasks(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        try:
            DBHelper.delete_all(
                table_name="home_maintenance",
                filters={"user_id": uid},
            )
            return {
                "status": 1,
                "message": "All Maintenance Tasks Deleted Successfully",
                "payload": {},
            }
        except Exception as e:
            logger.error(f"Error deleting all maintenance tasks: {str(e)}")
            return {
                "status": 0,
                "message": f"Error deleting all maintenance tasks: {str(e)}",
                "payload": {},
            }


class AddUtility(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        type = input_data.get("type", "").strip()
        account_number = input_data.get("accountNumber", "").strip()
        monthly_cost = input_data.get("monthlyCost")
        provider_url = input_data.get("providerUrl", "").strip()

        if not type or not account_number or not monthly_cost or not provider_url:
            return {
                "status": 0,
                "message": "Type, account number, monthly cost, and provider URL are required",
                "payload": {},
            }

        try:
            monthly_cost = float(monthly_cost)
            if monthly_cost < 0:
                return {
                    "status": 0,
                    "message": "Monthly cost must be non-negative",
                    "payload": {},
                }
        except (ValueError, TypeError):
            return {
                "status": 0,
                "message": "Invalid monthly cost format",
                "payload": {},
            }

        utility_data = {
            "user_id": uid,
            "type": type,
            "account_number": account_number,
            "monthly_cost": monthly_cost,
            "provider_url": provider_url,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": 1,
        }

        try:
            inserted_id = DBHelper.insert(
                "utility", return_column="utid", **utility_data
            )
            utility_data["utid"] = inserted_id
            return {
                "status": 1,
                "message": "Utility Added Successfully",
                "payload": {"utility": utility_data},
            }
        except Exception as e:
            logger.error(f"Error adding utility: {str(e)}")
            return {
                "status": 0,
                "message": f"Error adding utility: {str(e)}",
                "payload": {},
            }


class GetUtilities(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            utilities = DBHelper.find_all(
                table_name="utility",
                filters={"user_id": uid},
                select_fields=[
                    "utid",
                    "type",
                    "account_number",
                    "monthly_cost",
                    "provider_url",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            user_utilities = [
                {
                    "id": str(utility["utid"]),
                    "type": utility["type"],
                    "accountNumber": utility["account_number"],
                    "monthlyCost": float(utility["monthly_cost"]),
                    "providerUrl": utility["provider_url"],
                    "created_at": (
                        utility["created_at"].isoformat()
                        if utility["created_at"]
                        else None
                    ),
                    "updated_at": (
                        utility["updated_at"].isoformat()
                        if utility["updated_at"]
                        else None
                    ),
                    "is_active": utility["is_active"],
                }
                for utility in utilities
            ]
            return {
                "status": 1,
                "message": "Utilities fetched successfully",
                "payload": {"utilities": user_utilities},
            }
        except Exception as e:
            logger.error(f"Error fetching utilities: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching utilities: {str(e)}",
                "payload": {},
            }


class UpdateUtility(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, utility_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "type" in input_data and input_data["type"].strip():
            updates["type"] = input_data["type"].strip()
        if "accountNumber" in input_data and input_data["accountNumber"].strip():
            updates["account_number"] = input_data["accountNumber"].strip()
        if "monthlyCost" in input_data:
            try:
                monthly_cost = float(input_data["monthlyCost"])
                if monthly_cost < 0:
                    return {
                        "status": 0,
                        "message": "Monthly cost must be non-negative",
                        "payload": {},
                    }
                updates["monthly_cost"] = monthly_cost
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid monthly cost format",
                    "payload": {},
                }
        if "providerUrl" in input_data and input_data["providerUrl"].strip():
            updates["provider_url"] = input_data["providerUrl"].strip()
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="utility",
                filters={"utid": int(utility_id), "user_id": uid, "is_active": 1},
                updates=updates,
                return_fields=[
                    "utid",
                    "type",
                    "account_number",
                    "monthly_cost",
                    "provider_url",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if result:
                updated_utility = {
                    "id": str(result["utid"]),
                    "type": result["type"],
                    "accountNumber": result["account_number"],
                    "monthlyCost": float(result["monthly_cost"]),
                    "providerUrl": result["provider_url"],
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"]
                        else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"]
                        else None
                    ),
                    "is_active": result["is_active"],
                }
                return {
                    "status": 1,
                    "message": "Utility Updated Successfully",
                    "payload": {"utility": updated_utility},
                }
            else:
                return {
                    "status": 0,
                    "message": "Utility not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            logger.error(f"Error updating utility: {str(e)}")
            return {
                "status": 0,
                "message": f"Error updating utility: {str(e)}",
                "payload": {},
            }


class DeleteUtility(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, utility_id):
        try:
            logger.info(
                f"Attempting to deactivate utility with utid: {utility_id}, user_id: {uid}"
            )
            utility = DBHelper.find_one(
                table_name="utility",
                filters={"utid": int(utility_id), "user_id": uid, "is_active": 1},
                select_fields=[
                    "utid",
                    "type",
                    "account_number",
                    "monthly_cost",
                    "provider_url",
                    "is_active",
                ],
            )
            if not utility:
                logger.warning(
                    f"Utility not found or already inactive: utid={utility_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Utility not found or already inactive",
                    "payload": {},
                }

            result = DBHelper.update_one(
                table_name="utility",
                filters={"utid": int(utility_id), "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
                return_fields=[
                    "utid",
                    "type",
                    "account_number",
                    "monthly_cost",
                    "provider_url",
                    "is_active",
                ],
            )
            if result:
                logger.info(
                    f"Utility deactivated successfully: utid={utility_id}, is_active={result['is_active']}"
                )
                return {
                    "status": 1,
                    "message": "Utility Deactivated Successfully",
                    "payload": {
                        "utility": {
                            "utid": str(result["utid"]),
                            "type": result["type"],
                            "account_number": result["account_number"],
                            "monthly_cost": float(result["monthly_cost"]),
                            "provider_url": result["provider_url"],
                            "is_active": result["is_active"],
                        }
                    },
                }
            else:
                logger.warning(
                    f"Failed to deactivate utility: utid={utility_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Failed to deactivate utility",
                    "payload": {},
                }
        except Exception as e:
            logger.error(
                f"Error deactivating utility: utid={utility_id}, error={str(e)}"
            )
            return {
                "status": 0,
                "message": f"Error deactivating utility: {str(e)}",
                "payload": {},
            }


class AddInsurance(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        name = input_data.get("name", "").strip()
        meta = input_data.get("meta", "").strip()
        type = input_data.get("type", "").strip()
        years = input_data.get("years")
        payment = input_data.get("payment")
        renewal_date = input_data.get("renewalDate")

        if not name or not meta or not type or years is None or payment is None:
            return {
                "status": 0,
                "message": "Name, policy number, type, years, and payment are required",
                "payload": {},
            }

        try:
            years = int(years)
            if years <= 0:
                return {
                    "status": 0,
                    "message": "Years must be a positive integer",
                    "payload": {},
                }
        except (ValueError, TypeError):
            return {"status": 0, "message": "Invalid years format", "payload": {}}

        try:
            payment = float(payment)
            if payment < 0:
                return {
                    "status": 0,
                    "message": "Payment must be non-negative",
                    "payload": {},
                }
        except (ValueError, TypeError):
            return {"status": 0, "message": "Invalid payment format", "payload": {}}

        if renewal_date:
            try:
                # Validate date format (YYYY-MM-DD)
                datetime.strptime(renewal_date, "%Y-%m-%d")
            except ValueError:
                return {
                    "status": 0,
                    "message": "Invalid renewal date format (use YYYY-MM-DD)",
                    "payload": {},
                }

        insurance_data = {
            "id": str(datetime.now().timestamp()),  # Generate unique ID
            "user_id": uid,
            "name": name,
            "meta": meta,
            "type": type,
            "years": years,
            "payment": payment,
            "renewal_date": renewal_date,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        try:
            DBHelper.insert("insurance", return_column="id", **insurance_data)
            return {
                "status": 1,
                "message": "Insurance Policy Added Successfully",
                "payload": {
                    "insurance": {
                        "id": insurance_data["id"],
                        "name": insurance_data["name"],
                        "meta": insurance_data["meta"],
                        "type": insurance_data["type"],
                        "years": insurance_data["years"],
                        "payment": insurance_data["payment"],
                        "renewalDate": insurance_data["renewal_date"],
                    }
                },
            }
        except Exception as e:
            logger.error(f"Error adding insurance: {str(e)}")
            return {
                "status": 0,
                "message": f"Error adding insurance: {str(e)}",
                "payload": {},
            }


class GetInsurance(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            insurances = DBHelper.find_all(
                table_name="insurance",
                filters={"user_id": uid},
                select_fields=[
                    "id",
                    "name",
                    "meta",
                    "type",
                    "years",
                    "payment",
                    "renewal_date",
                    "created_at",
                    "updated_at",
                ],
            )
            user_insurances = [
                {
                    "id": str(insurance["id"]),
                    "name": insurance["name"],
                    "meta": insurance["meta"],
                    "type": insurance["type"],
                    "years": insurance["years"],
                    "payment": float(insurance["payment"]),
                    "renewalDate": (
                        insurance["renewal_date"].strftime("%Y-%m-%d")
                        if insurance["renewal_date"]
                        else None
                    ),
                    "created_at": (
                        insurance["created_at"].isoformat()
                        if insurance["created_at"]
                        else None
                    ),
                    "updated_at": (
                        insurance["updated_at"].isoformat()
                        if insurance["updated_at"]
                        else None
                    ),
                }
                for insurance in insurances
            ]
            return {
                "status": 1,
                "message": "Insurance Policies fetched successfully",
                "payload": {"insurances": user_insurances},
            }
        except Exception as e:
            logger.error(f"Error fetching insurance policies: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching insurance policies: {str(e)}",
                "payload": {},
            }


class UpdateInsurance(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, insurance_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "name" in input_data and input_data["name"].strip():
            updates["name"] = input_data["name"].strip()
        if "meta" in input_data and input_data["meta"].strip():
            updates["meta"] = input_data["meta"].strip()
        if "type" in input_data and input_data["type"].strip():
            updates["type"] = input_data["type"].strip()
        if "years" in input_data:
            try:
                years = int(input_data["years"])
                if years <= 0:
                    return {
                        "status": 0,
                        "message": "Years must be a positive integer",
                        "payload": {},
                    }
                updates["years"] = years
            except (ValueError, TypeError):
                return {"status": 0, "message": "Invalid years format", "payload": {}}
        if "payment" in input_data:
            try:
                payment = float(input_data["payment"])
                if payment < 0:
                    return {
                        "status": 0,
                        "message": "Payment must be non-negative",
                        "payload": {},
                    }
                updates["payment"] = payment
            except (ValueError, TypeError):
                return {"status": 0, "message": "Invalid payment format", "payload": {}}
        if "renewalDate" in input_data and input_data["renewalDate"]:
            try:
                datetime.strptime(input_data["renewalDate"], "%Y-%m-%d")
                updates["renewal_date"] = input_data["renewalDate"]
            except ValueError:
                return {
                    "status": 0,
                    "message": "Invalid renewal date format (use YYYY-MM-DD)",
                    "payload": {},
                }
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="insurance",
                filters={"id": insurance_id, "user_id": uid, "is_active": 1},
                updates=updates,
                return_fields=[
                    "id",
                    "name",
                    "meta",
                    "type",
                    "years",
                    "payment",
                    "renewal_date",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if result:
                updated_insurance = {
                    "id": str(result["id"]),
                    "name": result["name"],
                    "meta": result["meta"],
                    "type": result["type"],
                    "years": result["years"],
                    "payment": float(result["payment"]),
                    "renewalDate": (
                        result["renewal_date"].strftime("%Y-%m-%d")
                        if result["renewal_date"]
                        else None
                    ),
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"]
                        else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"]
                        else None
                    ),
                    "is_active": result["is_active"],
                }
                return {
                    "status": 1,
                    "message": "Insurance Policy Updated Successfully",
                    "payload": {"insurance": updated_insurance},
                }
            else:
                return {
                    "status": 0,
                    "message": "Insurance policy not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            logger.error(f"Error updating insurance policy: {str(e)}")
            return {
                "status": 0,
                "message": f"Error updating insurance policy: {str(e)}",
                "payload": {},
            }


class DeleteInsurance(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, insurance_id):
        try:
            logger.info(
                f"Attempting to deactivate insurance with id: {insurance_id}, user_id: {uid}"
            )
            insurance = DBHelper.find_one(
                table_name="insurance",
                filters={"id": insurance_id, "user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "name",
                    "meta",
                    "type",
                    "years",
                    "payment",
                    "renewal_date",
                    "is_active",
                ],
            )
            if not insurance:
                logger.warning(
                    f"Insurance not found or already inactive: id={insurance_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Insurance policy not found or already inactive",
                    "payload": {},
                }

            result = DBHelper.update_one(
                table_name="insurance",
                filters={"id": insurance_id, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
                return_fields=[
                    "id",
                    "name",
                    "meta",
                    "type",
                    "years",
                    "payment",
                    "renewal_date",
                    "is_active",
                ],
            )
            if result:
                logger.info(
                    f"Insurance deactivated successfully: id={insurance_id}, is_active={result['is_active']}"
                )
                return {
                    "status": 1,
                    "message": "Insurance Policy Deactivated Successfully",
                    "payload": {
                        "insurance": {
                            "id": str(result["id"]),
                            "name": result["name"],
                            "meta": result["meta"],
                            "type": result["type"],
                            "years": result["years"],
                            "payment": float(result["payment"]),
                            "renewalDate": (
                                result["renewal_date"].strftime("%Y-%m-%d")
                                if result["renewal_date"]
                                else None
                            ),
                            "is_active": result["is_active"],
                        }
                    },
                }
            else:
                logger.warning(
                    f"Failed to deactivate insurance: id={insurance_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Failed to deactivate insurance policy",
                    "payload": {},
                }
        except Exception as e:
            logger.error(
                f"Error deactivating insurance: id={insurance_id}, error={str(e)}"
            )
            return {
                "status": 0,
                "message": f"Error deactivating insurance: {str(e)}",
                "payload": {},
            }


class AddProperty(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        address = input_data.get("address", "").strip()
        purchase_date = input_data.get("purchaseDate", "").strip()
        purchase_price = input_data.get("purchasePrice")
        square_footage = input_data.get("squareFootage", "").strip()
        lot_size = input_data.get("lotSize", "").strip()
        property_tax_id = input_data.get("propertyTaxId", "").strip()

        if (
            not address
            or not purchase_date
            or not purchase_price
            or not square_footage
            or not lot_size
            or not property_tax_id
        ):
            return {"status": 0, "message": "All fields are required", "payload": {}}

        try:
            if isinstance(purchase_price, str):
                purchase_price = float(purchase_price.replace("$", "").replace(",", ""))
            else:
                purchase_price = float(purchase_price)
            if purchase_price < 0:
                return {
                    "status": 0,
                    "message": "Purchase price must be non-negative",
                    "payload": {},
                }
        except (ValueError, TypeError, AttributeError):
            return {
                "status": 0,
                "message": "Invalid purchase price format",
                "payload": {},
            }

        try:
            datetime.strptime(purchase_date, "%Y-%m-%d")
        except ValueError:
            return {
                "status": 0,
                "message": "Invalid purchase date format (use YYYY-MM-DD)",
                "payload": {},
            }

        # Generate a unique pid
        property_data = {
            "pid": str(datetime.now().timestamp()),  # Generate unique pid
            "user_id": uid,
            "address": address,
            "purchase_date": purchase_date,
            "purchase_price": purchase_price,
            "square_footage": square_footage,
            "lot_size": lot_size,
            "property_tax_id": property_tax_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": 1,
        }

        try:
            inserted_id = DBHelper.insert(
                "property_information", return_column="pid", **property_data
            )
            property_data["pid"] = (
                inserted_id if inserted_id else property_data["pid"]
            )  # Use inserted_id if provided, else keep generated pid
            return {
                "status": 1,
                "message": "Property Added Successfully",
                "payload": {"property": property_data},
            }
        except Exception as e:
            logger.error(f"Error adding property: {str(e)}")
            return {
                "status": 0,
                "message": f"Error adding property: {str(e)}",
                "payload": {},
            }


class GetProperties(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            properties = DBHelper.find_all(
                table_name="property_information",
                filters={"user_id": uid, "is_active": 1},
                select_fields=[
                    "pid",
                    "address",
                    "purchase_date",
                    "purchase_price",
                    "square_footage",
                    "lot_size",
                    "property_tax_id",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            # logger.info(f"Fetched properties for user_id {uid}: {properties}")  # Debug log
            user_properties = [
                {
                    "id": str(property["pid"]),
                    "address": property["address"] or "N/A",
                    "purchaseDate": (
                        property["purchase_date"].strftime("%Y-%m-%d")
                        if property["purchase_date"]
                        else "N/A"
                    ),
                    "purchasePrice": (
                        float(property["purchase_price"])
                        if property["purchase_price"] is not None
                        else 0.0
                    ),
                    "squareFootage": property["square_footage"] or "N/A",
                    "lotSize": property["lot_size"] or "N/A",
                    "propertyTaxId": property["property_tax_id"] or "N/A",
                    "created_at": (
                        property["created_at"].isoformat()
                        if property["created_at"]
                        else None
                    ),
                    "updated_at": (
                        property["updated_at"].isoformat()
                        if property["updated_at"]
                        else None
                    ),
                    "is_active": property["is_active"],
                }
                for property in properties
            ]
            return {
                "status": 1,
                "message": "Properties fetched successfully",
                "payload": {"properties": user_properties},
            }
        except Exception as e:
            logger.error(f"Error fetching properties for user_id {uid}: {str()}")
            # return {
            #     "status": 0,
            #     "message": f"Error fetching properties: {str(e)}",
            #     "payload": {}
            # }


class UpdateProperty(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, property_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "address" in input_data and input_data["address"].strip():
            updates["address"] = input_data["address"].strip()
        if "purchaseDate" in input_data and input_data["purchaseDate"].strip():
            try:
                datetime.strptime(input_data["purchaseDate"], "%Y-%m-%d")
                updates["purchase_date"] = input_data["purchaseDate"]
            except ValueError:
                return {
                    "status": 0,
                    "message": "Invalid purchase date format (use YYYY-MM-DD)",
                    "payload": {},
                }
        if "purchasePrice" in input_data:
            try:
                purchase_price = input_data["purchasePrice"]
                if isinstance(purchase_price, str):
                    purchase_price = float(
                        purchase_price.replace("$", "").replace(",", "")
                    )
                else:
                    purchase_price = float(purchase_price)
                if purchase_price < 0:
                    return {
                        "status": 0,
                        "message": "Purchase price must be non-negative",
                        "payload": {},
                    }
                updates["purchase_price"] = purchase_price
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid purchase price format",
                    "payload": {},
                }
        if "squareFootage" in input_data and input_data["squareFootage"].strip():
            updates["square_footage"] = input_data["squareFootage"].strip()
        if "lotSize" in input_data and input_data["lotSize"].strip():
            updates["lot_size"] = input_data["lotSize"].strip()
        if "propertyTaxId" in input_data and input_data["propertyTaxId"].strip():
            updates["property_tax_id"] = input_data["propertyTaxId"].strip()
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            logger.info(
                f"Updating property with pid {property_id} for user_id {uid}: {updates}"
            )  # Debug log
            result = DBHelper.update_one(
                table_name="property_information",
                filters={"pid": property_id, "user_id": uid, "is_active": 1},
                updates=updates,
                return_fields=[
                    "pid",
                    "address",
                    "purchase_date",
                    "purchase_price",
                    "square_footage",
                    "lot_size",
                    "property_tax_id",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if result:
                logger.info(f"Updated property result: {result}")  # Debug log
                updated_property = {
                    "id": str(result["pid"]),
                    "address": result["address"] or "N/A",
                    "purchaseDate": (
                        result["purchase_date"].strftime("%Y-%m-%d")
                        if result["purchase_date"]
                        else "N/A"
                    ),
                    "purchasePrice": (
                        float(result["purchase_price"])
                        if result["purchase_price"] is not None
                        else 0.0
                    ),
                    "squareFootage": result["square_footage"] or "N/A",
                    "lotSize": result["lot_size"] or "N/A",
                    "propertyTaxId": result["property_tax_id"] or "N/A",
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"]
                        else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"]
                        else None
                    ),
                    "is_active": result["is_active"],
                }
                return {
                    "status": 1,
                    "message": "Property Updated Successfully",
                    "payload": {"property": updated_property},
                }
            else:
                logger.warning(
                    f"Property not found or not authorized: pid={property_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Property not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            logger.error(f"Error updating property with pid {property_id}: {str(e)}")
            return {
                "status": 0,
                "message": f"Error updating property: {str(e)}",
                "payload": {},
            }


class AddMortgage(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        name = input_data.get("name", "").strip()
        meta = input_data.get("meta", "").strip()
        amount = input_data.get("amount")
        interest_rate = input_data.get("interestRate")
        term = input_data.get("term")

        if not all(
            [
                name,
                meta,
                amount is not None,
                interest_rate is not None,
                term is not None,
            ]
        ):
            return {
                "status": 0,
                "message": "Name, meta, amount, interest rate, and term are required",
                "payload": {},
            }

        try:
            amount = float(amount)
            interest_rate = float(interest_rate)
            term = int(term)
            if amount < 0 or interest_rate < 0 or term <= 0:
                return {
                    "status": 0,
                    "message": "Amount and interest rate must be non-negative, term must be positive",
                    "payload": {},
                }
        except (ValueError, TypeError):
            return {
                "status": 0,
                "message": "Invalid format for amount, interest rate, or term",
                "payload": {},
            }

        mortgage_data = {
            "id": str(datetime.now().timestamp()),
            "user_id": uid,
            "name": name,
            "meta": meta,
            "amount": amount,
            "interest_rate": interest_rate,
            "term": term,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": 1,
        }

        try:
            inserted_id = DBHelper.insert(
                "mortgages", return_column="id", **mortgage_data
            )
            mortgage_data["id"] = inserted_id if inserted_id else mortgage_data["id"]
            return {
                "status": 1,
                "message": "Mortgage Added Successfully",
                "payload": {"loans": [mortgage_data]},
            }
        except Exception as e:
            logger.error(f"Error adding mortgage: {str(e)}")
            return {
                "status": 0,
                "message": f"Error adding mortgage: {str(e)}",
                "payload": {},
            }


class GetMortgages(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            mortgages = DBHelper.find_all(
                table_name="mortgages",
                filters={"user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "name",
                    "meta",
                    "amount",
                    "interest_rate",
                    "term",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            user_mortgages = [
                {
                    "id": str(mortgage["id"]),
                    "name": mortgage["name"],
                    "meta": mortgage["meta"],
                    "amount": float(mortgage["amount"]),
                    "interestRate": float(mortgage["interest_rate"]),
                    "term": mortgage["term"],
                    "created_at": (
                        mortgage["created_at"].isoformat()
                        if mortgage["created_at"]
                        else None
                    ),
                    "updated_at": (
                        mortgage["updated_at"].isoformat()
                        if mortgage["updated_at"]
                        else None
                    ),
                    "is_active": mortgage["is_active"],
                }
                for mortgage in mortgages
            ]
            return {
                "status": 1,
                "message": "Mortgages fetched successfully",
                "payload": {"loans": user_mortgages},
            }
        except Exception as e:
            logger.error(f"Error fetching mortgages: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching mortgages: {str(e)}",
                "payload": {},
            }


class UpdateMortgage(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, mortgage_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "name" in input_data and input_data["name"].strip():
            updates["name"] = input_data["name"].strip()
        if "meta" in input_data and input_data["meta"].strip():
            updates["meta"] = input_data["meta"].strip()
        if "amount" in input_data:
            try:
                amount = float(input_data["amount"])
                if amount < 0:
                    return {
                        "status": 0,
                        "message": "Amount must be non-negative",
                        "payload": {},
                    }
                updates["amount"] = amount
            except (ValueError, TypeError):
                return {"status": 0, "message": "Invalid amount format", "payload": {}}
        if "interestRate" in input_data:
            try:
                interest_rate = float(input_data["interestRate"])
                if interest_rate < 0:
                    return {
                        "status": 0,
                        "message": "Interest rate must be non-negative",
                        "payload": {},
                    }
                updates["interest_rate"] = interest_rate
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid interest rate format",
                    "payload": {},
                }
        if "term" in input_data:
            try:
                term = int(input_data["term"])
                if term <= 0:
                    return {
                        "status": 0,
                        "message": "Term must be a positive integer",
                        "payload": {},
                    }
                updates["term"] = term
            except (ValueError, TypeError):
                return {"status": 0, "message": "Invalid term format", "payload": {}}
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="mortgages",
                filters={"id": mortgage_id, "user_id": uid, "is_active": 1},
                updates=updates,
                return_fields=[
                    "id",
                    "name",
                    "meta",
                    "amount",
                    "interest_rate",
                    "term",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if result:
                updated_mortgage = {
                    "id": str(result["id"]),
                    "name": result["name"],
                    "meta": result["meta"],
                    "amount": float(result["amount"]),
                    "interestRate": float(result["interest_rate"]),
                    "term": result["term"],
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"]
                        else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"]
                        else None
                    ),
                    "is_active": result["is_active"],
                }
                return {
                    "status": 1,
                    "message": "Mortgage Updated Successfully",
                    "payload": {"loans": [updated_mortgage]},
                }
            else:
                return {
                    "status": 0,
                    "message": "Mortgage not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            logger.error(f"Error updating mortgage: {str(e)}")
            return {
                "status": 0,
                "message": f"Error updating mortgage: {str(e)}",
                "payload": {},
            }


class DeleteMortgage(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, mortgage_id):
        try:
            mortgage = DBHelper.find_one(
                table_name="mortgages",
                filters={"id": mortgage_id, "user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "name",
                    "meta",
                    "amount",
                    "interest_rate",
                    "term",
                    "is_active",
                ],
            )
            if not mortgage:
                logger.warning(
                    f"Mortgage not found or already inactive: id={mortgage_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Mortgage not found or already inactive",
                    "payload": {},
                }

            result = DBHelper.update_one(
                table_name="mortgages",
                filters={"id": mortgage_id, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
                return_fields=[
                    "id",
                    "name",
                    "meta",
                    "amount",
                    "interest_rate",
                    "term",
                    "is_active",
                ],
            )
            if result:
                logger.info(
                    f"Mortgage deactivated successfully: id={mortgage_id}, is_active={result['is_active']}"
                )
                return {
                    "status": 1,
                    "message": "Mortgage Deactivated Successfully",
                    "payload": {
                        "loans": [
                            {
                                "id": str(result["id"]),
                                "name": result["name"],
                                "meta": result["meta"],
                                "amount": float(result["amount"]),
                                "interestRate": float(result["interest_rate"]),
                                "term": result["term"],
                                "is_active": result["is_active"],
                            }
                        ]
                    },
                }
            else:
                logger.warning(
                    f"Failed to deactivate mortgage: id={mortgage_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Failed to deactivate mortgage",
                    "payload": {},
                }
        except Exception as e:
            logger.error(
                f"Error deactivating mortgage: id={mortgage_id}, error={str(e)}"
            )
            return {
                "status": 0,
                "message": f"Error deactivating mortgage: {str(e)}",
                "payload": {},
            }


def uniqueId(digit=15, isNum=True):
    if isNum:
        return "".join(random.choices(string.digits, k=digit))
    else:
        return "".join(random.choices(string.ascii_letters + string.digits, k=digit))


class AddPlannerNotes(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)

        if not data.get("title"):
            return {"status": 0, "message": "Title is required", "payload": {}}

        note = {
            "id": uniqueId(digit=15, isNum=True),
            "user_id": uid,
            "title": data.get("title", ""),
            "description": data.get("description", ""),
            "date": data.get("date") or date.today().isoformat(),
            "status": "Yet to Start",
        }

        DBHelper.insert("notes", return_column="id", **note)

        return {
            "status": 1,
            "message": "Note added successfully",
            "payload": note,
        }


class GetPlannerNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        notes = DBHelper.find_all(
            "notes",
            {"user_id": uid},
            select_fields=[
                "id",
                "title",
                "description",
                "date",
                "status",
                "created_at",
                "updated_at",
            ],
        )

        # Convert `date`, `created_at`, and `updated_at` to string
        for note in notes:
            if isinstance(note.get("date"), (datetime, date)):
                note["date"] = note["date"].isoformat()
            if isinstance(note.get("created_at"), datetime):
                note["created_at"] = note["created_at"].isoformat()
            if isinstance(note.get("updated_at"), datetime):
                note["updated_at"] = note["updated_at"].isoformat()

        return {"status": 1, "payload": notes}


class UpdatePlannerNotes(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        data = request.get_json(silent=True)
        note_id = data.get("id")

        if not note_id:
            return {"status": 0, "message": "Note ID is required", "payload": {}}

        update_data = {}
        for field in ["title", "description", "date", "status"]:
            if data.get(field) is not None:
                update_data[field] = data.get(field)

        if not update_data:
            return {"status": 0, "message": "No fields to update", "payload": {}}

        success = DBHelper.update_one(
            "notes", {"id": note_id, "user_id": uid}, update_data
        )

        if success:
            return {"status": 1, "message": "Note updated successfully"}
        else:
            return {"status": 0, "message": "Note not found or update failed"}


class DeletePlannerNotes(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        note_id = request.args.get("id")

        if not note_id:
            return {"status": 0, "message": "Note ID is required", "payload": {}}

        try:
            DBHelper.delete_all("notes", {"id": note_id, "user_id": uid})
            return {"status": 1, "message": "Note deleted successfully"}
        except Exception as e:
            return {"status": 0, "message": "Failed to delete note", "error": str(e)}


# from flask import request
# import requests
# from flask_restful import Resource
# import os

# class GeoapifyAutocomplete(Resource):
#     def get(self):
#         query = request.args.get("text")
#         if not query:
#             return {"status": 0, "message": "Missing query text"}, 400

#         api_key = os.environ.get("GEOAPIFY_API_KEY")
#         if not api_key:
#             return {"status": 0, "message": "Geoapify API key not configured"}, 500

#         url = f"https://api.geoapify.com/v1/geocode/autocomplete?text={query}&apiKey={api_key}"
#         try:
#             res = requests.get(url)
#             return res.json()
#         except Exception as e:
#             return {"status": 0, "message": "Request failed", "error": str(e)}, 500

from werkzeug.utils import secure_filename
from googleapiclient.http import MediaIoBaseUpload
import io


class UploadHomeDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]
            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }, 401

            folder_data = ensure_drive_folder_structure(service)
            home_folder_id = folder_data["subfolders"].get("Home")

            if not home_folder_id:
                return {
                    "status": 0,
                    "message": "Home folder not found",
                    "payload": {},
                }, 404

            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [home_folder_id],
            }

            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
            )
            uploaded = (
                service.files()
                .create(
                    body=file_metadata, media_body=media, fields="id, name, webViewLink"
                )
                .execute()
            )

            return {
                "status": 1,
                "message": "File uploaded to Home folder",
                "payload": {"file": uploaded},
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to upload file: {str(e)}"}, 500


class GetHomeDriveFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Drive not connected",
                    "payload": {},
                }, 401

            folder_data = ensure_drive_folder_structure(service)
            home_folder_id = folder_data["subfolders"].get("Home")

            if not home_folder_id:
                return {
                    "status": 0,
                    "message": "Home folder not found",
                    "payload": {},
                }, 404

            query = f"'{home_folder_id}' in parents and trashed = false"
            results = (
                service.files()
                .list(q=query, fields="files(id, name, webViewLink)", spaces="drive")
                .execute()
            )
            files = results.get("files", [])

            return {
                "status": 1,
                "message": "Files fetched",
                "payload": {"files": files},
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Fetch failed: {str(e)}"}, 500


class DeleteHomeDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        file_id = request.args.get("file_id")
        if not file_id:
            return {"status": 0, "message": "Missing file_id"}, 400

        service = self.get_drive_service(uid)
        if not service:
            return {"status": 0, "message": "Drive not connected"}, 401

        try:
            service.files().delete(fileId=file_id).execute()
            return {"status": 1, "message": "File deleted"}, 200
        except Exception as e:
            return {"status": 0, "message": f"Delete failed: {str(e)}"}, 500
