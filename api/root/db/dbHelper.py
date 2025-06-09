from root.db.db import postgres  # Import your PostgreSQL connection
from psycopg2.extras import RealDictCursor
from psycopg2 import sql
import psycopg2


class DBHelper:
    @staticmethod
    def insert(table_name, return_column="uid", **kwargs):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            columns = list(kwargs.keys())
            values = list(kwargs.values())

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

            # SELECT fields or *
            if select_fields:
                columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))
            else:
                columns_sql = sql.SQL("*")

            # WHERE clause if filters provided
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

            # Default: SELECT *
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

            # SET part: column = %s
            set_clause = sql.SQL(", ").join(
                sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                for k in updates.keys()
            )

            # WHERE part
            where_clause = sql.SQL(" AND ").join(
                sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                for k in filters.keys()
            )

            # Fields to return
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
