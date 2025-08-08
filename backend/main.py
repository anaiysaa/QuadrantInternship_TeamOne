import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

import pyodbc
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import ai_utils
from openai import AzureOpenAI
import requests
import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

from it_asset_api import it_asset_api
from it_inventory_api import it_inventory_api
from software_center_api import software_center_api


from ticketAi.it_ticket_bot import classify_it_ticket
from ticketAi.hr_ticket_bot import classify_hr_ticket

load_dotenv()
app = Flask(__name__)
CORS(app)

# Register Blueprints *after* app exists!
from resume_ai.resume_api import resume_api
app.register_blueprint(resume_api, url_prefix='/resume')

from resume_ai.job_match import job_match_api
app.register_blueprint(job_match_api, url_prefix='/job')

from onboarding_api import onboarding_api
app.register_blueprint(onboarding_api, url_prefix='/onboarding')

from feedback_api import feedback_api
app.register_blueprint(feedback_api, url_prefix="/api")

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

def log_activity(employee_id, action, type_, details):
    conn = get_connection()
    cursor = conn.cursor()

    # Get email and department from Employees table
    cursor.execute("SELECT Email, Department FROM Employees WHERE ID = ?", (employee_id,))
    row = cursor.fetchone()

    email = row[0] if row else "Unknown"
    department = row[1] if row else "Unknown"

    # Use department as type_ if type_ is not provided
    final_type = type_ if type_ else department

    cursor.execute("""
        INSERT INTO ActivityLog (timestamp, username, action, type, details)
        VALUES (?, ?, ?, ?, ?)
    """, (datetime.now(), email, action, final_type, details))

    conn.commit()
    conn.close()

