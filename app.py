import os
import sys
from pathlib import Path

# Aggiungi src al path per importare runanalyze
sys.path.insert(0, str(Path(__file__).parent / "src"))

from flask import Flask

from runanalyze.routes import activity_bp
from runanalyze.routes.dashboard_routes import dashboard_bp

app = Flask(import_name=__name__)

# Register blueprints
app.register_blueprint(blueprint=dashboard_bp)
app.register_blueprint(blueprint=activity_bp)

if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "").lower() in {"1", "true", "yes", "on"}
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "5001"))
    app.run(debug=debug, host=host, port=port)
