from flask import Blueprint, request, jsonify
from backend.config import get_db_connection, close_db_connection
import bcrypt
import pymysql
import jwt
import os
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-this')

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user with role-based authentication"""
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['role', 'user_id', 'password']):
            return jsonify({"error": "Missing required fields: role, user_id, password"}), 400
        
        role = data['role']
        user_id = data['user_id']
        password = data['password']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Query user by role and user_id
            query = "SELECT id, name, password_hash, role FROM users WHERE user_id=%s AND role=%s"
            cursor.execute(query, (user_id, role))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({"error": "Invalid credentials"}), 401
            
            # Verify password
            if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return jsonify({"error": "Invalid credentials"}), 401
            
            # Generate JWT token
            token = jwt.encode({
                'user_id': user['id'],
                'role': user['role'],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, SECRET_KEY, algorithm='HS256')
            
            return jsonify({
                "message": "Login successful",
                "token": token,
                "user_id": user['id'],
                "name": user['name'],
                "role": user['role']
            }), 200
        finally:
            cursor.close()
            close_db_connection(conn)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['name', 'user_id', 'password', 'role']):
            return jsonify({"error": "Missing required fields"}), 400
        
        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            query = """
            INSERT INTO users (name, user_id, password_hash, role)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (data['name'], data['user_id'], password_hash, data['role']))
            conn.commit()
            
            return jsonify({
                "message": "User registered successfully"
            }), 201
        finally:
            cursor.close()
            close_db_connection(conn)
    except pymysql.IntegrityError:
        return jsonify({"error": "User already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500
