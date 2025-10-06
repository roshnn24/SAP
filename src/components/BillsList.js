import React, { useEffect, useState } from 'react';
import { 
  Receipt, Search, Filter, Clock, Calendar, DollarSign, Zap, Eye
} from 'lucide-react';

const BillsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [bills, setBills] = useState([]);
  const [loadingBillId, setLoadingBillId] = useState(null);

  const fetchBills = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/bills/json');
      const data = await res.json();
      if (data.success && Array.isArray(data.bills)) {
        const billsWithIds = data.bills.map((b, idx) => ({ ...b, id: `${b.invoice_number}-${b.vendor}-${idx}` }));
        setBills(billsWithIds);
        // If a bill was selected, update its data in the sidebar
        if (selectedBill) {
            const updatedSelectedBill = billsWithIds.find(b => b.id === selectedBill.id);
            setSelectedBill(updatedSelectedBill || null);
        }
      } else {
        setBills([]);
      }
    } catch (e) { console.error("Failed to fetch bills:", e); setBills([]); }
  };

  useEffect(() => {
    fetchBills();
    window.addEventListener('billUploaded', fetchBills);
    return () => { window.removeEventListener('billUploaded', fetchBills); };
  }, []);

  const handleGetRiskScore = async (billToScore) => {
    setLoadingBillId(billToScore.id);
    try {
      const res = await fetch('http://localhost:5001/api/get-risk-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bill: billToScore }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bills)) {
        const billsWithIds = data.bills.map((b, idx) => ({ ...b, id: `${b.invoice_number}-${b.vendor}-${idx}` }));
        setBills(billsWithIds);
        // Also update the selected bill if it was the one being scored
        if (selectedBill && selectedBill.id === billToScore.id) {
            const updatedBill = billsWithIds.find(b => b.id === billToScore.id);
            setSelectedBill(updatedBill);
        }
      }
    } catch (e) { console.error("Error fetching risk score:", e); } 
    finally { setLoadingBillId(null); }
  };

  const getRiskScoreColor = (score) => {
    if (score > 70) return 'bg-red-500';
    if (score > 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const filteredBills = bills.filter(bill =>
    (bill.vendor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (bill.invoice_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (bill.item?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const formatCurrency = (amountStr) => { /* unchanged */ };
  const formatDate = (dateString) => { /* unchanged */ };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search and Filter bar is unchanged */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredBills.map(bill => (
              <div
                key={bill.id}
                className={`card hover:shadow-xl transition-all duration-200 cursor-pointer ${selectedBill?.id === bill.id ? 'ring-2 ring-dark-accent' : 'ring-0'}`}
                onClick={() => setSelectedBill(bill)}
              >
                {/* Bill header unchanged */}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-dark-muted">Uploaded: {formatDate(bill.date)}</span>
                  {bill.risk_score != null && bill.risk_score >= 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-dark-muted">Risk Score:</span>
                      <div className="w-24 bg-gray-700 rounded-full h-2.5">
                        <div className={`${getRiskScoreColor(bill.risk_score)} h-2.5 rounded-full`} style={{ width: `${bill.risk_score}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-dark-text">{bill.risk_score}</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGetRiskScore(bill); }}
                      disabled={loadingBillId === bill.id}
                      className="btn-secondary flex items-center space-x-2 px-3 py-1 text-sm"
                    >
                      {loadingBillId === bill.id ? (
                        <><Clock className="w-4 h-4 animate-spin" /><span>Analyzing...</span></>
                      ) : (
                        <><Zap className="w-4 h-4" /><span>Get Risk Score</span></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RESTORED BILL DETAILS SIDEBAR --- */}
        <div className="lg:col-span-1">
          {selectedBill ? (
            <div className="card sticky top-6">
              <h2 className="text-xl font-semibold text-dark-text mb-4">Bill Details</h2>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-dark-muted">Vendor:</span><span className="text-dark-text font-medium">{selectedBill.vendor}</span></div>
                  <div className="flex justify-between"><span className="text-dark-muted">Invoice #:</span><span className="text-dark-text font-medium">{selectedBill.invoice_number}</span></div>
                  <div className="flex justify-between"><span className="text-dark-muted">Amount:</span><span className="text-dark-text font-medium">{formatCurrency(selectedBill.amount)}</span></div>
                  <div className="flex justify-between"><span className="text-dark-muted">Date:</span><span className="text-dark-text font-medium">{formatDate(selectedBill.date)}</span></div>
                  <div className="flex justify-between"><span className="text-dark-muted">Category:</span><span className="text-dark-text font-medium">{selectedBill.short_description}</span></div>
                </div>

                <div className="pt-4 border-t border-dark-border">
                  <p className="text-sm text-dark-muted mb-2">Item Description:</p>
                  <p className="text-dark-text text-sm">{selectedBill.item}</p>
                </div>
                
                {selectedBill.risk_score != null && selectedBill.risk_score >= 0 && (
                  <div className="pt-4 border-t border-dark-border">
                    <p className="text-sm text-dark-muted mb-2">Risk Analysis:</p>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-dark-text">Score: {selectedBill.risk_score}</span>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className={`${getRiskScoreColor(selectedBill.risk_score)} h-2.5 rounded-full`} style={{ width: `${selectedBill.risk_score}%` }}></div>
                      </div>
                    </div>
                    <p className="text-dark-text text-xs italic">Reason: {selectedBill.risk_reason}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Eye className="w-16 h-16 text-dark-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-text mb-2">Select a Bill</h3>
              <p className="text-dark-muted">Click on a bill to view detailed information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillsList;
