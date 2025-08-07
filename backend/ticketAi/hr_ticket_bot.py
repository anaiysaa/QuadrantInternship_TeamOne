# ticketAi/hr_ticket_bot.py
# Requires: pip install azure-ai-inference python-dotenv
import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

load_dotenv()

# --- Azure connection settings ---
endpoint = os.getenv(
    "AZURE_INFERENCE_SDK_ENDPOINT",
    "https://AnaiysaasAIFoundryTest.services.ai.azure.com/models",
)
model_name = os.getenv("DEPLOYMENT_NAME", "ticketClassifyingTest")
key = os.getenv(
    "AZURE_INFERENCE_SDK_KEY",
    "5KW1rps1l6JBaMaoTktaghezYRPa9xI4y3rk8Z4nuuhn4qDTgBqnJQQJ99BGACYeBjFXJ3w3AAAAACOGvavS",
)

client = ChatCompletionsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

# --- Fallback HR severity data (matches your JSON: 1=Critical, 5=Informational) ---
_DEFAULT_HR_SEVERITY = {
    "severity_levels": [
        {
            "severity": 1,
            "name": "Critical Severity",
            "description": "A widespread issue that completely disrupts core business functions or affects multiple users or systems. Includes legal risks, data breaches, or complete service outages. Requires immediate intervention.",
            "resolve_within": "30 minutes - 1 hour",
            "example_phrases": [
                "Payroll was not processed for this month.",
                "Employee data breach reported.",
                "Harassment complaint needs immediate action.",
                "All employees locked out of HR system.",
                "Unauthorized access to payroll information.",
            ],
            "keywords": [
                "payroll",
                "breach",
                "leak",
                "harassment",
                "compliance",
                "termination",
                "security",
                "access-denied",
                "data-loss",
                "hris-down",
            ],
        },
        {
            "severity": 2,
            "name": "High Severity",
            "description": "A serious problem impacting an individual’s ability to work or a major functionality failure affecting deadlines, customers, or security. Requires prompt escalation and rapid resolution.",
            "resolve_within": "2 - 4 hours",
            "example_phrases": [
                "New hire onboarding is blocked.",
                "Urgent approval needed for PTO request.",
                "Bonus payment missing from my salary.",
                "Access was not revoked for a terminated employee.",
                "Salary update error causing wrong payslip.",
            ],
            "keywords": [
                "salary-error",
                "bonus-missing",
                "overtime-missing",
                "benefits-error",
                "enrollment-fail",
                "deadline",
                "onboarding-blocked",
                "access-revoke",
                "locked-account",
                "role-mismatch",
            ],
        },
        {
            "severity": 3,
            "name": "Medium Severity",
            "description": "A moderate disruption that limits productivity but does not halt work. Often isolated to a single user, workflow, or system function. Requires routine investigation and timely resolution.",
            "resolve_within": "4 - 8 hours",
            "example_phrases": [
                "My leave approval request is stuck.",
                "Job title is incorrect in my profile.",
                "Training module does not launch.",
                "Form submission returns validation error.",
                "Files are not syncing properly.",
            ],
            "keywords": [
                "approval-stuck",
                "leave-pending",
                "workflow-delay",
                "title-mismatch",
                "org-chart",
                "lms-error",
                "training-missing",
                "review-missing",
                "form-error",
                "validation",
            ],
        },
        {
            "severity": 4,
            "name": "Low Severity",
            "description": "A minor issue or inconvenience with no significant impact on workflow. Includes cosmetic bugs, non-urgent errors, or usability concerns. Resolution can occur as part of the regular support cycle.",
            "resolve_within": "1 - 2 business days",
            "example_phrases": [
                "There is a typo on the profile page.",
                "Link to policy document is broken.",
                "Buttons not aligned properly.",
                "Page scrolling is slow.",
                "UI elements are misaligned on mobile.",
            ],
            "keywords": [
                "typo",
                "misaligned",
                "spacing",
                "font",
                "dark-mode",
                "contrast",
                "theme",
                "broken-link",
                "outdated-link",
                "slow-load",
                "animation-lag",
            ],
        },
        {
            "severity": 5,
            "name": "Informational Severity",
            "description": "A general inquiry, feature request, or policy clarification. No action required beyond guidance or documentation. Can often be resolved with self-service or basic support follow-up.",
            "resolve_within": "3 - 5 business days",
            "example_phrases": [
                "How do I request PTO?",
                "Where can I find the employee handbook?",
                "How to update my address?",
                "How do I install Microsoft Teams?",
                "Where can I find the software installation guide?",
            ],
            "keywords": [
                "policy",
                "handbook",
                "holiday",
                "schedule",
                "contact-hr",
                "pto",
                "faq",
                "benefits-info",
                "update-info",
                "address-change",
                "setup",
                "password-reset",
            ],
        },
    ]
}

