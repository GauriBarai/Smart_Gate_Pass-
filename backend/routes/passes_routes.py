from flask import Blueprint, request, jsonify
from backend.config import get_db_connection, close_db_connection
import pymysql
import os
import qrcode
import uuid

passes_bp = Blueprint("passes", __name__)

def ensure_tables_exist(cursor):
    """Ensure all required tables exist"""
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS gate_pass_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reason TEXT,
            from_time DATETIME NULL,
            to_time DATETIME NULL,
            status VARCHAR(32) DEFAULT 'Pending',
            faculty_id INT NULL,
            student_id INT NOT NULL,
            qr_code VARCHAR(255) NULL,
            rejection_reason TEXT NULL,
            approved_at DATETIME NULL,
            rejected_at DATETIME NULL,
            approved_by INT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """)

@passes_bp.route('/passes', methods=['GET'])
def list_passes():
    """List all passes"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            ensure_tables_exist(cursor)
            cursor.execute("""
                SELECT r.id, r.reason, r.from_time, r.to_time, r.status,
                       f.name AS faculty_name, r.student_id
                FROM gate_pass_requests r
                LEFT JOIN faculty f ON r.faculty_id = f.id
                ORDER BY COALESCE(r.from_time, NOW()) DESC
            """)
            
            rows = cursor.fetchall()
            result = []
            
            for r in rows:
                from_time = r['from_time'].strftime('%Y-%m-%d %H:%M') if r.get('from_time') else ''
                to_time = r['to_time'].strftime('%Y-%m-%d %H:%M') if r.get('to_time') else ''
                
                result.append({
                    'id': r['id'],
                    'date': from_time[:10] if from_time else '',
                    'time': from_time[11:16] if from_time else '',
                    'reason': r['reason'],
                    'status': r['status'] or 'Pending',
                    'faculty': r.get('faculty_name') or 'Unassigned',
                    'studentId': r.get('student_id'),
                })
            
            return jsonify(result), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@passes_bp.route('/passes', methods=['POST'])
def create_pass():
    """Create a new pass"""
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['date', 'time', 'reason']):
            return jsonify({"error": "Missing required fields"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            ensure_tables_exist(cursor)
            
            student_id = data.get('studentId') or data.get('student_id') or 1
            status = data.get('status', 'Pending')
            
            from_datetime = f"{data['date']} {data['time']}"
            
            cursor.execute("""
                INSERT INTO gate_pass_requests 
                (reason, from_time, to_time, status, student_id)
                VALUES (%s, %s, %s, %s, %s)
            """, (data['reason'], from_datetime, from_datetime, status, student_id))
            
            conn.commit()
            created_id = cursor.lastrowid
            
            try:
                os.makedirs('static/qr_codes', exist_ok=True)
                qr_token = str(uuid.uuid4())
                qr_payload = f"REQ:{created_id}|QR:{qr_token}"
                qr_filename = f"{qr_token}.png"
                qr_path = os.path.join('static', 'qr_codes', qr_filename)
                
                qrcode.make(qr_payload).save(qr_path)
                
                cursor.execute(
                    "UPDATE gate_pass_requests SET qr_code = %s WHERE id = %s",
                    (qr_token, created_id)
                )
                conn.commit()
                
                relative_qr_path = f"/static/qr_codes/{qr_filename}"
            except Exception as e:
                print(f"QR generation failed: {e}")
                relative_qr_path = None
            
            return jsonify({
                'id': created_id,
                'date': data['date'],
                'time': data['time'],
                'reason': data['reason'],
                'status': status,
                'qrCode': relative_qr_path
            }), 201
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@passes_bp.route('/passes/<int:pass_id>/status', methods=['PUT'])
def update_pass_status(pass_id):
    """Update pass status"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status or new_status not in ['Pending', 'Approved', 'Rejected']:
            return jsonify({"error": "Invalid status"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            ensure_tables_exist(cursor)
            
            rejection_reason = data.get('rejection_reason', '')
            update_sql = "UPDATE gate_pass_requests SET status = %s"
            update_params = [new_status]
            
            if new_status == 'Rejected' and rejection_reason:
                update_sql += ", rejection_reason = %s"
                update_params.append(rejection_reason)
            
            if new_status == 'Approved':
                update_sql += ", approved_at = NOW()"
            elif new_status == 'Rejected':
                update_sql += ", rejected_at = NOW()"
            
            update_sql += " WHERE id = %s"
            update_params.append(pass_id)
            
            cursor.execute(update_sql, update_params)
            conn.commit()
            
            return jsonify({
                'message': f'Pass status updated to {new_status}'
            }), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
