import psycopg2
import os


def get_conn():
    return psycopg2.connect(
        os.environ["DATABASE_URL"],
        sslmode="require",   # important on Heroku
    )
