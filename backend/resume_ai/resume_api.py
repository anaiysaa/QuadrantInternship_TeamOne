from flask import Flask, request, jsonify
from flask_cors import CORS
from resume_nor import process_resume_file  # <-- Make sure this exists in your project
import pyodbc
import os
import re
import json


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}}, supports_credentials=True)

# ----- BASIC SECTION EXTRACTION (for UI only) -----
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

# ----- RESUME UPLOAD ENDPOINT -----
@app.route('/upload', methods=['POST'])
def upload_resume():
    file = request.files.get('resume')
    if not file:
        return jsonify({"status": "error", "message": "No file received"}), 400

    try:
        # Backend processing (AI, DB, etc)
        result = process_resume_file(file)

        # Section extraction ONLY for display (does NOT affect database)
        file.stream.seek(0)
        raw_text = file.read().decode(errors="ignore")
        sections = extract_basic_sections(raw_text)

        return jsonify({
            "status": "success",
            "result": result,      # AI/DB result for backend logic
            "sections": sections   # Just for UI display
        }), 200

    except Exception as e:
        print("ERROR processing resume:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

# ----- GET EMPLOYEE RESUME ENDPOINT -----
@app.route('/employee-resume', methods=['GET'])
def get_employee_resume():
    username = request.args.get('username')
    if not username:
        return jsonify({"success": False, "message": "No username provided"}), 400

    try:
        # Adjust these based on your environment/pyodbc setup!
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

if __name__ == '__main__':
    app.run(port=5000, debug=True)
