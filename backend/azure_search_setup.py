import os
import json
from dotenv import load_dotenv
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential

# Load environment variables
load_dotenv()

# Portable path for chunk file
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, "handbook_chunks.json")

# Load chunk data
with open(json_path, "r") as f:
    docs = [json.loads(line) for line in f]

# Ensure metadata is stringified
for d in docs:
    if not isinstance(d.get('metadata', ''), str):
        d['metadata'] = json.dumps(d.get('metadata', ''))

# Azure Search setup using .env values
endpoint = os.getenv("SEARCH_ENDPOINT")
index_name = os.getenv("SEARCH_INDEX")
admin_key = os.getenv("SEARCH_ADMIN_KEY")

if not endpoint or not index_name or not admin_key:
    raise ValueError("Missing SEARCH_ENDPOINT, SEARCH_INDEX, or SEARCH_ADMIN_KEY in .env file")

client = SearchClient(endpoint=endpoint, index_name=index_name, credential=AzureKeyCredential(admin_key))

# Upload in batches
batch_size = 1000
for i in range(0, len(docs), batch_size):
    batch = docs[i:i+batch_size]
    result = client.upload_documents(documents=batch)
    print(f"Uploaded batch {i // batch_size + 1}: {result}")
