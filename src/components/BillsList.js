import React, { useState } from 'react';
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
  DollarSign,
  Building
} from 'lucide-react';

const BillsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);

  const bills = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      vendor: 'ABC Corporation',
      amount: 1234.56,
      date: '2024-01-15',
      dueDate: '2024-02-15',
      category: 'Office Supplies',
      status: 'accepted',
      uploadedDate: '2024-01-15',
      processedDate: '2024-01-15',
      confidence: 95,
      description: 'Office supplies and equipment purchase'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      vendor: 'Tech Solutions Inc',
      amount: 2500.00,
      date: '2024-01-12',
      dueDate: '2024-02-12',
      category: 'Technology',
      status: 'pending',
      uploadedDate: '2024-01-12',
      processedDate: null,
      confidence: null,
      description: 'Software licenses and IT equipment'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      vendor: 'Travel Agency Ltd',
      amount: 850.75,
      date: '2024-01-10',
      dueDate: '2024-02-10',
      category: 'Travel',
      status: 'rejected',
      uploadedDate: '2024-01-10',
      processedDate: '2024-01-10',
      confidence: 78,
      description: 'Business travel expenses'
    },
    {
      id: 4,
      invoiceNumber: 'INV-2024-004',
      vendor: 'Marketing Pro',
      amount: 1500.00,
      date: '2024-01-08',
      dueDate: '2024-02-08',
      category: 'Marketing',
      status: 'accepted',
      uploadedDate: '2024-01-08',
      processedDate: '2024-01-08',
      confidence: 92,
      description: 'Digital marketing campaign'
    },
    {
      id: 5,
      invoiceNumber: 'INV-2024-005',
      vendor: 'Office Depot',
      amount: 450.25,
      date: '2024-01-05',
      dueDate: '2024-02-05',
      category: 'Office Supplies',
      status: 'accepted',
      uploadedDate: '2024-01-05',
      processedDate: '2024-01-05',
      confidence: 98,
      description: 'Stationery and office materials'
    }
  ];

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-dark-success" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-dark-error" />;
      case 'pending':
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
      case 'pending':
        return 'text-dark-warning bg-yellow-900 bg-opacity-20';
      default:
        return 'text-dark-muted bg-gray-900 bg-opacity-20';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search bills by vendor, invoice number, or description..."
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
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bills List */}
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
                      <h3 className="text-lg font-semibold text-dark-text">{bill.invoiceNumber}</h3>
                      <p className="text-sm text-dark-muted">{bill.vendor}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bill.status)}`}>
                      {bill.status.toUpperCase()}
                    </span>
                    {getStatusIcon(bill.status)}
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

                <p className="text-dark-muted text-sm mb-4">{bill.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-dark-muted">
                    Uploaded: {formatDate(bill.uploadedDate)}
                  </span>
                  <div className="flex space-x-2">
                    <button className="btn-secondary flex items-center space-x-1 px-3 py-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </button>
                    <button className="btn-secondary flex items-center space-x-1 px-3 py-1">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
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

        {/* Bill Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedBill ? (
            <div className="card sticky top-6">
              <h2 className="text-xl font-semibold text-dark-text mb-4">Bill Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedBill.status)}
                  <div>
                    <p className="text-dark-text font-medium">{selectedBill.invoiceNumber}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBill.status)}`}>
                      {selectedBill.status.toUpperCase()}
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
                    <span className="text-dark-muted">Due Date:</span>
                    <span className="text-dark-text font-medium">{formatDate(selectedBill.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Category:</span>
                    <span className="text-dark-text font-medium">{selectedBill.category}</span>
                  </div>
                  {selectedBill.confidence && (
                    <div className="flex justify-between">
                      <span className="text-dark-muted">Confidence:</span>
                      <span className="text-dark-text font-medium">{selectedBill.confidence}%</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-dark-border">
                  <p className="text-sm text-dark-muted mb-2">Description:</p>
                  <p className="text-dark-text text-sm">{selectedBill.description}</p>
                </div>

                <div className="pt-4 border-t border-dark-border">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-muted">Uploaded:</span>
                      <span className="text-dark-text">{formatDate(selectedBill.uploadedDate)}</span>
                    </div>
                    {selectedBill.processedDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-muted">Processed:</span>
                        <span className="text-dark-text">{formatDate(selectedBill.processedDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-border">
                  <div className="flex space-x-2">
                    <button className="btn-primary flex-1">
                      Download PDF
                    </button>
                    <button className="btn-secondary">
                      Share
                    </button>
                  </div>
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





