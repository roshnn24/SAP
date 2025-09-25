#!/usr/bin/env python3
"""
Setup script for the OCR API backend
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def check_ollama_installed():
    """Check if Ollama is installed"""
    try:
        result = subprocess.run(['ollama', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Ollama is installed")
            return True
        else:
            print("❌ Ollama is not installed")
            return False
    except FileNotFoundError:
        print("❌ Ollama is not installed")
        return False

def check_model_available():
    """Check if the required model is available"""
    try:
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True)
        if 'qwen2.5vl:3b' in result.stdout:
            print("✅ Model 'qwen2.5vl:3b' is available")
            return True
        else:
            print("⚠️  Model 'qwen2.5vl:3b' not found")
            return False
    except Exception as e:
        print(f"⚠️  Could not check models: {e}")
        return False

def main():
    print("🚀 Setting up OCR API Backend...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('requirements.txt'):
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Install Python dependencies
    if not run_command('pip install -r requirements.txt', 'Installing Python dependencies'):
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Check Ollama installation
    if not check_ollama_installed():
        print("\n📋 To install Ollama:")
        print("   macOS: brew install ollama")
        print("   Linux: curl -fsSL https://ollama.ai/install.sh | sh")
        print("   Windows: Download from https://ollama.ai/download")
        print("\n   Then run: ollama pull qwen2.5vl:3b")
        sys.exit(1)
    
    # Check model availability
    if not check_model_available():
        print("\n📋 To install the required model:")
        print("   ollama pull qwen2.5vl:3b")
        print("\n   This may take a few minutes...")
        
        # Try to pull the model
        if not run_command('ollama pull qwen2.5vl:3b', 'Pulling OCR model'):
            print("❌ Failed to pull model. Please run manually: ollama pull qwen2.5vl:3b")
            sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("   1. Start the backend server: python run.py")
    print("   2. Start the React frontend: npm start")
    print("   3. Upload invoice images to test OCR processing")
    print("\n🔗 API endpoints:")
    print("   - Health check: http://localhost:5000/api/health")
    print("   - Process invoice: POST http://localhost:5000/api/process-invoice")

if __name__ == '__main__':
    main()


