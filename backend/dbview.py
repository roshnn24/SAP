import sqlite3
import pandas as pd

conn = sqlite3.connect(r"C:\Users\Koushik\Desktop\SAP\backend\bills.db")
cursor = conn.cursor()

cursor.execute("SELECT * FROM bills LIMIT 10")
rows = cursor.fetchall()

# Pretty print with pandas
df = pd.DataFrame(rows, columns=[desc[0] for desc in cursor.description])
print(df)