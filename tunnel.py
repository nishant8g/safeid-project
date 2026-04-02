"""
Ngrok tunnel script — creates a public URL for SafeID.
Run this to make your local SafeID accessible from any phone worldwide.

Usage:
  python tunnel.py

This will:
1. Create a public URL for the frontend (port 3000)
2. Create a public URL for the backend API (port 8000)
3. Update the QR code BASE_URL to use the public URL
"""

import os
import sys
import time

try:
    from pyngrok import ngrok, conf
except ImportError:
    print("❌ pyngrok not installed. Run: pip install pyngrok")
    sys.exit(1)


def start_tunnels():
    """Start ngrok tunnels for both frontend and backend."""

    print("\n🚀 Starting SafeID Public Tunnels...\n")

    # Start tunnels
    try:
        frontend_tunnel = ngrok.connect(3000, "http")
        backend_tunnel = ngrok.connect(8000, "http")
    except Exception as e:
        print(f"❌ Failed to start tunnels: {e}")
        print("\n💡 If you haven't set up ngrok, run these steps:")
        print("   1. Sign up at https://ngrok.com (free)")
        print("   2. Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken")
        print("   3. Run: ngrok config add-authtoken YOUR_TOKEN")
        print("   (or) python -c \"from pyngrok import ngrok; ngrok.set_auth_token('YOUR_TOKEN')\"")
        sys.exit(1)

    frontend_url = frontend_tunnel.public_url
    backend_url = backend_tunnel.public_url

    # Ensure HTTPS
    if frontend_url.startswith("http://"):
        frontend_url = frontend_url.replace("http://", "https://")
    if backend_url.startswith("http://"):
        backend_url = backend_url.replace("http://", "https://")

    print("=" * 60)
    print("🌍 SafeID is now PUBLIC!")
    print("=" * 60)
    print(f"\n🖥️  Frontend URL:  {frontend_url}")
    print(f"📡 Backend API:   {backend_url}")
    print(f"📚 API Docs:      {backend_url}/docs")
    print(f"\n📱 QR codes will use: {frontend_url}/scan/{{user_id}}")
    print(f"\n⚠️  IMPORTANT: You need to regenerate your QR code to use the public URL!")
    print(f"    Go to Dashboard → QR Code → Regenerate")
    print()

    # Update the .env file with public URLs
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            content = f.read()

        # Update BASE_URL and FRONTEND_URL
        lines = content.split("\n")
        new_lines = []
        for line in lines:
            if line.startswith("BASE_URL="):
                new_lines.append(f"BASE_URL={frontend_url}")
            elif line.startswith("FRONTEND_URL="):
                new_lines.append(f"FRONTEND_URL={frontend_url}")
            else:
                new_lines.append(line)

        with open(env_path, "w") as f:
            f.write("\n".join(new_lines))
        print("✅ .env file updated with public URLs")
        print("   ⚠️  Restart the backend server for changes to take effect!")

    print(f"\n🔴 Press Ctrl+C to stop tunnels\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down tunnels...")
        ngrok.kill()
        print("✅ Tunnels closed")

        # Restore local URLs in .env
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                content = f.read()
            content = content.replace(f"BASE_URL={frontend_url}", "BASE_URL=http://localhost:3000")
            content = content.replace(f"FRONTEND_URL={frontend_url}", "FRONTEND_URL=http://localhost:3000")
            with open(env_path, "w") as f:
                f.write(content)
            print("✅ .env restored to localhost URLs")


if __name__ == "__main__":
    start_tunnels()
