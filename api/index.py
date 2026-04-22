import os
import sys
from pathlib import Path

# Add the project root to sys.path so 'backend' is findable
root_dir = str(Path(__file__).resolve().parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Import the actual FastAPI app from the backend
from backend.app.main import app

# Vercel needs 'app' to be available at the module level
# We already imported it as 'app' above.
