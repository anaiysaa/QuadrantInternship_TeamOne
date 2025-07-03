# backend/main.py
from flask import Flask, jsonify
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)
CORS(app)

@app.route("/employees", methods=["GET"])
def get_employees():
    return fetch_all("Employees")

@app.route("/employeeonboarding", methods=["GET"])
def get_employee_onboarding():
    return fetch_all("EmployeeOnboarding")

@app.route("/leavedecisions", methods=["GET"])
def get_leave_requests():
    return fetch_all("LeaveRequests")

@app.route("/timesheets", methods=["GET"])
def get_timesheets():
    return fetch_all("Timesheets")

@app.route("/tickets", methods=["GET"])
def get_tickets():
    return fetch_all("Tickets")


@app.route("/troubleshootingdocs", methods=["GET"])
def get_troubleshooting_docs():
    return fetch_all("TroubleshootingDocs")

@app.route("/assets", methods=["GET"])
def get_assets():
    return fetch_all("Assets")

def fetch_all(table):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {table}")
        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        data = [dict(zip(columns, row)) for row in rows]
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
