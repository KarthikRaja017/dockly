import json
from root.db.db import postgres  # Import your PostgreSQL connection
from psycopg2.extras import RealDictCursor
from psycopg2 import sql
import psycopg2


class DBHelper:
    @staticmethod
    def insert(table_name, return_column="user_id", **kwargs):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            columns = list(kwargs.keys())
            values = []

            for val in kwargs.values():
                if isinstance(val, dict):
                    values.append(json.dumps(val))  # Convert dict to JSON string
                else:
                    values.append(val)

            columns_sql = sql.SQL(", ").join(map(sql.Identifier, columns))
            placeholders = sql.SQL(", ").join(sql.Placeholder() * len(values))

            query = sql.SQL(
                "INSERT INTO {table} ({fields}) VALUES ({values}) RETURNING {returning}"
            ).format(
                table=sql.Identifier(table_name),
                fields=columns_sql,
                values=placeholders,
                returning=sql.Identifier(return_column),
            )

            cur.execute(query, values)
            result = cur.fetchone()
            conn.commit()
            return result[0] if result else None

        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def find(table_name, filters=None, select_fields=None):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            if select_fields:
                columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))
            else:
                columns_sql = sql.SQL("*")

            if filters:
                where_clause = sql.SQL(" AND ").join(
                    sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                    for k in filters.keys()
                )
                query = sql.SQL("SELECT {fields} FROM {table} WHERE {where}").format(
                    fields=columns_sql,
                    table=sql.Identifier(table_name),
                    where=where_clause,
                )
                values = list(filters.values())
            else:
                query = sql.SQL("SELECT {fields} FROM {table}").format(
                    fields=columns_sql, table=sql.Identifier(table_name)
                )
                values = []

            cur.execute(query, values)
            return cur.fetchall()

        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def find_one(table_name, filters=None, select_fields=None):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            if select_fields:
                columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))
            else:
                columns_sql = sql.SQL("*")

            where_clause = sql.SQL(" AND ").join(
                sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                for k in filters.keys()
            )

            query = sql.SQL(
                "SELECT {fields} FROM {table} WHERE {where} LIMIT 1"
            ).format(
                fields=columns_sql, table=sql.Identifier(table_name), where=where_clause
            )

            cur.execute(query, list(filters.values()))
            return cur.fetchone()

        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def update_one(table_name, filters: dict, updates: dict, return_fields=None):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            set_clause = sql.SQL(", ").join(
                sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                for k in updates.keys()
            )

            where_clause = sql.SQL(" AND ").join(
                sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                for k in filters.keys()
            )

            returning = (
                sql.SQL(", ").join(map(sql.Identifier, return_fields))
                if return_fields
                else sql.SQL("*")
            )

            query = sql.SQL(
                "UPDATE {table} SET {set_clause} WHERE {where_clause} RETURNING {returning}"
            ).format(
                table=sql.Identifier(table_name),
                set_clause=set_clause,
                where_clause=where_clause,
                returning=returning,
            )

            values = list(updates.values()) + list(filters.values())
            cur.execute(query, values)
            result = cur.fetchone()
            conn.commit()
            return result

        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def update(table_name, filters: dict, update_fields: dict):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            set_clause = ", ".join([f"{key} = %s" for key in update_fields])
            where_clause = " AND ".join([f"{key} = %s" for key in filters])
            values = list(update_fields.values()) + list(filters.values())

            query = f"""
                UPDATE {table_name}
                SET {set_clause}
                WHERE {where_clause}
            """

            cur.execute(query, values)
            conn.commit()
        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def find_all(table_name, filters=None, select_fields=None, retry=False):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            if select_fields:
                columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))
            else:
                columns_sql = sql.SQL("*")

            if filters:
                where_clause = sql.SQL(" AND ").join(
                    sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                    for k in filters.keys()
                )
                query = sql.SQL("SELECT {fields} FROM {table} WHERE {where}").format(
                    fields=columns_sql,
                    table=sql.Identifier(table_name),
                    where=where_clause,
                )
                cur.execute(query, list(filters.values()))
            else:
                query = sql.SQL("SELECT {fields} FROM {table}").format(
                    fields=columns_sql, table=sql.Identifier(table_name)
                )
                cur.execute(query)

            return cur.fetchall()

        except psycopg2.OperationalError as e:
            if not retry:
                return DBHelper.find_all(table_name, filters, select_fields, retry=True)
            raise Exception("Database connection failed after retry") from e

        except Exception as e:
            raise e

        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def find_in(table_name, select_fields, field, values):
        conn = None
        cur = None
        try:
            if not isinstance(values, list):
                values = list(values)

            if values and isinstance(values[0], list):
                values = values[0]

            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))
            query = sql.SQL(
                "SELECT {fields} FROM {table} WHERE {field} = ANY(%s)"
            ).format(
                fields=columns_sql,
                table=sql.Identifier(table_name),
                field=sql.Identifier(field),
            )
            cur.execute(query, (values,))
            return cur.fetchall()

        except Exception as e:
            print("Error in find_in:", e)
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def insert_ignore_duplicates(table_name, unique_key=None, **kwargs):
        conn = None
        cur = None
        try:
            columns = ", ".join(kwargs.keys())
            values = list(kwargs.values())
            placeholders = ", ".join(["%s"] * len(values))

            sql_query = f"""
                INSERT INTO {table_name} ({columns})
                VALUES ({placeholders})
                ON CONFLICT ({unique_key}) DO NOTHING
            """

            conn = postgres.get_connection()
            cur = conn.cursor()
            cur.execute(sql_query, values)
            conn.commit()

        except Exception as e:
            print("❌ Error in insert_ignore_duplicates:", e)
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def delete_all(table_name, filters=None):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            if filters:
                where_clause = sql.SQL(" AND ").join(
                    sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                    for k in filters.keys()
                )
                query = sql.SQL("DELETE FROM {table} WHERE {where}").format(
                    table=sql.Identifier(table_name), where=where_clause
                )
                values = list(filters.values())
            else:
                query = sql.SQL("DELETE FROM {table}").format(
                    table=sql.Identifier(table_name)
                )
                values = []

            cur.execute(query, values)
            conn.commit()
        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def find_multi(table_queries: dict, retry=False):
        conn = None
        cur = None
        results = {}
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            for table_name, query_data in table_queries.items():
                filters = query_data.get("filters")
                select_fields = query_data.get("select_fields")

                if select_fields:
                    columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))
                else:
                    columns_sql = sql.SQL("*")

                if filters:
                    where_clause = sql.SQL(" AND ").join(
                        sql.Composed(
                            [sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()]
                        )
                        for k in filters.keys()
                    )
                    query = sql.SQL(
                        "SELECT {fields} FROM {table} WHERE {where}"
                    ).format(
                        fields=columns_sql,
                        table=sql.Identifier(table_name),
                        where=where_clause,
                    )
                    cur.execute(query, list(filters.values()))
                else:
                    query = sql.SQL("SELECT {fields} FROM {table}").format(
                        fields=columns_sql,
                        table=sql.Identifier(table_name),
                    )
                    cur.execute(query)

                results[table_name] = cur.fetchall()

            return results
        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)
