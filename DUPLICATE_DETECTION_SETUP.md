# Duplicate Bill Detection System

This guide explains the integrated duplicate detection system that automatically identifies and prevents duplicate bill submissions.

## 🎯 Overview

The system uses a two-tier approach to detect duplicates:

1. **Exact Duplicate Detection**: Uses normalized keys based on vendor, invoice number, date, and amount
2. **Fuzzy Duplicate Detection**: Uses RapidFuzz for similarity matching with configurable thresholds

## 🏗️ Architecture

```
OCR Processing → Duplicate Check → Database Storage
     ↓               ↓                    ↓
Extract Data → Compare with DB → Save/Flag Duplicate
     ↓               ↓                    ↓
Display Results → Show Matches → User Decision
```

## 📊 Duplicate Detection Logic

### Exact Duplicates
- **Key Generation**: `vendor_normalized + invoice_number + date + amount`
- **Vendor Normalization**: Removes punctuation, converts to lowercase
- **Match Criteria**: 100% identical keys

### Fuzzy Duplicates
- **Vendor Similarity**: >90% using RapidFuzz token_sort_ratio
- **Invoice Match**: Exact invoice number match
- **Amount Difference**: <$1.00 difference
- **Date Difference**: ≤2 days difference

## 🚀 Setup Instructions

### 1. Install MongoDB
```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: Follow MongoDB installation guide
```

### 2. Start MongoDB Service
```bash
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### 3. Install Dependencies
```bash
cd backend
python setup_mongodb.py
```

### 4. Start the Application
```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend
npm start
```

## 📋 Database Schema

### Bills Collection
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "dup_key": "string",
  "vendor": "string",
  "invoice_number": "string", 
  "item": "string",
  "date": "string",
  "amount": "number",
  "short_description": "string",
  "ocr_data": "object",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Indexes
- `dup_key`: For exact duplicate lookups
- `user_id`: For user-specific queries
- `vendor`: For vendor-based searches
- `invoice_number`: For invoice lookups

## 🔧 API Endpoints

### Process Invoice with Duplicate Detection
```bash
POST http://localhost:5000/api/process-invoice
Content-Type: multipart/form-data

file: [image file]
user_id: "default_user" (optional)
```

**Response:**
```json
{
  "success": true,
  "data": { /* OCR extracted data */ },
  "duplicate_check": {
    "is_duplicate": true,
    "exact_duplicates": [ /* exact matches */ ],
    "similar_duplicates": [ /* fuzzy matches */ ],
    "duplicate_key": "normalized_key"
  },
  "saved_to_database": false,
  "bill_id": null
}
```

### Get User Bills
```bash
GET http://localhost:5000/api/bills?user_id=default_user
```

### Get All Bills
```bash
GET http://localhost:5000/api/bills/all
```

## 🎨 Frontend Integration

### Duplicate Detection Display
- **Warning Banner**: Yellow alert for detected duplicates
- **Exact Matches**: Shows identical bills found
- **Similar Matches**: Shows fuzzy matches with similarity scores
- **Success Message**: Confirms bill saved to database

### Status Indicators
- **🟢 Accepted**: Bill processed and saved
- **🟡 Duplicate**: Duplicate detected, not saved
- **🔴 Rejected**: Processing error occurred

## 🔍 Duplicate Detection Examples

### Example 1: Exact Duplicate
```json
Bill A: {"vendor": "ABC Corp", "invoice": "INV001", "date": "01-01-2024", "amount": "100.00"}
Bill B: {"vendor": "ABC Corp", "invoice": "INV001", "date": "01-01-2024", "amount": "100.00"}
Result: EXACT DUPLICATE (same dup_key)
```

### Example 2: Fuzzy Duplicate
```json
Bill A: {"vendor": "ABC Corporation", "invoice": "INV001", "date": "01-01-2024", "amount": "100.00"}
Bill B: {"vendor": "ABC Corp", "invoice": "INV001", "date": "02-01-2024", "amount": "100.50"}
Result: SIMILAR DUPLICATE (vendor: 95% similar, amount diff: $0.50, date diff: 1 day)
```

## ⚙️ Configuration

### Duplicate Detection Thresholds
```python
# In database.py
vendor_similarity_threshold = 90  # Percentage
amount_difference_threshold = 1.0  # Dollars
date_difference_threshold = 2      # Days
```

### MongoDB Connection
```python
# Default: mongodb://localhost:27017/
# Custom: Set MONGODB_URI environment variable
```

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
- **Check**: Is MongoDB running?
- **Solution**: Start MongoDB service

#### 2. Duplicate Detection Not Working
- **Check**: Are dependencies installed?
- **Solution**: Run `python setup_mongodb.py`

#### 3. False Positives
- **Adjust**: Lower similarity thresholds
- **Review**: Check vendor normalization logic

#### 4. False Negatives
- **Adjust**: Raise similarity thresholds
- **Review**: Check date/amount difference limits

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
export FLASK_DEBUG=1
```

## 📈 Performance Considerations

- **Indexing**: Database indexes on key fields for fast lookups
- **Batch Processing**: Can be extended for bulk duplicate checking
- **Caching**: Consider Redis for frequently accessed data
- **Pagination**: Implement for large bill collections

## 🔒 Security Considerations

- **User Isolation**: Bills are separated by user_id
- **Data Validation**: Input sanitization and validation
- **Access Control**: Implement authentication for production
- **Audit Trail**: Track all duplicate detection activities

## 🚀 Production Deployment

### Environment Variables
```bash
MONGODB_URI=mongodb://your-production-db:27017/
FLASK_ENV=production
SECRET_KEY=your-secret-key
```

### Scaling Considerations
- **Database Sharding**: For large-scale deployments
- **Load Balancing**: Multiple backend instances
- **Monitoring**: Track duplicate detection metrics
- **Backup**: Regular database backups

## 📝 Development Notes

- **Model Updates**: Easy to modify similarity algorithms
- **Custom Rules**: Add business-specific duplicate rules
- **Integration**: Can be extended with ML-based detection
- **Reporting**: Generate duplicate detection reports

## 🎯 Future Enhancements

1. **Machine Learning**: Train models for better duplicate detection
2. **Image Similarity**: Compare bill images for visual duplicates
3. **Pattern Recognition**: Detect recurring billing patterns
4. **User Feedback**: Learn from user duplicate confirmations
5. **Advanced Analytics**: Duplicate trend analysis and reporting
