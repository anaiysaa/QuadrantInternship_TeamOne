import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

DB_CONN_STR = os.getenv("DB_CONN_STR")

# Global course cache
_cached_courses = None

def get_available_courses():
    """
    Loads courses from the LMSCourses table and caches them.
    """
    global _cached_courses
    if _cached_courses is not None:
        return _cached_courses

    try:
        conn = pyodbc.connect(DB_CONN_STR)
        cursor = conn.cursor()
        cursor.execute("SELECT CourseName, SkillsCovered, Link FROM LMSCourses")
        rows = cursor.fetchall()
        _cached_courses = [
            {
                "name": row[0],
                "skills": [s.strip().lower() for s in row[1].split(",") if s.strip()],
                "url": row[2]
            }
            for row in rows
        ]
        return _cached_courses

    except Exception as e:
        print(f"[ERROR loading courses from DB]: {e}")
        return []

def get_recommended_courses(skills_missing):
    """
    For each missing skill, find LMS courses that cover it.
    Returns a list of course dictionaries.
    """
    if not skills_missing:
        return []

    available_courses = get_available_courses()
    skills_missing_lower = [s.lower() for s in skills_missing]
    recommendations = []

    for skill in skills_missing_lower:
        for course in available_courses:
            if skill in course["skills"]:
                course_entry = {
                    "name": course["name"],
                    "url": course["url"]
                }
                if course_entry not in recommendations:
                    recommendations.append(course_entry)

    return recommendations
