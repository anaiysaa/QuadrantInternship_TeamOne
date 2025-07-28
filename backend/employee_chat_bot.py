import os
import requests
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

# Read secrets from .env
AZURE_OPENAI_API_KEY = os.getenv("subscription_key")
AZURE_OPENAI_ENDPOINT = os.getenv("endpoint")
AZURE_OPENAI_DEPLOYMENT = os.getenv("deployment")
AZURE_OPENAI_API_VERSION = os.getenv("api_version")

SEARCH_ENDPOINT = os.getenv("SEARCH_ENDPOINT")
SEARCH_INDEX = os.getenv("SEARCH_INDEX")
SEARCH_ADMIN_KEY = os.getenv("SEARCH_ADMIN_KEY")
SEARCH_API_VERSION = os.getenv("SEARCH_API_VERSION")


app = FastAPI()

# 👇 Add this block after creating the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # or ["*"] during dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Azure OpenAI client (new SDK)
client = AzureOpenAI(
    api_key=AZURE_OPENAI_API_KEY,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_version=AZURE_OPENAI_API_VERSION
)

def search_employee_handbook(query, top_k=2):
    url = f"{SEARCH_ENDPOINT}/indexes/{SEARCH_INDEX}/docs/search?api-version={SEARCH_API_VERSION}"
    headers = {
        "Content-Type": "application/json",
        "api-key": SEARCH_ADMIN_KEY
    }
    body = {
        "search": query,
        "top": top_k
    }
    resp = requests.post(url, headers=headers, json=body)
    resp.raise_for_status()
    results = resp.json()
    snippets = [doc['content'] for doc in results.get('value', [])]
    return "\n\n".join(snippets)

@app.post("/ask")
async def ask(request: Request):
    data = await request.json()
    user_question = data.get("question", "")

    # 1. Retrieve relevant handbook snippets
    try:
        handbook_snippet = search_employee_handbook(user_question, top_k=2)
    except Exception as e:
        return {"error": f"Azure Search failed: {e}"}

    # 2. Compose prompt for LLM
    prompt = f"""
You are an HR assistant bot. Answer the following employee question using ONLY the official handbook excerpts below.
First, provide a clear, friendly summary in your own words.
Then, show the actual excerpt(s) from the handbook that you used to answer.

Handbook excerpts:
\"\"\"
{handbook_snippet}
\"\"\"

Question: {user_question}
"""

    # 3. Get answer from Azure OpenAI
    try:
        completion = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=[
                {"role": "system", "content": "You are a helpful HR assistant. Always use the provided handbook excerpt to answer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=600
        )
        answer = completion.choices[0].message.content.strip()
    except Exception as e:
        return {"error": f"OpenAI API failed: {e}"}

    return {"answer": answer}
