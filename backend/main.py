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

from it_asset_api import it_asset_api
from it_inventory_api import it_inventory_api
from software_center_api import software_center_api


from ticketAi.it_ticket_bot import classify_it_ticket
from ticketAi.hr_ticket_bot import classify_hr_ticket

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

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






# ------------------ EMPLOYEES ------------------

@app.route("/api/employees", methods=["GET"])
def get_employees():
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
        return jsonify(employees)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------ LEAVE REQUESTS (SAMPLE) ------------------

@app.route("/api/leave-requests", methods=["GET"])
def get_leave_requests():
    emp_id = request.args.get("employee_id")
    conn = get_connection()
    cursor = conn.cursor()
    if emp_id:
        cursor.execute("""
            SELECT RequestID, Employee, Type, StartDate, EndDate, Days, Status, Urgent, Reason, SubmittedDate
            FROM LeaveRequests WHERE Employee=?
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
        for k in ('StartDate', 'EndDate', 'SubmittedDate'):
            if r.get(k):
                r[k] = str(r[k])
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
    if not employee:
        return jsonify({"error": "Employee ID is required"}), 400
    type_ = data.get("Type") or data.get("type")
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
    print("Received data:", data)

    conn.commit()
    conn.close()
    return jsonify({"RequestID": new_id, "success": True, "days": days}), 201

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
        course_id = data.get("course_id")
        if not course_id:
            return jsonify({"error": "Missing course_id"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        # Check if already enrolled
        cursor.execute(
            "SELECT COUNT(*) FROM LMSEnrollments WHERE UserID=? AND CourseID=?",
            (user_id, course_id)
        )
        if cursor.fetchone()[0] > 0:
            conn.close()
            return jsonify({"error": "Already enrolled"}), 400

        # Insert new enrollment: UserID, CourseID, Status, Progress
        cursor.execute(
            "INSERT INTO LMSEnrollments (UserID, CourseID, Status, Progress) VALUES (?, ?, ?, ?)",
            (user_id, course_id, "Not Started", 0)
        )
        conn.commit()
        conn.close()
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
    ticket_type = data.get('ticket_type')
    author = data.get('author')
    content = data.get('content')
    
    # Check for missing data
    if not all([ticket_id, ticket_type, author, content]):
        logger.error("Missing required fields: ticket_id, ticket_type, author, content")
        return jsonify({'error': 'Missing required fields'}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO ViewTicketComments (ticket_id, ticket_type, author, content)
            VALUES (?, ?, ?, ?)
        """
        cursor.execute(query, (ticket_id, ticket_type, author, content))
        conn.commit()
        logger.info(f"Comment successfully added to ticket {ticket_id}")
        return jsonify({'message': 'Comment added successfully'}), 201
    except Exception as e:
        logger.error(f"Error while adding comment: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/ticket-comments', methods=['GET'])
def get_comments():
    ticket_id = request.args.get('ticket_id')
    ticket_type = request.args.get('ticket_type')
    conn = get_connection()
    if not ticket_id or not ticket_type:
        return jsonify({'error': 'Missing ticket_id or ticket_type'}), 400
    try:
        cursor = conn.cursor()
        query = """
            SELECT comment_id, author, content, created_at
            FROM ViewTicketComments
            WHERE ticket_id = ? AND ticket_type = ?
            ORDER BY created_at ASC
        """
        cursor.execute(query, (ticket_id, ticket_type))
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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)