def get_employee_skills_and_jobs(employee_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Skills, AppliedJobs FROM dbo.Employees WHERE ID = ?", (employee_id,))
    row = cursor.fetchone()
    conn.close()
    skills = [s.split('(')[0].strip() for s in (row[0] or '').split(',')] if row and row[0] else []
    applied_jobs = [j.strip() for j in (row[1] or '').split(',')] if row and row[1] else []
    return skills, applied_jobs

@app.route("/api/livechats/<int:chat_id>/messages", methods=["GET"])
def get_messages(chat_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT m.MessageID, m.SenderID, e.Name, m.Content, m.Timestamp
        FROM Messages m
        JOIN Employees e ON e.ID = m.SenderID
        WHERE m.ChatID = ?
        ORDER BY m.Timestamp ASC
    """, (chat_id,))
    messages = []
    for row in cursor.fetchall():
        messages.append({
            "MessageID": row[0],
            "SenderID": row[1],
            "SenderName": row[2],
            "Content": row[3],
            "Timestamp": str(row[4])
        })
    conn.close()
    return jsonify(messages)

@app.route("/api/livechats/<int:chat_id>/messages", methods=["POST"])
def add_message(chat_id):
    data = request.json
    sender_id = data.get("sender_id")
    message = data.get("message")
    if not sender_id or not message:
        return jsonify({"error": "Missing sender_id or message"}), 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO Messages (ChatID, SenderID, Content)
        VALUES (?, ?, ?)
    """, (chat_id, sender_id, message))
    conn.commit()
    conn.close()
    return jsonify({"success": True})



DEGREE_RANK = {
    "High School": 1,
    "Associate": 2,
    "Bachelor": 3,
    "Bachelor's": 3,
    "Masters": 4,
    "Master's": 4,
    "Doctorate": 5,
    "PhD": 5
}

def get_recommended_courses(missing_skills):
    # Placeholder, replace with your real logic or AI model
    return [
        {"name": f"Course for {skill.title()}", "skill": skill, "url": f"https://example.com/courses/{skill}"}
        for skill in missing_skills
    ] if missing_skills else []

@app.route('/api/job-matches/<int:employee_id>', methods=['GET'])
def get_job_matches(employee_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ID, Name, Email, Phone, Address, EducationDegree, Skills
            FROM Employees
            WHERE ID = ?
        """, (employee_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Employee not found"}), 404

        try:
            skills_list = json.loads(row[6]) if row[6] else []
        except Exception:
            skills_list = [s.strip() for s in row[6].split(",") if s.strip()]

        employee = {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "phone": row[3],
            "address": row[4],
            "degree_level": row[5],
            "skills": skills_list
        }

        emp_rank = DEGREE_RANK.get(employee["degree_level"], 0)
        emp_skills = set(s.lower() for s in employee["skills"])

        cursor.execute("""
            SELECT JobID, JobTitle, MandatorySkills, OptionalSkills, RecommendedCertifications, JobDescription
            FROM InternalJobs
        """)
        job_rows = cursor.fetchall()

        matches = []
        for job_row in job_rows:
            job_id = job_row[0]
            title = job_row[1]
            mand_skills = job_row[2] or ""
            opt_skills = job_row[3]
            rec_certs = job_row[4]
            job_desc = job_row[5]

            required_skills = [s.strip().lower() for s in mand_skills.split(",") if s.strip()]
            job_skills = set(required_skills)

            matched_skills = emp_skills & job_skills
            missing_skills = list(job_skills - emp_skills)
            match_percent = int(len(matched_skills) / max(1, len(job_skills)) * 100)

            recommended_courses = get_recommended_courses(missing_skills)

            matches.append({
                "job_id": job_id,
                "title": title,
                "match_percent": match_percent,
                "skills_matched": list(matched_skills),
                "skills_missing": missing_skills,
                "recommended_courses": recommended_courses,
                "optional_skills": opt_skills,
                "recommended_certifications": rec_certs,
                "description": job_desc
            })

        return jsonify({
            "employee": employee,
            "matches": sorted(matches, key=lambda x: -x["match_percent"])
        })

    except Exception as e:
        return jsonify({"error": f"Failed to get job matches: {str(e)}"}), 500

# ---- Applications by Employee (assuming /resume/applications/<employee_id> route) ----
@app.route('/resume/applications/<int:employee_id>', methods=['GET'])
def get_applications(employee_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ja.ApplicationID, ja.JobID, ja.Status, ja.ApplicationDate, ij.JobTitle
        FROM JobApplications ja
        JOIN InternalJobs ij ON ja.JobID = ij.JobID
        WHERE ja.EmployeeID = ?
        ORDER BY ja.ApplicationDate DESC
    """, (employee_id,))
    apps = []
    for row in cursor.fetchall():
        apps.append({
            "applicationId": row[0],
            "jobId": row[1],
            "status": row[2],
            "appliedDate": row[3].strftime("%Y-%m-%d") if row[3] else "",
            "title": row[4],
        })
    cursor.close()
    conn.close()
    return jsonify({"applications": apps})

# ---- Apply to a job ----
@app.route('/resume/apply', methods=['POST'])
def apply_job():
    data = request.get_json()
    job_id = data.get('jobId')
    employee_id = data.get('employeeId')
    if not (job_id and employee_id):
        return jsonify({"success": False, "message": "Missing jobId or employeeId"}), 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO JobApplications (JobID, EmployeeID, ApplicationDate, Status)
        VALUES (?, ?, GETDATE(), ?)
    """, (job_id, employee_id, "Submitted"))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"success": True}), 201

# ---- Get Job Details ----
@app.route('/resume/jobs/<int:job_id>', methods=['GET'])
def get_job_by_id(job_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT JobID, JobTitle, MandatorySkills, OptionalSkills, RecommendedCertifications, JobDescription, Department, Location, JobType
        FROM InternalJobs WHERE JobID = ?
    """, (job_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if not row:
        return jsonify({"error": "Job not found"}), 404
    return jsonify({
        "jobId": row[0],
        "title": row[1],
        "mandatorySkills": row[2],
        "optionalSkills": row[3],
        "certifications": row[4],
        "jobDescription": row[5],
        "department": row[6],
        "location": row[7],
        "jobType": row[8]
    })

# ---- Delete (Rescind) an Application ----


# ------------------ EMPLOYEES ------------------

# ------------------ LEAVE REQUESTS (SAMPLE) ------------------
@app.route("/api/leave-requests", methods=["GET"])
def get_leave_requests():
    emp_id = request.args.get("employee_id")
    conn = get_connection()
    cursor = conn.cursor()
    if emp_id:
        cursor.execute("""
            SELECT RequestID, Employee, Type, StartDate, EndDate, Days, Status, Urgent, Reason, SubmittedDate, archived, paid
            FROM LeaveRequests WHERE Employee=?
            ORDER BY SubmittedDate DESC
        """, (emp_id,))
    else:
        cursor.execute("""
            SELECT RequestID, Employee, Type, StartDate, EndDate, Days, Status, Urgent, Reason, SubmittedDate, archived, paid
            FROM LeaveRequests
            ORDER BY SubmittedDate DESC
        """)
    rows = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    conn.close()
    results = [dict(zip(columns, row)) for row in rows]
    for r in results:
        r['Urgent'] = bool(r.get('Urgent', False))
        r['archived'] = bool(r.get('archived', False))
        r['paid'] = bool(r.get('paid', False))
        for k in ('StartDate', 'EndDate', 'SubmittedDate'):
            if r.get(k):
                r[k] = str(r[k])
    return jsonify(results)

@app.route("/api/leave-requests/<string:request_id>/approve", methods=["POST"])
def approve_leave_request(request_id):
    data = request.get_json()
    approver_id = data.get("employee_id")
    if not approver_id:
        return jsonify({"error": "Missing employee_id"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE LeaveRequests SET Status = 'Approved' WHERE RequestID = ?", (request_id,))
    conn.commit()
    conn.close()

    log_activity(approver_id, "Approved Leave Request", None, f"Approved request ID: {request_id}")
    return jsonify({"message": "Request approved and logged."})


@app.route("/api/leave-requests/<string:request_id>/reject", methods=["POST"])
def reject_leave_request(request_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE LeaveRequests SET Status = 'Rejected' WHERE RequestID = ?", (request_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Request rejected"})

@app.route("/api/leave-requests/<string:request_id>/archive", methods=["POST"])
def archive_leave_request(request_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE LeaveRequests SET archived = 1 WHERE RequestID = ?", (request_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Request Archived"})

@app.route("/api/leave-requests", methods=["POST"])
def submit_leave_request():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT ISNULL(MAX(CAST(SUBSTRING(RequestID, 3, 10) AS INT)), 0) + 1 FROM LeaveRequests")
    next_number = cursor.fetchone()[0]
    new_id = f"LR{next_number:03d}"
    
    start = data.get("StartDate") or data.get("startDate")
    end = data.get("EndDate") or data.get("endDate")
    start_dt = datetime.strptime(start, "%Y-%m-%d") if start else datetime.today()
    end_dt = datetime.strptime(end, "%Y-%m-%d") if end else start_dt
    
    def count_weekdays(s, e):
        count = 0
        d = s
        while d <= e:
            if d.weekday() < 5:
                count += 1
            d += timedelta(days=1)
        return count
    
    days = count_weekdays(start_dt, end_dt)
    reason = data.get("Reason") or data.get("reason") or ""
    submitted_date = datetime.now().strftime("%Y-%m-%d")
    urgent = bool(data.get("Urgent") or data.get("urgent") or False)
    status = data.get("Status") or data.get("status") or "Pending"
    employee = data.get("Employee") or data.get("employee")
    
    # Handle paid leave - this was missing in original code
    paid = bool(data.get("paid") or data.get("paidLeave") or False)
    
    if not employee:
        return jsonify({"error": "Employee ID is required"}), 400
    
    type_ = data.get("Type") or data.get("type")
    
    cursor.execute(
        "INSERT INTO LeaveRequests (RequestID, Employee, Type, StartDate, EndDate, Days, Status, Urgent, Reason, SubmittedDate, paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
            paid,  # Added paid parameter
        ),
    )
    print("Received data:", data)

    conn.commit()
    conn.close()
    return jsonify({"RequestID": new_id, "success": True, "days": days, "paid": paid}), 201

# ------------------ CHAT SYSTEM (THE PART YOU NEED) ------------------

@app.route("/api/livechats", methods=["GET"])
def get_live_chats():
    user_id = request.args.get("user_id")
    scope = request.args.get("scope")  # For IT Portal, use ?scope=all
    conn = get_connection()
    cursor = conn.cursor()

    # New: For IT Portal (see all), else only filter for current user
    if scope == "all":
        cursor.execute("""
            SELECT
                c.ChatID, c.FromID, c.ToID, c.Issue, c.Priority, c.Description, c.Department, c.Timestamp,
                (SELECT TOP 1 SenderID FROM Messages m WHERE m.ChatID = c.ChatID ORDER BY m.Timestamp DESC) AS LastSenderID,
                (SELECT TOP 1 Content FROM Messages m WHERE m.ChatID = c.ChatID ORDER BY m.Timestamp DESC) AS LastMessage,
                (SELECT TOP 1 Timestamp FROM Messages m WHERE m.ChatID = c.ChatID ORDER BY m.Timestamp DESC) AS LastMessageTimestamp
            FROM LiveChats c
            ORDER BY ISNULL((SELECT TOP 1 Timestamp FROM Messages m WHERE m.ChatID = c.ChatID ORDER BY m.Timestamp DESC), c.Timestamp) DESC
        """)
    else:
        cursor.execute("""
            SELECT
                c.ChatID, c.FromID, c.ToID, c.Issue, c.Priority, c.Description, c.Department, c.Timestamp,
                (SELECT TOP 1 SenderID FROM Messages m WHERE m.ChatID = c.ChatID ORDER BY m.Timestamp DESC) AS LastSenderID,
                (SELECT TOP 1 Content FROM Messages m WHERE m.ChatID = c.ChatID ORDER BY m.Timestamp DESC) AS LastMessage,
                (SELECT TOP 1 Timestamp FROM Messages m WHERE m.ChatID = c.ChatID ORDER BY m.Timestamp DESC) AS LastMessageTimestamp
            FROM LiveChats c
            WHERE c.FromID = ? OR c.ToID = ?
            ORDER BY ISNULL((SELECT TOP 1 Timestamp FROM Messages m WHERE m.ChatID = c.ChatID ORDER BY m.Timestamp DESC), c.Timestamp) DESC
        """, (user_id, user_id))

    columns = [desc[0] for desc in cursor.description]
    chats = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(chats)



@app.route("/api/livechats", methods=["POST"])
def create_live_chat():
    data = request.json
    required = ("from", "to", "issue", "priority", "department")
    if not all(x in data for x in required):
        return jsonify({"error": "Missing fields"}), 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO LiveChats (FromID, ToID, Issue, Priority, Description, Department, Timestamp)
        VALUES (?, ?, ?, ?, ?, ?, GETDATE())
    """, (
        data["from"],
        data["to"],
        data["issue"],
        data["priority"],
        data.get("description", ""),
        data["department"]
    ))
    cursor.execute("SELECT SCOPE_IDENTITY()")
    chat_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    return jsonify({"success": True, "ChatID": chat_id}), 201

@app.route("/api/chat-messages", methods=["GET"])
def get_chat_messages():
    chat_id = request.args.get("chat_id")
    if not chat_id:
        return jsonify([])
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT MessageID, ChatID, SenderID, Message, Timestamp
        FROM ChatMessages
        WHERE ChatID = ?
        ORDER BY Timestamp ASC
    """, (chat_id,))
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    messages = [dict(zip(columns, row)) for row in rows]
    conn.close()
    return jsonify(messages)

@app.route("/api/chat-messages", methods=["POST"])
def send_chat_message():
    data = request.get_json()
    if not all(x in data for x in ("chat_id", "sender_id", "message")):
        return jsonify({"error": "Missing fields"}), 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO ChatMessages (ChatID, SenderID, Message, Timestamp)
        VALUES (?, ?, ?, GETDATE())
    """, (
        data["chat_id"],
        data["sender_id"],
        data["message"]
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True}), 201

# ------------------ LOGIN (SIMPLE) ------------------

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/api/resources/upload", methods=["POST"])
def upload_resource():
    try:
        file = request.files['file']
        title = request.form['title']
        category = request.form['category']
        tags = request.form['tags']
        summary = request.form['summary']

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO knowledge_base (title, category, tags, summary, file_name, file_path, uploaded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (title, category, tags, summary, filename, filepath, datetime.now()))
        conn.commit()
        conn.close()

        return jsonify({'message': 'File uploaded successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route("/api/resources", methods=["GET"])
def get_resources():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, category, tags, summary, file_name, 
                   uploaded_at, file_path
            FROM knowledge_base
            ORDER BY uploaded_at DESC
        """)
        rows = cursor.fetchall()
        conn.close()

        results = [
            {
                'id': row[0],
                'title': row[1],
                'category': row[2],
                'tags': row[3],
                'description': row[4],
                'file_name': row[5],
                'lastUpdated': row[6],
                'size': get_file_size(row[7]) if row[7] else 'N/A',
                'downloads': 0,  # Placeholder value since column doesn't exist
                'type': row[3]   # Assuming tags are used for type
            }
            for row in rows
        ]
        return jsonify(results)
    except Exception as e:
        print("Server error:", e)
        return jsonify({'error': str(e)}), 500


