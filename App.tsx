
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './components/Landing';
import ComplaintForm from './components/ComplaintForm';
import Login from './components/Login';
import DashboardAdmin1 from './components/DashboardAdmin1';
import DashboardAdmin2 from './components/DashboardAdmin2';
import DashboardDespachos from './components/DashboardDespachos';
import { storage } from './services/storage';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    storage.init();
    
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    
    // Simple session recovery from localStorage
    const savedUser = localStorage.getItem('violeta_session');
    if (savedUser) setUser(JSON.parse(savedUser));

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    localStorage.setItem('violeta_session', JSON.stringify(u));
    window.location.hash = '#dashboard';
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('violeta_session');
    window.location.hash = '#';
  };

  // Basic Routing Logic
  const renderContent = () => {
    // If not logged in, only public pages
    if (!user) {
      if (currentHash === '#report') return <ComplaintForm />;
      if (currentHash === '#login') return <Login onLoginSuccess={handleLoginSuccess} />;
      return <Landing />;
    }

    // Dashboard redirection based on role
    if (currentHash === '#dashboard' || currentHash === '') {
      switch (user.role) {
        case UserRole.ADMIN1: return <DashboardAdmin1 />;
        case UserRole.ADMIN2: return <DashboardAdmin2 />;
        case UserRole.DESPACHO: return <DashboardDespachos user={user} />;
        default: return <Landing />;
      }
    }

    return <Landing />;
  };

  return (
    <Layout user={user} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
