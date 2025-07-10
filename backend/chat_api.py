from dotenv import load_dotenv
from openai import AzureOpenAI
import os


class ChatWrapper:

    def __init__(self):
        load_dotenv()
        self.endpoint = os.getenv("endpoint")
        self.model_name = os.getenv("model_name")
        self.deployment = os.getenv("deployment")

        self.subscription_key = os.getenv("subscription_key")
        self.api_version = os.getenv("api_version")

    def get_client(self):
        return AzureOpenAI(
            api_version=self.api_version,
            azure_endpoint=self.endpoint,
            api_key=self.subscription_key,
        )

    def get_response(self, system_prompt, user_prompt):
        client = self.get_client()
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            max_tokens=4096,
            temperature=1.0,
            top_p=1.0,
            model=self.deployment,
        )
        return response
 