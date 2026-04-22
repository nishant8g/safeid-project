
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text

# Add backend to path
sys.path.append(str(Path(r'c:\Users\nisha\Desktop\ResQ project antigravity\safeid-project\backend')))

from app.config import settings

def main():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    print(f"Connecting to Database...")
    engine = create_engine(db_url)
    
    try:
        with engine.connect() as conn:
            # Check if table exists first
            print("Checking if medical_info table exists...")
            res = conn.execute(text("SELECT to_regclass('public.medical_info');"))
            table_exists = res.fetchone()[0]
            
            if not table_exists:
                print("Table 'medical_info' does not exist. Running full init_db...")
                from app.database import init_db
                from app.models import medical # ensures registered
                init_db()
                print("Full initialization complete.")
                return

            # Check if column exists
            print("Checking schema for abha_id...")
            res = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='medical_info' AND column_name='abha_id';
            """))
            exists = res.fetchone()
            
            if exists:
                print("status: column 'abha_id' already exists.")
            else:
                print("Adding column 'abha_id'...")
                conn.execute(text("ALTER TABLE medical_info ADD COLUMN abha_id VARCHAR(255);"))
                conn.commit()
                print("status: Successfully added 'abha_id' column.")
                
    except Exception as e:
        print(f"error: During migration: {e}")

if __name__ == "__main__":
    main()
