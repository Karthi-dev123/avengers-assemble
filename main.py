"""
Main entry point for Student Tracking & Mentorship System API
"""
import os
from app import create_app, db

app = create_app(os.getenv('FLASK_ENV', 'development'))

@app.shell_context_processor
def make_shell_context():
    return {'db': db}

if __name__ == '__main__':
    port = int(os.getenv('API_PORT', 5000))
    host = os.getenv('API_HOST', '127.0.0.1')
    app.run(host=host, port=port, debug=True)

# ============================================================================
# DEVELOPMENT COMMANDS
# ============================================================================
#
# 1. Setup Virtual Environment:
#    python -m venv venv
#    source venv/Scripts/activate  (Windows)
#    source venv/bin/activate       (Mac/Linux)
#
# 2. Install Dependencies:
#    pip install -r requirements.txt
#
# 3. Initialize Database:
#    flask db init
#    flask db migrate -m "Initial migration"
#    flask db upgrade
#
# 4. Run the Application:
#    flask run
#
# 5. Run Tests:
#    pytest -v
#
# ============================================================================
