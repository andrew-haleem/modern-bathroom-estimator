'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Save, CheckCircle, List, DollarSign } from 'lucide-react';

export default function AdminDashboard({ initialPricing, submissions = [] }) {
  const [activeTab, setActiveTab] = useState('submissions');
  const [pricing, setPricing] = useState(initialPricing);
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const router = useRouter();

  const handleUpdate = async (key, newValue) => {
    setSavingKey(key);
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: Number(newValue) })
      });
      if (res.ok) {
        setPricing(prev => prev.map(item => item.key === key ? { ...item, value: Number(newValue) } : item));
        setSavedKey(key);
        setTimeout(() => setSavedKey(null), 2000);
      } else {
        alert('Failed to update pricing');
      }
    } catch (error) {
      alert('Error updating pricing');
    } finally {
      setSavingKey(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.refresh();
  };

  const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  const categories = pricing.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="admin-dashboard">
      <header className="admin-header glass-panel">
        <div>
          <h1>Admin Portal</h1>
          <p>Modern Renovations Estimator</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setActiveTab('submissions')} className={`btn ${activeTab === 'submissions' ? 'primary-btn' : 'secondary-btn'}`}>
            <List size={16} /> Submissions
          </button>
          <button onClick={() => setActiveTab('pricing')} className={`btn ${activeTab === 'pricing' ? 'primary-btn' : 'secondary-btn'}`}>
            <DollarSign size={16} /> Pricing Config
          </button>
          <button onClick={handleLogout} className="btn secondary-btn" style={{ marginLeft: 'auto' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        {activeTab === 'pricing' && (
          <div>
            {Object.keys(categories).map(category => (
              <div key={category} className="category-section glass-panel">
                <h2>{category}</h2>
                <div className="pricing-grid">
                  {categories[category].map(item => (
                    <div key={item.key} className="pricing-item">
                      <div className="pricing-info">
                        <label>{item.label}</label>
                        <span className="pricing-key">{item.key}</span>
                      </div>
                      <div className="pricing-input-group">
                        <span className="currency-symbol">$</span>
                        <input 
                          type="number" 
                          defaultValue={item.value} 
                          className="input-field"
                          onBlur={(e) => {
                            if (Number(e.target.value) !== item.value) {
                              handleUpdate(item.key, e.target.value);
                            }
                          }}
                        />
                        <div className="status-indicator">
                          {savingKey === item.key && <Save className="spin-icon" size={16} />}
                          {savedKey === item.key && <CheckCircle className="success-icon" size={16} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2>Recent Submissions</h2>
            {submissions.length === 0 ? (
              <p>No submissions yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                {submissions.map(sub => (
                  <div key={sub.id} className="pricing-item" style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>
                        {sub.first_name} {sub.last_name}
                      </h3>
                      <p style={{ margin: 0 }}><strong>Email:</strong> {sub.email}</p>
                      <p style={{ margin: 0 }}><strong>Phone:</strong> {sub.phone}</p>
                      <p style={{ margin: 0 }}><strong>Address:</strong> {sub.address}</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                        Date: {new Date(sub.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>Estimate: {formatCurrency(sub.total_estimate)}</h3>
                      <details>
                        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>View Breakdown</summary>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                          {JSON.parse(sub.breakdown_json).map((item, i) => (
                            <li key={i}>{item.label}: {formatCurrency(item.cost)}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
