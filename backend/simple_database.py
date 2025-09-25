# simple_database.py
import sqlite3
from rapidfuzz import fuzz

class SimpleDatabase:
    def __init__(self, db_name="bills.db"):
        self.conn = sqlite3.connect(db_name, check_same_thread=False)
        self.create_table()

    def create_table(self):
        query = """
        CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            vendor TEXT,
            date TEXT,
            amount REAL,
            category TEXT,
            unique_key TEXT
        )
        """
        self.conn.execute(query)
        self.conn.commit()

    def generate_key(self, bill_data):
        """
        Generate a unique key from vendor, date, amount, category
        """
        vendor_norm = "".join(e.lower() for e in bill_data["vendor"] if e.isalnum())
        return f"{vendor_norm}_{bill_data['date']}_{bill_data['amount']}_{bill_data['short_description']}"

    def check_duplicates(self, bill_data, user_id):
        """
        Check exact + fuzzy duplicates for a user
        """
        cur = self.conn.cursor()
        cur.execute("SELECT id, vendor, date, amount, category, unique_key FROM bills WHERE user_id=?", (user_id,))
        existing_bills = cur.fetchall()

        new_key = self.generate_key(bill_data)

        # --- Exact match ---
        for row in existing_bills:
            if row[5] == new_key:
                return {"is_duplicate": True, "reason": "Exact duplicate", "matched_bill_id": row[0]}

        # --- Fuzzy match (vendor similarity >95% + same date/amount) ---
        for row in existing_bills:
            vendor_score = fuzz.token_sort_ratio(bill_data["vendor"], row[1])
            same_date = bill_data["date"] == row[2]
            same_amount = abs(float(bill_data["amount"]) - float(row[3])) < 1
            same_category = bill_data["short_description"] == row[4]

            if vendor_score > 95 and same_date and same_amount and same_category:
                return {"is_duplicate": True, "reason": f"Fuzzy match {vendor_score}%", "matched_bill_id": row[0]}

        return {"is_duplicate": False}

    def save_bill(self, bill_data, user_id):
        """
        Save bill if not duplicate
        """
        unique_key = self.generate_key(bill_data)
        query = "INSERT INTO bills (user_id, vendor, date, amount, category, unique_key) VALUES (?, ?, ?, ?, ?, ?)"
        self.conn.execute(query, (
            user_id,
            bill_data["vendor"],
            bill_data["date"],
            bill_data["amount"],
            bill_data["short_description"],
            unique_key
        ))
        self.conn.commit()
        return self.conn.execute("SELECT last_insert_rowid()").fetchone()[0]

    def get_user_bills(self, user_id):
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM bills WHERE user_id=?", (user_id,))
        return cur.fetchall()

    def get_all_bills(self):
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM bills")
        return cur.fetchall()


db_instance = SimpleDatabase()
