import os
from flask import Flask, request, jsonify, abort, Blueprint
from flask_cors import CORS
from db import get_conn

app = Flask(__name__)

CORS(app, resources={r"/api/frontend/*": {"origins": os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")}})

DISCORD_SECRET_TOKEN = os.environ.get("DISCORD_SECRET_TOKEN", "dev-secret")

frontend = Blueprint('frontend', __name__)

@frontend.route("/main", methods=["GET"])
def frontend_secret():
    return jsonify({"message": "Only frontend can access this (via CORS)"})

@frontend.route("/test", methods=["GET"])
def front_route_origin():
    print(os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"))
    return jsonify({"message": "Hello from Flask!"})

@frontend.route("/benchmark", methods=["GET"])
def benchmark_timeseries():
    """
    GET /benchmark?question_id=vector_sum

    Returns time series grouped by (ai_agent_name, metric_name).
    """
    question_id = "vector_sum"  # hardcoded for now

    sql = """
        SELECT
            a.name AS ai_agent_name,
            m.metric_name,
            m.metric_value,
            m.metric_unit,
            m.timestamp
        FROM benchmark_metric m
        JOIN benchmark_result r ON r.result_id = m.result_id
        JOIN ai_agent a ON a.id = r.ai_agent_id
        WHERE r.question_id = %s
          AND r.status = 'active'
          AND m.status = 'active'
        ORDER BY a.name, m.metric_name, m.timestamp
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (question_id,))   # ✅ tuple
            rows = cur.fetchall()

    grouped = {}
    for ai_agent_name, metric_name, metric_value, metric_unit, ts in rows:
        key = (ai_agent_name, metric_name)
        if key not in grouped:
            grouped[key] = {
                "ai_agent_name": ai_agent_name,
                "metric_name": metric_name,
                "metric_unit": metric_unit,
                "points": [],
            }

        grouped[key]["points"].append({
            "timestamp": ts.isoformat(),
            "metric_value": metric_value,
        })

    return jsonify({
        "question_id": question_id,
        "series": list(grouped.values()),
    })

@app.route("/api/discord/submit", methods=["POST"])
def discord_submit():
    token = request.headers.get("Authorization")
    if token != f"Bot {DISCORD_SECRET_TOKEN}":
        abort(403, description="Invalid token")
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users LIMIT 10")
            rows = cur.fetchall()
    return jsonify(rows)

@app.route("/", defaults={"path": ""})
def serve_react_or_static(path):
    return jsonify({"error": "Not found"}), 404

app.register_blueprint(frontend, url_prefix="/api/frontend")

if __name__ == "__main__":
    app.run(debug=True)
