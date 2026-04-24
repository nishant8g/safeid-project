"""Telegram Alert Service — sends free automated emergency notifications."""

import httpx
import logging
from typing import List, Optional
from ..config import settings

logger = logging.getLogger(__name__)

async def send_telegram_alert(message: str, media_url: Optional[str] = None) -> dict:
    """Send an SOS alert via Telegram Bot API (100% Free)."""
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    if not token or not chat_id:
        logger.warning("Telegram not configured — skipping")
        return {"status": "skipped", "method": "telegram", "reason": "Not configured"}

    try:
        async with httpx.AsyncClient() as client:
            # If there's a photo, send use sendPhoto, otherwise sendMessage
            if media_url:
                url = f"https://api.telegram.org/bot{token}/sendPhoto"
                params = {
                    "chat_id": chat_id,
                    "photo": media_url,
                    "caption": message,
                    "parse_mode": "Markdown"
                }
            else:
                url = f"https://api.telegram.org/bot{token}/sendMessage"
                params = {
                    "chat_id": chat_id,
                    "text": message,
                    "parse_mode": "Markdown"
                }

            response = await client.post(url, json=params)
            
            if response.status_code == 200:
                logger.info("✅ Telegram alert sent successfully")
                return {"status": "sent", "method": "telegram"}
            else:
                logger.error(f"❌ Telegram failed: {response.text}")
                return {"status": "failed", "method": "telegram", "error": response.text}

    except Exception as e:
        logger.error(f"🚨 Telegram service error: {e}")
        return {"status": "failed", "method": "telegram", "error": str(e)}
