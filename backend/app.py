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
_POLICY_VECTORSTORE = None

def initialize_rag_pipeline():
    global _POLICY_VECTORSTORE
    try:
        print("--- Initializing RAG Policy Agent ---")
        script_dir = os.path.dirname(__file__)
        pdf_path = os.path.join(script_dir, "Policies.pdf")
        if not os.path.exists(pdf_path):
            print(f"ERROR: 'Policies.pdf' not found at the expected path: {pdf_path}")
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
    You are a strict expense approval auditor... (rest of prompt unchanged)
    """ # Keeping this brief as it's unchanged
    response = ollama.chat(model='llama3.1:8b', messages=[{'role': 'system', 'content': 'You are a strict financial auditor.'}, {'role': 'user', 'content': prompt_template}])
    return response['message']['content'].strip()

def get_risk_score_from_llm(target_bill: dict, all_bills: list):
    try:
        context_bills = "\n".join([f"- {b.get('vendor', 'N/A')}, Amount: {b.get('amount', '0.00')}, Item: {b.get('item', 'N/A')}" for b in all_bills])
        
        # --- MODIFIED PROMPT ---
        prompt = f"""
        You are a financial fraud detection expert. Your task is to provide a numerical risk score for a given invoice based on its details and in the context of a list of historical invoices.

        **Historical Invoices Context:**
        {context_bills}

        **Target Invoice to Analyze:**
        - Vendor: {target_bill.get('vendor')}
        - Amount: {target_bill.get('amount')}
        - Item: {target_bill.get('item')}
        - Date: {target_bill.get('date')}
        - Is Split Purchase Order (Manual Flag): {target_bill.get('is_splitPO')}

        **Scoring Rubric:**
        - **Score 71-100 (High Risk):** Assign a high score for unusually large amounts compared to the vendor's history, vague item descriptions for high costs, or if 'is_splitPO' is true. Multiple small invoices from the same vendor in a short period also indicate high risk.
        - **Score 31-70 (Medium Risk):** Assign a medium score for vendors not present in the historical context or for items that seem unusual for a given vendor.
        - **Score 0-30 (Low Risk):** Assign a low score for invoices that are consistent with the vendor's historical amounts and item types.

        **Output Format:**
        Respond with ONLY a JSON object in the following format. Do not include any other text or explanations.
        {{
          "risk_score": <an integer between 0 and 100>,
          "reason": "Provide a brief, one-sentence explanation for your reasoning."
        }}
        """
        # --- END OF MODIFICATION ---

        response = ollama.chat(
            model='deepseek-r1:8b',
            messages=[{'role': 'user', 'content': prompt}],
            format='json'
        )
        return json.loads(response['message']['content'])
    except Exception as e:
        print(f"Error during risk score generation: {e}")
        return {"risk_score": -1, "reason": "Failed to generate risk score."} # Use -1 for error

def safe_json_parse(raw_output):
    match = re.search(r'\{[\s\S]*\}', raw_output)
    if match:
        try: return json.loads(match.group(0))
        except Exception: pass
    return None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def _load_bills_json():
    try:
        if not os.path.exists(_BILLS_JSON_PATH): return []
        with open(_BILLS_JSON_PATH, 'r', encoding='utf-8') as f: return json.load(f)
    except Exception: return []

def _write_bills_to_json(bills_data: list):
    with open(_BILLS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(bills_data, f, indent=2)

def process_invoice_with_ocr(image_path):
    try:
        model_name = 'qwen2.5vl:3b'
        base_messages = [{ "role": "system", "content": "You are an assistant that extracts structured fields from invoices." }, { "role": "user", "content": ("... (prompt unchanged) ..."), "images": [image_path] }]
        response = ollama.chat(model=model_name, messages=base_messages)
        raw_output = response['message']['content']
        data = safe_json_parse(raw_output)
        if data is None: return {"success": False, "error": "OCR failed to extract JSON.", "raw_output": raw_output}
        required_fields = {"invoice_number": "N/A", "vendor": "Unknown", "item": "N/A", "date": "N/A", "amount": "0.00", "short_description": "General"}
        for field, default in required_fields.items():
            if field not in data or not data[field]: data[field] = default
        return {"success": True, "data": data, "raw_output": raw_output}
    except Exception as e:
        return {"success": False, "error": str(e), "data": None}

@app.route('/api/process-invoice', methods=['POST'])
def process_invoice_endpoint():
    if 'file' not in request.files: return jsonify({"success": False, "error": "No file uploaded"}), 400
    file = request.files['file']
    if not file or not allowed_file(file.filename): return jsonify({"success": False, "error": "Invalid file"}), 400
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    result = process_invoice_with_ocr(file_path) 
    os.remove(file_path)
    return jsonify(result) if result["success"] else (jsonify(result), 500)

@app.route('/api/policy-check', methods=['POST'])
def policy_check_endpoint():
    invoice_data = request.get_json()
    if not invoice_data: return jsonify({"success": False, "error": "No invoice data provided"}), 400
    decision = check_invoice_compliance(invoice_data)
    return jsonify({"success": True, "decision": decision})

@app.route('/api/save-bill', methods=['POST'])
def save_bill_endpoint():
    invoice_data = request.get_json()
    if not invoice_data: return jsonify({"success": False, "error": "No invoice data provided"}), 400
    invoice_data["is_splitPO"] = "false"
    user_id = 'default_user'
    duplicate_check = db_instance.check_duplicates(invoice_data, user_id)
    if duplicate_check["is_duplicate"]:
        return jsonify({"success": False, "error": "This bill is a duplicate and cannot be saved."})
    db_instance.save_bill(invoice_data, user_id)
    all_bills = _load_bills_json()
    all_bills.append(invoice_data)
    _write_bills_to_json(all_bills)
    return jsonify({"success": True, "message": "Bill saved successfully."})

@app.route('/api/get-risk-score', methods=['POST'])
def get_risk_score_endpoint():
    data = request.get_json()
    target_bill = data.get('bill')
    if not target_bill: return jsonify({"success": False, "error": "Target bill data not provided"}), 400
    all_bills = _load_bills_json()
    risk_info = get_risk_score_from_llm(target_bill, all_bills)
    updated = False
    for i, bill in enumerate(all_bills):
        if bill.get('invoice_number') == target_bill.get('invoice_number') and bill.get('vendor') == target_bill.get('vendor'):
            all_bills[i]['risk_score'] = risk_info.get('risk_score', -1)
            all_bills[i]['risk_reason'] = risk_info.get('reason', 'N/A')
            updated = True
            break
    if not updated: return jsonify({"success": False, "error": "Could not find bill to update."})
    _write_bills_to_json(all_bills)
    return jsonify({"success": True, "bills": all_bills})

@app.route('/api/bills/json', methods=['GET'])
def get_bills_json():
    bills = _load_bills_json()
    return jsonify({"success": True, "bills": bills, "count": len(bills)})

if __name__ == '__main__':
    initialize_rag_pipeline()
    app.run(debug=True, host='0.0.0.0', port=5001)