@app.route("/api/resources/download/<filename>", methods=["GET"])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

def get_file_size(path):
    try:
        size_bytes = os.path.getsize(path)
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 ** 2:
            return f"{size_bytes // 1024} KB"
        else:
            return f"{round(size_bytes / (1024 ** 2), 2)} MB"
    except:
        return "N/A"
    
AZURE_OPENAI_API_KEY = os.getenv("subscription_key")
AZURE_OPENAI_ENDPOINT = os.getenv("endpoint")
AZURE_OPENAI_DEPLOYMENT = os.getenv("deployment")
AZURE_OPENAI_API_VERSION = os.getenv("api_version")
    
client = AzureOpenAI(
    api_key=AZURE_OPENAI_API_KEY,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_version=AZURE_OPENAI_API_VERSION
)


# Azure Search setup
SEARCH_ENDPOINT = os.getenv("SEARCH_ENDPOINT")
SEARCH_INDEX = os.getenv("SEARCH_INDEX")
SEARCH_ADMIN_KEY = os.getenv("SEARCH_ADMIN_KEY")
SEARCH_API_VERSION = os.getenv("SEARCH_API_VERSION")

def search_employee_handbook(query, top_k=2):
    url = f"{SEARCH_ENDPOINT}/indexes/{SEARCH_INDEX}/docs/search?api-version={SEARCH_API_VERSION}"
    headers = {
        "Content-Type": "application/json",
        "api-key": SEARCH_ADMIN_KEY
    }
    body = {
        "search": query,
        "top": top_k
    }
    resp = requests.post(url, headers=headers, json=body)
    resp.raise_for_status()
    results = resp.json()
    snippets = [doc['content'] for doc in results.get('value', [])]
    return "\n\n".join(snippets)

