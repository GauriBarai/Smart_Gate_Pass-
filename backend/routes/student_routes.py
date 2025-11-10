from flask import Blueprint, request, jsonify
from backend.config import get_db_connection, close_db_connection
from datetime import datetime
import pymysql

student_bp = Blueprint('student', __name__)

@student_bp.route('/<int:student_id>/passes', methods=['GET'])
def get_passes(student_id):
    """Get all passes for a student"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, reason, date, time, status, approved_by, created_at
                FROM gate_passes
                WHERE student_id=%s
                ORDER BY created_at DESC
            """, (student_id,))
            
            passes = cursor.fetchall()
            return jsonify(passes), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
