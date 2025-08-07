# Install the following dependencies: azure.identity and azure-ai-inference
import os
import json
import re
from dotenv import load_dotenv
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from pathlib import Path

# Load .env
load_dotenv()

# Azure connection
endpoint = os.getenv(
    "AZURE_INFERENCE_SDK_ENDPOINT",
    "https://AnaiysaasAIFoundryTest.services.ai.azure.com/models"
)
model_name = os.getenv("DEPLOYMENT_NAME", "ticketClassifyingTest")
key = os.getenv(
    "AZURE_INFERENCE_SDK_KEY",
    "5KW1rps1l6JBaMaoTktaghezYRPa9xI4y3rk8Z4nuhn4qDTgBqnJQQJ99BGACYeBjFXJ3w3AAAAACOGvavS"
)

client = ChatCompletionsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

# ---------------- FALLBACK IT SEVERITY DATA ----------------
_DEFAULT_SEVERITY_DATA = {
    "severity_levels": [
        {
            "severity": 1,
            "name": "Critical Severity",
            "description": "Emergency-level issues affecting multiple users, security breaches, or complete system outages requiring immediate attention.",
            "resolve_within": "30 minutes - 1 hour",
            "example_phrases": [
                "The entire network is down.",
                "Security breach detected in our systems.",
                "All servers are offline and nobody can work.",
                "Data backup systems have failed completely.",
                "Ransomware attack detected on company computers."
            ],
            "keywords": [
                "network down", "security breach", "servers offline", "backup failed",
                "ransomware", "data breach", "complete outage", "multiple users affected", "emergency"
            ]
        },
        {
            "severity": 2,
            "name": "High Severity",
            "description": "Critical issues that significantly impact individual productivity and work capabilities.",
            "resolve_within": "2-4 hours",
            "example_phrases": [
                "I can't access my work email at all.",
                "My computer won't start up.",
                "I cannot log in to any company systems.",
                "All my files are corrupted or missing.",
                "The system crashed and I lost important work."
            ],
            "keywords": [
                "cannot access email", "computer won't start", "cannot log in",
                "files corrupted", "files missing", "system crashed", "lost work", "complete failure"
            ]
        },
        {
            "severity": 3,
            "name": "Medium Severity",
            "description": "Issues that moderately impact work efficiency but have workarounds available.",
            "resolve_within": "4-8 hours",
            "example_phrases": [
                "My email is not syncing properly.",
                "I can't connect to the VPN.",
                "The application keeps crashing but I can restart it.",
                "I'm having trouble with file permissions.",
                "My second monitor isn't working."
            ],
            "keywords": [
                "email sync", "vpn connection", "application crash",
                "file permissions", "monitor issues", "sync problems", "connection issues"
            ]
        },
        {
            "severity": 4,
            "name": "Low Severity",
            "description": "Routine maintenance requests or minor issues that don't impact productivity significantly.",
            "resolve_within": "1-2 business days",
            "example_phrases": [
                "Please install software X on my computer.",
                "I need access to a shared folder.",
                "Can you help me set up my email signature?",
                "My computer is running slowly.",
                "I need a new mouse/keyboard."
            ],
            "keywords": [
                "install software", "shared folder access", "email signature",
                "running slowly", "new hardware", "setup", "configure"
            ]
        },
        {
            "severity": 5,
            "name": "Very Low Severity",
            "description": "Informational requests, documentation, or minor questions that do not affect system functionality.",
            "resolve_within": "3-5 business days",
            "example_phrases": [
                "Can you send me the IT user manual?",
                "What's the WiFi password for guests?",
                "How do I connect to the printer?",
                "Where can I download software X?",
                "What are the system requirements for this application?"
            ],
            "keywords": [
                "manual", "documentation", "wifi password",
                "printer setup", "download", "system requirements", "how to", "tutorial"
            ]
        }
    ]
}

# ---------------- LOAD SEVERITY FILE ----------------
def load_severity_data():
    here = Path(__file__).resolve().parent
    json_path = here / "it_severity.json"
    if json_path.exists():
        with json_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    return _DEFAULT_SEVERITY_DATA

severity_data = load_severity_data()

# ---------------- BUILD SYSTEM PROMPT ----------------
def build_system_message_from_severity(severity_data):
    message = (
        "You are an IT support ticket severity classification assistant. "
        "Classify tickets from severity level 1 (critical) to 5 (very low). "
        "Use the following guide:\n"
    )
    for level in severity_data["severity_levels"]:
        message += f"\nSeverity {level['severity']}: {level['name']} - {level['description']}"
        if 'resolve_within' in level:
            message += f"\nResolve within: {level['resolve_within']}"
        message += f"\nExample phrases: {', '.join(level['example_phrases'])}"
        message += f"\nKeywords: {', '.join(level['keywords'])}\n"
    
    message += (
        "\nIf you cannot match specific keywords, use the 'resolve_within' timeframes "
        "to help determine severity based on urgency expressed in the ticket."
    )
    message += "\nAlways end your response with the severity level number, e.g., 'Final Classification: Severity 3'.\n"
    return message

system_message_text = build_system_message_from_severity(severity_data)

# ---------------- CLASSIFIER ----------------
def classify_it_ticket(ticket_text):
    response = client.complete(
        messages=[
            SystemMessage(content=system_message_text),
            UserMessage(content=f"Ticket: {ticket_text}")
        ],
        model=model_name,
        max_tokens=1000
    )
    
    full_response = response.choices[0].message.content.strip()
    print(full_response)

    match = re.search(r"Final Classification[:\s]*\**Severity\s*(\d)\**", full_response, re.IGNORECASE)
    if match:
        return int(match.group(1))
    return None

# ---------------- TESTING ----------------
if __name__ == "__main__":
    sample_tickets = [
        "I can't access my work email, and I need it fixed as soon as possible.",
        "The entire network is down and nobody can work.",
        "What's the WiFi password for the guest network?"
    ]
    
    print("Testing IT Ticket Classification:")
    print("=" * 50)
    
    for ticket in sample_tickets:
        print(f"\nTicket: {ticket}")
        severity = classify_it_ticket(ticket)
        print(f"Classification: {severity}")
        print("-" * 30)
