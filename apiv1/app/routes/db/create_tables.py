import json, os
from psycopg2 import sql
from app.core.database import postgres


def init_tables_from_json():
    json_path = os.path.join(os.path.dirname(__file__), "tables.json")
    with open(json_path, "r") as f:
        data = json.load(f)

    tables = data.get("tables", [])
    created, errors = [], []

    conn, cur = None, None
    try:
        if not postgres.connection_pool:
            postgres.init_app()

        conn = postgres.get_connection()
        cur = conn.cursor()

        for table in tables:
            table_name, columns = table.get("table_name"), table.get("columns")
            if not table_name or not columns:
                errors.append(f"Missing data for {table}")
                continue

            try:
                create_query = sql.SQL("CREATE TABLE IF NOT EXISTS {} ({});").format(
                    sql.Identifier(table_name),
                    sql.SQL(", ").join(sql.SQL(col) for col in columns),
                )
                cur.execute(create_query)
                created.append(table_name)
            except Exception as e:
                errors.append({table_name: str(e)})

        conn.commit()
    except Exception as e:
        return {"error": str(e), "created_tables": created, "errors": errors}
    finally:
        if cur:
            cur.close()
        if conn:
            postgres.release_connection(conn)

    return {"created_tables": created, "errors": errors}


def upload_static_data_from_json():
    json_path = os.path.join(os.path.dirname(__file__), "staticData.json")
    with open(json_path, "r") as f:
        data = json.load(f)

    inserted, errors = [], []
    conn, cur = None, None

    try:
        if not postgres.connection_pool:
            postgres.init_app()

        conn = postgres.get_connection()
        cur = conn.cursor()

        for table_name, rows in data.items():
            if not isinstance(rows, list) or not rows:
                continue

            for row in rows:
                try:
                    columns = row.keys()
                    values = [row[c] for c in columns]
                    insert_query = sql.SQL(
                        "INSERT INTO {} ({}) VALUES ({}) ON CONFLICT DO NOTHING"
                    ).format(
                        sql.Identifier(table_name),
                        sql.SQL(", ").join(map(sql.Identifier, columns)),
                        sql.SQL(", ").join(sql.Placeholder() * len(values)),
                    )
                    cur.execute(insert_query, values)
                    inserted.append({table_name: row})
                except Exception as e:
                    errors.append({table_name: str(e)})

        conn.commit()
    except Exception as e:
        return {"error": str(e), "inserted_rows": inserted, "errors": errors}
    finally:
        if cur:
            cur.close()
        if conn:
            postgres.release_connection(conn)

    return {"inserted_rows": inserted, "errors": errors}
