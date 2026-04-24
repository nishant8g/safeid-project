
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def check_connection():
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL not found in environment")
        return
    
    print(f"Connecting to: {DATABASE_URL.split('@')[-1]}")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print(f"SUCCESS: Database connection successful: {result.fetchone()[0]}")
    except Exception as e:
        print(f"FAILURE: Database connection failed: {e}")

if __name__ == "__main__":
    check_connection()
