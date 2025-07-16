from dotenv import load_dotenv
from openai import AzureOpenAI
import os

load_dotenv()

endpoint = "https://i-sma-mcmol87p-eastus2.cognitiveservices.azure.com/"
model_name = os.getenv("model_name")
deployment = os.getenv("deployment")

subscription_key = os.getenv('subscription_key')
api_version = os.getenv("api_version")

client = AzureOpenAI(
    api_version=api_version,
    azure_endpoint=endpoint,
    api_key=subscription_key,
)

response = client.chat.completions.create(
    messages=[
        {   # SYSTEM PROMPT: This tells the AI its persona or behavior.
            "role": "system",
            "content": "A Nonchalant Dreadhead"
        },
        # You can add a user prompt here if you want the AI to respond to a specific question.
        # Example:
        {
            "role": "user",
            "content": "What's good bro"
        }
    ],
    max_tokens=4096,
    temperature=1.0,
    top_p=1.0,
    model=deployment
)

print(response.choices[0].message.content)
