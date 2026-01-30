from demobenchmark import fake_benchmark_log_data
import os
from flask import Flask, jsonify, Blueprint
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
            (r.metadata->>'baseline_score')::numeric AS baseline_score,
            r.metadata,
            r.labels
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

    for (
        ai_agent_name,
        ts,
        speedup,
        agent_type,
        model_score,
        baseline_score,
        metadata,
        labels,
    ) in rows:
        if ai_agent_name not in grouped:
            grouped[ai_agent_name] = {
                "ai_agent_name": ai_agent_name,
                "agent_type": agent_type,
                "metric_name": "speedup",
                "metric_unit": "x",
                "points": [],
            }

        metadata["result_log"] = fake_benchmark_log_data

        grouped[ai_agent_name]["points"].append(
            {
                "timestamp": ts.isoformat(),
                "speedup": float(speedup),
                "model_score": float(model_score),
                "baseline_score": float(baseline_score),
                "metadata": metadata,
                "labels": labels,
            }
        )
    return jsonify(
        {
            "question_id": question_id,
            "series": list(grouped.values()),
        }
    )


@app.route("/", defaults={"path": ""})
def serve_react_or_static(path):
    return jsonify({"error": "Not found"}), 404


app.register_blueprint(frontend, url_prefix="/api/frontend")

if __name__ == "__main__":
    app.run(debug=True)
