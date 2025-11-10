import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'admin'),
    'database': os.getenv('DB_NAME', 'smart_gate_pass'),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
    'autocommit': False
}

def get_db_connection():
    """Get a new database connection"""
    try:
        conn = pymysql.connect(**DB_CONFIG)
        return conn
    except pymysql.Error as e:
        print(f"Database connection error: {e}")
        raise

def close_db_connection(conn):
    """Close database connection properly"""
    try:
        if conn:
            conn.close()
    except Exception as e:
        print(f"Error closing connection: {e}")
