import psycopg2
from psycopg2 import pool
from app.core.config import settings  # where POSTGRES_URI is defined


class PostgreSQL:
    def __init__(self):
        self.connection_pool: pool.SimpleConnectionPool | None = None

    def init_app(self):
        """Initialize the PostgreSQL connection pool."""
        if not self.connection_pool:
            try:
                self.connection_pool = psycopg2.pool.SimpleConnectionPool(
                    minconn=1, maxconn=10, dsn=settings.POSTGRES_URI
                )
                print(f"✅ Postgres connection pool created: {settings.POSTGRES_URI}")
            except Exception as e:
                print(f"❌ Failed to create Postgres connection pool: {e}")
                self.connection_pool = None

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
            print("🔻 All Postgres connections closed.")


# Global instance (like Flask version)
postgres = PostgreSQL()
