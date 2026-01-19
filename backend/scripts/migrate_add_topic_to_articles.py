import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'ssotb.db')
DB_PATH = os.path.abspath(DB_PATH)

def migrate():
    if not os.path.isfile(DB_PATH):
        print(f"Database file {DB_PATH} does not exist.")
        return
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(articles);")
        columns = [row[1] for row in cursor.fetchall()]
        if 'topic' not in columns:
            cursor.execute("ALTER TABLE articles ADD COLUMN topic VARCHAR;")
            print("Column 'topic' added.")
        else:
            print("Column 'topic' already exists.")

if __name__ == '__main__':
    migrate()
