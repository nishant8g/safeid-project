import httpx
import asyncio
from app.config import settings

async def check_updates():
    token = settings.TELEGRAM_BOT_TOKEN
    print(f"Scanning for messages sent to Bot: {token[:10]}...")
    
    url = f"https://api.telegram.org/bot{token}/getUpdates"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            data = response.json()
            
            if not data.get("ok"):
                print(f"Error: {data}")
                return

            results = data.get("result", [])
            if not results:
                print("No recent messages found. Please send a message to the bot FIRST!")
                return

            print("\n--- Recent Messages Found ---")
            for update in results:
                msg = update.get("message", {})
                from_user = msg.get("from", {})
                chat = msg.get("chat", {})
                text = msg.get("text", "")
                
                print(f"User: {from_user.get('first_name')} (ID: {from_user.get('id')})")
                print(f"Text: '{text}'")
                print(f"Recommended TELEGRAM_CHAT_ID: {chat.get('id')}")
                print("-" * 30)

        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_updates())
