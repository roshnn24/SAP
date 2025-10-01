import React, { useEffect, useState } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  DollarSign
} from 'lucide-react';

const BillsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Note: status is now hardcoded as 'accepted'
  const [selectedBill, setSelectedBill] = useState(null);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/bills/json');
        const data = await res.json();
        if (data.success && Array.isArray(data.bills)) {
          // Add default values to prevent rendering errors
          const billsWithDefaults = data.bills.map((b, idx) => ({
            id: `${b.invoice_number}-${b.vendor}-${idx}`, // Create a stable key for React
            amount: b.amount ?? "0.00",
            date: b.date ?? "N/A",
            invoice_number: b.invoice_number ?? "N/A",
            item: b.item ?? "No item description",
            short_description: b.short_description ?? "Uncategorized",
            vendor: b.vendor ?? "Unknown Vendor",
          }));
          setBills(billsWithDefaults);
        } else {
          setBills([]);
        }
      } catch (e) {
        console.error("Failed to fetch bills:", e);
        setBills([]);
      }
    };

    fetchBills();
    window.addEventListener('billUploaded', fetchBills);
    return () => {
      window.removeEventListener('billUploaded', fetchBills);
    };
  }, []);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.item.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter is kept for UI but all items are 'accepted' by default now
    const matchesStatus = statusFilter === 'all' || statusFilter === 'accepted';
    return matchesSearch && matchesStatus;
  });

  // Since status is no longer in our data, we simplify these helpers
  const getStatusIcon = (status) => <CheckCircle className="w-5 h-5 text-dark-success" />;
  const getStatusColor = (status) => 'text-dark-success bg-green-900 bg-opacity-20';

  const formatCurrency = (amountStr) => {
    const amount = parseFloat(String(amountStr).replace(/,/g, '')) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return 'Invalid Date';
    // Assuming DD-MM-YYYY format from backend
    const parts = dateString.split('-');
    if (parts.length !== 3) return 'Invalid Date';
    const [day, month, year] = parts;
    // Reassemble to a format the Date constructor understands (YYYY-MM-DD)
    const isoDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(isoDate)) return 'Invalid Date';

    return isoDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text mb-2">My Bills</h1>
        <p className="text-dark-muted">View and manage your uploaded bills</p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search by vendor, invoice #, or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-full pl-10 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredBills.map(bill => (
              <div
                key={bill.id}
                className="card hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                onClick={() => setSelectedBill(bill)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-dark-accent bg-opacity-20 rounded-lg">
                      <Receipt className="w-6 h-6 text-dark-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-dark-text">{bill.invoice_number}</h3>
                      <p className="text-sm text-dark-muted">{bill.vendor}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                      ACCEPTED
                    </span>
                    {getStatusIcon()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-dark-muted" />
                    <span className="text-dark-text font-medium">{formatCurrency(bill.amount)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-dark-muted" />
                    <span className="text-dark-text">{formatDate(bill.date)}</span>
                  </div>
                </div>

                <p className="text-dark-muted text-sm mb-4">{bill.item}</p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-dark-muted">
                    Uploaded: {formatDate(bill.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredBills.length === 0 && (
            <div className="card text-center py-12">
              <Receipt className="w-16 h-16 text-dark-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-text mb-2">No bills found</h3>
              <p className="text-dark-muted">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedBill ? (
            <div className="card sticky top-6">
              <h2 className="text-xl font-semibold text-dark-text mb-4">Bill Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon()}
                  <div>
                    <p className="text-dark-text font-medium">{selectedBill.invoice_number}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                      ACCEPTED
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Vendor:</span>
                    <span className="text-dark-text font-medium">{selectedBill.vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Amount:</span>
                    <span className="text-dark-text font-medium">{formatCurrency(selectedBill.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Date:</span>
                    <span className="text-dark-text font-medium">{formatDate(selectedBill.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Category:</span>
                    <span className="text-dark-text font-medium">{selectedBill.short_description}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-border">
                  <p className="text-sm text-dark-muted mb-2">Item Description:</p>
                  <p className="text-dark-text text-sm">{selectedBill.item}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Eye className="w-16 h-16 text-dark-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-text mb-2">Select a Bill</h3>
              <p className="text-dark-muted">Click on a bill to view detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillsList;





