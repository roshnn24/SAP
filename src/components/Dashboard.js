import React, { useState } from 'react';
import { Upload, FileImage, CheckCircle, XCircle, Clock, AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);
  
  // New state for the policy check feature
  const [isCheckingPolicy, setIsCheckingPolicy] = useState(false);
  const [policyResult, setPolicyResult] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Reset everything on new file selection
      setProcessingResult(null);
      setPolicyResult(null);
    }
  };

  // Step 1: Just upload and get OCR data
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProcessingResult(null);
    setPolicyResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('http://localhost:5001/api/process-invoice', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setProcessingResult({
          status: 'processed', // A neutral status before policy check
          extractedData: result.data,
          rawOcrOutput: result.raw_output,
        });
      } else {
        setProcessingResult({ status: 'rejected', error: result.error || 'OCR failed' });
      }
    } catch (error) {
      console.error('Error processing invoice:', error);
      setProcessingResult({ status: 'rejected', error: 'Failed to process. Check API.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2 & 3: Check policy and conditionally save
  const handlePolicyCheck = async () => {
    if (!processingResult?.extractedData) return;

    setIsCheckingPolicy(true);
    setPolicyResult(null);

    try {
      // Step 2: Call the policy check API
      const policyResponse = await fetch('http://localhost:5001/api/policy-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processingResult.extractedData),
      });

      const policyData = await policyResponse.json();
      setPolicyResult(policyData.decision);

      // Step 3: If policy passed, call the save API
      if (policyData.success && policyData.decision.startsWith("PASS:")) {
        const saveResponse = await fetch('http://localhost:5001/api/save-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(processingResult.extractedData),
        });

        const saveData = await saveResponse.json();
        if (saveData.success) {
          // Update status and dispatch event for the other page to update
          setProcessingResult(prev => ({ ...prev, status: 'accepted' }));
          window.dispatchEvent(new CustomEvent('billUploaded'));
        } else {
          // Handle save failure (e.g., duplicate detected)
          setProcessingResult(prev => ({ ...prev, status: 'rejected' }));
          setPolicyResult(`Save Failed: ${saveData.error}`);
        }
      } else {
        // Policy failed or was unclear
        setProcessingResult(prev => ({ ...prev, status: 'rejected' }));
      }

    } catch (error) {
      console.error("Error during policy check/save:", error);
      setPolicyResult("An error occurred during the policy check.");
      setProcessingResult(prev => ({ ...prev, status: 'rejected' }));
    } finally {
      setIsCheckingPolicy(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-dark-success" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-dark-error" />;
      case 'processed':
        return <Clock className="w-5 h-5 text-dark-warning" />;
      default:
        return <Clock className="w-5 h-5 text-dark-muted" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'text-dark-success bg-green-900 bg-opacity-20';
      case 'rejected':
        return 'text-dark-error bg-red-900 bg-opacity-20';
      case 'processed':
        return 'text-dark-warning bg-yellow-900 bg-opacity-20';
      default:
        return 'text-dark-muted bg-gray-900 bg-opacity-20';
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(processingResult.status)}`}>
              {processingResult.status.toUpperCase()}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-dark-text mb-2">Extracted OCR Data</h3>
            <pre className="p-4 bg-dark-surface rounded-lg text-sm text-dark-muted overflow-x-auto">
              {JSON.stringify(processingResult.extractedData, null, 2)}
            </pre>
          </div>

          {/* NEW Policy Check Button and Results */}
          {processingResult.status === 'processed' && !policyResult && (
             <div className="mt-6">
                <button
                  onClick={handlePolicyCheck}
                  disabled={isCheckingPolicy}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {isCheckingPolicy ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Compare with Policies (Advanced Policy Check Agent)</span>
                    </>
                  )}
                </button>
             </div>
          )}

          {policyResult && (
            <div className="mt-6 p-4 border rounded-lg bg-dark-surface">
              <h3 className="text-lg font-semibold text-dark-text mb-2 flex items-center">
                {policyResult.startsWith("PASS:") ? 
                  <ShieldCheck className="w-5 h-5 mr-2 text-dark-success"/> : 
                  <ShieldOff className="w-5 h-5 mr-2 text-dark-error"/>
                }
                Policy Agent Decision
              </h3>
              <p className={`text-sm ${policyResult.startsWith("PASS:") ? 'text-dark-success' : 'text-dark-error'}`}>
                {policyResult}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;