def _load_hr_severity_json():
    """
    Load hr_severity.json from the same directory as this file.
    Falls back to _DEFAULT_HR_SEVERITY if the file doesn't exist.
    """
    here = Path(__file__).resolve().parent
    json_path = here / "hr_severity.json"
    if json_path.exists():
        try:
            with json_path.open("r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            # Safety net: if the file is corrupt, fall back to defaults
            pass
    return _DEFAULT_HR_SEVERITY

severity_data = _load_hr_severity_json()

def _build_system_message(sev):
    """
    IMPORTANT: Matches the JSON scale:
    Severity 1 = Critical (highest urgency)
    Severity 5 = Informational (lowest urgency)
    """
    msg = [
        "You are an HR support ticket severity classification assistant.",
        "Classify tickets strictly using this scale:",
        " - Severity 1 = Critical (highest urgency)",
        " - Severity 2 = High",
        " - Severity 3 = Medium",
        " - Severity 4 = Low",
        " - Severity 5 = Informational (lowest urgency)",
        "",
        "Use the following guide:",
    ]
    for level in sev["severity_levels"]:
        msg.append(f"\nSeverity {level['severity']}: {level['name']} - {level['description']}")
        if level.get("resolve_within"):
            msg.append(f"Resolve within: {level['resolve_within']}")
        msg.append(f"Example phrases: {', '.join(level['example_phrases'])}")
        msg.append(f"Keywords: {', '.join(level['keywords'])}")
    msg.append(
        "\nReturn a short rationale and ALWAYS end with this exact line:\n"
        "Final Classification: Severity X"
    )
    return "\n".join(msg)

_SYSTEM_MESSAGE = _build_system_message(severity_data)

# --- Public function used by your backend ---
def classify_hr_ticket(ticket_text: str) -> int | None:
    """
    Returns an integer severity 1..5 or None if extraction fails.
    """
    resp = client.complete(
        messages=[
            SystemMessage(content=_SYSTEM_MESSAGE),
            UserMessage(content=f"Ticket: {ticket_text}"),
        ],
        model=model_name,
        max_tokens=1000,
    )

    full = resp.choices[0].message.content.strip()
    # Print for server logs (optional)
    print("HR severity model output:\n", full)

    # Robust extraction: look for the "Final Classification" line and capture a 1-5
    m = re.search(r"Final\s*Classification\s*:\s*\**Severity\s*([1-5])\**", full, re.IGNORECASE)
    if m:
        return int(m.group(1))

    # Fallback: grab the first standalone 1-5 if the explicit phrase is missing
    m2 = re.search(r"\b([1-5])\b", full)
    if m2:
        return int(m2.group(1))

    return None

# --- Local test (optional) ---
if __name__ == "__main__":
    samples = [
        "Payroll wasn’t processed for this month for the whole company.",
        "New hire onboarding is blocked—no access to benefits portal.",
        "My leave approval is stuck in pending for a week.",
        "There’s a typo on the policy page.",
        "How do I request PTO in the system?",
    ]
    for s in samples:
        sev = classify_hr_ticket(s)
        print(f"Ticket: {s}\n -> Severity: {sev}\n")
