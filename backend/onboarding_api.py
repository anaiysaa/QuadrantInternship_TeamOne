from flask import Blueprint, request, jsonify
import pyodbc
import os
from dotenv import load_dotenv
import json

load_dotenv()

onboarding_api = Blueprint('onboarding_api', __name__)

def get_connection():
    conn_str = os.getenv("DB_CONN_STR")
    return pyodbc.connect(conn_str)

# --- NewHires Endpoints ---

@onboarding_api.route('/newhires', methods=['GET'])
def list_new_hires():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ID, Name, Email, Role, DateJoined, ManagerID, OnboardingStatus, ChecklistAssigned, ChecklistStatus, ChecklistTasksStatus
        FROM dbo.NewHires
        ORDER BY DateJoined DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    hires = []
    for row in rows:
        # Parse checklist tasks JSON safely
        try:
            tasks_status = json.loads(row[9]) if row[9] else []

        except Exception:
            tasks_status = []

        hires.append({
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "role": row[3],
            "dateJoined": str(row[4]) if row[4] else None,
            "managerId": row[5],
            "onboardingStatus": row[6],
            "checklistAssigned": bool(row[7]),
            "checklistStatus": row[8],
            "checklistTasksStatus": tasks_status,
        })
    return jsonify(hires)


@onboarding_api.route('/newhires/<int:hire_id>', methods=['GET'])
def get_new_hire(hire_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ID, Name, Email, Role, DateJoined, ManagerID, OnboardingStatus, ChecklistAssigned, ChecklistStatus, ChecklistTasksStatus
        FROM dbo.NewHires
        WHERE ID = ?
    """, (hire_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "New hire not found"}), 404

    try:
        tasks_status = json.loads(row[9]) if row[9] else []
    except Exception:
        tasks_status = []

    hire = {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "role": row[3],
        "dateJoined": str(row[4]) if row[4] else None,
        "managerId": row[5],
        "onboardingStatus": row[6],
        "checklistAssigned": bool(row[7]),
        "checklistStatus": row[8],
        "checklistTasksStatus": tasks_status,
    }
    return jsonify(hire)
@onboarding_api.route("/newhires", methods=["POST"])
def add_new_hire():
    data = request.json
    print("Received data:", data)

    name = data.get("name")
    email = data.get("email")
    role = data.get("role")
    date_joined = data.get("dateJoined")
    manager_id = data.get("managerId")  # optional

    # ✅ Only require basic fields
    if not all([name, email, role, date_joined]):
        return jsonify({"error": "Name, Email, Role, and DateJoined are required"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # Generate new ID
    cursor.execute("SELECT ISNULL(MAX(ID), 0) + 1 FROM dbo.NewHires")
    new_id = cursor.fetchone()[0]

    # ✅ Insert new hire without department or checklist yet
    cursor.execute("""
        INSERT INTO dbo.NewHires
        (ID, Name, Email, Role, DateJoined, ManagerID, OnboardingStatus, ChecklistAssigned, ChecklistTasksStatus, ChecklistStatus, Department)
        VALUES (?, ?, ?, ?, ?, ?, 'Not Started', 0, '[]', 'Not Started', NULL)
    """, (new_id, name, email, role, date_joined, manager_id))

    conn.commit()
    conn.close()

    return jsonify({
        "id": new_id,
        "name": name,
        "email": email,
        "role": role,
        "department": None,
        "dateJoined": date_joined,
        "managerId": manager_id,
        "onboardingStatus": "Not Started",
        "checklistAssigned": False,
        "checklistTasksStatus": []
    }), 201


@onboarding_api.route('/newhires/<int:hire_id>', methods=['PUT'])
def update_new_hire(hire_id):
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE dbo.NewHires SET
            Name = ?, Email = ?, Role = ?, DateJoined = ?, ManagerID = ?, OnboardingStatus = ?, ChecklistAssigned = ?
        WHERE ID = ?
    """, (
        data.get('name'),
        data.get('email'),
        data.get('role'),
        data.get('dateJoined'),
        data.get('managerId'),
        data.get('onboardingStatus'),
        data.get('checklistAssigned', False),
        hire_id
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# --- EmployeeOnboarding Endpoints ---

@onboarding_api.route('/employeeonboarding', methods=['GET'])
def list_employee_onboarding():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT OnboardingID, EmployeeID, ResumeLink, PhoneNumber, Email, JoinDate, RoleAssigned,
               Skills, InductionDate, InductionCompleted, EducationDegree, Major, School, Certifications
        FROM dbo.EmployeeOnboarding
        ORDER BY JoinDate DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    onboardings = []
    for row in rows:
        onboardings.append({
            "onboardingId": row[0],
            "employeeId": row[1],
            "resumeLink": row[2],
            "phoneNumber": row[3],
            "email": row[4],
            "joinDate": str(row[5]) if row[5] else None,
            "roleAssigned": row[6],
            "skills": row[7],
            "inductionDate": str(row[8]) if row[8] else None,
            "inductionCompleted": row[9],
            "educationDegree": row[10],
            "major": row[11],
            "school": row[12],
            "certifications": row[13],
        })
    
    return jsonify(onboardings)

@onboarding_api.route('/newhires/<int:hire_id>/checkliststatus', methods=['PATCH'])
def update_checklist_status(hire_id):
    data = request.json
    new_status = data.get('checklistStatus')
    tasks = data.get("tasks")

    # Ensure tasks is always a list
    if tasks is None:
        tasks = []
    elif isinstance(tasks, str):
        try:
            tasks = json.loads(tasks)
        except Exception:
            return jsonify({"error": "Invalid tasks format (not JSON list)"}), 400

    if not isinstance(tasks, list):
        return jsonify({"error": "Tasks must be a list"}), 400

    tasks_json = json.dumps(tasks)

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE dbo.NewHires
        SET ChecklistStatus = ?, OnboardingStatus = ?, ChecklistTasksStatus = ?
        WHERE ID = ?
    """, (new_status, new_status, tasks_json, hire_id))  # 4 arguments for 4 placeholders
    conn.commit()
    conn.close()

    return jsonify({"success": True})
@onboarding_api.route('/checklists/<int:checklist_id>', methods=['GET'])
def get_checklist_by_id(checklist_id):
    conn = get_connection()
    cursor = conn.cursor()

    # Get checklist name
    cursor.execute("SELECT ChecklistName FROM dbo.Checklists WHERE ChecklistID = ?", (checklist_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Checklist not found"}), 404

    checklist_name = row[0]

    # Get tasks
    cursor.execute(
        "SELECT ItemID, TaskDesc, IsMandatory FROM dbo.ChecklistItems WHERE ChecklistID = ?",
        (checklist_id,)
    )
    tasks = [
        {"itemId": t[0], "taskDesc": t[1], "isMandatory": bool(t[2])}
        for t in cursor.fetchall()
    ]
    conn.close()

    return jsonify({
        "checklistId": checklist_id,
        "checklistName": checklist_name,
        "tasks": tasks
    })

@onboarding_api.route('/checklists/<department>', methods=['GET'])
def get_checklist_by_department(department):
    conn = get_connection()
    cursor = conn.cursor()

    # Get checklist for department
    cursor.execute("""
        SELECT ChecklistID, ChecklistName FROM dbo.Checklists WHERE Department = ?
    """, (department,))
    checklist = cursor.fetchone()
    if not checklist:
        conn.close()
        return jsonify({"error": "Checklist not found"}), 404

    checklist_id = checklist[0]
    checklist_name = checklist[1]

    # Get checklist tasks
    cursor.execute("""
        SELECT ItemID, TaskDesc, IsMandatory FROM dbo.ChecklistItems WHERE ChecklistID = ?
    """, (checklist_id,))
    tasks = cursor.fetchall()
    conn.close()

    task_list = []
    for task in tasks:
        task_list.append({
            "itemId": task[0],
            "taskDesc": task[1],
            "isMandatory": bool(task[2]),
        })

    return jsonify({
        "checklistId": checklist_id,
        "checklistName": checklist_name,
        "tasks": task_list
    })

@onboarding_api.route("/newhires/<int:hire_id>/tasks", methods=["POST"])
def add_task_to_new_hire(hire_id):
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()

    # Get existing tasks
    cursor.execute("SELECT ChecklistTasksStatus FROM dbo.NewHires WHERE ID = ?", hire_id)
    row = cursor.fetchone()
    tasks = json.loads(row[0]) if row and row[0] else []

    # Append new task
    new_task = {
        "itemId": data.get("itemId"),
        "taskDesc": data.get("taskDesc"),
        "isMandatory": data.get("isMandatory", False),
        "completed": False
    }
    tasks.append(new_task)

    # Update DB
    cursor.execute(
        "UPDATE dbo.NewHires SET ChecklistTasksStatus = ? WHERE ID = ?",
        (json.dumps(tasks), hire_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"success": True, "tasks": tasks})
@onboarding_api.route('/departments', methods=['GET'])
def list_departments():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT c.ChecklistID, c.Department
        FROM dbo.Checklists c
        INNER JOIN dbo.ChecklistItems ci ON c.ChecklistID = ci.ChecklistID
        WHERE c.Department IS NOT NULL
    """)
    departments = [{"id": row[0], "name": row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(departments)



@onboarding_api.route('/checklists/<int:checklist_id>/tasks', methods=['POST'])
def add_task_to_checklist(checklist_id):
    data = request.json
    task_desc = data.get('taskDesc', '').strip()
    is_mandatory = bool(data.get('isMandatory', False))
    if not task_desc:
        return jsonify({"error": "Task description required"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # Generate new ItemID
    cursor.execute("SELECT ISNULL(MAX(ItemID), 0) + 1 FROM dbo.ChecklistItems WHERE ChecklistID = ?", checklist_id)
    new_item_id = cursor.fetchone()[0]

    cursor.execute("""
        INSERT INTO dbo.ChecklistItems (ItemID, ChecklistID, TaskDesc, IsMandatory)
        VALUES (?, ?, ?, ?)
    """, (new_item_id, checklist_id, task_desc, int(is_mandatory)))
    conn.commit()
    conn.close()

    return jsonify({
        "itemId": new_item_id,
        "taskDesc": task_desc,
        "isMandatory": is_mandatory
    }), 201
@onboarding_api.route('/checklists/tasks/<int:item_id>', methods=['PUT'])
def edit_checklist_task(item_id):
    data = request.json
    task_desc = data.get('taskDesc', '').strip()
    is_mandatory = bool(data.get('isMandatory', False))
    if not task_desc:
        return jsonify({"error": "Task description required"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE dbo.ChecklistItems
        SET TaskDesc = ?, IsMandatory = ?
        WHERE ItemID = ?
    """, (task_desc, int(is_mandatory), item_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})
@onboarding_api.route('/checklists/tasks/<int:item_id>', methods=['DELETE'])
def delete_checklist_task(item_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM dbo.ChecklistItems WHERE ItemID = ?", (item_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@onboarding_api.route('/employeeonboarding/<int:onboarding_id>', methods=['GET'])
def get_employee_onboarding(onboarding_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT OnboardingID, EmployeeID, ResumeLink, PhoneNumber, Email, JoinDate, RoleAssigned,
               Skills, InductionDate, InductionCompleted, EducationDegree, Major, School, Certifications
        FROM dbo.EmployeeOnboarding
        WHERE OnboardingID = ?
    """, (onboarding_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Employee onboarding record not found"}), 404

    record = {
        "onboardingId": row[0],
        "employeeId": row[1],
        "resumeLink": row[2],
        "phoneNumber": row[3],
        "email": row[4],
        "joinDate": str(row[5]) if row[5] else None,
        "roleAssigned": row[6],
        "skills": row[7],
        "inductionDate": str(row[8]) if row[8] else None,
        "inductionCompleted": row[9],
        "educationDegree": row[10],
        "major": row[11],
        "school": row[12],
        "certifications": row[13],
    }
    return jsonify(record)

@onboarding_api.route('/employeeonboarding', methods=['POST'])
def add_employee_onboarding():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(OnboardingID) FROM dbo.EmployeeOnboarding")
    last_id = cursor.fetchone()[0] or 0
    next_id = last_id + 1
    cursor.execute("""
        INSERT INTO dbo.EmployeeOnboarding (OnboardingID, EmployeeID, ResumeLink, PhoneNumber, Email, JoinDate,
                                            RoleAssigned, Skills, InductionDate, InductionCompleted,
                                            EducationDegree, Major, School, Certifications)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        next_id,
        data.get('employeeId'),
        data.get('resumeLink'),
        data.get('phoneNumber'),
        data.get('email'),
        data.get('joinDate'),
        data.get('roleAssigned'),
        data.get('skills'),
        data.get('inductionDate'),
        data.get('inductionCompleted'),
        data.get('educationDegree'),
        data.get('major'),
        data.get('school'),
        data.get('certifications'),
    ))
    conn.commit()
    conn.close()
    return jsonify({"onboardingId": next_id}), 201
@onboarding_api.route('/managerid', methods=['POST'])
def get_manager_id_by_name():
    data = request.json
    manager_name = data.get('managerName', '').strip()
    if not manager_name:
        return jsonify({"error": "Manager name is required"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT TOP 1 ID FROM dbo.Employees WHERE Name = ?
    """, (manager_name,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Manager not found"}), 404

    return jsonify({"managerId": row[0]})


@onboarding_api.route('/newhires/<int:hire_id>', methods=['DELETE'])
def delete_new_hire(hire_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM dbo.NewHires WHERE ID = ?", (hire_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@onboarding_api.route('/employeeonboarding/<int:onboarding_id>', methods=['DELETE'])
def delete_employee_onboarding(onboarding_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM dbo.EmployeeOnboarding WHERE OnboardingID = ?", (onboarding_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@onboarding_api.route('/newhires/search', methods=['GET'])
def search_new_hires():
    query = request.args.get('q', '')
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ID, Name, Email, Role, DateJoined, ManagerID, OnboardingStatus, ChecklistAssigned
        FROM dbo.NewHires
        WHERE Name LIKE ? OR Email LIKE ?
        ORDER BY DateJoined DESC
    """, (f'%{query}%', f'%{query}%'))
    rows = cursor.fetchall()
    conn.close()

    hires = []
    for row in rows:
        hires.append({
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "role": row[3],
            "dateJoined": str(row[4]) if row[4] else None,
            "managerId": row[5],
            "onboardingStatus": row[6],
            "checklistAssigned": bool(row[7])
        })
    return jsonify(hires)

@onboarding_api.route('/newhires/add_employee', methods=['POST'])
def add_employee_from_onboarding():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()

    # Generate new Employee ID
    cursor.execute("SELECT MAX(ID) FROM dbo.Employees")
    last_emp_id = cursor.fetchone()[0] or 0
    next_emp_id = last_emp_id + 1

    cursor.execute("""
        INSERT INTO dbo.Employees (ID, Name, Email, Role, ManagerID)
        VALUES (?, ?, ?, ?, ?)
    """, (
        next_emp_id,
        data.get('name'),
        data.get('email'),
        data.get('role'),
        data.get('managerId')
    ))

    conn.commit()
    conn.close()
    return jsonify({"employeeId": next_emp_id})



@onboarding_api.route('/managers', methods=['GET'])
def list_managers():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ID, Name FROM dbo.Employees WHERE Role LIKE '%Manager%'
    """)
    rows = cursor.fetchall()
    conn.close()

    managers = [{"id": row[0], "name": row[1]} for row in rows]
    return jsonify(managers)

@onboarding_api.route('/newhires/<int:hire_id>/checklist', methods=['PATCH'])
def update_newhire_checklist(hire_id):
    data = request.json
    checklist_status = data.get('checklistStatus')
    tasks = data.get('tasks')  # expected to be a dict/list representing task completion
    
    if checklist_status is None or tasks is None:
        return jsonify({"error": "Missing checklistStatus or tasks"}), 400

    try:
        tasks_json = json.dumps(tasks)
    except Exception as e:
        return jsonify({"error": f"Invalid tasks format: {str(e)}"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE dbo.NewHires
        SET ChecklistStatus = ?, ChecklistTasksStatus = ?
        WHERE ID = ?
    """, (checklist_status, tasks_json, hire_id))
    conn.commit()
    conn.close()

    return jsonify({"success": True})


@onboarding_api.route('/employeeonboarding/<int:onboarding_id>', methods=['PUT'])
def update_employee_onboarding(onboarding_id):
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE dbo.EmployeeOnboarding SET
            EmployeeID = ?, ResumeLink = ?, PhoneNumber = ?, Email = ?, JoinDate = ?, RoleAssigned = ?,
            Skills = ?, InductionDate = ?, InductionCompleted = ?, EducationDegree = ?, Major = ?, School = ?, Certifications = ?
        WHERE OnboardingID = ?
    """, (
        data.get('employeeId'),
        data.get('resumeLink'),
        data.get('phoneNumber'),
        data.get('email'),
        data.get('joinDate'),
        data.get('roleAssigned'),
        data.get('skills'),
        data.get('inductionDate'),
        data.get('inductionCompleted'),
        data.get('educationDegree'),
        data.get('major'),
        data.get('school'),
        data.get('certifications'),
        onboarding_id
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@onboarding_api.route("/newhires/<int:hire_id>/assign_checklist", methods=["POST"])
def assign_checklist_to_hire(hire_id):
    data = request.json

    try:
        checklist_id = int(data.get("checklistId"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid checklistId"}), 400

    if not checklist_id:
        return jsonify({"error": "Checklist ID is required"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT ChecklistName, Department FROM dbo.Checklists WHERE ChecklistID = ?", (checklist_id,))
    checklist_row = cursor.fetchone()
    if not checklist_row:
        conn.close()
        return jsonify({"error": "Invalid checklist ID"}), 400

    checklist_name, department = checklist_row

    cursor.execute("SELECT ItemID, TaskDesc, IsMandatory FROM dbo.ChecklistItems WHERE ChecklistID = ?", (checklist_id,))
    task_rows = cursor.fetchall()

    tasks = [
        {"itemId": r[0], "taskDesc": r[1], "isMandatory": bool(r[2]), "completed": False}
        for r in task_rows
    ]

    cursor.execute("""
        UPDATE dbo.NewHires
        SET ChecklistAssigned = 1,
            ChecklistStatus = 'Not Started',
            ChecklistTasksStatus = ?,
            OnboardingStatus = 'Not Started',
            Department = ?,
            ChecklistID = ?
        WHERE ID = ?
    """, (json.dumps(tasks), department, checklist_id, hire_id))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "hireId": hire_id,
        "department": department,
        "checklistId": checklist_id,
        "tasksAssigned": len(tasks),
        "tasks": tasks
    })
