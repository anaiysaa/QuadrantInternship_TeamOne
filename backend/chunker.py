import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import pandas as pd

base_dir = os.path.dirname(os.path.abspath(__file__))
pdf_path = os.path.join(base_dir, "employee_handbook.pdf")

loader = PyPDFLoader(pdf_path)
docs = loader.load()

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)

data = []
for i, chunk in enumerate(chunks):
    data.append({
        "id": str(i),
        "content": chunk.page_content,
        "metadata": chunk.metadata
    })

csv_path = os.path.join(base_dir, "handbook_chunks.csv")
json_path = os.path.join(base_dir, "handbook_chunks.json")

df = pd.DataFrame(data)
df.to_csv(csv_path, index=False)
df.to_json(json_path, orient="records", lines=True)
