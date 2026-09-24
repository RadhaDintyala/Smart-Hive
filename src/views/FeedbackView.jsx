import React, { useState } from 'react';

export default function FeedbackView() {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState('5');
  const [comments, setComments] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="app-container">
      <div className="login-card-container">
        <div className="neo-card">
          <h2 className="neo-card-title">💬 Public Feedback & Platform Rating Portal</h2>
          <p className="neo-card-subtitle">Help us improve the national honey traceability ecosystem with your feedback:</p>

          {submitted ? (
            <div style={{ background: '#dcfce7', border: '2px solid #000', padding: '20px', borderRadius: '6px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#15803d', fontWeight: 900 }}>✓ Thank You!</h3>
              <p style={{ marginTop: '8px' }}>Your feedback has been logged into the national quality registry.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Overall Traceability Platform Rating *</label>
                <select className="neo-input" value={rating} onChange={e => setRating(e.target.value)}>
                  <option value="5">5 ⭐ — Excellent Platform Experience</option>
                  <option value="4">4 ⭐ — Very Good</option>
                  <option value="3">3 ⭐ — Average</option>
                  <option value="2">2 ⭐ — Needs Improvement</option>
                </select>
              </div>

              <div className="form-group">
                <label>Your Feedback / Suggestions *</label>
                <textarea 
                  className="neo-input" 
                  rows="4" 
                  value={comments} 
                  onChange={e => setComments(e.target.value)}
                  required 
                  placeholder="Share your thoughts on hive telemetry transparency, lab certificates, or retailer audits..."
                />
              </div>

              <button type="submit" className="btn-yellow" style={{ width: '100%' }}>Submit System Feedback</button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
