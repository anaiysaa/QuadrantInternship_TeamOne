from flask import Blueprint, request, jsonify
from flask_cors import CORS
from .resume_nor import process_resume_file
import pyodbc
import os
import re
import json
from pathlib import Path
from dotenv import load_dotenv
from dotenv import load_dotenv
load_dotenv()  # loads backend/.env automatically


resume_api = Blueprint("resume_api", __name__)
CORS(resume_api)  # ✅ Enable CORS for this blueprint

# ---------------------- Database Helper ----------------------
def get_connection():
    return pyodbc.connect(os.getenv("DB_CONN_STR"))

def fetch_all(query, params=()):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return rows

def fetch_one(query, params=()):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    row = cursor.fetchone()
    conn.close()
    return row

def execute_query(query, params=()):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    conn.close()

# ---------------------- Resume Text Parsing ----------------------
def extract_basic_sections(text):
    sections = {"summary": "", "experience": [], "education": [], "skills": []}

    summary_match = re.search(r"^(.*?)(WORK EXPERIENCE|EXPERIENCE|EDUCATION|SKILLS)", text, re.I | re.S)
    if summary_match:
        sections["summary"] = summary_match.group(1).strip()

    exp_match = re.search(r"(WORK EXPERIENCE|EXPERIENCE)[:\s]*(.*?)(EDUCATION|SKILLS|$)", text, re.I | re.S)
    if exp_match:
        exp_text = exp_match.group(2).strip()
        jobs = [j.strip() for j in re.split(r"\n{2,}|•{3,}", exp_text) if j.strip()]
        for job in jobs:
            sections["experience"].append({
                "title": "", "company": "", "period": "", "description": job
            })

    edu_match = re.search(r"EDUCATION[:\s]*(.*?)(SKILLS|$)", text, re.I | re.S)
    if edu_match:
        sections["education"] = [{"degree": edu_match.group(1).strip(), "institution": "", "year": ""}]

    skills_match = re.search(r"SKILLS[:\s]*(.*?)(?:\n[A-Z ]{3,}|$)", text, re.I | re.S)
    if skills_match:
        skills = re.split(r"[\n·•,.;|-]+", skills_match.group(1))
        sections["skills"] = [s.strip() for s in skills if len(s.strip()) > 1]

    return sections