@app.route("/api/ask", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_question = data.get("question", "")

        # 1. Search Azure
        handbook_snippet = search_employee_handbook(user_question)

        # 2. Construct prompt
        prompt = f"""
You are an HR assistant bot. Answer the following employee question using ONLY the official handbook excerpts below.
First, provide a clear, friendly summary in your own words.
Then, show the actual excerpt(s) from the handbook that you used to answer.

Handbook excerpts:
\"\"\"
{handbook_snippet}
\"\"\"

Question: {user_question}
"""

        # 3. Ask OpenAI
        completion = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=[
                {"role": "system", "content": "You are a helpful HR assistant. Always use the provided handbook excerpt to answer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=600
        )
        answer = completion.choices[0].message.content.strip()

        return jsonify({"answer": answer})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
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

@app.route("/api/ITtickets/<string:request_id><int:num>/edit-severity", methods=["POST"])
def edit_severity_IT(request_id, num):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE IT_Tickets SET Severity = ? WHERE TicketID = ?", num, request_id)
    conn.commit()
    conn.close()
    return jsonify({"message": "Severity updated"})


@app.route("/api/HRTickets/<string:request_id><int:num>/edit-severity", methods=["POST"])
def edit_severity_HR(request_id, num):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE hr_tickets SET Severity = ? WHERE TicketID = ?", num, request_id)
    conn.commit()
    conn.close()
    return jsonify({"message": "Severity updated"})

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ID, Username, Name, Department, Gender
        FROM dbo.Employees
        WHERE Username = ? AND PasswordHash = ?
    """, (username, password))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Invalid username or password"}), 401
    employee_id = row[0] 
    department = row[3]
    log_activity(employee_id, "Logged In", None, f"User {username} logged in")
    return jsonify({
        "employee_id": row[0],
        "username": row[1],
        "name": row[2],    # <-- REAL NAME
        "department": department,
        "gender": row[4],
    }), 200

@app.route("/api/timesheets/<ticket_id>/approve", methods=["POST"])
def approve_timesheet(ticket_id):
    data = request.get_json()
    approved_by = data.get("approvedBy", "HR")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE dbo.Timesheets
        SET Status='Approved', ApprovedBy=?, ApprovedDate=GETDATE()
        WHERE TicketID=?
    """, (approved_by, ticket_id))
    
    conn.commit()
    approver_id = data.get("employee_id")

    log_activity(
        approver_id,
        "Approved Timesheet",
        None,
        f"Approved timesheet ID: {ticket_id}"
    )
    conn.close()
    return jsonify({"success": True})

@app.route("/api/timesheets/<ticket_id>/reject", methods=["POST"])
def reject_timesheet(ticket_id):
    data = request.get_json()
    approved_by = data.get("approvedBy", "HR")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE dbo.Timesheets
        SET Status='Rejected', ApprovedBy=?, ApprovedDate=GETDATE()
        WHERE TicketID=?
    """, (approved_by, ticket_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/timesheets/<string:ticket_id>/archive", methods=["POST"])
def archive_timesheet(ticket_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE Timesheets SET archived = 1 WHERE TicketID = ?", (ticket_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Request Archived"})

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

@app.route("/api/timesheets/<ticket_id>/submit", methods=["POST"])
def submit_timesheet_with_id(ticket_id):  # <--- Renamed here!
    now = "GETDATE()"
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"""
        UPDATE dbo.Timesheets SET Status='Submitted', SubmittedDate={now}
        WHERE TicketID=?""", (ticket_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})


@app.route("/api/employees", methods=["GET"])
def get_employees():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ID, Name, Email, Department, Role, ManagerID, DateJoined, Status, Phone, Gender
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
            "gender": row[9],   # <-- GENDER IS NOW HERE
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

@app.route('/api/internal-jobs', methods=['GET'])
def get_internal_jobs():
    conn = get_connection()
    cursor = conn.cursor()

    # Get job postings
    cursor.execute("""
        SELECT JobID, JobTitle, Department, Location, JobType,
               Status, ClosingDate
        FROM dbo.InternalJobs
    """)
    jobs = cursor.fetchall()

    # Get application counts from JobApplications
    cursor.execute("""
        SELECT JobID, COUNT(*) AS Applicants
        FROM dbo.JobApplications
        GROUP BY JobID
    """)
    app_counts_raw = cursor.fetchall()
    conn.close()

    # 🔧 Fix: Cast JobID to string for both
    app_counts = {str(row.JobID): row.Applicants for row in app_counts_raw}

    job_list = []
    for job in jobs:
        job_list.append({
            "id": job.JobID,
            "title": job.JobTitle,
            "department": job.Department,
            "location": job.Location,
            "type": job.JobType,
            "status": job.Status,
            "closingDate": job.ClosingDate.isoformat() if job.ClosingDate else None,
            "applicants": app_counts.get(str(job.JobID), 0)  # ✅ always matches now
        })

    return jsonify(job_list)

@app.route('/api/internal-jobs/<job_id>', methods=['PUT'])
def update_internal_job(job_id):
    try:
        data = request.json

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE dbo.InternalJobs SET
                JobTitle = ?, Department = ?, Location = ?, JobType = ?, Status = ?,
                ClosingDate = ?, JobDescription = ?, Applicants = ?, MandatorySkills = ?,
                OptionalSkills = ?, RecommendedCertifications = ?
            WHERE JobID = ?
        """, (
            data.get('title'),
            data.get('department'),
            data.get('location'),
            data.get('type'),
            data.get('status'),
            data.get('closingDate'),
            data.get('description'),
            data.get('applicants', 0),
            ', '.join(data.get('mandatorySkills', [])),
            ', '.join(data.get('optionalSkills', [])),
            data.get('certifications', ''),
            int(job_id.replace("JP", ""))  # Extract numeric JobID from JP001
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Job updated successfully"})

    except Exception as e:
        print("Error updating job:", str(e))
        return jsonify({"error": "Failed to update job"}), 500
    



@app.route("/api/job-applications", methods=["GET"])
def get_job_applications():
    job_id = request.args.get("jobId")

    conn = get_connection()
    cursor = conn.cursor()

    if job_id:
        cursor.execute("""
            SELECT 
                a.ApplicationID,
                a.EmployeeID,
                e.Name,
                e.Email,
                a.ApplicationDate,
                a.Status,
                a.JobID,
                a.InterviewDetails  -- ✅ Add this line

            FROM dbo.JobApplications a
            JOIN dbo.Employees e ON a.EmployeeID = e.ID
            WHERE a.JobID = ?
        """, (job_id,))
    else:
        cursor.execute("""
            SELECT 
                a.ApplicationID,
                a.EmployeeID,
                e.Name,
                e.Email,
                a.ApplicationDate,
                a.Status,
                a.JobID,
                a.InterviewDetails
            FROM dbo.JobApplications a
            JOIN dbo.Employees e ON a.EmployeeID = e.ID
        """)

    rows = cursor.fetchall()
    conn.close()

    return jsonify([
        {
            "ApplicationID": row.ApplicationID,
            "EmployeeID": row.EmployeeID,
            "Name": row.Name,
            "Email": row.Email,
            "ApplicationDate": row.ApplicationDate.isoformat() if row.ApplicationDate else None,
            "Status": row.Status,
            "JobID": row.JobID,
            "InterviewDetails": row.InterviewDetails 
        }
        for row in rows
    ])


@app.route('/api/post-job', methods=['POST'])
def post_job():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO InternalJobs (
            JobTitle, MandatorySkills, OptionalSkills, RecommendedCertifications,
            JobDescription, Department, Location, JobType,
            Applicants, Status, ClosingDate
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'Active', ?)
    """
    cursor.execute(query, (
        data.get('title'),
        data.get('mandatorySkills', ''),
        data.get('optionalSkills', ''),
        data.get('certifications', ''),
        data.get('description'),
        data.get('department'),
        data.get('location'),
        data.get('type'),
        data.get('closingDate')
    ))
    conn.commit()
    return jsonify({'message': 'Job posted successfully'})

@app.route("/api/job-applications/<int:application_id>", methods=["DELETE"])
def delete_job_application(application_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        check_query = "SELECT ApplicationID FROM JobApplications WHERE ApplicationID = ?"
        cursor.execute(check_query, (application_id,))
        
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Application not found"}), 404
   
        delete_query = "DELETE FROM JobApplications WHERE ApplicationID = ?"
        cursor.execute(delete_query, (application_id,))
        conn.commit()
        
        if cursor.rowcount > 0:
            return jsonify({"success": True, "message": "Application rescinded successfully"})
        else:
            return jsonify({"success": False, "message": "Failed to rescind application"}), 500
            
    except Exception as e:
        print(f"Error rescinding application: {e}")
        return jsonify({"success": False, "message": "Database error occurred"}), 500
    finally:
        if conn:
            conn.close()

@app.route("/api/update-application-status", methods=["POST"])
def update_application_status():
    data = request.get_json()
    application_id = data.get("applicationId")
    new_status = data.get("status")

    if not application_id or not new_status:
        return jsonify({"error": "Missing applicationId or status"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
            UPDATE JobApplications
            SET Status = ?
            WHERE ApplicationID = ?
        """
        cursor.execute(query, (new_status, application_id))
        conn.commit()

        return jsonify({"message": "Status updated successfully"}), 200

    except Exception as e:
        print("Error updating application status:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/api/schedule-interview", methods=["POST"])
def schedule_interview():
    data = request.get_json()
    application_id = data.get("applicationId")
    interview_data = data.get("interviewData")

    if not application_id or not interview_data:
        return jsonify({"error": "Missing applicationId or interviewData"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE JobApplications
            SET Status = ?, InterviewDetails = ?
            WHERE ApplicationID = ?
        """, (
            "Interview Scheduled",
            json.dumps(interview_data),
            application_id
        ))
        conn.commit()

        # Fetch updated application
        cursor.execute("""
            SELECT 
                a.ApplicationID,
                a.EmployeeID,
                e.Name,
                e.Email,
                a.ApplicationDate,
                a.Status,
                a.JobID
            FROM JobApplications a
            JOIN Employees e ON a.EmployeeID = e.ID
            WHERE a.ApplicationID = ?
        """, (application_id,))
        row = cursor.fetchone()
        conn.close()

        return jsonify({
            "ApplicationID": row.ApplicationID,
            "EmployeeID": row.EmployeeID,
            "Name": row.Name,
            "Email": row.Email,
            "ApplicationDate": row.ApplicationDate.isoformat() if row.ApplicationDate else None,
            "Status": row.Status,
            "JobID": row.JobID
        })

    except Exception as e:
        print("❌ Error scheduling interview:", e)
        return jsonify({"error": "Failed to schedule interview"}), 500

app.register_blueprint(it_asset_api)
app.register_blueprint(it_inventory_api)
app.register_blueprint(software_center_api)


# --- Course API ---
# ---- List All Courses ----
@app.route("/api/courses", methods=["GET"])
def get_courses():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT CourseID, CourseName, SkillsCovered, Link, category, difficulty,
                   duration, instructor, rating, enrolled, price, description, image
            FROM LMSCourses
        """)
        rows = cursor.fetchall()
        conn.close()
        courses = []
        for row in rows:
            courses.append({
                "id": row[0],
                "title": row[1],
                "skills": row[2],
                "link": row[3],
                "category": row[4],
                "difficulty": row[5],
                "duration": row[6],
                "instructor": row[7],
                "rating": row[8],
                "enrolled": row[9],
                "price": row[10],
                "description": row[11],
                "image": row[12],
            })
        return jsonify(courses)
    except Exception as e:
        print("Error in get_courses:", e)
        return jsonify({"error": str(e)}), 500

# ---- Get Course Details ----
@app.route("/api/courses/<int:course_id>", methods=["GET"])
def get_course_by_id(course_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT CourseID, CourseName, SkillsCovered, Link, category, difficulty,
                   duration, instructor, rating, enrolled, price, description, image
            FROM LMSCourses
            WHERE CourseID = ?
        """, (course_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return jsonify({"error": "Course not found"}), 404
        course = {
            "id": row[0],
            "title": row[1],
            "skills": row[2],
            "link": row[3],
            "category": row[4],
            "difficulty": row[5],
            "duration": row[6],
            "instructor": row[7],
            "rating": row[8],
            "enrolled": row[9],
            "price": row[10],
            "description": row[11],
            "image": row[12],
        }
        return jsonify(course)
    except Exception as e:
        print("Error in get_course_by_id:", e)
        return jsonify({"error": str(e)}), 500

# ---- Enroll User in Course ----
@app.route("/api/user-courses/<int:user_id>/enroll", methods=["POST"])
def enroll_user_in_course(user_id):
    try:
        data = request.json
        print("Enroll endpoint called. user_id:", user_id, "POST body:", data)
        course_id = data.get("course_id")
        if not course_id:
            print("Missing course_id in payload!")
            return jsonify({"error": "Missing course_id"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        # Check if the course exists
        cursor.execute("SELECT COUNT(*) FROM LMSCourses WHERE CourseID = ?", (course_id,))
        if cursor.fetchone()[0] == 0:
            conn.close()
            print(f"Course {course_id} does not exist!")
            return jsonify({"error": "Course does not exist"}), 400

        # Check if already enrolled
        cursor.execute(
            "SELECT COUNT(*) FROM LMSEnrollments WHERE UserID=? AND CourseID=?",
            (user_id, course_id)
        )
        if cursor.fetchone()[0] > 0:
            conn.close()
            print(f"User {user_id} already enrolled in course {course_id}")
            return jsonify({"error": "Already enrolled"}), 400

        # Insert new enrollment: UserID, CourseID, Status, Progress
        cursor.execute(
            "INSERT INTO LMSEnrollments (UserID, CourseID, Status, Progress) VALUES (?, ?, ?, ?)",
            (user_id, course_id, "Not Started", 0)
        )
        conn.commit()
        conn.close()
        print(f"User {user_id} successfully enrolled in course {course_id}")
        return jsonify({"success": True}), 201

    except Exception as e:
        print("Error in enroll_user_in_course:", e)
        return jsonify({"error": str(e)}), 500



# ---- Get All Courses a User is Enrolled In ----
@app.route("/api/user-courses/<int:user_id>", methods=["GET"])
def get_user_enrollments(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                c.CourseID, c.CourseName, c.SkillsCovered, c.Link, c.category, c.difficulty, c.duration, 
                c.instructor, c.rating, c.enrolled, c.price, c.description, c.image,
                e.Progress, e.Status, e.DueDate
            FROM LMSEnrollments e
            JOIN LMSCourses c ON e.CourseID = c.CourseID
            WHERE e.UserID = ?
        """, (user_id,))
        rows = cursor.fetchall()
        conn.close()
        enrolled_courses = []
        for row in rows:
            enrolled_courses.append({
                "id": row[0],
                "title": row[1],
                "skills": row[2],
                "link": row[3],
                "category": row[4],
                "difficulty": row[5],
                "duration": row[6],
                "instructor": row[7],
                "rating": row[8],
                "enrolled": row[9],
                "price": row[10],
                "description": row[11],
                "image": row[12],
                "progress": row[13],
                "status": row[14],
                "dueDate": row[15],
            })
        return jsonify(enrolled_courses)
    except Exception as e:
        print("Error in get_user_enrollments:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/tickets/it', methods=['GET'])
def get_it_tickets():
    include_archived = request.args.get('include_archived', 'false').lower() == 'true'
    
    conn = get_connection()
    cursor = conn.cursor()
    
    if include_archived:
        cursor.execute("SELECT * FROM IT_Tickets WHERE Status = 'Archived'")
    else:
        cursor.execute("SELECT * FROM IT_Tickets WHERE Status != 'Archived'")
    
    rows = cursor.fetchall()
    tickets = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
    conn.close()
    return jsonify(tickets)

@app.route('/api/tickets/it', methods=['POST'])
def post_it_ticket():
    data = request.get_json()
    required_fields = ["EmployeeID", "Status", "title", "description", "department"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing {field} parameter"}), 400
    employee_id = data['EmployeeID']
    status = data['Status']
    title = data['title']
    description = data['description']
    department = data['department']
    summary = data.get('summary', '')
    assigned_to = data.get('assignedTo', None)
    expected_resolution = data.get('expectedResolution', None)
    severity = classify_it_ticket(description)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO IT_Tickets (EmployeeID, Severity, Status, Title, Description, Summary, AssignedTo, ExpectedResolution, Department, SubmittedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())
    """, (employee_id, severity, status, title, description, summary, assigned_to, expected_resolution, department))
    conn.commit()
    return jsonify({"message": "IT Ticket created successfully!"}), 201

@app.route('/api/tickets/hr', methods=['GET'])
def get_hr_tickets():
    include_archived = request.args.get('include_archived', 'false').lower() == 'true'
    
    conn = get_connection()
    cursor = conn.cursor()
    
    if include_archived:
        # Get only archived tickets
        cursor.execute("SELECT * FROM hr_tickets WHERE Status = 'Archived'")
    else:
        # Get only active tickets (not archived)
        cursor.execute("SELECT * FROM hr_tickets WHERE Status != 'Archived'")
    
    rows = cursor.fetchall()
    tickets = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
    conn.close()
    return jsonify(tickets)


@app.route('/api/tickets/hr', methods=['POST'])
def post_hr_ticket():
    try:
        data = request.get_json()
        print(f"Received HR ticket data: {data}")
        
        required_fields = ["EmployeeID", "Status", "title", "description", "department"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing {field} parameter"}), 400
        employee_id = data['EmployeeID']
        status = data['Status']
        title = data['title']
        description = data['description']
        summary = data.get('summary', '')
        department = data['department']
        severity = classify_hr_ticket(description)
        print(f"Classified severity: {severity}")
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
    INSERT INTO hr_tickets (EmployeeID, Severity, Status, Title, Description, Summary, SubmittedDate, Department)
    VALUES (?, ?, ?, ?, ?, ?, GETDATE(), ?)
""", (employee_id, severity, status, title, description, summary, department))

        conn.commit()
        conn.close()
        print(f"HR Ticket created successfully!")
        return jsonify({"message": "HR Ticket created successfully!"}), 201
        
    except Exception as e:
        print(f"Error in post_hr_ticket: {str(e)}")  # Add error logging
        return jsonify({"error": str(e)}), 500

@app.route('/api/tickets/personal', methods=['GET'])
def get_personal_tickets():
    employee = request.args.get('EmployeeID')
    if not employee:
        return jsonify({"error": "Missing EmployeeID parameter"}), 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM IT_Tickets WHERE EmployeeID = ?", (employee,))
    it_rows = cursor.fetchall()
    it_tickets = [dict(zip([column[0] for column in cursor.description], row)) for row in it_rows]
    cursor.execute("SELECT * FROM hr_tickets WHERE EmployeeID = ?", (employee,))
    hr_rows = cursor.fetchall()
    hr_tickets = [dict(zip([column[0] for column in cursor.description], row)) for row in hr_rows]
    return jsonify({
        "it_tickets": it_tickets,
        "hr_tickets": hr_tickets
    })
# NEW ENDPOINT: Delete HR Ticket
@app.route('/api/tickets/it/<int:ticket_id>/archive', methods=['PUT'])
def archive_it_ticket(ticket_id):
    """Archive an IT ticket by setting its status to 'Archived'."""
    try:
        print(f"Received archive request for IT ticket {ticket_id}")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT TicketID, Status FROM IT_Tickets WHERE TicketID = ?", (ticket_id,))
        ticket = cursor.fetchone()
        
        if not ticket:
            conn.close()
            return jsonify({"error": "Ticket not found"}), 404
        
        if ticket[1] == 'Archived':
            conn.close()
            return jsonify({"error": "Ticket is already archived"}), 400
        
        cursor.execute("UPDATE IT_Tickets SET Status = 'Archived' WHERE TicketID = ?", (ticket_id,))
        
        conn.commit()
        rows_affected = cursor.rowcount
        conn.close()
        
        if rows_affected == 0:
            return jsonify({"error": "No ticket was archived"}), 400
        
        print(f"IT Ticket {ticket_id} archived successfully")
        return jsonify({
            "message": f"Ticket {ticket_id} archived successfully",
            "ticket_id": ticket_id,
            "status": "Archived"
        }), 200
        
    except Exception as e:
        print(f"Error in archive_it_ticket: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/tickets/hr/<int:ticket_id>/archive', methods=['PUT'])
def archive_hr_ticket(ticket_id):
    """Archive an HR ticket by setting its status to 'Archived'."""
    try:
        print(f"Received archive request for HR ticket {ticket_id}")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT TicketID, Status FROM hr_tickets WHERE TicketID = ?", (ticket_id,))
        ticket = cursor.fetchone()
        
        if not ticket:
            conn.close()
            return jsonify({"error": "Ticket not found"}), 404
        
        if ticket[1] == 'Archived':
            conn.close()
            return jsonify({"error": "Ticket is already archived"}), 400
        
        cursor.execute("UPDATE hr_tickets SET Status = 'Archived' WHERE TicketID = ?", (ticket_id,))
        
        conn.commit()
        rows_affected = cursor.rowcount
        conn.close()
        
        if rows_affected == 0:
            return jsonify({"error": "No ticket was archived"}), 400
        
        print(f"HR Ticket {ticket_id} archived successfully")
        return jsonify({
            "message": f"Ticket {ticket_id} archived successfully",
            "ticket_id": ticket_id,
            "status": "Archived"
        }), 200
        
    except Exception as e:
        print(f"Error in archive_hr_ticket: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/tickets/hr/<int:ticket_id>/status', methods=['PUT'])
def update_hr_ticket_status(ticket_id):
    """
    Update the status of an HR ticket.
    Expected payload: {"status": "Open|In Progress|Resolved|Closed", "assigned_to": "optional"}
    """
    try:
        data = request.get_json()
        print(f"Received status update for ticket {ticket_id}: {data}")
        
        if not data or 'status' not in data:
            return jsonify({"error": "Missing status in request body"}), 400
        
        new_status = data['status']
        assigned_to = data.get('assigned_to', None)
        
        # Validate status values
        valid_statuses = ['Open', 'In Progress', 'Resolved', 'Closed']
        if new_status not in valid_statuses:
            return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if ticket exists
        cursor.execute("SELECT TicketID FROM hr_tickets WHERE TicketID = ?", (ticket_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "Ticket not found"}), 404
        
        # Update the ticket status and assigned_to if provided
        if assigned_to:
            cursor.execute("""
                UPDATE hr_tickets 
                SET Status = ?
                WHERE TicketID = ?
            """, (new_status, ticket_id))
        else:
            cursor.execute("""
                UPDATE hr_tickets 
                SET Status = ?
                WHERE TicketID = ?
            """, (new_status, ticket_id))
        
        conn.commit()
        rows_affected = cursor.rowcount
        conn.close()
        
        if rows_affected == 0:
            return jsonify({"error": "No ticket was updated"}), 400
        
        print(f"HR Ticket {ticket_id} status updated to {new_status}")
        return jsonify({
            "message": f"Ticket {ticket_id} status updated successfully",
            "ticket_id": ticket_id,
            "new_status": new_status,
            "assigned_to": assigned_to
        }), 200
        
    except Exception as e:
        print(f"Error in update_hr_ticket_status: {str(e)}")
        return jsonify({"error": str(e)}), 500
@app.route('/api/tickets/it/<int:ticket_id>/status', methods=['PUT'])
def update_it_ticket_status(ticket_id):
    """
    Update the status of an IT ticket.
    Expected payload: {"status": "Open|In Progress|Resolved|Closed", "assigned_to": "optional"}
    """
    try:
        data = request.get_json()
        print(f"Received status update for IT ticket {ticket_id}: {data}")
        
        if not data or 'status' not in data:
            return jsonify({"error": "Missing status in request body"}), 400
        
        new_status = data['status']
        assigned_to = data.get('assigned_to', None)
        
        # Validate status values
        valid_statuses = ['Open', 'In Progress', 'Assigned', 'Resolved', 'Closed']  # Added 'Assigned'
        if new_status not in valid_statuses:
            return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if ticket exists
        cursor.execute("SELECT TicketID FROM IT_Tickets WHERE TicketID = ?", (ticket_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "Ticket not found"}), 404
        
        # Update the ticket status and assigned_to if provided
        if assigned_to:
            print(f"Updating ticket {ticket_id} with status='{new_status}' and assigned_to='{assigned_to}'")
            cursor.execute("""
                UPDATE IT_Tickets 
                SET Status = ?, AssignedTo = ?
                WHERE TicketID = ?
            """, (new_status, assigned_to, ticket_id))
        else:
            print(f"Updating ticket {ticket_id} with status='{new_status}' only")
            cursor.execute("""
                UPDATE IT_Tickets 
                SET Status = ?
                WHERE TicketID = ?
            """, (new_status, ticket_id))
        
        conn.commit()
        rows_affected = cursor.rowcount
        
        # Verify the update worked
        if rows_affected == 0:
            conn.close()
            return jsonify({"error": "No ticket was updated - check if ticket exists"}), 400
        
        # Get the updated ticket to confirm changes
        cursor.execute("SELECT Status, AssignedTo FROM IT_Tickets WHERE TicketID = ?", (ticket_id,))
        updated_ticket = cursor.fetchone()
        conn.close()
        
        print(f"IT Ticket {ticket_id} successfully updated. Status: {updated_ticket[0]}, AssignedTo: {updated_ticket[1]}")
        
        return jsonify({
            "message": f"Ticket {ticket_id} status updated successfully",
            "ticket_id": ticket_id,
            "new_status": new_status,
            "assigned_to": assigned_to,
            "updated_status": updated_ticket[0],
            "updated_assigned_to": updated_ticket[1]
        }), 200
        
    except Exception as e:
        print(f"Error in update_it_ticket_status: {str(e)}")
        import traceback
        traceback.print_exc()  # This will help debug the exact SQL error
        return jsonify({"error": str(e)}), 500

@app.route('/api/ticket-comments', methods=['POST'])
def post_comment():
    data = request.json
    ticket_id = data.get('ticket_id')
    author = data.get('author')
    content = data.get('content')
    
    # Check for missing data (no need for created_at)
    if not all([ticket_id, author, content]):
        logger.error("Missing required fields: ticket_id author, content")
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Calculate the next comment_id based ticket_id
        #cursor.execute("""
        #        SELECT ISNULL(MAX(comment_id), 0) + 1
        #        FROM ViewTicketComments
        #        WHERE ticket_id = ?
        #    """, (ticket_id,))

        #new_comment_id = cursor.fetchone()[0]

        query = """
            INSERT INTO ViewTicketComments (ticket_id, author, content, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        """
        cursor.execute(query, (ticket_id, author, content))
        conn.commit()

        logger.info(f"Comment successfully added to ticket {ticket_id}")
        return jsonify({'message': 'Comment added successfully'}), 201

    except Exception as e:
        logger.error(f"Error while adding comment: {str(e)}")
        return jsonify({'error': str(e)}), 500


    
@app.route('/api/ticket-comments', methods=['GET'])
def get_comments():
    ticket_id = request.args.get('ticket_id')
    conn = get_connection()
    if not ticket_id:
        return jsonify({'error': 'Missing ticket_id'}), 400
    try:
        cursor = conn.cursor()
        query = """
            SELECT comment_id, author, content, created_at
            FROM ViewTicketComments
            WHERE ticket_id = ?
            ORDER BY created_at ASC
        """
        cursor.execute(query, (ticket_id))
        rows = cursor.fetchall()
        comments = [{
            'comment_id': row[0],
            'author': row[1],
            'content': row[2],
            'created_at': row[3].strftime('%Y-%m-%d %H:%M:%S')
        } for row in rows]
        return jsonify(comments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tickets/hr/<int:ticket_id>/unarchive', methods=['PUT'])
def unarchive_hr_ticket(ticket_id):
    """Unarchive an HR ticket by setting its status back to 'Resolved'."""
    try:
        print(f"Received unarchive request for HR ticket {ticket_id}")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT TicketID, Status FROM hr_tickets WHERE TicketID = ?", (ticket_id,))
        ticket = cursor.fetchone()
        
        if not ticket:
            conn.close()
            return jsonify({"error": "Ticket not found"}), 404
        
        if ticket[1] != 'Archived':
            conn.close()
            return jsonify({"error": "Ticket is not archived"}), 400
        
        cursor.execute("UPDATE hr_tickets SET Status = 'Resolved' WHERE TicketID = ?", (ticket_id,))
        
        conn.commit()
        rows_affected = cursor.rowcount
        conn.close()
        
        if rows_affected == 0:
            return jsonify({"error": "No ticket was unarchived"}), 400
        
        print(f"HR Ticket {ticket_id} unarchived successfully")
        return jsonify({
            "message": f"Ticket {ticket_id} unarchived successfully",
            "ticket_id": ticket_id,
            "status": "Resolved"
        }), 200
        
    except Exception as e:
        print(f"Error in unarchive_hr_ticket: {str(e)}")
        return jsonify({"error": str(e)}), 500
# Add this endpoint to your main.py file after the archive_it_ticket endpoint

@app.route('/api/tickets/it/<int:ticket_id>/unarchive', methods=['PUT'])
def unarchive_it_ticket(ticket_id):
    """Unarchive an IT ticket by setting its status back to 'Resolved'."""
    try:
        print(f"Received unarchive request for IT ticket {ticket_id}")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT TicketID, Status FROM IT_Tickets WHERE TicketID = ?", (ticket_id,))
        ticket = cursor.fetchone()
        
        if not ticket:
            conn.close()
            return jsonify({"error": "Ticket not found"}), 404
        
        if ticket[1] != 'Archived':
            conn.close()
            return jsonify({"error": "Ticket is not archived"}), 400
        
        cursor.execute("UPDATE IT_Tickets SET Status = 'Resolved' WHERE TicketID = ?", (ticket_id,))
        
        conn.commit()
        rows_affected = cursor.rowcount
        conn.close()
        
        if rows_affected == 0:
            return jsonify({"error": "No ticket was unarchived"}), 400
        
        print(f"IT Ticket {ticket_id} unarchived successfully")
        return jsonify({
            "message": f"Ticket {ticket_id} unarchived successfully",
            "ticket_id": ticket_id,
            "status": "Resolved"
        }), 200
        
    except Exception as e:
        print(f"Error in unarchive_it_ticket: {str(e)}")
        return jsonify({"error": str(e)}), 500
# ------------------ RUN ------------------
@app.route("/api/timesheets", methods=["GET"])
def get_timesheets():
    employee_id = request.args.get('employeeId')
    status = request.args.get('status')
    conn = get_connection()
    cursor = conn.cursor()
    base_sql = """
        SELECT TicketID, EmployeeID, EmployeeName, Month, TotalHours, Overtime, WeekPeriod, SubmittedDate, Status,
               MondayHours, TuesdayHours, WednesdayHours, ThursdayHours, FridayHours, SaturdayHours, SundayHours, Notes,
               ApprovedBy, ApprovedDate, LastModified, archived
        FROM dbo.Timesheets
    """
    params = []
    where = []
    if employee_id:
        where.append("EmployeeID=?")
        params.append(employee_id)
    if status:
        where.append("Status=?")
        params.append(status)
    if where:
        base_sql += " WHERE " + " AND ".join(where)
    base_sql += " ORDER BY LastModified DESC"

    cursor.execute(base_sql, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    results = [
        {
            "id": row[0],
            "employeeId": row[1],
            "employeeName": row[2],
            "month": row[3],
            "totalHours": row[4],
            "overtime": row[5],
            "week": row[6],
            "submittedDate": row[7].isoformat() if row[7] else None,
            "status": row[8],
            "MondayHours": row[9],
            "TuesdayHours": row[10],
            "WednesdayHours": row[11],
            "ThursdayHours": row[12],
            "FridayHours": row[13],
            "SaturdayHours": row[14],
            "SundayHours": row[15],
            "notes": row[16],
            "approvedBy": row[17],
            "approvedDate": row[18].isoformat() if row[18] else None,
            "lastModified": row[19].isoformat() if row[19] else None,
            "archived": bool(row[20]) if row[20] is not None else False,
        }
        for row in rows
    ]
    return jsonify(results)

@app.route("/api/timesheets", methods=["POST"])
def submit_timesheet():
    data = request.get_json()
    required_fields = [
        "employeeId", "employeeName", "month", "week", "totalHours", "regularHours", "overtimeHours",
        "MondayHours", "TuesdayHours", "WednesdayHours", "ThursdayHours",
        "FridayHours", "SaturdayHours", "SundayHours", "notes"
    ]
    # Check for missing fields
    for f in required_fields:
        if f not in data:
            return jsonify({"error": f"Missing required field: {f}"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    # TicketID logic (TSxxx format)
    cursor.execute("SELECT MAX(TicketID) FROM dbo.Timesheets")
    raw_last_id = cursor.fetchone()[0]
    if raw_last_id and isinstance(raw_last_id, str) and raw_last_id.startswith("TS"):
        num = int(raw_last_id[2:])
        next_id = f"TS{num+1:03d}"
    else:
        next_id = "TS001"

    # INSERT statement including Month column!
    cursor.execute("""
        INSERT INTO dbo.Timesheets (
            TicketID, EmployeeID, EmployeeName, Month, WeekPeriod, TotalHours, Overtime, Status,
            MondayHours, TuesdayHours, WednesdayHours, ThursdayHours,
            FridayHours, SaturdayHours, SundayHours, Notes, SubmittedDate, ApprovedBy, ApprovedDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), NULL, NULL)
    """, (
        next_id, data["employeeId"], data["employeeName"], data["month"], data["week"],
        data["totalHours"], data["overtimeHours"], "Submitted",
        data["MondayHours"], data["TuesdayHours"], data["WednesdayHours"], data["ThursdayHours"],
        data["FridayHours"], data["SaturdayHours"], data["SundayHours"], data["notes"]
    ))

    conn.commit()
    conn.close()
    return jsonify({"message": "Timesheet submitted", "id": next_id})



@app.route("/api/timesheets/draft", methods=["POST"])
def save_timesheet_draft():
    data = request.get_json()
    required_fields = [
        "employeeId", "employeeName", "month", "week", "totalHours", "regularHours", "overtimeHours",
        "MondayHours", "TuesdayHours", "WednesdayHours", "ThursdayHours",
        "FridayHours", "SaturdayHours", "SundayHours", "notes"
    ]
    for f in required_fields:
        if f not in data:
            return jsonify({"error": f"Missing required field: {f}"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    # See if a draft already exists for this week and employee
    cursor.execute("""
        SELECT TicketID FROM dbo.Timesheets
        WHERE EmployeeID=? AND WeekPeriod=? AND Status='Draft'
    """, (data["employeeId"], data["week"]))
    row = cursor.fetchone()
    now = "GETDATE()"
    if row:
        # UPDATE draft
        cursor.execute(f"""
            UPDATE dbo.Timesheets SET
                EmployeeName=?, Month=?, TotalHours=?, Overtime=?, 
                MondayHours=?, TuesdayHours=?, WednesdayHours=?, ThursdayHours=?,
                FridayHours=?, SaturdayHours=?, SundayHours=?, Notes=?, LastModified={now}
            WHERE TicketID=?""",
            (
                data["employeeName"], data["month"], data["totalHours"], data["overtimeHours"],
                data["MondayHours"], data["TuesdayHours"], data["WednesdayHours"], data["ThursdayHours"],
                data["FridayHours"], data["SaturdayHours"], data["SundayHours"], data["notes"], row[0]
            ))
        draft_id = row[0]
    else:
        # INSERT new draft
        cursor.execute("SELECT MAX(TicketID) FROM dbo.Timesheets")
        raw_last_id = cursor.fetchone()[0]
        if raw_last_id and isinstance(raw_last_id, str) and raw_last_id.startswith("TS"):
            num = int(raw_last_id[2:])
            next_id = f"TS{num+1:03d}"
        else:
            next_id = "TS001"
        cursor.execute(f"""
            INSERT INTO dbo.Timesheets (
                TicketID, EmployeeID, EmployeeName, Month, WeekPeriod, TotalHours, Overtime, Status,
                MondayHours, TuesdayHours, WednesdayHours, ThursdayHours, FridayHours, SaturdayHours, SundayHours, Notes, LastModified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft', ?, ?, ?, ?, ?, ?, ?, ?, {now})
        """, (
            next_id, data["employeeId"], data["employeeName"], data["month"], data["week"], data["totalHours"],
            data["overtimeHours"], data["MondayHours"], data["TuesdayHours"], data["WednesdayHours"],
            data["ThursdayHours"], data["FridayHours"], data["SaturdayHours"], data["SundayHours"], data["notes"]
        ))
        draft_id = next_id
    conn.commit()
    conn.close()
    return jsonify({"message": "Draft saved", "id": draft_id})

# Admin
@app.route("/api/employees/count", methods=["GET"])
def get_employee_count_by_department():
    conn = get_connection()
    cursor = conn.cursor()

    # Query to get employees with their department
    cursor.execute("""
        SELECT ID, Name, Email, Department, Role, ManagerID, DateJoined, Status, Phone, Gender
        FROM Employees
    """)
    rows = cursor.fetchall()
    
    # Dictionary to map employee IDs to names
    id_to_name = {row[0]: row[1] for row in rows}
    
    # Dictionary to count employees by department
    department_count = {
        'IT': 0,
        'HR': 0,
        'Admin': 0,
        'All': 0  # New category to capture all employees
    }

    # Count employees by department
    for row in rows:
        department = row[3]  # department is in the 4th column
        if department in department_count:
            department_count[department] += 1
        else:
            department_count['All'] += 1  # If the department is not IT, HR, or Admin, count as 'All'

    conn.close()

    # Return the department count in the response
    return jsonify(department_count)

@app.route("/api/system-settings", methods=["GET"])
def get_system_env():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT Feature, Value 
        FROM SystemSettings 
        WHERE Feature IN ('Host_Key', 'Database_Key', 'AI_Key', 'Uptime', 'MaintenanceMode')
    """)
    rows = cursor.fetchall()
    conn.close()

    response = {
        "envs": [],
        "uptime": None,
        "maintenanceMode": None
    }

    for feature, value in rows:
        if feature == "Uptime":
            response["uptime"] = value
        elif feature == "MaintenanceMode":
            response["maintenanceMode"] = value.lower() == 'true'
        else:
            response["envs"].append({
                "key": feature,
                "value": value
            })

    return jsonify(response)



@app.route("/api/system-settings/maintenance", methods=["PUT"])
def toggle_maintenance_mode():
    data = request.json
    new_mode = data.get("maintenanceMode")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE SystemSettings SET Value = ?
        WHERE Feature = 'MaintenanceMode'
    """, (str(new_mode),))

    # Update uptime if maintenance is being turned OFF
    if new_mode == False:
        now_iso = datetime.utcnow().isoformat()
        cursor.execute("""
            UPDATE SystemSettings SET Value = ?
            WHERE Feature = 'Uptime'
        """, (now_iso,))
    log_activity("Admin", "Toggled maintenance mode", "Admin", f"Status: {new_mode}")
    conn.commit()
    conn.close()
    return jsonify({"success": True, "maintenanceMode": new_mode})

@app.route('/api/database-size', methods=['GET'])
def get_database_size():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
            CAST(SUM(a.total_pages) * 8.0 / 1024 AS DECIMAL(10,2)) AS DatabaseSizeMB
            FROM
            sys.partitions p
            JOIN sys.allocation_units a ON p.partition_id = a.container_id
        """)
        db_size = cursor.fetchone()[0]

        cursor.close()
        conn.close()

        return jsonify({ "databaseSize": f"{db_size} MB" })
    except Exception as e:
        return jsonify({ "error": str(e) }), 500

#announcements
@app.route("/api/hr-announcements", methods=["GET"])
def list_hr_announcements():
    department = request.args.get("department", "").strip().lower()  # get query param
    active_only = request.args.get("active", "true").lower() == "true"  # default to active only

    conn = get_connection()
    cur = conn.cursor()

    # Build the query dynamically based on filters
    query = """
        SELECT ID, Title, Message, CreatedBy, CreatedDate, ExpiryDate, Priority, Department, IsActive
        FROM dbo.Announcements
        WHERE 1=1
    """
    params = []

    # Filter by active status
    if active_only:
        query += " AND IsActive = 1"

    # Filter by department if provided
    if department:
        query += " AND (LOWER(Department) = ? OR LOWER(Department) = 'all')"
        params.append(department)

    # Filter out expired announcements
    query += " AND (ExpiryDate IS NULL OR ExpiryDate >= GETDATE())"
    
    query += " ORDER BY Priority DESC, CreatedDate DESC"

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    return jsonify([
        {
            "id": r.ID,
            "title": r.Title,
            "message": r.Message,
            "createdBy": r.CreatedBy,
            "createdDate": r.CreatedDate.isoformat() if r.CreatedDate else None,
            "expiryDate": r.ExpiryDate.isoformat() if r.ExpiryDate else None,
            "priority": r.Priority,
            "department": r.Department,
            "isActive": bool(r.IsActive)
        }
        for r in rows
    ])

@app.route("/api/hr-announcements", methods=["POST"])
def create_hr_announcement():
    data = request.get_json(force=True)
    title = data.get("title")
    message = data.get("message")
    created_by = data.get("createdBy")
    expiry_date = data.get("expiryDate")  # Optional, can be None
    priority = data.get("priority", 1)  # Default priority 1 (low)
    department = data.get("department", "all")  # Default to 'all'
    is_active = data.get("isActive", True)  # Default to active

    if not title or not message or not created_by:
        return jsonify({"error": "title, message, and createdBy are required"}), 400

    # Validate priority range (assuming 1=low, 2=medium, 3=high)
    if priority not in [1, 2, 3]:
        return jsonify({"error": "priority must be 1 (low), 2 (medium), or 3 (high)"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO dbo.Announcements (Title, Message, CreatedBy, CreatedDate, ExpiryDate, Priority, Department, IsActive)
        OUTPUT INSERTED.ID
        VALUES (?, ?, ?, GETDATE(), ?, ?, ?, ?)
    """, (title, message, created_by, expiry_date, priority, department, is_active))
    row = cur.fetchone()
    conn.commit()
    conn.close()

    if not row:
        return jsonify({"error": "Insert succeeded but no ID returned"}), 500

    return jsonify({"id": str(row[0])})

@app.route("/api/hr-announcements/<int:announcement_id>", methods=["PUT"])
def update_hr_announcement(announcement_id):
    data = request.get_json(force=True)
    title = data.get("title")
    message = data.get("message")
    created_by = data.get("createdBy")
    expiry_date = data.get("expiryDate")
    priority = data.get("priority", 1)
    department = data.get("department", "all")
    is_active = data.get("isActive", True)

    if not title or not message or not created_by:
        return jsonify({"error": "title, message, and createdBy are required"}), 400

    # Validate priority range
    if priority not in [1, 2, 3]:
        return jsonify({"error": "priority must be 1 (low), 2 (medium), or 3 (high)"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE dbo.Announcements
        SET Title = ?, Message = ?, CreatedBy = ?, ExpiryDate = ?, Priority = ?, Department = ?, IsActive = ?
        WHERE ID = ?
    """, (title, message, created_by, expiry_date, priority, department, is_active, announcement_id))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route("/api/hr-announcements/<int:announcement_id>", methods=["DELETE"])
def delete_hr_announcement(announcement_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM dbo.Announcements WHERE ID = ?", (announcement_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        print("Error deleting announcement:", e)
        return jsonify({"error": "Failed to delete announcement"}), 500

# Additional endpoint to deactivate instead of delete
@app.route("/api/hr-announcements/<int:announcement_id>/deactivate", methods=["PUT"])
def deactivate_hr_announcement(announcement_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE dbo.Announcements SET IsActive = 0 WHERE ID = ?", (announcement_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        print("Error deactivating announcement:", e)
        return jsonify({"error": "Failed to deactivate announcement"}), 500

# --- FETCH LOGS ---
@app.route('/api/logs', methods=['GET'])
def get_activity_logs():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, timestamp, username, action, type, details
        FROM ActivityLog
        ORDER BY timestamp DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    logs = []
    for row in rows:
        logs.append({
            "id": row[0],
            "timestamp": row[1].strftime("%Y-%m-%d %H:%M:%S"),
            "username": row[2],
            "action": row[3],
            "type": row[4],
            "details": row[5]
        })

    return jsonify(logs)

<<<<<<< HEAD



@app.route("/api/quiz/submit", methods=["POST"])
def quiz_submit():
    """
    Body: {
      "name": "Alice",
      "score": 8,
      "totalQuestions": 10,
      "durationSeconds": 124   (optional)
    }
    """
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    score = int(data.get("score") or 0)
    total_q = int(data.get("totalQuestions") or 0)
    duration = data.get("durationSeconds")

    if not name or total_q <= 0:
        return jsonify({"error": "Invalid payload"}), 400

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO dbo.QuizScores (PlayerName, Score, TotalQuestions, DurationSeconds)
            VALUES (?, ?, ?, ?)
        """, (name[:100], score, total_q, duration))
        conn.commit()

        # return the just-saved row (server timestamp)
        cur.execute("""
            SELECT TOP (1) Id, PlayerName, Score, TotalQuestions, DurationSeconds, CompletedAt
            FROM dbo.QuizScores
            WHERE PlayerName = ?
            ORDER BY Id DESC
        """, (name[:100],))
        row = cur.fetchone()
        conn.close()

        return jsonify({
            "id": row[0],
            "name": row[1],
            "score": row[2],
            "totalQuestions": row[3],
            "durationSeconds": row[4],
            "completedAt": row[5].isoformat()
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/quiz/leaderboard", methods=["GET"])
def quiz_leaderboard():
    """
    Query:
      limit=10
      bestOnly=true|false  (true uses the view, one best row per player)
    """
    limit = int(request.args.get("limit", 10))
    best_only = (request.args.get("bestOnly", "true").lower() == "true")

    try:
        
        conn = get_connection()
        cur = conn.cursor()
        if best_only:
            cur.execute(f"""
                SELECT TOP ({limit})
                    PlayerName, Score, TotalQuestions, DurationSeconds, CompletedAt
                FROM dbo.vw_QuizLeaderboard
                ORDER BY Score DESC, CompletedAt ASC
            """)
        else:
            cur.execute(f"""
                SELECT TOP ({limit})
                    PlayerName, Score, TotalQuestions, DurationSeconds, CompletedAt
                FROM dbo.QuizScores
                ORDER BY Score DESC, CompletedAt DESC
            """)
        rows = cur.fetchall()
        conn.close()

        results = [{
            "name": r[0],
            "score": r[1],
            "totalQuestions": r[2],
            "durationSeconds": r[3],
            "timestamp": r[4].strftime("%Y-%m-%d %H:%M")
        } for r in rows]

        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

=======
>>>>>>> bb7cbcf39d07acaad1512b3023d57e8ae4eb71de
@app.route("/api/hello", methods=["GET"])
def hello_world():
    return jsonify({"msg": "Hello, Flask is working!"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)