import os
from flask import Flask, request, jsonify, abort, Blueprint
from flask_cors import CORS


app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")}})

DISCORD_SECRET_TOKEN = os.environ.get("DISCORD_SECRET_TOKEN", "dev-secret")

frontend = Blueprint('frontend', __name__)

@frontend.route("/main", methods=["GET"])
def frontend_secret():
    return jsonify({"message": "Only frontend can access this (via CORS)"})

@app.route("/api/test", methods=["GET"])
def front_route_origin():
    print(os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"))
    return jsonify({"message": "Hello from Flask!"})

@app.route("/api/discord/submit", methods=["POST"])
def discord_submit():
    token = request.headers.get("Authorization")
    if token != f"Bot {DISCORD_SECRET_TOKEN}":
        abort(403, description="Invalid token")
    return jsonify({"message": "Hello Discord bot!"})

@app.route("/", defaults={"path": ""})
def serve_react_or_static(path):
    return jsonify({"error": "Not found"}), 404

app.register_blueprint(frontend, url_prefix="/api/frontend")

if __name__ == "__main__":
    app.run(debug=True)
