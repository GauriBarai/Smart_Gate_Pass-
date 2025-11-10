from flask import Blueprint, request, jsonify
from backend.config import get_db_connection, close_db_connection
import qrcode
import uuid
import os
import pymysql

qr_bp = Blueprint("qr", __name__)

QR_DIR = os.path.join('static', 'qr_codes')
os.makedirs(QR_DIR, exist_ok=True)

def generate_qr_code(payload_text):
    """Generate QR code and return path and token"""
    token = str(uuid.uuid4())
    filename = f"{token}.png"
    path = os.path.join(QR_DIR, filename)
    img = qrcode.make(payload_text)
    img.save(path)
    return path, token

def save_qr_to_db(request_id, token, path, conn):
    """Save QR code info to database"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS qr_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id INT NOT NULL,
                qr_token VARCHAR(255) NOT NULL,
                qr_path VARCHAR(500) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES gate_pass_requests(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        cursor.execute(
            "INSERT INTO qr_codes (request_id, qr_token, qr_path) VALUES (%s, %s, %s)",
            (request_id, token, path)
        )
    except Exception as e:
        print(f"Error saving QR to DB: {e}")
    finally:
        cursor.close()

@qr_bp.route('/generate/<int:pass_id>', methods=['POST'])
def generate_qr_for_pass(pass_id):
    """Generate QR code for a specific pass"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT * FROM gate_pass_requests WHERE id = %s", (pass_id,))
            pass_record = cursor.fetchone()
            
            if not pass_record:
                return jsonify({"error": "Pass not found"}), 404
            
            qr_path, qr_token = generate_qr_code("")
            qr_payload = f"REQ:{pass_id}|QR:{qr_token}"
            qrcode.make(qr_payload).save(qr_path)
            
            save_qr_to_db(pass_id, qr_token, qr_path, conn)
            
            cursor.execute(
                "UPDATE gate_pass_requests SET qr_code = %s WHERE id = %s",
                (qr_token, pass_id)
            )
            conn.commit()
            
            relative_path = qr_path.replace(os.sep, '/')
            
            return jsonify({
                "success": True,
                "qrCode": relative_path,
                "qr_token": qr_token,
                "pass_id": pass_id
            }), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@qr_bp.route('/verify', methods=['POST'])
def verify_qr_code():
    """Verify QR code"""
    try:
        payload = request.get_json(force=True) or {}
        request_id = payload.get('request_id')
        qr_token = payload.get('qr')
        raw = payload.get('payload')
        
        if raw and (not request_id or not qr_token):
            try:
                parts = dict(p.split(':', 1) for p in raw.split('|'))
                request_id = request_id or int(parts.get('REQ'))
                qr_token = qr_token or parts.get('QR')
            except Exception:
                pass
        
        if not request_id or not qr_token:
            return jsonify({"error": "Missing request_id or qr"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT qr.request_id, qr.qr_token,
                       pass.reason, pass.from_time, pass.to_time, pass.status,
                       pass.student_id, pass.faculty_id
                FROM qr_codes qr
                JOIN gate_pass_requests pass ON qr.request_id = pass.id
                WHERE qr.request_id = %s AND qr.qr_token = %s
            """, (request_id, qr_token))
            
            qr_record = cursor.fetchone()
            
            if not qr_record:
                return jsonify({"error": "Invalid QR code"}), 404
            
            return jsonify({
                "valid": True,
                "pass_id": qr_record['request_id'],
                "student_id": qr_record['student_id'],
                "reason": qr_record['reason'],
                "from_time": qr_record['from_time'].isoformat() if qr_record['from_time'] else None,
                "to_time": qr_record['to_time'].isoformat() if qr_record['to_time'] else None,
                "status": qr_record['status']
            }), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
