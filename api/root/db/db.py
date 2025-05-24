import psycopg2
from psycopg2 import sql, pool
from root.config import POSTGRES_URI  # Make sure this is defined properly
import json
import os
class PostgreSQL:
    def __init__(self):
        self.connection_pool = None

    def init_app(self):
        """Initialize the PostgreSQL connection pool."""
        if not self.connection_pool:
            try:
                self.connection_pool = psycopg2.pool.SimpleConnectionPool(
                    minconn=1,
                    maxconn=10,
                    dsn=POSTGRES_URI
                )
                print(f"POSTGRES_URI: {POSTGRES_URI}")
                print("✅ Postgres connection pool created successfully.")
            except Exception as e:
                print(f"❌ Failed to create Postgres connection pool: {e}")
                self.connection_pool = None  # important to reset if failed

    def get_connection(self):
        if not self.connection_pool:
            raise Exception("Connection pool is not initialized")
        return self.connection_pool.getconn()

    def release_connection(self, conn):
        if self.connection_pool and conn:
            self.connection_pool.putconn(conn)

    def close_all_connections(self):
        if self.connection_pool:
            self.connection_pool.closeall()


# Initialize PostgreSQL object, but DO NOT connect yet
postgres = PostgreSQL()
# postgres.init_app()  # ❌ Do NOT call it immediately here!


def init_tables_from_json():
    json_path = os.path.join(os.path.dirname(__file__), 'tables.json')

    with open(json_path, 'r') as f:
        data = json.load(f)

    tables = data.get('tables', [])
    created = []
    errors = []

    conn = None
    cur = None

    try:
        # Initialize the connection pool if not already initialized
        if not postgres.connection_pool:
            postgres.init_app()

        conn = postgres.get_connection()
        cur = conn.cursor()

        for table in tables:
            table_name = table.get('table_name')
            columns = table.get('columns')

            if not table_name or not columns:
                errors.append(f"Missing data for one table: {table}")
                continue

            try:
                create_query = sql.SQL("CREATE TABLE IF NOT EXISTS {} ({});").format(
                    sql.Identifier(table_name),
                    sql.SQL(', ').join(sql.SQL(col) for col in columns)
                )
                cur.execute(create_query)
                created.append(table_name)
            except Exception as table_err:
                errors.append({table_name: str(table_err)})

        conn.commit()
    except Exception as e:
        return {
            "error": str(e),
            "created_tables": created,
            "errors": errors
        }
    finally:
        if cur:
            cur.close()
        if conn:
            postgres.release_connection(conn)

    return {
        "created_tables": created,
        "errors": errors
    }