# ---------------------- Upload Resume ----------------------
@resume_api.route("/upload", methods=["POST"])
def upload_resume():
    file = request.files.get("resume")
    if not file:
        return jsonify({"status": "error", "message": "No file received"}), 400

    try:
        result = process_resume_file(file)
        file.stream.seek(0)
        raw_text = file.read().decode(errors="ignore")
        sections = extract_basic_sections(raw_text)
        return jsonify({"status": "success", "result": result, "sections": sections}), 200
    except Exception as e:
        print("ERROR processing resume:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

# ---------------------- Get Employee Resume ----------------------
@resume_api.route("/employee-resume", methods=["GET"])
def get_employee_resume():
    username = request.args.get("username")
    if not username:
        return jsonify({"success": False, "message": "No username provided"}), 400

    try:
        row = fetch_one("""
            SELECT Skills, EducationDegree, EducationField, EducationInstitution, EducationYear
            FROM Employees WHERE Username = ?
        """, (username,))
        if not row:
            return jsonify({"success": False, "message": "Employee not found"}), 404

        return jsonify({
            "skills": json.loads(row.Skills) if row.Skills else [],
            "education": [{
                "degree": row.EducationDegree,
                "field": row.EducationField,
                "institution": row.EducationInstitution,
                "year": row.EducationYear
            }]
        }), 200
    except Exception as e:
        print("DB error:", e)
        return jsonify({"success": False, "message": "DB error"}), 500

# ---------------------- Apply for a Job ----------------------
@resume_api.route("/apply", methods=["POST"])
def apply_job():
    data = request.get_json()
    job_id, employee_id = data.get("jobId"), data.get("employeeId")

    if not job_id or not employee_id:
        return jsonify({"success": False, "message": "Job ID and Employee ID required"}), 400

    try:
        execute_query("INSERT INTO JobApplications (JobID, EmployeeID) VALUES (?, ?)", (job_id, employee_id))
        return jsonify({"success": True, "message": "Application submitted successfully"})
    except Exception as e:
        print("DB Error:", e)
        return jsonify({"success": False, "message": "Database error"}), 500

# ---------------------- Get Applications for an Employee ----------------------
@resume_api.route("/applications/<int:employee_id>", methods=["GET"])
def get_employee_applications(employee_id):
    try:
        rows = fetch_all("""
            SELECT JA.ApplicationID, JA.JobID, IJ.JobTitle, JA.Status, JA.ApplicationDate
            FROM JobApplications JA
            JOIN InternalJobs IJ ON JA.JobID = IJ.JobID
            WHERE JA.EmployeeID = ?
        """, (employee_id,))

        applications = [{
            "applicationId": r.ApplicationID,
            "jobId": r.JobID,
            "title": r.JobTitle,
            "status": r.Status or "Applied",
            "appliedDate": str(r.ApplicationDate) if r.ApplicationDate else ""
        } for r in rows]

        return jsonify({"applications": applications}), 200
    except Exception as e:
        print("DB error:", e)
        return jsonify({"error": "Database error", "details": str(e)}), 500

@resume_api.route("/test-ai", methods=["GET"])
def test_ai():
    from openai import AzureOpenAI
    import os

    client = AzureOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        api_version=os.getenv("OPENAI_API_VERSION"),
        azure_endpoint=os.getenv("OPENAI_API_BASE")
    )

    try:
        response = client.chat.completions.create(
            model=os.getenv("DEPLOYMENT_NAME"),
            messages=[{"role": "user", "content": "Say hello!"}],
            max_tokens=20
        )
        return jsonify({"status": "success", "message": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# ---------------------- Get Application Details ----------------------
@resume_api.route("/applications/details/<int:application_id>", methods=["GET"])
def get_application_details(application_id):
    try:
        row = fetch_one("""
            SELECT JA.ApplicationID, JA.Status, JA.ApplicationDate,
                   IJ.JobID, IJ.JobTitle, IJ.Department, IJ.Location, IJ.JobType,
                   IJ.JobDescription, IJ.MandatorySkills, IJ.OptionalSkills
            FROM JobApplications JA
            JOIN InternalJobs IJ ON JA.JobID = IJ.JobID
            WHERE JA.ApplicationID = ?
        """, (application_id,))
        if not row:
            return jsonify({"error": "Application not found"}), 404

        return jsonify({
            "applicationId": row.ApplicationID,
            "status": row.Status or "Applied",
            "appliedDate": str(row.ApplicationDate) if row.ApplicationDate else "",
            "jobId": row.JobID,
            "title": row.JobTitle,
            "department": row.Department,
            "location": row.Location,
            "jobType": row.JobType,
            "jobDescription": row.JobDescription,
            "mandatorySkills": row.MandatorySkills,
            "optionalSkills": row.OptionalSkills
        }), 200
    except Exception as e:
        print("DB Error:", e)
        return jsonify({"error": "Database error"}), 500

# ---------------------- Get Job Details ----------------------
@resume_api.route("/jobs/<int:job_id>", methods=["GET"])
def get_job_details(job_id):
    try:
        row = fetch_one("""
            SELECT JobID, JobTitle, MandatorySkills, OptionalSkills,
                   RecommendedCertifications, JobDescription,
                   Department, Location, JobType, Status, ClosingDate
            FROM InternalJobs WHERE JobID = ?
        """, (job_id,))
        if not row:
            return jsonify({"error": "Job not found"}), 404

        return jsonify({
            "jobId": row.JobID,
            "title": row.JobTitle,
            "mandatorySkills": row.MandatorySkills,
            "optionalSkills": row.OptionalSkills,
            "recommendedCertifications": row.RecommendedCertifications,
            "jobDescription": row.JobDescription,
            "department": row.Department,
            "location": row.Location,
            "jobType": row.JobType,
            "status": row.Status,
            "closingDate": str(row.ClosingDate) if row.ClosingDate else None
        }), 200
    except Exception as e:
        print("DB error:", e)
        return jsonify({"error": "Database error"}), 500

# ---------------------- Get Employee ----------------------
@resume_api.route("/employees/<int:emp_id>", methods=["GET"])
def get_employee(emp_id):
    try:
        row = fetch_one("""
            SELECT ID, Name, Email, Phone, Address, Username,
                   Department, Role, ManagerID, TeamID, DateJoined, Status,
                   PaidLeavesLeft, Gender, TrainingsDone, TrainingsLeft,
                   Salary, Campus, EmploymentStatus, PhotoURL, HireDate,
                   SkillCategory, YearsInCompany, Skills, AppliedJobs,
                   Certifications, EducationDegree, EducationField,
                   EducationInstitution, EducationYear
            FROM Employees WHERE ID = ?
        """, (emp_id,))
        if not row:
            return jsonify({"error": "Employee not found"}), 404

        return jsonify({
            "id": row.ID,
            "name": row.Name,
            "email": row.Email,
            "phone": row.Phone,
            "address": row.Address,
            "department": row.Department,
            "role": row.Role,
            "managerId": row.ManagerID,
            "teamId": row.TeamID,
            "joinDate": str(row.DateJoined) if row.DateJoined else "",
            "status": row.Status,
            "paidLeavesLeft": row.PaidLeavesLeft,
            "gender": row.Gender,
            "trainingsDone": row.TrainingsDone,
            "trainingsLeft": row.TrainingsLeft,
            "salary": row.Salary,
            "campus": row.Campus,
            "employmentStatus": row.EmploymentStatus,
            "photoUrl": row.PhotoURL,
            "hireDate": str(row.HireDate) if row.HireDate else "",
            "skills": json.loads(row.Skills) if row.Skills else [],
            "appliedJobs": json.loads(row.AppliedJobs) if row.AppliedJobs else [],
            "certifications": json.loads(row.Certifications) if row.Certifications else [],
            "educationDegree": row.EducationDegree,
            "educationField": row.EducationField,
            "educationInstitution": row.EducationInstitution,
            "educationYear": row.EducationYear
        })
    except Exception as e:
        print("DB error:", e)
        return jsonify({"error": "Database error"}), 500

# ---------------------- Get Employee Assets ----------------------
@resume_api.route("/employees/<int:emp_id>/assets", methods=["GET"])
def get_employee_assets(emp_id):
    try:
        rows = fetch_all("""
            SELECT AssetID, EmployeeID, Department, AssetType, BrandModel,
                   SerialNumber, Status, Condition, Location, DateAssigned
            FROM IT_Assets WHERE EmployeeID = ?
        """, (emp_id,))

        assets = [{
            "assetId": r.AssetID,
            "employeeId": r.EmployeeID,
            "department": r.Department,
            "type": r.AssetType,
            "brand": r.BrandModel,
            "serialNumber": r.SerialNumber,
            "status": r.Status,
            "condition": r.Condition,
            "location": r.Location,
            "assignedDate": str(r.DateAssigned) if r.DateAssigned else ""
        } for r in rows]

        return jsonify({"assets": assets}), 200
    except Exception as e:
        print("DB error:", e)
        return jsonify({"error": "Database error"}), 500


@resume_api.route("/employees/<int:emp_id>/update-personal", methods=["PUT"])
def update_personal_info(emp_id):
    data = request.json
    try:
        execute_query("""
            UPDATE Employees
            SET Name = ?, Email = ?, Phone = ?, Address = ?, Gender = ?, Campus = ?
            WHERE ID = ?
        """, (
            data.get("name"),
            data.get("email"),
            data.get("phone"),
            data.get("address"),
            data.get("gender"),
            data.get("campus"),
            emp_id
        ))
        return jsonify({"success": True, "message": "Personal info updated"})
    except Exception as e:
        print("DB error:", e)
        return jsonify({"success": False, "message": "Update failed"}), 500

@resume_api.route("/employees/<int:emp_id>/update-professional", methods=["PUT"])
def update_professional_info(emp_id):
    data = request.json
    try:
        execute_query("""
            UPDATE Employees
            SET Department = ?, Role = ?, Status = ?, ManagerID = ?, TeamID = ?,
                PaidLeavesLeft = ?, TrainingsDone = ?, TrainingsLeft = ?, EmploymentStatus = ?
            WHERE ID = ?
        """, (
            data.get("department"),
            data.get("role"),
            data.get("status"),
            data.get("managerId"),
            data.get("teamId"),
            data.get("paidLeavesLeft"),
            data.get("trainingsDone"),
            data.get("trainingsLeft"),
            data.get("employmentStatus"),
            emp_id
        ))
        return jsonify({"success": True, "message": "Professional info updated"})
    except Exception as e:
        print("DB error:", e)
        return jsonify({"success": False, "message": "Update failed"}), 500

@resume_api.route("/employees/<int:emp_id>/update-skills", methods=["PUT"])
def update_skills(emp_id):
    data = request.json
    skills = data.get("skills", [])
    try:
        execute_query("UPDATE Employees SET Skills = ? WHERE ID = ?", (
            json.dumps(skills), emp_id
        ))
        return jsonify({"success": True, "message": "Skills updated"})
    except Exception as e:
        print("DB error:", e)
        return jsonify({"success": False, "message": "Update failed"}), 500

@resume_api.route("/employees/<int:emp_id>/update-certifications", methods=["PUT"])
def update_certifications(emp_id):
    data = request.json
    certs = data.get("certifications", [])
    try:
        execute_query("UPDATE Employees SET Certifications = ? WHERE ID = ?", (
            json.dumps(certs), emp_id
        ))
        return jsonify({"success": True, "message": "Certifications updated"})
    except Exception as e:
        print("DB error:", e)
        return jsonify({"success": False, "message": "Update failed"}), 500
@resume_api.route("/employees/<int:emp_id>/update-education", methods=["PUT"])
def update_education(emp_id):
    data = request.json
    try:
        execute_query("""
            UPDATE Employees
            SET EducationDegree = ?, EducationField = ?, EducationInstitution = ?, EducationYear = ?
            WHERE ID = ?
        """, (
            data.get("degree"),
            data.get("field"),
            data.get("institution"),
            data.get("year"),
            emp_id
        ))
        return jsonify({"success": True, "message": "Education updated"})
    except Exception as e:
        print("DB error:", e)
        return jsonify({"success": False, "message": "Update failed"}), 500
