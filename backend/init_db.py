
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).resolve().parent
sys.path.append(str(backend_path))

from app.database import init_db
from app.models import user, medical, contact, qrcode, alert, analytics

def main():
    print("Initializing Database...")
    try:
        init_db()
        print("[SUCCESS] Database initialized successfully.")
    except Exception as e:
        print(f"[ERROR] Error: {e}")

if __name__ == "__main__":
    main()
