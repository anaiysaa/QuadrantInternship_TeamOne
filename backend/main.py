# backend/main.py
from flask import Flask, jsonify, request
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

@app.route("/hr_tickets", methods=["GET"])
def get_hrtickets():
    return fetch_all("hr_Tickets")

@app.route("/it_tickets", methods=["GET"])
def get_ittickets():
    return fetch_all("it_Tickets")

@app.route("/it_tickets", methods=["POST"])
def post_it_ticket():
    try:
        data = request.json
        employee_id = data.get("employeeId")
        department = data.get("department")
        issue = data.get("issue")
        description = data.get("description")
        # Add other fields as needed
 
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO IT_Tickets (EmployeeID, Department, Issue, Description) VALUES (?, ?, ?, ?)",
            (employee_id, department, issue, description)
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/hr_tickets", methods=["POST"])
def post_hr_ticket():
    try:
        data = request.json
        employee_id = data.get("employeeId")
        department = data.get("department")
        issue = data.get("issue")
        description = data.get("description")
        # Add other fields as needed
 
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO IT_Tickets (EmployeeID, Department, Issue, Description) VALUES (?, ?, ?, ?)",
            (employee_id, department, issue, description)
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/it_troubleshootingdocs", methods=["GET"])
def get_troubleshooting_docs():
    return fetch_all("it_troubleshootingdocs")

@app.route("/it_assets", methods=["GET"])
def get_assets():
    return fetch_all("it_Assets")

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
