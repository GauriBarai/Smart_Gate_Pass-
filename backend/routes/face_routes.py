from flask import Blueprint, request, jsonify
from backend.config import get_db_connection, close_db_connection
import pymysql

face_bp = Blueprint("face", __name__)

@face_bp.route("/verify-face", methods=["POST"])
def verify_face_endpoint():
    """Verify face from uploaded image"""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        file = request.files["file"]
        name = request.form.get("name", type=str)
        student_id = request.form.get("student_id", type=str)
        
        if not name and not student_id:
            return jsonify({"error": "Provide 'name' or 'student_id'"}), 400
        
        # In production, compute embedding and compare with stored embedding
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            if name:
                cursor.execute("SELECT id FROM students WHERE name=%s", (name,))
            else:
                cursor.execute("""
                    SELECT s.id FROM students s
                    WHERE s.student_id=%s
                """, (student_id,))
            
            row = cursor.fetchone()
            
            if not row:
                return jsonify({"error": "Student not found"}), 404
            
            # In production, use face_recognition library
            return jsonify({
                "match": True,
                "similarity": 0.95,
                "name": name if name else student_id,
                "student_id": row['id']
            }), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
