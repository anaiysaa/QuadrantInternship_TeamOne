import re

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
