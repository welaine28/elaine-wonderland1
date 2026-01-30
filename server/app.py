import os
from flask import Flask, request, jsonify, abort, Blueprint
from flask_cors import CORS
from db import get_conn

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/frontend/*": {
            "origins": os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
        }
    },
)

DISCORD_SECRET_TOKEN = os.environ.get("DISCORD_SECRET_TOKEN", "dev-secret")

frontend = Blueprint("frontend", __name__)


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

    Returns time series grouped by ai_agent_name.
    """
    question_id = "vectorsum"  # hardcoded for now

    sql = """
        SELECT
            a.name AS ai_agent_name,
            r.timestamp,
            r.benchmark_result::numeric AS speedup,
            r.harness as agent_type,
            (r.metadata->>'model_score')::numeric AS model_score,
            (r.metadata->>'baseline_score')::numeric AS baseline_score
        FROM benchmark_result r
        JOIN ai_agent a ON a.id = r.ai_agent_id
        WHERE r.question_id = %s
          AND r.status = 'active'
        ORDER BY a.name, r.timestamp
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (question_id,))
            rows = cur.fetchall()

    grouped = {}

    for ai_agent_name, ts, speedup, agent_type, model_score, baseline_score in rows:
        if ai_agent_name not in grouped:
            grouped[ai_agent_name] = {
                "ai_agent_name": ai_agent_name,
                "agent_type": agent_type,
                "metric_name": "speedup",
                "metric_unit": "x",
                "points": [],
            }

        grouped[ai_agent_name]["points"].append(
            {
                "timestamp": ts.isoformat(),
                "speedup": float(speedup),
                "model_score": float(model_score),
                "baseline_score": float(baseline_score),
            }
        )

    return jsonify(
        {
            "question_id": question_id,
            "series": list(grouped.values()),
        }
    )


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
