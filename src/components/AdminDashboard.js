'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Save, CheckCircle, List, DollarSign, Upload, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard({ initialPricing, submissions = [] }) {
  const [activeTab, setActiveTab] = useState('pricing');
  const [pricing, setPricing] = useState(initialPricing);
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const [uploadingKey, setUploadingKey] = useState(null);
  const router = useRouter();
  
  const fileInputRefs = useRef({});

  const handleUpdate = async (key, newValue, newImageUrl = undefined) => {
    setSavingKey(key);
    try {
      const currentItem = pricing.find(i => i.key === key);
      const valToSave = newValue !== undefined ? Number(newValue) : currentItem.value;
      const imgToSave = newImageUrl !== undefined ? newImageUrl : currentItem.image_url;

      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: valToSave, image_url: imgToSave })
      });

      if (res.ok) {
        setPricing(prev => prev.map(item => item.key === key ? { ...item, value: valToSave, image_url: imgToSave } : item));
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

  const handleFileUpload = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        // Update the item with the new image URL
        await handleUpdate(key, undefined, data.url);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    window.location.reload();
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
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
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
                      
                      {/* Image Upload Section */}
                      <div className="image-upload-section" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt="preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={20} color="var(--text-muted)" />
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          ref={el => fileInputRefs.current[item.key] = el}
                          onChange={(e) => handleFileUpload(item.key, e.target.files[0])}
                        />
                        <button 
                          className="btn secondary-btn" 
                          style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                          onClick={() => fileInputRefs.current[item.key].click()}
                          disabled={uploadingKey === item.key}
                        >
                          {uploadingKey === item.key ? 'Uploading...' : <><Upload size={14}/> Upload Image</>}
                        </button>
                        {item.image_url && (
                           <button className="btn secondary-btn" style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }} onClick={() => handleUpdate(item.key, undefined, null)}>Remove</button>
                        )}
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
                    <div style={{ flex: '1 1 300px', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
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
