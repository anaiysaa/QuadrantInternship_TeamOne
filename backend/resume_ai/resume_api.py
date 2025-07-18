# resume_api.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from resume_nor import process_resume_file

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_resume():
    file = request.files.get('resume')
    if not file:
        return jsonify({"status": "error", "message": "No file received"}), 400

    try:
        result = process_resume_file(file)
        return jsonify({"status": "success", "result": result}), 200
    except Exception as e:
        print("ERROR processing resume:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # If port 5000 is busy, use another one like 5001
    app.run(port=5001, debug=True)
