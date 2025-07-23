import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import pyodbc
import ai_utils
import sys

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # dev only

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

# ------------------ LEAVE REQUESTS ------------------

@app.route("/api/leave-requests", methods=["GET"])
def get_leave_requests():
    """
    If ?employee_id=ID is provided, return only that employee's leave requests.
    Otherwise, return all (for HR portal).
    """
    emp_id = request.args.get("employee_id")
    conn = get_connection()
    cursor = conn.cursor()
    if emp_id:
        cursor.execute("""
            SELECT RequestID, Employee, Type, StartDate, EndDate, Days, Status, Urgent, Reason, SubmittedDate
            FROM LeaveRequests WHERE EmployeeID=?
            ORDER BY SubmittedDate DESC
        """, (emp_id,))
    else:
        cursor.execute("""
            SELECT RequestID, Employee, Type, StartDate, EndDate, Days, Status, Urgent, Reason, SubmittedDate
            FROM LeaveRequests
            ORDER BY SubmittedDate DESC
        """)
    rows = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    conn.close()
    results = [dict(zip(columns, row)) for row in rows]
    for r in results:
        r['Urgent'] = bool(r.get('Urgent', False))
        # Format dates for JSON serializability
        for k in ('StartDate', 'EndDate', 'SubmittedDate'):
            if r.get(k):
                r[k] = str(r[k])
    return jsonify(results)

from flask import jsonify, request

# main.py (relevant leave request part, copy-paste over your /api/leave-requests POST endpoint)

from datetime import datetime, timedelta

@app.route("/api/leave-requests", methods=["POST"])
def submit_leave_request():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()

    # Generate next RequestID
    cursor.execute("SELECT ISNULL(MAX(CAST(SUBSTRING(RequestID, 3, 10) AS INT)), 0) + 1 FROM LeaveRequests")
    next_number = cursor.fetchone()[0]
    new_id = f"LR{next_number:03d}"

    # Parse/calculate start & end dates
    start = data.get("StartDate") or data.get("startDate")
    end = data.get("EndDate") or data.get("endDate")
    # Defensive: fallback to today if either is missing
    start_dt = datetime.strptime(start, "%Y-%m-%d") if start else datetime.today()
    end_dt = datetime.strptime(end, "%Y-%m-%d") if end else start_dt

    # Count weekdays only
    def count_weekdays(s, e):
        count = 0
        d = s
        while d <= e:
            if d.weekday() < 5:  # 0-4 = Mon-Fri
                count += 1
            d += timedelta(days=1)
        return count

    days = count_weekdays(start_dt, end_dt)

    # Pull fields, using defaults for missing
    reason = data.get("Reason") or data.get("reason") or ""
    submitted_date = datetime.now().strftime("%Y-%m-%d")
    urgent = bool(data.get("Urgent") or data.get("urgent") or False)
    status = data.get("Status") or data.get("status") or "Pending"
    employee = data.get("Employee") or data.get("employee")
    type_ = data.get("Type") or data.get("type")

    # Insert with all required columns
    cursor.execute(
        "INSERT INTO LeaveRequests (RequestID, Employee, Type, StartDate, EndDate, Days, Status, Urgent, Reason, SubmittedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            new_id,
            employee,
            type_,
            start_dt.strftime("%Y-%m-%d"),
            end_dt.strftime("%Y-%m-%d"),
            days,
            status,
            urgent,
            reason,
            submitted_date,
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"RequestID": new_id, "success": True, "days": days}), 201




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


# ------------------ END LEAVE REQUESTS ------------------

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
    cursor.execute("""
        SELECT ID, Username, Department
        FROM dbo.Employees
        WHERE Username = ? AND PasswordHash = ?
    """, (username, password))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Invalid username or password"}), 401

    department = row[2]
    return jsonify({
        "employee_id": row[0],
        "username": row[1],
        "department": department,
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
    import sys
    print("==== /api/employees HIT! ====", file=sys.stderr)
    print("HEADERS:", dict(request.headers), file=sys.stderr)
    sys.stderr.flush()
    try:
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
        print(f"Returning {len(employees)} employees", file=sys.stderr)
        sys.stderr.flush()
        return jsonify(employees)
    except Exception as e:
        print("ERROR in /api/employees:", e, file=sys.stderr)
        sys.stderr.flush()
        return jsonify({"error": str(e)}), 500


@app.route("/api/employees", methods=["POST"])
def add_employee():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(ID) FROM Employees")
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

@app.route("/api/livechats", methods=["POST"])
def create_live_chat():
    data = request.get_json()
    print("POST data:", data, file=sys.stderr)
    sys.stderr.flush()

    if not data:
        return jsonify({"error": "No data received. Check Content-Type and body format."}), 400

    # Defensive: check for 'from'
    if 'from' not in data or not data['from']:
        return jsonify({"error": "Missing 'from' field in POST data"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    # Generate a new ChatID, store all relevant info
    cursor.execute("SELECT ISNULL(MAX(ChatID), 0) + 1 FROM LiveChats")
    chat_id = cursor.fetchone()[0]
    cursor.execute("""
        INSERT INTO LiveChats (ChatID, FromID, ToID, Issue, Priority, Description, Department, Timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
    """, (
        chat_id,
        data["from"],           # sender's Employee ID
        data["to"],             # recipient's Employee ID
        data["issue"],
        data["priority"],
        data.get("description", ""),
        data.get("department", ""),
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "ChatID": chat_id})

@app.route("/api/livechats/<int:chat_id>/messages", methods=["POST"])
def add_message(chat_id):
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO Messages (ChatID, SenderID, Content)
        VALUES (?, ?, ?)
    """, (
        chat_id,
        data["senderId"],
        data["content"]
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/livechats/<int:chat_id>/messages", methods=["GET"])
def get_messages(chat_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT MessageID, SenderID, Content, Timestamp
        FROM Messages
        WHERE ChatID = ?
        ORDER BY Timestamp ASC
    """, (chat_id,))
    messages = []
    for row in cursor.fetchall():
        messages.append({
            "messageId": row[0],
            "senderId": row[1],
            "content": row[2],
            "timestamp": str(row[3])
        })
    conn.close()
    return jsonify(messages)

@app.route("/api/livechats", methods=["GET"])
def get_all_chats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ChatID, FromID, ToID, Issue, Priority, Department, Timestamp
        FROM LiveChats
        ORDER BY Timestamp DESC
    """)
    chats = []
    for row in cursor.fetchall():
        chats.append({
            "chatId": row[0],
            "fromId": row[1],
            "toId": row[2],
            "issue": row[3],
            "priority": row[4],
            "department": row[5],
            "timestamp": str(row[6])
        })
    conn.close()
    return jsonify(chats)

@app.route("/api/livechats", methods=["GET"])
def get_live_chats():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify([])

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.ChatID, c.FromID, c.ToID, c.Issue, c.Priority, c.Description, c.Department, c.Timestamp, c.Status,
               e.Name as EmployeeName
        FROM LiveChats c
        JOIN Employees e ON e.ID = c.ToID
        WHERE c.FromID = ? OR c.ToID = ?
        ORDER BY c.Timestamp DESC
    """, (user_id, user_id))
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    chats = [dict(zip(columns, row)) for row in rows]
    conn.close()
    return jsonify(chats)






if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
