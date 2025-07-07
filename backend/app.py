from flask import Flask, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

STRINGS = [
    "Welcome!",
    "You clicked me!",
    "Hello from Python!",
    "Another random message.",
    "React + Flask = 🚀",
    "Backend says hi!",
    "Here's a random fact."
]

@app.route('/api/random-string')
def random_string():
    message = random.choice(STRINGS)
    return jsonify({"msg": message})

if __name__ == "__main__":
    app.run(port=5000)