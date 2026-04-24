from app.config import settings
import smtplib

def test_email_login():
    print(f"Testing login for: {settings.SMTP_EMAIL}")
    if not settings.SMTP_EMAIL or not settings.SMTP_APP_PASSWORD:
        print("❌ Error: SMTP_EMAIL or SMTP_APP_PASSWORD is empty in settings!")
        return

    try:
        print("Connecting to smtp.gmail.com:587...")
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
        server.starttls()
        print("Attempting login...")
        server.login(settings.SMTP_EMAIL, settings.SMTP_APP_PASSWORD)
        print("✅ SUCCESS: Email authentication is working perfectly!")
        server.quit()
    except smtplib.SMTPAuthenticationError:
        print("❌ FAILED: Authentication Error. Check if your App Password is correct.")
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")

if __name__ == "__main__":
    test_email_login()
