import os
import sys

# Get absolute path of project root
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

# Import the backend app explicitly
from backend.app.main import app
