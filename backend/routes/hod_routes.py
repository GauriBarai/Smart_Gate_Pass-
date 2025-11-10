from flask import Blueprint, request, jsonify
from backend.config import get_db_connection, close_db_connection
import pymysql

hod_bp = Blueprint('hod', __name__)

@hod_bp.route('/approve-request', methods=['POST'])
def approve_request():
    """HOD approve or reject request"""
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['request_id', 'decision']):
            return jsonify({"error": "Missing required fields"}), 400
        
        if data['decision'] not in ['Approved', 'Rejected']:
            return jsonify({"error": "Invalid decision"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            approver_id = data.get('approver_id')
            
            cursor.execute(
                "UPDATE gate_pass_requests SET status=%s, approved_by=%s WHERE id=%s",
                (data['decision'], approver_id, data['request_id'])
            )
            conn.commit()
            
            return jsonify({
                "message": f"Request {data['request_id']} has been {data['decision']} by HOD {approver_id}"
            }), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@hod_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get statistics for HOD dashboard"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_passes,
                    SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) as rejected,
                    SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending
                FROM gate_pass_requests
            """)
            
            stats = cursor.fetchone()
            
            return jsonify({
                "total_passes": stats['total_passes'] or 0,
                "approved": stats['approved'] or 0,
                "rejected": stats['rejected'] or 0,
                "pending": stats['pending'] or 0
            }), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
