from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from hr_ticket_bot import classify_hr_ticket
from it_ticket_bot import classify_it_ticket
import datetime

# Flask setup
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Your existing classification routes (UNCHANGED)
@app.route("/classify/hr", methods=["POST"])
def classify_hr():
    if not request.is_json:
        return jsonify({"error": "Invalid input, JSON expected"}), 400
    ticket_text = request.json.get("ticket_text")
    if not ticket_text:
        return jsonify({"error": "ticket_text is required"}), 400

    try:
        result = classify_hr_ticket(ticket_text)
        return jsonify({"classification": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/classify/it", methods=["POST"])
def classify_it():
    if not request.is_json:
        return jsonify({"error": "Invalid input, JSON expected"}), 400
    ticket_text = request.json.get("ticket_text")
    if not ticket_text:
        return jsonify({"error": "ticket_text is required"}), 400

    try:
        result = classify_it_ticket(ticket_text)
        return jsonify({"classification": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# NEW: Simple live chat with notifications
@app.route("/chat/send", methods=["POST"])
def send_chat_message():
    """Send a live chat message with notification"""
    data = request.get_json()
    ticket_id = data.get('ticket_id')
    user_name = data.get('user_name')
    message = data.get('message')
    
    if not all([ticket_id, user_name, message]):
        return jsonify({"error": "ticket_id, user_name, and message are required"}), 400
    
    # Create message object
    chat_message = {
        'ticket_id': ticket_id,
        'user_name': user_name,
        'message': message,
        'timestamp': datetime.datetime.now().isoformat(),
        'type': 'live_chat'  # This makes it different from comments!
    }
    
    # Send real-time notification to all connected users
    socketio.emit('new_chat_message', {
        'ticket_id': ticket_id,
        'user_name': user_name,
        'message': message,
        'timestamp': chat_message['timestamp'],
        'notification': f"💬 New message from {user_name}: {message[:30]}..."
    })
    
    return jsonify({"status": "sent", "message": chat_message})

# NEW: Regular comment (no real-time notification)
@app.route("/comment/add", methods=["POST"])
def add_comment():
    """Add a regular comment (no notification)"""
    data = request.get_json()
    ticket_id = data.get('ticket_id')
    user_name = data.get('user_name')
    comment = data.get('comment')
    
    if not all([ticket_id, user_name, comment]):
        return jsonify({"error": "ticket_id, user_name, and comment are required"}), 400
    
    # Create comment object
    ticket_comment = {
        'ticket_id': ticket_id,
        'user_name': user_name,
        'comment': comment,
        'timestamp': datetime.datetime.now().isoformat(),
        'type': 'regular_comment'  # No real-time notification
    }
    
    return jsonify({"status": "added", "comment": ticket_comment})

# WebSocket connection handling
@socketio.on('connect')
def handle_connect():
    print(f'User connected: {request.sid}')
    emit('connected', {'message': 'Connected to live chat'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'User disconnected: {request.sid}')

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)