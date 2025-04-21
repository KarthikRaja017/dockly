from root.db.db import postgres  # Import your PostgreSQL connection
from psycopg2.extras import RealDictCursor
from psycopg2 import sql
import psycopg2

class DBHelper:
    @staticmethod
    def insert(table_name, return_column="id", **kwargs):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            columns = list(kwargs.keys())
            values = list(kwargs.values())

            columns_sql = sql.SQL(', ').join(map(sql.Identifier, columns))
            placeholders = sql.SQL(', ').join(sql.Placeholder() * len(values))

            query = sql.SQL("INSERT INTO {table} ({fields}) VALUES ({values}) RETURNING {returning}").format(
                table=sql.Identifier(table_name),
                fields=columns_sql,
                values=placeholders,
                returning=sql.Identifier(return_column)
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
    def find_one(table_name, filters=None, select_fields=None):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Default: SELECT *
            if select_fields:
                columns_sql = sql.SQL(', ').join(map(sql.Identifier, select_fields))
            else:
                columns_sql = sql.SQL('*')

            where_clause = sql.SQL(' AND ').join(
                sql.Composed([sql.Identifier(k), sql.SQL(' = '), sql.Placeholder()]) for k in filters.keys()
            )

            query = sql.SQL("SELECT {fields} FROM {table} WHERE {where} LIMIT 1").format(
                fields=columns_sql,
                table=sql.Identifier(table_name),
                where=where_clause
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

