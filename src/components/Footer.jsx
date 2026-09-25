import React from 'react';

export default function Footer({ setCurrentView }) {
  const handleContactClick = () => {
    window.history.pushState({}, '', '/contact');
    setCurrentView('contact');
  };

  return (
    <footer className="app-footer">
      <div className="footer-links-row">
        <button onClick={() => alert('Smart Hive Traceability Platform Privacy Policy')}>Privacy Policy</button>
        <span className="sep">|</span>
        <button onClick={() => alert('Smart Hive Terms of Use & Legal Blueprint')}>Terms of Use</button>
        <span className="sep">|</span>
        <button onClick={handleContactClick}>Contact Us</button>
      </div>
      <div style={{ marginTop: '12px', fontSize: '0.8rem', opacity: 0.7 }}>
        Smart Hive Government Traceability Blueprint © 2028. All rights reserved.
      </div>
    </footer>
  );
}
