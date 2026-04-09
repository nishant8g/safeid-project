import os
import sys

# Since this is now inside /frontend/api/, we need to go UP two levels to reach the root
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.append(project_root)

# Import the backend app
try:
    from backend.app.main import app as backend_app
    # Explicitly define 'app' at the top level for Vercel
    app = backend_app
except ImportError as e:
    print(f"Deployment Error: Could not find backend. PATH: {sys.path}")
    raise e
