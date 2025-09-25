import React, { useState } from 'react';
import { FileText, Search, Filter, Download, Eye } from 'lucide-react';

const Policies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const policies = [
    {
      id: 1,
      title: 'Travel Expense Policy',
      category: 'Travel',
      version: '2.1',
      lastUpdated: '2024-01-15',
      description: 'Guidelines for business travel expenses including accommodation, meals, and transportation.',
      status: 'Active'
    },
    {
      id: 2,
      title: 'Office Supplies Policy',
      category: 'Procurement',
      version: '1.5',
      lastUpdated: '2024-01-10',
      description: 'Policy for purchasing office supplies and equipment with approval limits.',
      status: 'Active'
    },
    {
      id: 3,
      title: 'Meal and Entertainment Policy',
      category: 'Entertainment',
      version: '1.8',
      lastUpdated: '2024-01-08',
      description: 'Guidelines for business meals and entertainment expenses.',
      status: 'Active'
    },
    {
      id: 4,
      title: 'IT Equipment Policy',
      category: 'Technology',
      version: '3.0',
      lastUpdated: '2024-01-05',
      description: 'Policy for purchasing and maintaining IT equipment and software.',
      status: 'Active'
    },
    {
      id: 5,
      title: 'Training and Development Policy',
      category: 'HR',
      version: '1.2',
      lastUpdated: '2023-12-20',
      description: 'Guidelines for employee training and professional development expenses.',
      status: 'Active'
    },
    {
      id: 6,
      title: 'Marketing and Advertising Policy',
      category: 'Marketing',
      version: '2.3',
      lastUpdated: '2023-12-15',
      description: 'Policy for marketing expenses and advertising campaigns.',
      status: 'Active'
    }
  ];

  const categories = ['all', 'Travel', 'Procurement', 'Entertainment', 'Technology', 'HR', 'Marketing'];

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || policy.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    return status === 'Active' ? 'text-dark-success' : 'text-dark-warning';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text mb-2">Company Policies</h1>
        <p className="text-dark-muted">View and manage company expense policies</p>
      </div>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search policies..."
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field w-full pl-10 appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolicies.map(policy => (
          <div key={policy.id} className="card hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-dark-accent bg-opacity-20 rounded-lg">
                  <FileText className="w-6 h-6 text-dark-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-text">{policy.title}</h3>
                  <p className="text-sm text-dark-muted">v{policy.version}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)} bg-opacity-20`}>
                {policy.status}
              </span>
            </div>

            <p className="text-dark-muted text-sm mb-4 line-clamp-3">
              {policy.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-dark-muted">Category:</span>
                <span className="text-dark-text">{policy.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-muted">Last Updated:</span>
                <span className="text-dark-text">{policy.lastUpdated}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="btn-secondary flex-1 flex items-center justify-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button className="btn-secondary flex items-center justify-center space-x-2 px-3">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-dark-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark-text mb-2">No policies found</h3>
          <p className="text-dark-muted">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Policies;





