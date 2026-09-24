import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import SidebarDrawer from './components/SidebarDrawer.jsx';

import HomeView from './views/HomeView.jsx';
import LoginView from './views/LoginView.jsx';
import BeekeeperView from './views/BeekeeperView.jsx';
import LabView from './views/LabView.jsx';
import RetailerView from './views/RetailerView.jsx';
import ConsumerView from './views/ConsumerView.jsx';
import FeedbackView from './views/FeedbackView.jsx';
import ContactView from './views/ContactView.jsx';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_user') || 'null'); } catch { return null; }
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('sh_token') || null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('BATCH-2026-HIM-101');

  useEffect(() => {
    // Handle URL pathname routing on initial load
    const path = window.location.pathname.toLowerCase();
    if (path === '/login') setCurrentView('login');
    else if (path === '/beekeeper') setCurrentView('beekeeper');
    else if (path === '/tester') setCurrentView('tester');
    else if (path === '/retailer') setCurrentView('retailer');
    else if (path === '/consumer') setCurrentView('consumer');
    else if (path === '/feedback') setCurrentView('feedback');
    else if (path === '/contact') setCurrentView('contact');
  }, []);

  const handleLoginSuccess = (token, profile, redirectRoute) => {
    localStorage.setItem('sh_token', token);
    localStorage.setItem('sh_user', JSON.stringify(profile));
    setAuthToken(token);
    setCurrentUser(profile);

    if (redirectRoute === '/beekeeper') setCurrentView('beekeeper');
    else if (redirectRoute === '/tester') setCurrentView('tester');
    else if (redirectRoute === '/retailer') setCurrentView('retailer');
    else setCurrentView('consumer');
  };

  const handleLogout = () => {
    localStorage.removeItem('sh_token');
    localStorage.removeItem('sh_user');
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleSelectRoleFromDrawer = (username) => {
    setCurrentView('login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={handleLogout}
        toggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <SidebarDrawer 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onSelectRole={handleSelectRoleFromDrawer}
      />

      <div style={{ flex: 1 }}>
        {currentView === 'home' && (
          <HomeView 
            setCurrentView={setCurrentView} 
            setSelectedBatchId={setSelectedBatchId} 
          />
        )}
        {currentView === 'login' && (
          <LoginView onLoginSuccess={handleLoginSuccess} />
        )}
        {currentView === 'beekeeper' && (
          <BeekeeperView authToken={authToken} currentUser={currentUser} />
        )}
        {currentView === 'tester' && (
          <LabView authToken={authToken} />
        )}
        {currentView === 'retailer' && (
          <RetailerView authToken={authToken} />
        )}
        {currentView === 'consumer' && (
          <ConsumerView 
            selectedBatchId={selectedBatchId} 
            setCurrentView={setCurrentView} 
          />
        )}
        {currentView === 'feedback' && <FeedbackView />}
        {currentView === 'contact' && <ContactView />}
      </div>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}
