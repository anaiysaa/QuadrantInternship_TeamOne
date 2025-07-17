# ai_utils.py
import os
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

# Setup Azure OpenAI client
client = AzureOpenAI(
    api_key=os.getenv('subscription_key'),
    api_version=os.getenv('api_version'),
    azure_endpoint=os.getenv('endpoint'),
)

def recommend_courses_for_missing_skills(employee_skills, job_required_skills, courses):
    """
    Given employee's current skills, required job skills, and a list of courses,
    ask Azure OpenAI to recommend the best courses for missing skills.
    """
    course_list = "\n".join([f"{c['CourseName']} ({c['SkillsCovered']}): {c['Link']}" for c in courses])
    prompt = f"""
Employee skills: {employee_skills}
Job required skills: {job_required_skills}
Available courses (with links): 
{course_list}

Instructions:
For each missing skill, recommend the best matching course(s) above to help the employee gain that skill.
If no match, say "None available".
Format:
Missing Skill: <Skill>
Recommended Courses: <CourseName1> (<Link1>), <CourseName2> (<Link2>)
Just output the list, no extra commentary.
"""
    response = client.chat.completions.create(
        model=os.getenv('deployment'),
        messages=[
            {"role": "system", "content": "You are an expert HR assistant helping employees upskill."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=700,
        temperature=0.0,
        top_p=1.0,
    )
    return response.choices[0].message.content

def summarize_ticket_description(description):
    """
    Uses Azure OpenAI to summarize a ticket description for HR staff.
    """
    prompt = f"""
Below is a ticket description submitted to HR. The language may be confusing, overly detailed, or unclear. 
Summarize it into a short, clear summary (1-2 sentences) so that HR staff can quickly understand the main issue.

Ticket Description:
\"\"\"{description}\"\"\"

Summary:
"""
    response = client.chat.completions.create(
        model=os.getenv('deployment'),
        messages=[
            {"role": "system", "content": "You are an expert HR assistant who summarizes tickets for clarity."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=120,
        temperature=0.2,
        top_p=1.0,
    )
    return response.choices[0].message.content.strip()
# --- Add more AI functions here for other LLM-powered tools as needed! ---
