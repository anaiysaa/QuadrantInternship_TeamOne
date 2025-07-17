# Install the following dependencies: azure.identity and azure-ai-inference
import os
import json
from dotenv import load_dotenv
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

load_dotenv()

endpoint = os.getenv("AZURE_INFERENCE_SDK_ENDPOINT", "https://AnaiysaasAIFoundryTest.services.ai.azure.com/models")
model_name = os.getenv("DEPLOYMENT_NAME", "ticketClassifyingTest")
key = os.getenv("AZURE_INFERENCE_SDK_KEY", "5KW1rps1l6JBaMaoTktaghezYRPa9xI4y3rk8Z4nuhn4qDTgBqnJQQJ99BGACYeBjFXJ3w3AAAAACOGvavS")

client = ChatCompletionsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

# Load IT severity data instead of HR severity data
with open("it_severity.json", "r", encoding="utf-8") as f:
    severity_data = json.load(f)

def build_system_message_from_severity(severity_data):
    # Updated to mention IT support instead of HR support
    message = "You are an IT support ticket severity classification assistant. Classify tickets from severity level 1 (critical) to 5 (very low). Use the following guide:\n"
    for level in severity_data["severity_levels"]:
        message += f"\nSeverity {level['severity']}: {level['name']} - {level['description']}"
        # Include resolve_within timing if available
        if 'resolve_within' in level:
            message += f"\nResolve within: {level['resolve_within']}"
        message += f"\nExample phrases: {', '.join(level['example_phrases'])}\nKeywords: {', '.join(level['keywords'])}\n"
    
    message += "\nIf you cannot match specific keywords, use the 'resolve_within' timeframes to help determine severity based on urgency expressed in the ticket."
    message += "\nAlways end your response with the severity level number, e.g., 'Final Classification: Severity 3'.\n"
    return message

system_message_text = build_system_message_from_severity(severity_data)

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

    # Extract only the number after "Final Classification: Severity X"
    match = re.search(r"Final Classification: Severity (\d)", full_response)
    if match:
        severity_number = int(match.group(1))
        return severity_number
    else:
        return None

if __name__ == "__main__":
    # Test with IT-related sample tickets
    sample_tickets = [
        "I can't access my work email, and I need it fixed as soon as possible.",
        #"My computer won't start up this morning.",
        #"Can you help me install Microsoft Office on my laptop?",
        #"The entire network is down and nobody can work.",
        #"What's the WiFi password for the guest network?"
    ]
    
    print("Testing IT Ticket Classification:")
    print("=" * 50)
    
    for ticket in sample_tickets:
        print(f"\nTicket: {ticket}")
        severity = classify_ticket(ticket)
        print(f"Classification: {severity}")
        print("-" * 30)