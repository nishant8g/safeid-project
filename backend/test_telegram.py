import asyncio
from app.config import settings
from app.services.telegram_service import send_telegram_alert

async def test_telegram():
    print(f"--- Telegram Diagnostic ---")
    
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        print("Error: Telegram settings are missing!")
        return

    print("Sending Test SOS to Telegram...")
    # This calls the actual API
    result = await send_telegram_alert("SafeID System Check: Your free automated alert system is working!")
    
    if result["status"] == "sent":
        print("Login Successful. SUCCESS: Check your Telegram app now!")
    else:
        print(f"FAILED: {result.get('error')}")

if __name__ == "__main__":
    asyncio.run(test_telegram())
