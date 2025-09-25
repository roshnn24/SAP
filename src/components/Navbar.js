import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  MessageCircle, 
  Receipt, 
  Upload, 
  User, 
  LogOut,
  Menu,
  X,
  DollarSign
} from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Upload },
    { path: '/policies', label: 'Policies', icon: FileText },
    { path: '/chatbot', label: 'Chatbot', icon: MessageCircle },
    { path: '/spending-limits', label: 'Spending Limits', icon: DollarSign },
    { path: '/bills', label: 'My Bills', icon: Receipt },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-dark-surface border-b border-dark-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-dark-accent">
              BillProcessor
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-dark-accent text-white'
                      : 'text-dark-muted hover:text-dark-text hover:bg-dark-card'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-dark-text">
              <User className="w-4 h-4" />
              <span className="text-sm">{user?.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-dark-muted hover:text-dark-text transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-dark-text hover:text-dark-accent transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-dark-border py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'bg-dark-accent text-white'
                        : 'text-dark-muted hover:text-dark-text hover:bg-dark-card'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-dark-border">
              <div className="flex items-center space-x-2 text-dark-text mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-dark-muted hover:text-dark-text transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;



