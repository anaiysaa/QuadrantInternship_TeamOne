# resume_nor.py

import os
import json
import re
from dotenv import load_dotenv
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
import pyodbc
from openai import AzureOpenAI  # NEW: for openai>=1.0.0

# Load .env variables
load_dotenv()

# Azure Document Intelligence settings
docai_endpoint = os.getenv("DOCINTEL_ENDPOINT")
docai_key = os.getenv("DOCINTEL_KEY")

# Azure OpenAI settings
openai_api_key = os.getenv("OPENAI_API_KEY")
openai_api_version = os.getenv("OPENAI_API_VERSION", "2024-02-15-preview")
openai_api_base = os.getenv("OPENAI_API_BASE")
deployment_name = os.getenv("DEPLOYMENT_NAME")

# Database connection settings
driver = '{ODBC Driver 17 for SQL Server}'
server = os.getenv("server")
database = os.getenv("database")
username = os.getenv("username")   # Use your .env value here
password = os.getenv("password")
conn_str = f"DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}"

def get_db_cursor():
    """Get a new DB connection and cursor. Call close() after use."""
    conn = pyodbc.connect(conn_str)
    return conn, conn.cursor()

def extract_text_with_docai(file_obj):
    # file_obj is a file-like object (from Flask upload)
    client = DocumentAnalysisClient(
        endpoint=docai_endpoint,
        credential=AzureKeyCredential(docai_key)
    )
    file_obj.seek(0)  # Ensure pointer at start
    poller = client.begin_analyze_document("prebuilt-document", document=file_obj)
    result = poller.result()
    all_text = []
    for page in result.pages:
        for line in page.lines:
            all_text.append(line.content)
    return "\n".join(all_text)

def normalize_resume_text_azure(raw_text):
    # Uses OpenAI >=1.0.0 (AzureOpenAI)
    client = AzureOpenAI(
        api_key=openai_api_key,
        api_version=openai_api_version,
        azure_endpoint=openai_api_base,
    )
    prompt = f"""
Given the following resume, extract and return a JSON object with these fields ONLY:
- Name
- Email
- Phone
- Address
- EducationDegree: degree only (e.g., Bachelor, Master, PhD, Associate). DO NOT include coursework, classes, certificates, minors, or areas of focus.
- EducationField: subject of study
- EducationInstitution: name of institution
- EducationYear: year of graduation
- Certifications: list of [certification name, year]
- Skills: a list of unique skill names AND roles/job titles (for example: "Software Engineer", "Data Analytics", "Data Analyst", "Project Manager") found anywhere in the resume (do not include context, descriptions, or phrases—just skill and role names)

Resume:
\"\"\"
{raw_text}
\"\"\"
Return only valid JSON. No explanation.
"""
    response = client.chat.completions.create(
        model=deployment_name,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500
    )
    text = response.choices[0].message.content
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        else:
            raise ValueError("No JSON detected in LLM response!")

def insert_or_update_employee(data, cursor, conn):
    email = data.get('Email')
    if not email:
        print("No Email found in data, skipping DB update.")
        return

    Name = data.get('Name', '')
    Phone = data.get('Phone', '')
    Address = data.get('Address', '')
    EducationDegree = data.get('EducationDegree', '')
    EducationField = data.get('EducationField', '')
    EducationInstitution = data.get('EducationInstitution', '')
    EducationYear = data.get('EducationYear', '')
    Certifications = json.dumps(data.get('Certifications', []))
    Skills = json.dumps(data.get('Skills', []))

    cursor.execute("SELECT Email FROM employees WHERE Email = ?", (email,))
    row = cursor.fetchone()
    if row:
        cursor.execute("""
            UPDATE employees SET
                Name = ?,
                Phone = ?,
                Address = ?,
                EducationDegree = ?,
                EducationField = ?,
                EducationInstitution = ?,
                EducationYear = ?,
                Certifications = ?,
                Skills = ?
            WHERE Email = ?
        """, (
            Name, Phone, Address,
            EducationDegree, EducationField, EducationInstitution, EducationYear,
            Certifications, Skills, email
        ))
        print(f"Updated employee: {email}")
    else:
        cursor.execute("""
            INSERT INTO employees (
                Name, Email, Phone, Address,
                EducationDegree, EducationField, EducationInstitution, EducationYear,
                Certifications, Skills
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            Name, email, Phone, Address,
            EducationDegree, EducationField, EducationInstitution, EducationYear,
            Certifications, Skills
        ))
        print(f"Inserted employee: {email}")
    conn.commit()

def process_resume_file(file_obj):
    # file_obj is the Flask-uploaded file (file-like object)
    resume_text = extract_text_with_docai(file_obj)
    normalized = normalize_resume_text_azure(resume_text)
    conn, cursor = get_db_cursor()
    insert_or_update_employee(normalized, cursor, conn)
    cursor.close()
    conn.close()
    return normalized
