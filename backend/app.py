from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
import re
import json
import os
import tempfile
from werkzeug.utils import secure_filename
from simple_database import db_instance
import re
import json

def safe_json_parse(raw_output):
    # Find the first JSON object in the text
    match = re.search(r'\{.*\}', raw_output, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError as e:
            print("❌ JSON decode failed:", e)
            return None
    return None

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def process_invoice_with_ocr(image_path):
    """
    Process invoice image using Ollama OCR model
    """
    try:
        # Check if Ollama is available and model exists
        try:
            models = ollama.list()
            
            # Try different model names
            model_name = 'llama3.2-vision:11b'
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Ollama not available: {str(e)}",
                "data": None
            }


        # Step 1: Ask SLM to analyze image and extract structured fields
        messages = [
    {
        "role": "system",
        "content": "You are an assistant that extracts structured fields from invoices. Analyze image correctly, for example the content near the text of invoice number is the invoice number but there may be other numbers that look like the same."
    },
    {
        "role": "user",
        "content": """Return only the following fields in JSON format:
        {
          "invoice_number": "...",
          "vendor": "...",
          "item": "max 4 words (make the item name concise if it's too long)",
          "date": "DD-MM-YYYY",
          "amount": "...",
          "short_description": "concise 2–5 word expense category (e.g., 'office supplies', 'travel expense')"
        }
        Make sure all fields are filled in, even if you need to infer from context. 
        Make sure you give with starting bracket and ending bracket like a typical JSON.
        Also dont give any additional text.
        Give only JSON no additional text .
        """,
        "images": [image_path]
    }
]


        response = ollama.chat(
            model=model_name,
            messages=messages
        )

        raw_output = response['message']['content']
        print(raw_output)

        # Step 2: Parse JSON safely
        try:
            data = safe_json_parse(raw_output)
        except Exception as e:
            # If JSON parsing fails, return error
            return {
                "success": False,
                "error": f"Failed to parse OCR output: {str(e)}",
                "data": None
            }


        # Step 3: Post-processing / normalization

        # Clean invoice number (keep alphanumerics and dashes)
        if "invoice_number" in data:
            match = re.search(r'[A-Za-z0-9-]+', data["invoice_number"])
            if match:
                data["invoice_number"] = match.group()

        # Normalize date to DD-MM-YYYY
        if "date" in data:
            match = re.search(r'(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})', data["date"])
            if match:
                day, month, year = match.groups()
                if len(year) == 2:  # Fix short year like "25"
                    year = "20" + year
                data["date"] = f"{int(day):02d}-{int(month):02d}-{year}"

        # Clean amount (digits + decimal)
        if "amount" in data:
            match = re.search(r'[\d,.]+', data["amount"])
            if match:
                data["amount"] = match.group().replace(",", "")
            else:
                data["amount"] = "0.00"  # Default to 0 if no amount found

        # Vendor cleanup (strip extra whitespace/newlines)
        if "vendor" in data:
            data["vendor"] = data["vendor"].strip()

        # Item cleanup (shorten to clean text line)
        if "item" in data:
            data["item"] = re.sub(r'\s+', ' ', data["item"]).strip()

        # Ensure all required fields have default values
        required_fields = {
            "invoice_number": "N/A",
            "vendor": "Unknown Vendor", 
            "item": "Unknown Item",
            "date": "01-01-2024",
            "amount": "0.00",
            "short_description": "Unknown Category"
        }
        
        for field, default_value in required_fields.items():
            if field not in data or not data[field] or data[field].strip() == "":
                data[field] = default_value

        return {
            "success": True,
            "data": data,
            "raw_output": raw_output
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": None
        }

@app.route('/api/process-invoice', methods=['POST'])
def process_invoice():
    """
    API endpoint to process uploaded invoice images
    """
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({
                "success": False,
                "error": "No file uploaded"
            }), 400

        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No file selected"
            }), 400

        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "error": "File type not allowed. Please upload PNG, JPG, JPEG, or PDF files."
            }), 400

        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            # Process the invoice with OCR
            result = process_invoice_with_ocr(file_path)
            
            # Clean up temporary file
            os.remove(file_path)
            
            if result["success"]:
                # Check for duplicates
                # Check for duplicates
                user_id = request.form.get('user_id', 'default_user')
                duplicate_check = db_instance.check_duplicates(result["data"], user_id)

                # Add duplicate info
                result["duplicate_check"] = duplicate_check

                if not duplicate_check["is_duplicate"]:
                    bill_id = db_instance.save_bill(result["data"], user_id)
                    result["bill_id"] = bill_id
                    result["saved_to_database"] = True
                else:
                    result["saved_to_database"] = False

                
                return jsonify(result)
            else:
                return jsonify(result), 500
                
        except Exception as e:
            # Clean up temporary file in case of error
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({
                "success": False,
                "error": f"Processing failed: {str(e)}"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        "status": "healthy",
        "message": "OCR API is running"
    })

@app.route('/api/bills', methods=['GET'])
def get_user_bills():
    """
    Get all bills for a user
    """
    try:
        user_id = request.args.get('user_id', 'default_user')
        bills = db_instance.get_user_bills(user_id)
        
        return jsonify({
            "success": True,
            "bills": bills,
            "count": len(bills)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/bills/all', methods=['GET'])
def get_all_bills():
    """
    Get all bills (for admin purposes)
    """
    try:
        bills = db_instance.get_all_bills()
        
        return jsonify({
            "success": True,
            "bills": bills,
            "count": len(bills)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
