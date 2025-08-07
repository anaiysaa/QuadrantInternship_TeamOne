from flask import Blueprint, request, jsonify
import pyodbc, os, uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv


# ✅ Load .env from the root directory (same level as main.py)
load_dotenv()

feedback_api = Blueprint("feedback_api", __name__)

# def get_connection():
#     """Get database connection using environment variables"""
#     try:
#         conn_str = os.getenv("DB_CONN_STR")
#         if not conn_str:
#             # Fallback: construct connection string from individual components
#             conn_str = (
#                 f"DRIVER={{ODBC Driver 18 for SQL Server}};"
#                 f"SERVER={os.getenv('AZURE_SQL_SERVER')};"
#                 f"DATABASE={os.getenv('AZURE_SQL_DB')};"
#                 f"UID={os.getenv('AZURE_SQL_USER')};"
#                 f"PWD={os.getenv('AZURE_SQL_PASSWORD')};"
#                 "Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
#             )
#         return pyodbc.connect(conn_str)
#     except Exception as e:
#         print(f"❌ Database connection error: {e}")
#         raise

def get_connection():
    return pyodbc.connect(
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={os.getenv('AZURE_SQL_SERVER')};"
        f"DATABASE={os.getenv('AZURE_SQL_DB')};"
        f"UID={os.getenv('AZURE_SQL_USER')};"
        f"PWD={os.getenv('AZURE_SQL_PASSWORD')};"
        "Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    )

# ---------------------- GET Feedback for Employee ----------------------
@feedback_api.route("/feedback", methods=["GET"])
def get_feedback():
    employee_id = request.args.get("employeeId")
    if not employee_id:
        return jsonify({"error": "employeeId parameter is required"}), 400
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ID, EmployeeID, Category, Subject, Message, Rating,
                   Anonymous, Status, SubmittedDate, Response, RecipientGroup
            FROM dbo.Feedback
            WHERE EmployeeID = ?
            ORDER BY SubmittedDate DESC
        """, (employee_id,))
        rows = cursor.fetchall()
        conn.close()

        return jsonify([
            {
                "id": row.ID,
                "employeeId": row.EmployeeID,
                "category": row.Category,
                "subject": row.Subject,
                "message": row.Message,
                "rating": row.Rating,
                "anonymous": row.Anonymous,
                "status": row.Status,
                "submittedDate": row.SubmittedDate.isoformat() if row.SubmittedDate else None,
                "response": row.Response,
                "recipientGroup": getattr(row, "RecipientGroup", None)
            }
            for row in rows
        ])
    except Exception as e:
        print(f"❌ Error fetching feedback: {e}")
        return jsonify({"error": "Failed to fetch feedback"}), 500

# ---------------------- POST New Feedback ----------------------
@feedback_api.route("/feedback", methods=["POST"])
def add_feedback():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        new_id = str(uuid.uuid4())

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO dbo.Feedback
            (ID, EmployeeID, Category, Subject, Message, Rating,
             Anonymous, Status, SubmittedDate, CreatedDate, UpdatedDate, RecipientGroup)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            new_id,
            data.get("employeeId"),
            data.get("category"),
            data.get("subject"),
            data.get("message"),
            data.get("rating"),
            data.get("anonymous"),
            "Under Review",
            datetime.now(),
            datetime.now(),
            datetime.now(),
            data.get("recipientGroup")
        ))

        conn.commit()
        conn.close()
        return jsonify({"message": "✅ Feedback submitted", "id": new_id}), 201

    except Exception as e:
        print("❌ Error inserting feedback:", e)
        return jsonify({"error": "Failed to submit feedback"}), 500

# ---------------------- GET Employees (for Recipient Dropdown) ----------------------
@feedback_api.route("/feedback/employees", methods=["GET"])
def get_employees():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT ID, Name, Role FROM dbo.Employees")
        rows = cursor.fetchall()
        conn.close()

        return jsonify([
            {"EmployeeID": row.ID, "Name": row.Name, "Role": row.Role}
            for row in rows
        ])

    except Exception as e:
        print("❌ Error fetching employees:", e)
        return jsonify({"error": str(e)}), 500

# ---------------------- GET All Feedback (HR View) ----------------------
@feedback_api.route("/feedback/all", methods=["GET"])
def get_all_feedback():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ID, EmployeeID, Category, Subject, Message, Rating,
                   Anonymous, Status, SubmittedDate, Response, RecipientGroup
            FROM dbo.Feedback
            ORDER BY SubmittedDate DESC
        """)
        rows = cursor.fetchall()
        conn.close()

        return jsonify([
            {
                "id": row.ID,
                "employeeId": row.EmployeeID,
                "category": row.Category,
                "subject": row.Subject,
                "message": row.Message,
                "rating": row.Rating,
                "anonymous": row.Anonymous,
                "status": row.Status,
                "submittedDate": row.SubmittedDate.isoformat() if row.SubmittedDate else None,
                "response": row.Response,
                "recipientGroup": getattr(row, "RecipientGroup", None)
            }
            for row in rows
        ])
    except Exception as e:
        print("❌ Error fetching all feedback:", e)
        return jsonify({"error": str(e)}), 500

