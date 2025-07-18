import os
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
import json

# Portable path for chunk file
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, "handbook_chunks.json")


with open(json_path, "r") as f:
    docs = [json.loads(line) for line in f]

import json

for d in docs:
    if not isinstance(d.get('metadata', ''), str):
        d['metadata'] = json.dumps(d.get('metadata', ''))

# Azure Search setup (replace with your real values)
endpoint = "https://veer.search.windows.net"
index_name = "veer"
admin_key = "8YoS6MJvSTlYuNH2JOvAGC3jgqBa6HOdczjfiIhkhqAzSeDVQ6JS"

client = SearchClient(endpoint=endpoint, index_name=index_name, credential=AzureKeyCredential(admin_key))

# Upload in batches
batch_size = 1000
for i in range(0, len(docs), batch_size):
    batch = docs[i:i+batch_size]
    result = client.upload_documents(documents=batch)
    print(f"Uploaded batch {i // batch_size + 1}: {result}")
