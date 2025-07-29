# main.py
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import pyodbc

# Import your AI utilities here
import ai_utils

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # dev only

# Register Blueprints *after* app exists!
from resume_ai.resume_api import resume_api
app.register_blueprint(resume_api, url_prefix='/resume')

from resume_ai.job_match import job_match_api
app.register_blueprint(job_match_api, url_prefix='/job')

from onboarding_api import onboarding_api
app.register_blueprint(onboarding_api, url_prefix='/onboarding')

# -- DB connection
def get_connection():
    return pyodbc.connect(
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={os.getenv('AZURE_SQL_SERVER')};"
        f"DATABASE={os.getenv('AZURE_SQL_DB')};"
        f"UID={os.getenv('AZURE_SQL_USER')};"
        f"PWD={os.getenv('AZURE_SQL_PASSWORD')};"
        "Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    )

def get_employee_skills_and_jobs(employee_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Skills, AppliedJobs FROM dbo.Employees WHERE ID = ?", (employee_id,))
    row = cursor.fetchone()
    conn.close()
    skills = [s.split('(')[0].strip() for s in (row[0] or '').split(',')] if row and row[0] else []
    applied_jobs = [j.strip() for j in (row[1] or '').split(',')] if row and row[1] else []
    return skills, applied_jobs

@app.route("/api/leave-requests", methods=["GET"])
def get_leave_requests():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT RequestID, Employee, Type, StartDate, EndDate, Days, Status, Urgent FROM LeaveRequests")
    rows = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    conn.close()
    results = [dict(zip(columns, row)) for row in rows]
    for r in results:
        r['Urgent'] = bool(r['Urgent'])
    return jsonify(results)

@app.route("/api/leave-requests/<string:request_id>/approve", methods=["POST"])
def approve_leave_request(request_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE LeaveRequests SET Status = 'Approved' WHERE RequestID = ?", request_id)
    conn.commit()
    conn.close()
    return jsonify({"message": "Request approved"})

@app.route("/api/leave-requests/<string:request_id>/reject", methods=["POST"])
def reject_leave_request(request_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE LeaveRequests SET Status = 'Rejected' WHERE RequestID = ?", request_id)
    conn.commit()
    conn.close()
    return jsonify({"message": "Request rejected"})

def get_job_details(job_title):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT JobID, MandatorySkills FROM dbo.InternalJobs WHERE JobTitle = ?", (job_title,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None, []
    job_id = row[0]
    skills = [s.strip() for s in (row[1] or '').split(',') if s.strip()]
    return job_id, skills

def get_courses_for_skills(skills_needed):
    if not skills_needed:
        return []
    conn = get_connection()
    cursor = conn.cursor()
    like_clauses = " OR ".join([f"LOWER(SkillsCovered) LIKE ?" for _ in skills_needed])
    sql = f"SELECT CourseName, SkillsCovered, Link FROM dbo.LMSCourses WHERE {like_clauses}"
    params = [f"%{skill.lower()}%" for skill in skills_needed]
    cursor.execute(sql, params)
    results = cursor.fetchall()
    conn.close()
    return [
        {"CourseName": row[0], "SkillsCovered": row[1], "Link": row[2]}
        for row in results
    ]

@app.route("/summarize-hr-tickets", methods=["GET"])
def summarize_hr_tickets():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT TicketID, Title, Description FROM dbo.hr_tickets")
    rows = cursor.fetchall()
    conn.close()
    results = []
    for row in rows:
        ticket_id, title, description = row
        summary = ai_utils.summarize_ticket_description(description)
        results.append({
            "TicketID": ticket_id,
            "Title": title,
            "OriginalDescription": description,
            "Summary": summary
        })
    return jsonify(results)

@app.route("/login", methods=["POST"])
def login():
    """
    Authenticates user based on username and password.
    Returns ID and department for access control.
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    # NOTE: Use plain Password for now, or update logic for hashed check if needed.
    cursor.execute("""
        SELECT ID, Username, Department
        FROM dbo.Employees
        WHERE Username = ? AND PasswordHash = ?
    """, (username, password))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Invalid username or password"}), 401

    # Example: Map Department value to portals/roles
    department = row[2]
    # You can optionally send a list of allowed portals based on department value
    # Example: department="HR" → portals = ["Employee Portal", "HR Portal"]
    return jsonify({
        "employee_id": row[0],
        "username": row[1],
        "department": department,
        # Optionally: portals/roles can be returned too
    }), 200

@app.route("/apply-internal-transfer", methods=["POST"])
def apply_internal_transfer():
    data = request.get_json()
    employee_id = data.get("employee_id")
    if not employee_id:
        return jsonify({"error": "employee_id is required"}), 400

    employee_skills, applied_jobs = get_employee_skills_and_jobs(employee_id)
    if not applied_jobs:
        return jsonify({"error": "No applied jobs found for this employee"}), 404

    results = []
    for job_title in applied_jobs:
        job_id, job_required_skills = get_job_details(job_title)
        if not job_id:
            results.append({"job_title": job_title, "error": "Job not found in InternalJobs table"})
            continue
        missing_skills = [s for s in job_required_skills if s not in employee_skills]
        courses = get_courses_for_skills(missing_skills)
        ai_output = ai_utils.recommend_courses_for_missing_skills(employee_skills, job_required_skills, courses)
        results.append({
            "job_title": job_title,
            "job_id": job_id,
            "missing_skills": missing_skills,
            "recommended_courses": courses,
            "ai_recommendation": ai_output
        })
    return jsonify({
        "employee_id": employee_id,
        "recommendations": results
    })

@app.route("/api/employees", methods=["GET"])
def get_employees():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ID, Name, Email, Department, Role, ManagerID, DateJoined, Status, Phone
        FROM Employees
    """)
    rows = cursor.fetchall()
    id_to_name = {row[0]: row[1] for row in rows}
    employees = []
    for row in rows:
        manager_id = row[5]
        manager_name = id_to_name.get(manager_id, "") if manager_id else ""
        employees.append({
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "department": row[3],
            "position": row[4],
            "managerId": manager_id,
            "managerName": manager_name,
            "joinDate": str(row[6]) if row[6] else "",
            "status": row[7],
            "phone": row[8],
        })
    conn.close()
    return jsonify(employees)

@app.route("/api/employees", methods=["POST"])
def add_employee():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(ID) FROM Employees")   # <--- FIXED LINE for INT IDs
    last_id = cursor.fetchone()[0] or 0
    next_id = last_id + 1
    cursor.execute("""
        INSERT INTO Employees (ID, Name, Email, Department, Role, Status, DateJoined, ManagerID, Phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        next_id, data['name'], data['email'], data['department'], data['position'],
        data.get('status', 'Active'), data['joinDate'], data['manager'], data['phone']
    ))
    conn.commit()
    conn.close()
    return jsonify({"id": next_id})

@app.route("/api/employees/<int:emp_id>", methods=["PUT"])
def update_employee(emp_id):
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE Employees SET 
            Name=?, Email=?, Department=?, Role=?, Status=?, DateJoined=?, ManagerID=?, Phone=?
        WHERE ID=?
    """, (
        data['name'], data['email'], data['department'], data['position'],
        data.get('status', 'Active'), data['joinDate'], data['manager'], data['phone'], emp_id
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/hello", methods=["GET"])
def hello_world():
    return jsonify({"msg": "Hello, Flask is working!"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)


