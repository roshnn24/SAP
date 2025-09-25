import React, { useState } from "react";
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";

const BillUpload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setBillData(data);
      setStatus(data.is_duplicate ? "duplicate" : "unique");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto card">
      <h1 className="text-2xl font-bold mb-4">Upload Bill</h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="input-field flex-1"
        />
        <button
          onClick={handleUpload}
          className="btn-primary flex items-center px-6"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </button>
      </div>

      {loading && (
        <div className="flex items-center space-x-2 text-dark-muted mb-4">
          <Loader2 className="animate-spin w-5 h-5" />
          <span>Analyzing bill...</span>
        </div>
      )}

      {status === "unique" && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg flex items-center space-x-2 mb-4">
          <CheckCircle className="w-5 h-5" />
          <span>Bill stored successfully (not a duplicate).</span>
        </div>
      )}

      {status === "duplicate" && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center space-x-2 mb-4">
          <XCircle className="w-5 h-5" />
          <span>Duplicate bill detected. Already exists in database.</span>
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg mb-4">
          Error uploading bill. Please try again.
        </div>
      )}

      {billData && (
        <div className="bg-gray-50 p-4 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Extracted Bill Data:</h3>
          <pre className="text-dark-muted overflow-x-auto">
            {JSON.stringify(billData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BillUpload;
