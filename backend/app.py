from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
import re
import json
import os
from werkzeug.utils import secure_filename
from simple_database import db_instance

# --- LangChain & RAG Imports ---
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS

app = Flask(__name__)
CORS(app)

# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
_BILLS_JSON_PATH = os.path.join(os.path.dirname(__file__), 'bills_data.json')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- RAG Pipeline (Initialized on Startup) ---
_POLICY_VECTORSTORE = None

def initialize_rag_pipeline():
    """Loads PDF, creates embeddings, and sets up the vector store."""
    global _POLICY_VECTORSTORE
    try:
        print("--- Initializing RAG Policy Agent ---")
        
        # --- THIS IS THE CORRECTED PART ---
        # Build an absolute path to the PDF relative to this script's location
        script_dir = os.path.dirname(__file__)
        pdf_path = os.path.join(script_dir, "Policies.pdf")
        # --- END OF CORRECTION ---

        if not os.path.exists(pdf_path):
            print(f"ERROR: 'Policies.pdf' not found at the expected path: {pdf_path}")
            print("Please ensure the PDF file is in the same directory as app.py.")
            return

        print(f"Loading PDF from: {pdf_path}")
        loader = PyPDFLoader(pdf_path)
        docs = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        embeddings = OllamaEmbeddings(model="nomic-embed-text")
        _POLICY_VECTORSTORE = FAISS.from_documents(documents=splits, embedding=embeddings)
        print("--- RAG Policy Agent Ready ---")
    except Exception as e:
        print(f"FATAL: Could not initialize RAG pipeline: {e}")

# ... (The rest of your app.py file is unchanged) ...

def check_invoice_compliance(invoice: dict):
    if not _POLICY_VECTORSTORE:
        return "ERROR: Policy agent is not initialized. Check server logs."
    invoice_text = (
        f"Invoice Number: {invoice.get('invoice_number', 'N/A')}. "
        f"Vendor: {invoice.get('vendor', 'N/A')}. "
        f"Item: {invoice.get('item', 'N/A')}. "
        f"Date: {invoice.get('date', 'N/A')}. "
        f"Amount: {invoice.get('amount', 'N/A')}. "
        f"Category: {invoice.get('short_description', 'N/A')}."
    )
    retriever = _POLICY_VECTORSTORE.as_retriever(search_kwargs={"k": 5})
    relevant_docs = retriever.invoke(invoice_text)
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    prompt_template = f"""
    You are a strict expense approval auditor. Your ONLY task is to determine if an expense claim passes or is declined based *strictly* on the company policy context provided below.
    - Provide a one-sentence answer starting with "PASS:" or "DECLINED:".
    - You MUST cite the specific rule from the context that justifies your decision.
    - If the context does not contain a specific rule, state: "UNCLEAR: The policy does not contain a specific rule for this expense."

    **Company Policy Context:**
    {context}
    **Expense Claim to Verify:**
    {invoice_text}
    **Your auditor decision:**
    """
    response = ollama.chat(
        model='llama3.1:8b',
        messages=[
            {'role': 'system', 'content': 'You are a strict financial auditor.'},
            {'role': 'user', 'content': prompt_template}
        ]
    )
    return response['message']['content'].strip()

def safe_json_parse(raw_output):
    match = re.search(r'\{[\s\S]*\}', raw_output)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception: pass
    return None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def _load_bills_json():
    try:
        if not os.path.exists(_BILLS_JSON_PATH): return []
        with open(_BILLS_JSON_PATH, 'r', encoding='utf-8') as f: return json.load(f)
    except Exception: return []

def _save_bill_to_json(extracted_data):
    bills = _load_bills_json()
    bills.append(extracted_data)
    with open(_BILLS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(bills, f, indent=2)

def process_invoice_with_ocr(image_path):
    try:
        model_name = 'qwen2.5vl:3b'
        base_messages = [{
            "role": "system", "content": "You are an assistant that extracts structured fields from invoices."
        }, {
            "role": "user",
            "content": (
                "Return only the following fields in JSON format:\n"
                "{\n"
                "  \"invoice_number\": \"...\",\n"
                "  \"vendor\": \"...\",\n"
                "  \"item\": \"max 4 words\",\n"
                "  \"date\": \"DD-MM-YYYY\",\n"
                "  \"amount\": \"...\",\n"
                "  \"short_description\": \"concise 2–5 word expense category\"\n"
                "}\n"
                "Respond with JSON ONLY. No prose."
            ), "images": [image_path]
        }]
        response = ollama.chat(model=model_name, messages=base_messages)
        raw_output = response['message']['content']
        data = safe_json_parse(raw_output)
        if data is None:
            return {"success": False, "error": "OCR failed to extract JSON.", "raw_output": raw_output}
        required_fields = {
            "invoice_number": "N/A", "vendor": "Unknown", "item": "N/A",
            "date": "N/A", "amount": "0.00", "short_description": "General"
        }
        for field, default in required_fields.items():
            if field not in data or not data[field]: data[field] = default
        return {"success": True, "data": data, "raw_output": raw_output}
    except Exception as e:
        return {"success": False, "error": str(e), "data": None}

@app.route('/api/process-invoice', methods=['POST'])
def process_invoice_endpoint():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400
    file = request.files['file']
    if not file or not allowed_file(file.filename):
        return jsonify({"success": False, "error": "Invalid file"}), 400
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    result = process_invoice_with_ocr(file_path) 
    os.remove(file_path)
    return jsonify(result) if result["success"] else (jsonify(result), 500)

@app.route('/api/policy-check', methods=['POST'])
def policy_check_endpoint():
    invoice_data = request.get_json()
    if not invoice_data:
        return jsonify({"success": False, "error": "No invoice data provided"}), 400
    decision = check_invoice_compliance(invoice_data)
    return jsonify({"success": True, "decision": decision})

@app.route('/api/save-bill', methods=['POST'])
def save_bill_endpoint():
    invoice_data = request.get_json()
    if not invoice_data:
        return jsonify({"success": False, "error": "No invoice data provided"}), 400
    user_id = 'default_user'
    duplicate_check = db_instance.check_duplicates(invoice_data, user_id)
    if duplicate_check["is_duplicate"]:
        return jsonify({"success": False, "error": "This bill is a duplicate and cannot be saved."})
    db_instance.save_bill(invoice_data, user_id)
    _save_bill_to_json(invoice_data)
    return jsonify({"success": True, "message": "Bill saved successfully."})

@app.route('/api/bills/json', methods=['GET'])
def get_bills_json():
    bills = _load_bills_json()
    return jsonify({"success": True, "bills": bills, "count": len(bills)})

if __name__ == '__main__':
    initialize_rag_pipeline()
    app.run(debug=True, host='0.0.0.0', port=5001)