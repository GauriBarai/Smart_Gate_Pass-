"""
Database initialization script
Run this to create all required tables
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config import get_db_connection, close_db_connection

def init_database():
    """Create all required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("Creating tables...")
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        print("✓ Users table created")
        
        # Students table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(255) NOT NULL,
                student_id VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                department VARCHAR(100),
                face_embedding LONGBLOB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        print("✓ Students table created")
        
        # Faculty table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS faculty (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                department VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        print("✓ Faculty table created")
        
        # Security table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS security (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        print("✓ Security table created")
        
        # Gate pass requests table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS gate_pass_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                faculty_id INT,
                reason TEXT NOT NULL,
                from_time DATETIME NOT NULL,
                to_time DATETIME NOT NULL,
                status VARCHAR(32) DEFAULT 'Pending',
                qr_code VARCHAR(255),
                rejection_reason TEXT,
                approved_at DATETIME,
                rejected_at DATETIME,
                approved_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        print("✓ Gate pass requests table created")
        
        # QR codes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS qr_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id INT NOT NULL,
                qr_token VARCHAR(255) NOT NULL UNIQUE,
                qr_path VARCHAR(500) NOT NULL,
                scanned_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES gate_pass_requests(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        print("✓ QR codes table created")
        
        # Attendance table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                faculty_id INT,
                check_in_time DATETIME,
                check_out_time DATETIME,
                pass_id INT,
                verified_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
                FOREIGN KEY (pass_id) REFERENCES gate_pass_requests(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        print("✓ Attendance table created")
        
        conn.commit()
        print("\n✓ Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        conn.rollback()
    finally:
        cursor.close()
        close_db_connection(conn)

if __name__ == '__main__':
    init_database()
