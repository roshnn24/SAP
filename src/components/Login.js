import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogin({
        id: 1,
        email: formData.email,
        name: 'John Doe'
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark-text mb-2">
              Bill Processing System
            </h1>
            <p className="text-dark-muted">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field w-full pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field w-full pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-muted hover:text-dark-text"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-muted">
              Demo credentials: admin@example.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;





