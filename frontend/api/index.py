import os
import sys

# Since this is now inside /frontend/api/, the backend is at /frontend/backend/
# We add the /frontend/ directory to sys.path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

# Import the backend app
# This looks for 'backend' folder inside the project_root
from backend.app.main import app
