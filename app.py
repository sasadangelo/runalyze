import os
import sys
from pathlib import Path

# Aggiungi src al path per importare runanalyze
sys.path.insert(0, str(Path(__file__).parent / "src"))

from dotenv import load_dotenv
from flask import Flask

from runanalyze.routes import activity_bp
from runanalyze.routes.dashboard_routes import dashboard_bp
from runanalyze.services import DatabaseInitializer

# Load environment variables
load_dotenv()

# Initialize database tables
db_initializer: DatabaseInitializer = DatabaseInitializer()
db_initializer.initialize_tables()

app = Flask(import_name=__name__)

# Register blueprints
app.register_blueprint(blueprint=dashboard_bp)
app.register_blueprint(blueprint=activity_bp)

if __name__ == "__main__":
    debug: bool = os.getenv("FLASK_DEBUG", "").lower() in {"1", "true", "yes", "on"}
    host: str = os.getenv("FLASK_HOST", "127.0.0.1")
    port: int = int(os.getenv("FLASK_PORT", "5001"))
    app.run(debug=debug, host=host, port=port)
