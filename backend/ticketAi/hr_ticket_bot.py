# Install the following dependencies: azure.identity and azure-ai-inference
import os
import json
from dotenv import load_dotenv
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
import re


load_dotenv()

endpoint = os.getenv("AZURE_INFERENCE_SDK_ENDPOINT", "https://AnaiysaasAIFoundryTest.services.ai.azure.com/models")
model_name = os.getenv("DEPLOYMENT_NAME", "ticketClassifyingTest")
key = os.getenv("AZURE_INFERENCE_SDK_KEY", "5KW1rps1l6JBaMaoTktaghezYRPa9xI4y3rk8Z4nuuhn4qDTgBqnJQQJ99BGACYeBjFXJ3w3AAAAACOGvavS")

client = ChatCompletionsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

#with open("ticketAi/hr_severity.json", "r", encoding="utf-8") as f:
with open("hr_severity.json", "r", encoding="utf-8") as f:
    severity_data = json.load(f)

def build_system_message_from_severity(severity_data):
    message = "You are an HR support ticket severity classification assistant. Classify tickets from severity level 1 (very low) to 5 (critical). Use the following guide:\n"
    for level in severity_data["severity_levels"]:
        message += f"\nSeverity {level['severity']}: {level['name']} - {level['description']}\nExample phrases: {', '.join(level['example_phrases'])}\nKeywords: {', '.join(level['keywords'])}\n"
    message += "\n ALWAYS end ‘Final Classification: Severity [1–5]’.\n"
    return message

system_message_text = build_system_message_from_severity(severity_data)


def classify_hr_ticket(ticket_text):
    response = client.complete(
        messages=[
            SystemMessage(content=system_message_text),
            UserMessage(content=f"Ticket: {ticket_text}")
        ],
        model=model_name,
        max_tokens=1000
    )

    print(f"LLM Response: {response.choices[0].message.content.strip()}")
    full_response = response.choices[0].message.content.strip()
    match = re.search(r"Final Classification[:\s]*\**Severity\s*(\d)\**", full_response, re.IGNORECASE)
    if match:
        return int(match.group(1))
    else:
        print("⚠️ Could not extract severity from LLM output")
        return None

# individual ticket classification test
#if __name__ == "__main__":
#    sample_ticket = "the building is on fire HELP"
#    severity = classify_ticket(sample_ticket)
#    print(f"Classified Severity: {severity}")

#loop through test tickets
#if __name__ == "__main__":
#    with open("hr_test_tickets.json", "r", encoding="utf-8") as f:
#        test_tickets = json.load(f)["tickets"]

#    for ticket in test_tickets:
#        result = classify_ticket(ticket["text"])
#        print(f"{ticket['id']}:\n{result}\n{'-' * 40}")