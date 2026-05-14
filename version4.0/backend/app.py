import os
import sys

# Add the current directory to the path so Vercel can find sibling modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from advisor_logic import AdvisorSystem
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Firebase
try:
    if not firebase_admin._apps:
        # Priority 1: FIREBASE_SERVICE_ACCOUNT (JSON string for Vercel/Production)
        sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if sa_json:
            import json
            cred_dict = json.loads(sa_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        else:
            # Priority 2: Local file path (Development)
            sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            if sa_path and os.path.exists(sa_path):
                cred = credentials.Certificate(sa_path)
                firebase_admin.initialize_app(cred)
            else:
                # Priority 3: Default credentials
                firebase_admin.initialize_app()
    db = firestore.client()
except Exception as e:
    print(f"Firebase Init Error: {e}")
    db = None

@app.route('/api/advise', methods=['POST'])
def advise():
    data = request.json
    uid = data.get('uid')
    message = data.get('message')
    chat_id = data.get('chatId')

    if not uid:
        return jsonify({"error": "Missing User ID (UID)"}), 400
    if not message:
        return jsonify({"error": "Message is empty"}), 400
    if not db:
        return jsonify({"error": "Firebase Database not initialized. Check your service account configuration."}), 400

    try:
        user_ref = db.collection('users').document(uid)
        user_data = user_ref.get().to_dict() or {}
        profile = user_data.get('profile', {})
        records = user_data.get('records', [])

        chat_ref = user_ref.collection('chats').document(chat_id)
        chat_doc = chat_ref.get()
        history = chat_doc.to_dict().get('messages', []) if chat_doc.exists else []

        target_gpa = data.get('target_gpa')
        required_future_gpa = data.get('required_future_gpa')

        response_text = AdvisorSystem.get_response(
            message, 
            profile, 
            records, 
            history, 
            target_gpa=target_gpa, 
            required_future_gpa=required_future_gpa
        )

        new_messages = history + [
            {"role": "user", "content": message},
            {"role": "assistant", "content": response_text}
        ]
        chat_ref.set({
            "messages": new_messages,
            "lastModified": firestore.SERVER_TIMESTAMP,
            "title": message[:40] + "..." if not chat_doc.exists else chat_doc.to_dict().get('title')
        }, merge=True)

        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chats', methods=['GET'])
def list_chats():
    uid = request.args.get('uid')
    if not uid or not db: return jsonify([]), 200
    try:
        chats_ref = db.collection('users').document(uid).collection('chats').order_by('lastModified', direction=firestore.Query.DESCENDING).stream()
        return jsonify([{"id": c.id, **c.to_dict()} for c in chats_ref])
    except Exception as e:
        print(f"List Chats Error: {e}")
        return jsonify([]), 200

@app.route('/api/chats/<chat_id>', methods=['GET'])
def get_chat(chat_id):
    uid = request.args.get('uid')
    if not uid or not db: return jsonify([]), 400
    doc = db.collection('users').document(uid).collection('chats').document(chat_id).get()
    return jsonify(doc.to_dict().get('messages', [])) if doc.exists else jsonify([])

@app.route('/api/chats/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    uid = request.args.get('uid')
    if not uid or not db: return jsonify({"error": "No UID"}), 400
    try:
        db.collection('users').document(uid).collection('chats').document(chat_id).delete()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
