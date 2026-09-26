import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import SidebarDrawer from './components/SidebarDrawer.jsx';
import { bootstrapLedger, connectLedgerSocket } from './services/batchStore.js';

import HomeView from './views/HomeView.jsx';
import ExploreView from './views/ExploreView.jsx';
import LoginView from './views/LoginView.jsx';
import BeekeeperView from './views/BeekeeperView.jsx';
import LabView from './views/LabView.jsx';
import RetailerView from './views/RetailerView.jsx';
import ConsumerView from './views/ConsumerView.jsx';
import FeedbackView from './views/FeedbackView.jsx';
import ContactView from './views/ContactView.jsx';

import PDFReportView from './views/PDFReportView.jsx';

// Global historic scan log. Kept out of the main bundle and only fetched when
// the consumer actually opens the "Explore Previous Scans" tab.
const PreviousScansPanel = lazy(() => import('./components/PreviousScansPanel.jsx'));

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_user') || 'null'); } catch { return null; }
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('sh_token') || null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('BATCH-2026-HIM-101');

  /**
   * Pull the shared ledger once at boot and keep it live over WebSocket.
   * Without this the app only ever saw this browser's localStorage, so batches
   * registered elsewhere were invisible.
   */
  useEffect(() => {
    // Prime the cache from the shared ledger, and keep it live over WebSocket.
    // Without this the app only ever saw this browser's localStorage, so batches
    // registered on another machine were invisible.
    //
    // `bootstrapLedger` only syncs; the single socket is owned here so this
    // effect's teardown can actually close it (StrictMode double-mounts).
    bootstrapLedger().catch(() => {});
    return connectLedgerSocket();
  }, []);

  useEffect(() => {
    // Handle URL pathname and query param routing on initial load & popstate
    const syncRouteFromPath = () => {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const bId = params.get('batchId');

      if (path.startsWith('/pdf/')) {
        const pdfBatchId = path.split('/pdf/')[1];
        if (pdfBatchId) setSelectedBatchId(pdfBatchId.toUpperCase());
        setCurrentView('pdf');
        return;
      }

      if (bId) {
        setSelectedBatchId(bId);
      }

      if (path === '/login') setCurrentView('login');
      else if (path === '/explore') setCurrentView('explore');
      else if (path === '/beekeeper' || path === '/bee') {
        if (path === '/bee') window.history.replaceState({}, '', '/beekeeper');
        setCurrentView('beekeeper');
      }
      else if (path === '/tester' || path === '/lab' || path === '/laboratory') {
        if (path === '/lab' || path === '/laboratory') window.history.replaceState({}, '', '/tester');
        setCurrentView('tester');
      }
      else if (path === '/retailer' || path === '/retail') {
        if (path === '/retail') window.history.replaceState({}, '', '/retailer');
        setCurrentView('retailer');
      }
      else if (path === '/consumer') setCurrentView('consumer');
      else if (path === '/pdf') setCurrentView('pdf');
      else if (path === '/feedback') setCurrentView('feedback');
      else if (path === '/contact') setCurrentView('contact');
      else if (bId) setCurrentView('consumer');
      else setCurrentView('home');
    };

    syncRouteFromPath();
    window.addEventListener('popstate', syncRouteFromPath);
    return () => window.removeEventListener('popstate', syncRouteFromPath);
  }, []);

  const handleLoginSuccess = (token, profile, redirectRoute) => {
    localStorage.setItem('sh_token', token);
    localStorage.setItem('sh_user', JSON.stringify(profile));
    setAuthToken(token);
    setCurrentUser(profile);

    let targetRoute = redirectRoute;
    if (!targetRoute) {
      if (profile?.role === 'Beekeeper') targetRoute = '/beekeeper';
      else if (profile?.role === 'Laboratory') targetRoute = '/tester';
      else if (profile?.role === 'Retailer') targetRoute = '/retailer';
      else targetRoute = '/consumer';
    }

    if (targetRoute === '/bee') targetRoute = '/beekeeper';
    if (targetRoute === '/lab' || targetRoute === '/laboratory') targetRoute = '/tester';
    if (targetRoute === '/retail') targetRoute = '/retailer';

    // Ensure the address bar changes from /login to /beekeeper (or target role route)
    window.history.pushState({}, '', targetRoute);

    if (targetRoute === '/beekeeper') setCurrentView('beekeeper');
    else if (targetRoute === '/tester') setCurrentView('tester');
    else if (targetRoute === '/retailer') setCurrentView('retailer');
    else setCurrentView('consumer');
  };

  const handleLogout = () => {
    localStorage.removeItem('sh_token');
    localStorage.removeItem('sh_user');
    setAuthToken(null);
    setCurrentUser(null);
    window.history.pushState({}, '', '/');
    setCurrentView('home');
  };

  const handleSelectRoleFromDrawer = (username) => {
    window.history.pushState({}, '', '/login');
    setCurrentView('login');
  };

  const isConsumerView = currentView === 'consumer';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hide Header on Public Consumer Verification View */}
      {!isConsumerView && (
        <Header 
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentUser={currentUser}
          onLogout={handleLogout}
          toggleSidebar={() => setSidebarOpen(prev => !prev)}
        />
      )}

      {!isConsumerView && (
        <SidebarDrawer 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentUser={currentUser}
          onSelectRole={handleSelectRoleFromDrawer}
        />
      )}

      <div style={{ flex: 1, marginLeft: 0 }}>
        {currentView === 'home' && (
          <HomeView 
            setCurrentView={setCurrentView} 
            setSelectedBatchId={setSelectedBatchId} 
          />
        )}
        {currentView === 'explore' && (
          <ExploreView 
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
          <Suspense fallback={null}>
            <ConsumerView 
              selectedBatchId={selectedBatchId} 
              setCurrentView={setCurrentView} 
              renderPreviousScans={() => (
                <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading scan history...</div>}>
                  <PreviousScansPanel onSelectBatch={(id) => {
                    setSelectedBatchId(id);
                    setCurrentView('consumer');
                    window.history.pushState({}, '', `/consumer?batchId=${encodeURIComponent(id)}`);
                  }} />
                </Suspense>
              )}
            />
          </Suspense>
        )}
        {currentView === 'pdf' && (
          <PDFReportView 
            batchId={selectedBatchId} 
            setCurrentView={setCurrentView} 
          />
        )}
        {currentView === 'feedback' && <FeedbackView />}
        {currentView === 'contact' && <ContactView />}
      </div>

      {!isConsumerView && currentView !== 'pdf' && <Footer setCurrentView={setCurrentView} />}
    </div>
  );
}

