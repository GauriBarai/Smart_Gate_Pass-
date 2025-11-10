from flask import Blueprint, request, jsonify
from backend.config import get_db_connection, close_db_connection
from datetime import datetime
import pymysql

security_bp = Blueprint('security', __name__)

@security_bp.route('/verify-qr', methods=['POST'])
def verify_qr():
    """Verify QR code at security gate"""
    try:
        data = request.get_json(force=True) or {}
        print("[DEBUG] Incoming JSON:", data)
        
        request_id = data.get('request_id')
        qr_scan = data.get('qr')
        
        if not request_id or not qr_scan:
            return jsonify({"error": "Missing request_id or qr"}), 400
        
        print("[DEBUG] Request ID:", request_id)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT status, from_time, to_time
                FROM gate_pass_requests
                WHERE id = %s AND qr_code = %s
            """, (request_id, qr_scan))
            
            row = cursor.fetchone()
            
            if not row:
                print(f"[DEBUG] No entry found for request_id={request_id}")
                return jsonify({"message": "Access denied"}), 404
            
            print(f"[DEBUG] Row from DB: {row}")
            
            now = datetime.now()
            print(f"[DEBUG] Current time: {now}")
            print(f"[DEBUG] Status: {row['status']}")
            print(f"[DEBUG] Valid Time Range: {row['from_time']} to {row['to_time']}")
            
            if (row['status'] == 'Approved' and 
                row['from_time'] <= now <= row['to_time']):
                print("[DEBUG] Access granted")
                return jsonify({"message": "Access granted"}), 200
            
            print("[DEBUG] Access denied")
            return jsonify({"message": "Access denied"}), 403
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@security_bp.route('/verify-face', methods=['POST'])
def verify_face():
    """Verify face recognition"""
    try:
        data = request.get_json()
        
        if not data.get('student_id') or not data.get('match'):
            return jsonify({"error": "Missing required fields"}), 400
        
        if data.get('match'):
            return jsonify({
                "message": "Face verification successful",
                "student_id": data['student_id']
            }), 200
        else:
            return jsonify({"message": "Face verification failed"}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500
