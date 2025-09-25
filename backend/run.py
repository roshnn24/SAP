#!/usr/bin/env python3
"""
Run script for the OCR API server
"""

import sys
from app import app

# 1️⃣ Check if Ollama is installed
try:
    import ollama
    print("✅ Ollama is available")
except ImportError:
    print("❌ Ollama is not installed. Please install it with: pip install ollama")
    sys.exit(1)

# 2️⃣ Check if the required model is available
try:
    models = ollama.list()
    print("Ollama list output:", models)

    # Handle either a dict with 'models' key or a simple list
    if isinstance(models, dict) and 'models' in models:
        model_names = models['models']
    else:
        model_names = models  # assume it's a list of strings

    if 'llama3.2-vision:11b' not in model_names:
        print("⚠️ Model 'llama3.2-vision:11b' not found. Please pull it with: ollama pull llama3.2-vision:11b")
    else:
        print("✅ Model 'llama3.2-vision:11b' is available")

except Exception as e:
    print(f"⚠️ Could not check models: {e}")

# 3️⃣ Start the Flask API server
print("\n🚀 Starting OCR API server...")
print("📡 API will be available at: http://localhost:5000")
print("🔍 Health check: http://localhost:5000/api/health")
print("📄 Process invoice: POST http://localhost:5000/api/process-invoice")

app.run(debug=True, host='0.0.0.0', port=5000)
