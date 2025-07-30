from flask import Blueprint, request, jsonify
from flask_cors import CORS
from .resume_nor import process_resume_file

import pyodbc
import os
import re
import json
from dotenv import load_dotenv

resume_api = Blueprint('resume_api', __name__)
load_dotenv()

# -- Enable CORS if needed  for this blueprint (not for the whole app here) --
# (You may also enable CORS globally in main.py)

def get_connection():
    return pyodbc.connect(os.getenv("DB_CONN_STR"))

def extract_basic_sections(text):
    """Extract summary, experience, education, skills from raw text. For display only."""
    sections = {"summary": "", "experience": [], "education": [], "skills": []}
    summary_match = re.search(r'^(.*?)(WORK EXPERIENCE|EXPERIENCE|EDUCATION|SKILLS)', text, re.I | re.S)
    if summary_match:
        sections["summary"] = summary_match.group(1).strip()
    exp_match = re.search(r'(WORK EXPERIENCE|EXPERIENCE)[:\s]*(.*?)(EDUCATION|SKILLS|$)', text, re.I | re.S)
    if exp_match:
        exp_text = exp_match.group(2).strip()
        jobs = [j.strip() for j in re.split(r'\n{2,}|•{3,}', exp_text) if j.strip()]
        for job in jobs:
            sections["experience"].append({"title": "", "company": "", "period": "", "description": job})
    edu_match = re.search(r'EDUCATION[:\s]*(.*?)(SKILLS|$)', text, re.I | re.S)
    if edu_match:
        edu_text = edu_match.group(1).strip()
        sections["education"] = [{"degree": edu_text, "institution": "", "year": ""}]
    skills_match = re.search(r'SKILLS[:\s]*(.*?)(?:\n[A-Z ]{3,}|$)', text, re.I | re.S)
    if skills_match:
        skills_block = skills_match.group(1)
        skills = re.split(r'[\n·•,.;|-]+', skills_block)
        sections["skills"] = [s.strip() for s in skills if len(s.strip()) > 1]
    return sections

@resume_api.route('/upload', methods=['POST'])
def upload_resume():
    file = request.files.get('resume')
    if not file:
        return jsonify({"status": "error", "message": "No file received"}), 400

    try:
        result = process_resume_file(file)
        file.stream.seek(0)
        raw_text = file.read().decode(errors="ignore")
        sections = extract_basic_sections(raw_text)
        return jsonify({
            "status": "success",
            "result": result,
            "sections": sections
        }), 200
    except Exception as e:
        print("ERROR processing resume:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@resume_api.route('/employee-resume', methods=['GET'])
def get_employee_resume():
    username = request.args.get('username')
    if not username:
        return jsonify({"success": False, "message": "No username provided"}), 400

    try:
        conn_str = os.getenv("DB_CONN_STR")
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        query = """
            SELECT Skills, EducationDegree, EducationField, EducationInstitution, EducationYear
            FROM Employees
            WHERE Username = ?
        """
        cursor.execute(query, username)
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if row:
            return jsonify({
                "skills": json.loads(row.Skills),
                "education": [{
                    "degree": row.EducationDegree,
                    "field": row.EducationField,
                    "institution": row.EducationInstitution,
                    "year": row.EducationYear
                }]
            }), 200
        else:
            return jsonify({"success": False, "message": "Employee not found"}), 404
    except Exception as e:
        print("DB error:", e)
        return jsonify({"success": False, "message": "DB error"}), 500

@resume_api.route("/api/employees/<int:emp_id>", methods=["GET"])
def get_employee(emp_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ID, Name, Email, Phone, Address, Username, PasswordHash, Department, Role, ManagerID, TeamID,
               DateJoined, Status, PaidLeavesLeft, Gender, TrainingsDone, TrainingsLeft, Salary, Campus,
               EmploymentStatus, PhotoURL, HireDate, SkillCategory, YearsInCompany, Skills, AppliedJobs,
               Certifications, EducationDegree, EducationField, EducationInstitution, EducationYear
        FROM Employees
        WHERE ID = ?
    """, (emp_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Not found"}), 404

    manager_name = ""
    if row[9]:
        conn2 = get_connection()
        cursor2 = conn2.cursor()
        cursor2.execute("SELECT Name FROM Employees WHERE ID = ?", (row[9],))
        manager_row = cursor2.fetchone()
        if manager_row:
            manager_name = manager_row[0]
        conn2.close()

    return jsonify({
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "phone": row[3],
        "address": row[4],
        "username": row[5],
        "department": row[7],
        "role": row[8],
        "managerId": row[9],
        "managerName": manager_name,
        "teamId": row[10],
        "joinDate": str(row[11]) if row[11] else "",
        "status": row[12],
        "paidLeavesLeft": row[13],
        "gender": row[14],
        "trainingsDone": row[15],
        "trainingsLeft": row[16],
        "salary": row[17],
        "campus": row[18],
        "employmentStatus": row[19],
        "photoUrl": row[20],
        "hireDate": str(row[21]) if row[21] else "",
        "skillCategory": row[22],
        "yearsInCompany": row[23],
        "skills": row[24],
        "appliedJobs": row[25],
        "certifications": row[26],
        "educationDegree": row[27],
        "educationField": row[28],
        "educationInstitution": row[29],
        "educationYear": row[30]
    })

# No app.run() or CORS(app, ...) here—do that in main.py

