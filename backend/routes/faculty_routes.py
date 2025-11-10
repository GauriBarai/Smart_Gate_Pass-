from flask import Blueprint, request, jsonify
from backend.config import get_db_connection, close_db_connection
import pymysql

faculty_bp = Blueprint('faculty', __name__)

@faculty_bp.route('/approve-request', methods=['POST'])
def approve_request():
    """Approve or reject a pass request"""
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['request_id', 'decision']):
            return jsonify({"error": "Missing required fields"}), 400
        
        if data['decision'] not in ['Approved', 'Rejected']:
            return jsonify({"error": "Invalid decision"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Update pass status
            cursor.execute(
                "UPDATE gate_pass_requests SET status=%s WHERE id=%s",
                (data['decision'], data['request_id'])
            )
            conn.commit()
            
            return jsonify({
                "message": f"Request {data['request_id']} has been {data['decision']}"
            }), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@faculty_bp.route('/get-requests', methods=['GET'])
def get_requests():
    """Get all pending requests for a faculty member"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT r.id, r.reason, r.from_time, r.to_time, r.status,
                       s.name AS student_name, s.student_id
                FROM gate_pass_requests r
                JOIN students s ON r.student_id = s.id
                WHERE r.status = 'Pending'
                ORDER BY r.from_time DESC
            """)
            
            requests = cursor.fetchall()
            
            for req in requests:
                if hasattr(req.get('from_time'), 'strftime'):
                    req["from_time"] = req["from_time"].strftime("%Y-%m-%d %H:%M")
                if hasattr(req.get('to_time'), 'strftime'):
                    req["to_time"] = req["to_time"].strftime("%Y-%m-%d %H:%M")
            
            return jsonify(requests), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
