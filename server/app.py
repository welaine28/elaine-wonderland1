import os
from flask import Flask, request, jsonify, abort, send_from_directory, Blueprint
from flask_cors import CORS

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app = Flask(__name__)
CORS(app, resources={
    r"/api/frontend/*": {"origins": "http://localhost:5173"}
})

DISCORD_SECRET_TOKEN = os.environ.get("DISCORD_SECRET_TOKEN", "dev-secret")

frontend = Blueprint('frontend', __name__)

@frontend.route("/main", methods=["GET"])
def frontend_secret():
    return jsonify({"message": "Only frontend can access this (via CORS)"})

@app.route("/api/discord/submit", methods=["POST"])
def discord_submit():
    token = request.headers.get("Authorization")
    if token != f"Bot {DISCORD_SECRET_TOKEN}":
        abort(403, description="Invalid token")
    return jsonify({"message": "Hello Discord bot!"})

@app.route("/", defaults={"path": ""})
def serve_react_or_static(path):
    return jsonify({"error": "Not found"}), 404

if __name__ == "__main__":
    app.register_blueprint(frontend, url_prefix="/api/frontend")
    app.run(debug=True)
