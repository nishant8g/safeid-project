
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv('.env.local')

db_url = os.getenv('DATABASE_URL')
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("✅ Database Connection Successful")
except Exception as e:
    print(f"❌ Database Connection Failed: {e}")
