'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Save, CheckCircle } from 'lucide-react';

export default function AdminDashboard({ initialPricing }) {
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

  // Group by category
  const categories = pricing.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="admin-dashboard">
      <header className="admin-header glass-panel">
        <div>
          <h1>Pricing Configuration</h1>
          <p>Update base costs for the estimator</p>
        </div>
        <button onClick={handleLogout} className="btn secondary-btn">
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="admin-content">
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
    </div>
  );
}
