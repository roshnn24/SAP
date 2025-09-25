# OCR Integration Setup Guide

This guide will help you set up the OCR processing functionality for your bill processing application.

## 🎯 Overview

The application now includes real OCR processing using Ollama with the `qwen2.5vl:3b` model. When users upload bill images, the system will:

1. **Extract structured data** from invoice images
2. **Display results** in the same screen
3. **Show raw OCR output** for debugging
4. **Handle errors gracefully** with user-friendly messages

## 🏗️ Architecture

```
Frontend (React)     →     Backend (Flask)     →     Ollama OCR
     ↓                           ↓                        ↓
Upload Image              Process File              Extract Data
     ↓                           ↓                        ↓
Display Results           Return JSON              Structured Fields
```

## 📋 Prerequisites

### 1. Install Ollama
- **macOS**: `brew install ollama`
- **Linux**: `curl -fsSL https://ollama.ai/install.sh | sh`
- **Windows**: Download from [ollama.ai](https://ollama.ai/download)

### 2. Pull the OCR Model
```bash
ollama pull qwen2.5vl:3b
```

## 🚀 Quick Setup

### Option 1: Automated Setup
```bash
cd backend
python setup.py
```

### Option 2: Manual Setup
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Pull the OCR model
ollama pull qwen2.5vl:3b
```

## 🏃‍♂️ Running the Application

### 1. Start the Backend Server
```bash
cd backend
python run.py
```
The API will be available at: `http://localhost:5000`

### 2. Start the Frontend
```bash
npm start
```
The React app will be available at: `http://localhost:3000`

## 📊 OCR Processing Flow

### 1. File Upload
- User selects image file (PNG, JPG, JPEG, PDF)
- File is uploaded to the backend via FormData

### 2. OCR Processing
- Backend saves file temporarily
- Calls Ollama with the image
- Extracts structured fields using the `qwen2.5vl:3b` model

### 3. Data Extraction
The OCR extracts these fields:
```json
{
  "invoice_number": "INV-2024-001",
  "vendor": "ABC Corporation",
  "item": "Office Supplies",
  "date": "15-01-2024",
  "amount": "1234.56",
  "short_description": "office supplies"
}
```

### 4. Data Processing
- Cleans and normalizes extracted data
- Formats dates to DD-MM-YYYY
- Removes extra whitespace
- Validates numeric fields

### 5. Display Results
- Shows extracted data in structured format
- Displays processing status (Accepted/Rejected)
- Includes raw OCR output for debugging
- Handles errors gracefully

## 🔧 API Endpoints

### Health Check
```bash
GET http://localhost:5000/api/health
```

### Process Invoice
```bash
POST http://localhost:5000/api/process-invoice
Content-Type: multipart/form-data

file: [image file]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoice_number": "INV-2024-001",
    "vendor": "ABC Corporation",
    "item": "Office Supplies",
    "date": "15-01-2024",
    "amount": "1234.56",
    "short_description": "office supplies"
  },
  "raw_output": "Raw OCR response..."
}
```

## 🎨 Frontend Integration

### Updated Components
- **Dashboard.js**: Now calls OCR API instead of simulation
- **Real-time processing**: Shows loading state during OCR
- **Error handling**: Displays user-friendly error messages
- **Debug mode**: Shows raw OCR output in collapsible section

### New Features
- **File validation**: Checks file type and size
- **Progress indicators**: Visual feedback during processing
- **Structured display**: Clean presentation of extracted data
- **Error recovery**: Easy retry and file replacement

## 🐛 Troubleshooting

### Common Issues

#### 1. "Failed to process invoice" Error
- **Check**: Is the backend server running on port 5000?
- **Solution**: Start backend with `python run.py`

#### 2. "Model not found" Error
- **Check**: Is the model installed?
- **Solution**: Run `ollama pull qwen2.5vl:3b`

#### 3. CORS Errors
- **Check**: Is Flask-CORS installed?
- **Solution**: Backend includes CORS configuration

#### 4. File Upload Issues
- **Check**: File size (max 16MB) and type (PNG, JPG, JPEG, PDF)
- **Solution**: Ensure file meets requirements

### Debug Mode
The application includes a debug section that shows:
- Raw OCR output from the model
- Processing errors
- API response details

## 📈 Performance Notes

- **Model size**: `qwen2.5vl:3b` is optimized for speed
- **Processing time**: Typically 2-5 seconds per image
- **Memory usage**: Model loads into RAM for faster processing
- **Concurrent requests**: Backend handles multiple uploads

## 🔒 Security Considerations

- **File validation**: Only allowed file types accepted
- **Size limits**: 16MB maximum file size
- **Temporary storage**: Files deleted after processing
- **CORS protection**: Configured for localhost development

## 🚀 Production Deployment

For production deployment:

1. **Use a production WSGI server** (e.g., Gunicorn)
2. **Set up proper environment variables**
3. **Configure reverse proxy** (e.g., Nginx)
4. **Implement proper logging**
5. **Add authentication/authorization**
6. **Set up monitoring and health checks**

## 📝 Development Notes

- **Model updates**: The `qwen2.5vl:3b` model can be updated with `ollama pull qwen2.5vl:3b`
- **Custom prompts**: Modify the system prompt in `backend/app.py` for different extraction needs
- **Field validation**: Add custom validation logic in the post-processing section
- **Error handling**: Extend error handling for specific OCR failure cases

## 🎯 Next Steps

1. **Test with real invoices** to validate extraction accuracy
2. **Tune the OCR prompts** for your specific invoice formats
3. **Add field validation** based on your business rules
4. **Implement confidence scoring** for extraction quality
5. **Add batch processing** for multiple invoices
6. **Integrate with your existing database** for bill storage


