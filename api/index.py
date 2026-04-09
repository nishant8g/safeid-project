import sys
import os
from pathlib import Path

# Fix the path so we can import the 'backend' folder from the root
sys.path.append(str(Path(__file__).parent.parent))

# Import the FastAPI app from your existing backend folder
from backend.app.main import app

# This 'app' is what Vercel will run
