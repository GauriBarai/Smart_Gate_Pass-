from flask import Blueprint, jsonify

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/test', methods=['GET'])
def test():
    """Test endpoint"""
    return jsonify({'message': 'Dashboard routes working'}), 200
