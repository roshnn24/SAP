import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Policies from './components/Policies';
import Chatbot from './components/Chatbot';
import SpendingLimits from './components/SpendingLimits';
import BillsList from './components/BillsList';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/spending-limits" element={<SpendingLimits />} />
            <Route path="/bills" element={<BillsList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;