# ---------------------- PUT Respond to Feedback ----------------------
@feedback_api.route("/feedback/respond/<feedback_id>", methods=["PUT"])
def respond_to_feedback(feedback_id):
    try:
        data = request.json
        response = data.get("response")
        responded_by = data.get("respondedBy", "HR Admin")

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE dbo.Feedback
            SET Response = ?, ResponseDate = GETDATE(),
                RespondedBy = ?, Status = 'Responded', UpdatedDate = GETDATE()
            WHERE ID = ?
        """, (response, responded_by, feedback_id))

        conn.commit()
        conn.close()

        return jsonify({"message": "✅ Response saved"}), 200

    except Exception as e:
        print("❌ Error updating feedback:", e)
        return jsonify({"error": str(e)}), 500

# ---------------------- EMPLOYEE DASHBOARD ----------------------
@feedback_api.route("/employee-dashboard", methods=["GET"])
def get_employee_dashboard():
    try:
        employee_id = request.args.get("employeeId")
        if not employee_id:
            return jsonify({"error": "employeeId parameter is required"}), 400

        print(f"🔍 Fetching dashboard for employee: {employee_id}")
        
        conn = get_connection()
        cursor = conn.cursor()

        # 🔹 Profile Info (including manager name from self-join)
        cursor.execute("""
            SELECT E.Name, E.Email, E.Role, E.Department, E.DateJoined, M.Name AS ManagerName
            FROM dbo.Employees E
            LEFT JOIN dbo.Employees M ON E.ManagerID = M.ID
            WHERE E.ID = ?
        """, (employee_id,))
        profile_row = cursor.fetchone()

        if not profile_row:
            print(f"❌ No employee found with ID: {employee_id}")
            return jsonify({"error": "Employee not found"}), 404

        profile = {
            "name": profile_row.Name,
            "email": profile_row.Email,
            "role": profile_row.Role,
            "department": profile_row.Department,
            "dateJoined": profile_row.DateJoined.isoformat() if profile_row.DateJoined else None,
            "managerName": profile_row.ManagerName
        }

        # 🔹 Feedback Count
        cursor.execute("SELECT COUNT(*) FROM dbo.Feedback WHERE EmployeeID = ?", (employee_id,))
        feedback_count = cursor.fetchone()[0]

        # 🔹 Job Applications Count
        cursor.execute("SELECT COUNT(*) FROM dbo.JobApplications WHERE EmployeeID = ?", (employee_id,))
        job_applications = cursor.fetchone()[0]

        # 🔹 Leave Requests Count
        cursor.execute("SELECT COUNT(*) FROM dbo.LeaveRequests WHERE Employee = ?", (employee_id,))
        leave_requests = cursor.fetchone()[0]

        # 🔹 IT Tickets Count
        cursor.execute("SELECT COUNT(*) FROM dbo.IT_Tickets WHERE EmployeeID = ?", (employee_id,))
        it_tickets = cursor.fetchone()[0]

        # 🔹 Announcements
        cursor.execute("""
            SELECT TOP 5 ID, Title, Message, CreatedDate 
            FROM dbo.Announcements 
            ORDER BY CreatedDate DESC
        """)
        announcements = [
            {
                "id": row.ID,
                "title": row.Title,
                "message": row.Message,
                "createdDate": row.CreatedDate.isoformat() if row.CreatedDate else None
            }
            for row in cursor.fetchall()
        ]

        conn.close()

        response_data = {
            "name": profile.get("name", "there"),
            "profile": profile,
            "stats": {
                "feedbackCount": feedback_count,
                "jobApplications": job_applications,
                "leaveRequests": leave_requests,
                "itTickets": it_tickets
            },
            "announcements": announcements
        }
        
        print(f"✅ Dashboard data fetched successfully for {employee_id}")
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Error fetching dashboard data: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------------------- HR DASHBOARD ----------------------
@feedback_api.route("/hr-dashboard", methods=["GET"])
def hr_dashboard():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        today = datetime.today()
        current_month = today.month
        current_year = today.year
        one_week_from_now = today + timedelta(days=7)

        # 🔹 Get first name from Employees table using employeeId (optional)
        employee_id = request.args.get("employeeId")
        first_name = "THERE"
        if employee_id:
            cursor.execute("SELECT Name FROM dbo.Employees WHERE ID = ?", (employee_id,))
            row = cursor.fetchone()
            if row and row.Name:
                first_name = row.Name.split(" ")[0].upper()
        
        # 1. Total Feedback
        cursor.execute("SELECT COUNT(*) FROM dbo.Feedback")
        total_feedback = cursor.fetchone()[0]

        # 2. Pending Feedback
        cursor.execute("SELECT COUNT(*) FROM dbo.Feedback WHERE Status = 'Pending'")
        pending_feedback = cursor.fetchone()[0]

        # 3. Leave Requests
        cursor.execute("SELECT COUNT(*) FROM dbo.LeaveRequests")
        leave_requests = cursor.fetchone()[0]

        # 4. Total Employees
        cursor.execute("SELECT COUNT(*) FROM dbo.Employees")
        employee_count = cursor.fetchone()[0]

        # 5. New Hires This Month
        cursor.execute("""
            SELECT COUNT(*) FROM dbo.Employees 
            WHERE MONTH(DateJoined) = ? AND YEAR(DateJoined) = ?
        """, (current_month, current_year))
        new_hires = cursor.fetchone()[0]

        # 6. Upcoming Work Anniversaries (7 days)
        cursor.execute("SELECT Name, DateJoined FROM dbo.Employees WHERE DateJoined IS NOT NULL")
        upcoming_anniversaries = []
        for name, doj in cursor.fetchall():
            try:
                anniv_this_year = doj.replace(year=today.year)
                if today.date() <= anniv_this_year <= one_week_from_now.date():
                    upcoming_anniversaries.append({
                        "name": name,
                        "dateJoined": doj.strftime("%Y-%m-%d")
                    })
            except Exception:
                continue

        # Continue with rest of the dashboard logic...
        # (Rest of the HR dashboard code remains the same)
        
        conn.close()
        
        return jsonify({
            "firstName": first_name,
            "totalFeedback": total_feedback,
            "pendingFeedback": pending_feedback,
            "leaveRequests": leave_requests,
            "employeeCount": employee_count,
            "newHires": new_hires,
            "upcomingAnniversaries": upcoming_anniversaries,
            # Add other fields as needed
        })
        
    except Exception as e:
        print(f"❌ Error in HR dashboard: {e}")
        return jsonify({"error": str(e)}), 500

# ---------------------- IT DASHBOARD ----------------------
@feedback_api.route("/it-dashboard", methods=["GET"])
def it_dashboard():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # 🔹 Get employee first name (if employeeId is provided)
        employee_id = request.args.get("employeeId")
        first_name = "THERE"
        if employee_id:
            cursor.execute("SELECT Name FROM dbo.Employees WHERE ID = ?", (employee_id,))
            row = cursor.fetchone()
            if row and row.Name:
                first_name = row.Name.split(" ")[0].upper()

        # --- 1. Total Inventory Items ---
        cursor.execute("SELECT COUNT(*) FROM dbo.InventoryItems")
        total_inventory = cursor.fetchone()[0]

        # --- 2. Total Assigned Inventory ---
        cursor.execute("SELECT SUM(Assigned) FROM dbo.InventoryItems")
        total_assigned = cursor.fetchone()[0] or 0

        # --- 3. Total Available Inventory ---
        cursor.execute("SELECT SUM(Available) FROM dbo.InventoryItems")
        total_available = cursor.fetchone()[0] or 0

        # --- 4. Total IT Assets ---
        cursor.execute("SELECT COUNT(*) FROM dbo.IT_Assets")
        total_assets = cursor.fetchone()[0]

        # --- 5. Total IT Tickets ---
        cursor.execute("SELECT COUNT(*) FROM dbo.IT_Tickets")
        total_tickets = cursor.fetchone()[0]

        # --- 6. Open IT Tickets ---
        cursor.execute("SELECT COUNT(*) FROM dbo.IT_Tickets WHERE Status = 'Open'")
        open_tickets = cursor.fetchone()[0]

        # --- 7. Tickets by Department ---
        cursor.execute("""
            SELECT Department, COUNT(*) 
            FROM dbo.IT_Tickets 
            WHERE Department IS NOT NULL 
            GROUP BY Department
        """)
        tickets_by_dept = [{"department": row[0], "count": row[1]} for row in cursor.fetchall()]

        # --- 8. Recently Uploaded Troubleshooting Docs (latest 5) ---
        cursor.execute("""
            SELECT TOP 5 Title, Category, DateUploaded 
            FROM dbo.IT_TroubleshootingDocs 
            ORDER BY DateUploaded DESC
        """)
        recent_docs = [{
            "title": row[0],
            "category": row[1],
            "dateUploaded": row[2].strftime("%Y-%m-%d") if row[2] else None
        } for row in cursor.fetchall()]

        conn.close()

        return jsonify({
            "firstName": first_name,
            "totalInventory": total_inventory,
            "totalAssigned": total_assigned,
            "totalAvailable": total_available,
            "totalAssets": total_assets,
            "totalTickets": total_tickets,
            "openTickets": open_tickets,
            "ticketsByDepartment": tickets_by_dept,
            "recentDocs": recent_docs
        })
        
    except Exception as e:
        print(f"❌ Error in IT dashboard: {e}")
        return jsonify({"error": str(e)}), 500

# ---------------------- ADMIN DASHBOARD ----------------------
@feedback_api.route("/admin-dashboard", methods=["GET"])
def admin_dashboard():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        today = datetime.today()

        # --- Metrics ---
        cursor.execute("SELECT COUNT(*) FROM dbo.Employees")
        total_employees = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM dbo.Feedback WHERE Status = 'Pending'")
        pending_feedback = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM dbo.LeaveRequests WHERE Status = 'Pending'")
        pending_leave = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM dbo.IT_Tickets WHERE Status = 'Open'")
        open_it_tickets = cursor.fetchone()[0]

        # --- Recent Logs ---
        cursor.execute("""
            SELECT TOP 5 timestamp, username, action, type, severity 
            FROM dbo.ActivityLog 
            ORDER BY timestamp DESC
        """)
        recent_logs = [
            {
                "timestamp": row.timestamp.strftime('%Y-%m-%d %H:%M:%S') if row.timestamp else None,
                "username": row.username,
                "action": row.action,
                "type": row.type,
                "severity": row.severity
            }
            for row in cursor.fetchall()
        ]

        # --- Continue with other admin dashboard logic ---
        
        conn.close()

        return jsonify({
            "adminName": "Admin",
            "totalEmployees": total_employees,
            "pendingFeedback": pending_feedback,
            "pendingLeaveRequests": pending_leave,
            "openItTickets": open_it_tickets,
            "recentLogs": recent_logs,
            # Add other fields as needed
        })
        
    except Exception as e:
        print(f"❌ Error in admin dashboard: {e}")
        return jsonify({"error": str(e)}), 500