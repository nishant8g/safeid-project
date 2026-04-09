import os
import sys
import django

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.alert_service import send_whatsapp
from app.config import settings

def run_test():
    phone = "+919334942710"
    message = "🚨 PRO-LEVEL TEST: Automatic Alert Verification 🚨\n\nThis is a verified test of the SafeID Automated Delivery System. If you see this, the server connection is live and the +91 normalization is active.\n\nView Profile: http://localhost:3000/scan/145181e1-69f6-4a1a-acbc-0275d219e19e"
    
    # Use a real public image for verification
    media_url = "https://i.ibb.co/L5Z5vWJ/accident-scene.jpg" 
    
    print(f"🚀 Triggering Automated Dispatch to {phone}...")
    result = send_whatsapp(phone, message, media_url=media_url)
    
    print("\n" + "="*60)
    print(f"📡 DISPATCH RESULT:")
    print(f"Status: {result.get('status').upper()}")
    if result.get('status') == 'mock':
        print("⚠️ MOCK MODE: Check .env credentials. No physical message sent.")
    elif result.get('status') == 'failed':
        print(f"❌ FAILED: {result.get('error')}")
        print(f"Code: {result.get('code')}")
    else:
        print(f"✅ SUCCESS: Message Sent! SID: {result.get('sid')}")
    print("="*60 + "\n")

if __name__ == "__main__":
    run_test()
