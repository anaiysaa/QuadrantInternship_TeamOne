import os
import json
import re
from dotenv import load_dotenv
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
import pyodbc
from openai import AzureOpenAI  # for openai>=1.0.0

load_dotenv()

# ---------- ENV (FIXED NAMES) ----------
DOCINTEL_ENDPOINT = os.getenv("DOCINTEL_ENDPOINT")
DOCINTEL_KEY = os.getenv("DOCINTEL_KEY")

# Use the base endpoint + deployment name (NOT a /chat/completions URL)
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")  # e.g., https://workwayveai.openai.azure.com/
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")  # e.g., "gpt-4.1" (your deployment name)

# ---------- DB (PREFER SINGLE CONN STRING) ----------
DB_CONN_STR = os.getenv("DB_CONN_STR")
if not DB_CONN_STR:
    # Fallback if you still keep individual parts around (optional)
    driver = "{ODBC Driver 18 for SQL Server}"  # FIX: 18 not 17
    server = os.getenv("DB_SERVER")
    database = os.getenv("DB_DATABASE")
    username = os.getenv("DB_USERNAME")
    password = os.getenv("DB_PASSWORD")
    DB_CONN_STR = f"DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}"

def get_db_cursor():
    conn = pyodbc.connect(DB_CONN_STR)
    return conn, conn.cursor()

# ---------- DOC INTEL ----------
def extract_text_with_docai(file_obj):
    if not (DOCINTEL_ENDPOINT and DOCINTEL_KEY):
        raise RuntimeError("Document Intelligence credentials missing. Check DOCINTEL_* envs.")

    client = DocumentAnalysisClient(
        endpoint=DOCINTEL_ENDPOINT,
        credential=AzureKeyCredential(DOCINTEL_KEY)
    )
    file_obj.seek(0)
    poller = client.begin_analyze_document("prebuilt-document", document=file_obj)
    result = poller.result()

    lines = []
    for page in getattr(result, "pages", []):
        for line in getattr(page, "lines", []):
            lines.append(line.content)
    return "\n".join(lines)

# ---------- AOAI NORMALIZER ----------
def normalize_resume_text_azure(raw_text: str) -> dict:
    if not (AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT):
        raise RuntimeError("Azure OpenAI envs missing. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT.")

    client = AzureOpenAI(
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_key=AZURE_OPENAI_API_KEY,
        api_version=AZURE_OPENAI_API_VERSION,
    )

    prompt = f"""
Given the following resume, extract and return a JSON object with these fields ONLY:
- Name
- Email
- Phone
- Address
- EducationDegree
- EducationField
- EducationInstitution
- EducationYear
- Certifications: list of [certification name, year]
- Skills: list of unique skill names AND role/job titles

Resume:
\"\"\"{raw_text}\"\"\"
Return only valid JSON. No explanation.
""".strip()

    response = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT,   # FIX: use your deployment name
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=1500,
    )
    text = response.choices[0].message.content or ""

    # Robust JSON extraction
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"LLM did not return valid JSON. Raw:\n{text[:500]}")

# ---------- DB UPSERT ----------
def insert_or_update_employee(data, cursor, conn):
    email = data.get("Email")
    if not email:
        print("No Email found in data, skipping DB update.")
        return

    Name = data.get("Name", "")
    Phone = data.get("Phone", "")
    Address = data.get("Address", "")
    EducationDegree = data.get("EducationDegree", "")
    EducationField = data.get("EducationField", "")
    EducationInstitution = data.get("EducationInstitution", "")
    EducationYear = data.get("EducationYear", "")
    Certifications = json.dumps(data.get("Certifications", []))
    Skills = json.dumps(data.get("Skills", []))

    # TIP: In SQL Server, default schema is often dbo. Use dbo.Employees if that's your table.
    cursor.execute("SELECT Email FROM dbo.Employees WHERE Email = ?", (email,))
    row = cursor.fetchone()

    if row:
        cursor.execute("""
            UPDATE dbo.Employees SET
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
            INSERT INTO dbo.Employees (
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

# ---------- MAIN OP ----------
def process_resume_file(file_obj):
    resume_text = extract_text_with_docai(file_obj)
    normalized = normalize_resume_text_azure(resume_text)
    conn, cursor = get_db_cursor()
    try:
        insert_or_update_employee(normalized, cursor, conn)
    finally:
        cursor.close()
        conn.close()
    return normalized
