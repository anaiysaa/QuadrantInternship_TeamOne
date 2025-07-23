from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc
import os
import json
import re
from dotenv import load_dotenv
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from openai import AzureOpenAI
from werkzeug.security import check_password_hash

from course_recommender_ai import get_recommended_courses

load_dotenv()

from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}}, supports_credentials=True)


DB_CONN_STR = os.getenv("DB_CONN_STR")

def get_db_connection():
    return pyodbc.connect(DB_CONN_STR)

# Degree ranking
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

@app.route('/job-matches/<int:employee_id>', methods=['GET'])
def get_job_matches(employee_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Fetch the specified employee
        cursor.execute("""
            SELECT Id, Name, Email, Phone, Address, EducationDegree, Skills
            FROM Employees
            WHERE Id = ?
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

        # 2. Fetch all internal jobs (using only the confirmed columns)
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

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")  # ✅ NOT email
    password = data.get("password")
    
    conn = pyodbc.connect(DB_CONN_STR)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Employees WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "User not found"}), 401

    # Assuming row[3] is password column
    if row[6] != password:
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({
        "username": row[5],
        "department": row[7],
        "employee_id": row[0]
    })

if __name__ == "__main__":
    app.run(port=5001, debug=True)
