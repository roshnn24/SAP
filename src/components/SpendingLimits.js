import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  PieChart,
  BarChart3
} from 'lucide-react';

const SpendingLimits = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const spendingData = {
    month: {
      categories: [
        {
          id: 1,
          name: 'Office Supplies',
          limit: 2000,
          spent: 1450.75,
          remaining: 549.25,
          percentage: 72.5,
          status: 'warning'
        },
        {
          id: 2,
          name: 'Travel',
          limit: 5000,
          spent: 3200.50,
          remaining: 1799.50,
          percentage: 64.0,
          status: 'good'
        },
        {
          id: 3,
          name: 'Technology',
          limit: 3000,
          spent: 2800.00,
          remaining: 200.00,
          percentage: 93.3,
          status: 'critical'
        },
        {
          id: 4,
          name: 'Marketing',
          limit: 4000,
          spent: 2100.25,
          remaining: 1899.75,
          percentage: 52.5,
          status: 'good'
        },
        {
          id: 5,
          name: 'Entertainment',
          limit: 1500,
          spent: 1200.00,
          remaining: 300.00,
          percentage: 80.0,
          status: 'warning'
        },
        {
          id: 6,
          name: 'Training',
          limit: 2500,
          spent: 1800.50,
          remaining: 699.50,
          percentage: 72.0,
          status: 'warning'
        }
      ],
      totalLimit: 18000,
      totalSpent: 12551.00,
      totalRemaining: 5449.00
    },
    week: {
      categories: [
        {
          id: 1,
          name: 'Office Supplies',
          limit: 500,
          spent: 350.25,
          remaining: 149.75,
          percentage: 70.0,
          status: 'warning'
        },
        {
          id: 2,
          name: 'Travel',
          limit: 1250,
          spent: 800.00,
          remaining: 450.00,
          percentage: 64.0,
          status: 'good'
        },
        {
          id: 3,
          name: 'Technology',
          limit: 750,
          spent: 700.00,
          remaining: 50.00,
          percentage: 93.3,
          status: 'critical'
        },
        {
          id: 4,
          name: 'Marketing',
          limit: 1000,
          spent: 525.50,
          remaining: 474.50,
          percentage: 52.5,
          status: 'good'
        },
        {
          id: 5,
          name: 'Entertainment',
          limit: 375,
          spent: 300.00,
          remaining: 75.00,
          percentage: 80.0,
          status: 'warning'
        },
        {
          id: 6,
          name: 'Training',
          limit: 625,
          spent: 450.25,
          remaining: 174.75,
          percentage: 72.0,
          status: 'warning'
        }
      ],
      totalLimit: 4500,
      totalSpent: 3138.00,
      totalRemaining: 1362.00
    },
    day: {
      categories: [
        {
          id: 1,
          name: 'Office Supplies',
          limit: 100,
          spent: 70.50,
          remaining: 29.50,
          percentage: 70.5,
          status: 'warning'
        },
        {
          id: 2,
          name: 'Travel',
          limit: 250,
          spent: 160.00,
          remaining: 90.00,
          percentage: 64.0,
          status: 'good'
        },
        {
          id: 3,
          name: 'Technology',
          limit: 150,
          spent: 140.00,
          remaining: 10.00,
          percentage: 93.3,
          status: 'critical'
        },
        {
          id: 4,
          name: 'Marketing',
          limit: 200,
          spent: 105.25,
          remaining: 94.75,
          percentage: 52.6,
          status: 'good'
        },
        {
          id: 5,
          name: 'Entertainment',
          limit: 75,
          spent: 60.00,
          remaining: 15.00,
          percentage: 80.0,
          status: 'warning'
        },
        {
          id: 6,
          name: 'Training',
          limit: 125,
          spent: 90.25,
          remaining: 34.75,
          percentage: 72.2,
          status: 'warning'
        }
      ],
      totalLimit: 900,
      totalSpent: 626.00,
      totalRemaining: 274.00
    }
  };

  const currentData = spendingData[timeFilter];
  const categories = ['all', 'Office Supplies', 'Travel', 'Technology', 'Marketing', 'Entertainment', 'Training'];

  const filteredCategories = selectedCategory === 'all' 
    ? currentData.categories 
    : currentData.categories.filter(cat => cat.name === selectedCategory);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-dark-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-dark-warning" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-dark-error" />;
      default:
        return <Clock className="w-5 h-5 text-dark-muted" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'text-dark-success bg-green-900 bg-opacity-20';
      case 'warning':
        return 'text-dark-warning bg-yellow-900 bg-opacity-20';
      case 'critical':
        return 'text-dark-error bg-red-900 bg-opacity-20';
      default:
        return 'text-dark-muted bg-gray-900 bg-opacity-20';
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-dark-error';
    if (percentage >= 75) return 'bg-dark-warning';
    return 'bg-dark-success';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTimeFilterLabel = (filter) => {
    switch (filter) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'This Month';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text mb-2">Spending Limits</h1>
        <p className="text-dark-muted">Track your spending against category limits and remaining allowances</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-5 h-5" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="input-field w-full pl-10 appearance-none"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-text">Total Limit</h3>
            <DollarSign className="w-6 h-6 text-dark-accent" />
          </div>
          <div className="text-3xl font-bold text-dark-text mb-2">
            {formatCurrency(currentData.totalLimit)}
          </div>
          <p className="text-sm text-dark-muted">{getTimeFilterLabel(timeFilter)}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-text">Total Spent</h3>
            <TrendingUp className="w-6 h-6 text-dark-error" />
          </div>
          <div className="text-3xl font-bold text-dark-text mb-2">
            {formatCurrency(currentData.totalSpent)}
          </div>
          <p className="text-sm text-dark-muted">
            {((currentData.totalSpent / currentData.totalLimit) * 100).toFixed(1)}% of limit
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-text">Remaining</h3>
            <TrendingDown className="w-6 h-6 text-dark-success" />
          </div>
          <div className="text-3xl font-bold text-dark-text mb-2">
            {formatCurrency(currentData.totalRemaining)}
          </div>
          <p className="text-sm text-dark-muted">Available allowance</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-dark-text mb-4">Category Breakdown</h2>
          {filteredCategories.map(category => (
            <div key={category.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(category.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-dark-text">{category.name}</h3>
                    <p className="text-sm text-dark-muted">
                      {formatCurrency(category.spent)} of {formatCurrency(category.limit)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(category.status)}`}>
                  {category.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-dark-surface rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(category.percentage)}`}
                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-dark-muted">Spent</p>
                  <p className="text-lg font-semibold text-dark-text">{formatCurrency(category.spent)}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Remaining</p>
                  <p className="text-lg font-semibold text-dark-text">{formatCurrency(category.remaining)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Charts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-dark-text">Visual Overview</h2>
          
          {/* Pie Chart Representation */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <PieChart className="w-6 h-6 text-dark-accent" />
              <h3 className="text-lg font-semibold text-dark-text">Spending Distribution</h3>
            </div>
            <div className="space-y-3">
              {currentData.categories.map(category => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: category.status === 'critical' ? '#f56565' : 
                                        category.status === 'warning' ? '#ed8936' : '#48bb78'
                      }}
                    ></div>
                    <span className="text-dark-text">{category.name}</span>
                  </div>
                  <span className="text-dark-text font-medium">{formatCurrency(category.spent)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Summary */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-dark-accent" />
              <h3 className="text-lg font-semibold text-dark-text">Status Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-dark-success" />
                  <span className="text-dark-text">Within Limit</span>
                </div>
                <span className="text-dark-text font-medium">
                  {currentData.categories.filter(cat => cat.status === 'good').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-dark-warning" />
                  <span className="text-dark-text">Approaching Limit</span>
                </div>
                <span className="text-dark-text font-medium">
                  {currentData.categories.filter(cat => cat.status === 'warning').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-dark-error" />
                  <span className="text-dark-text">Near/Over Limit</span>
                </div>
                <span className="text-dark-text font-medium">
                  {currentData.categories.filter(cat => cat.status === 'critical').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingLimits;


