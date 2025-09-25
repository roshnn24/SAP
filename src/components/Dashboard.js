import React, { useState } from 'react';
import { Upload, FileImage, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProcessingResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('http://localhost:5000/api/process-invoice', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        const ocrData = result.data;
        const duplicateCheck = result.duplicate_check || { is_duplicate: false, exact_duplicates: [], similar_duplicates: [] };
        
        setProcessingResult({
          status: duplicateCheck.is_duplicate ? 'duplicate' : 'accepted',
          amount: `$${parseFloat(ocrData.amount).toFixed(2)}`,
          vendor: ocrData.vendor,
          date: ocrData.date,
          category: ocrData.short_description,
          confidence: '95%', 
          extractedData: {
            invoiceNumber: ocrData.invoice_number,
            item: ocrData.item,
            amount: ocrData.amount,
            date: ocrData.date,
            vendor: ocrData.vendor,
            shortDescription: ocrData.short_description
          },
          rawOcrOutput: result.raw_output,
          duplicateCheck: duplicateCheck,
          savedToDatabase: result.saved_to_database || false,
          billId: result.bill_id || null
        });
      } else {
        setProcessingResult({
          status: 'rejected',
          error: result.error,
          extractedData: null
        });
      }
    } catch (error) {
      console.error('Error processing invoice:', error);
      setProcessingResult({
        status: 'rejected',
        error: 'Failed to process invoice. Please check if the OCR API is running on http://localhost:5000',
        extractedData: null
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-dark-success" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-dark-error" />;
      case 'duplicate':
        return <AlertTriangle className="w-5 h-5 text-dark-warning" />;
      default:
        return <Clock className="w-5 h-5 text-dark-warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'text-dark-success';
      case 'rejected':
        return 'text-dark-error';
      case 'duplicate':
        return 'text-dark-warning';
      default:
        return 'text-dark-warning';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text mb-2">Bill Processing Dashboard</h1>
        <p className="text-dark-muted">Upload your bill images for automated processing and validation</p>
      </div>

      {/* Upload Section */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-dark-text mb-4">Upload Bill Image</h2>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center hover:border-dark-accent transition-colors duration-200">
            <FileImage className="w-12 h-12 text-dark-muted mx-auto mb-4" />
            <p className="text-dark-text mb-2">Drop your bill image here or click to browse</p>
            <p className="text-sm text-dark-muted mb-4">Supports JPG, PNG, PDF formats up to 10MB</p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-block">
              Choose File
            </label>
          </div>

          {selectedFile && (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileImage className="w-8 h-8 text-dark-accent" />
                  <div>
                    <p className="text-dark-text font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-dark-muted">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing...' : 'Process Bill'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing Results */}
      {processingResult && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            {getStatusIcon(processingResult.status)}
            <h2 className="text-xl font-semibold text-dark-text">Processing Results</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(processingResult.status)} bg-opacity-20`}>
              {processingResult.status.toUpperCase()}
            </span>
          </div>

          {/* OCR Extracted Data */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-dark-text mb-2">Extracted OCR Data</h3>
            <pre className="p-4 bg-dark-surface rounded-lg text-sm text-dark-muted overflow-x-auto">
              {JSON.stringify(processingResult.extractedData, null, 2)}
            </pre>
          </div>

          {/* Duplicate / Non-duplicate Message */}
          {processingResult.duplicateCheck?.is_duplicate ? (
            <div className="mb-6 p-4 bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-dark-warning" />
                <h3 className="text-lg font-semibold text-dark-warning">Duplicate Bill Detected</h3>
              </div>
              <p className="text-dark-text">This bill already exists in the database.</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-green-900 bg-opacity-20 border border-green-500 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-dark-success" />
                <h3 className="text-lg font-semibold text-dark-success">Unique Bill</h3>
              </div>
              <p className="text-dark-text">This bill was stored successfully and is not a duplicate.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
