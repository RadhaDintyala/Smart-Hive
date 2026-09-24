import React, { useState } from 'react';

export default function ContactView() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="app-container">
      <div className="login-card-container">
        <div className="neo-card">
          <h2 className="neo-card-title">📞 Contact Support & Quality Portal</h2>
          <p className="neo-card-subtitle">Reach out to the Smart Hive National Support Team or report quality disputes:</p>

          {submitted ? (
            <div style={{ background: '#dcfce7', border: '2px solid #000', padding: '20px', borderRadius: '6px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#15803d', fontWeight: 900 }}>✓ Support Ticket Created</h3>
              <p style={{ marginTop: '8px' }}>Our technical support team will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Full Name *</label>
                <input type="text" className="neo-input" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" className="neo-input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Inquiry / Concern Message *</label>
                <textarea className="neo-input" rows="4" value={msg} onChange={e => setMsg(e.target.value)} required placeholder="State your inquiry or support ticket details..." />
              </div>

              <button type="submit" className="btn-yellow" style={{ width: '100%' }}>Submit Inquiry Ticket</button>
            </form>
          )}

          <div style={{ marginTop: '24px', borderTop: '2px solid #000', paddingTop: '16px', fontSize: '0.85rem' }}>
            <strong>📍 Head Office:</strong> National Apiary Mission & Smart Hive AI Division, New Delhi.<br />
            <strong>📧 Support Email:</strong> support@smarthive.gov.portal<br />
            <strong>📞 Toll-Free Helpline:</strong> 1800-HONEY-TRACE
          </div>
        </div>
      </div>
    </main>
  );
}
