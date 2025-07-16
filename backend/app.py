import chat_api
from flask import Flask, request, jsonify

import prompts

app = Flask(__name__)


@app.route("/chat", methods=["POST"])
def chat():
    """If user sends system prompt, then use it or use default system prompt."""
    if not request.is_json:
        return jsonify({"error": "Invalid input, JSON expected"}), 400
    if not request.json.get("user_prompt"):
        return jsonify({"error": "user_prompt are required"}), 400
    if not request.json.get("system_prompt"):
        system_prompt = prompts.system_prompt
    else:
        system_prompt = request.json.get("system_prompt")
    data = request.get_json()

    user_prompt = data.get("user_prompt", "")

    chat_wrapper = chat_api.ChatWrapper()
    response = chat_wrapper.get_response(system_prompt, user_prompt)

    return jsonify(response.choices[0].message.content)


if __name__ == "__main__":

    app.run(debug=True)
 