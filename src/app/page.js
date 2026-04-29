'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Calculator } from 'lucide-react';

const STEPS = [
  { id: 'personal', title: 'Personal Info' },
  { id: 'setup', title: 'Bathroom Setup' },
  { id: 'shower', title: 'Shower Area' },
  { id: 'vanity', title: 'Vanity & Paint' },
  { id: 'misc', title: 'Miscellaneous' },
  { id: 'result', title: 'Estimate' }
];

export default function Estimator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [estimateData, setEstimateData] = useState(null);

  const [formData, setFormData] = useState({
    personal: { firstName: '', lastName: '', email: '', phone: '', address: '' },
    setup: '',
    tiles: '',
    glass: '',
    floor: '',
    paint: '',
    vanity: '',
    misc: {
      led_lights_count: 0,
      replace_exhaust_fan: false,
      new_exhaust_fan_vent: false,
      raise_light_fixture: false,
      run_electrical_led_mirror: false
    }
  });

  const updateFormData = (category, field, value) => {
    if (field) {
      setFormData(prev => ({
        ...prev,
        [category]: { ...prev[category], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [category]: value }));
    }
  };

  const calculateEstimate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setEstimateData(data);
      setCurrentStep(STEPS.length - 1);
    } catch (error) {
      alert('Error calculating estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === STEPS.length - 2) {
      calculateEstimate();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const renderStepProgress = () => {
    return (
      <div className="step-progress">
        {STEPS.map((step, index) => {
          let className = 'progress-dot';
          if (index === currentStep) className += ' active';
          else if (index < currentStep) className += ' completed';
          return (
            <div key={step.id} className={className}>
              {index < currentStep ? <CheckCircle size={16} /> : index + 1}
            </div>
          );
        })}
      </div>
    );
  };

  const renderPersonal = () => (
    <div className="step-container glass-panel">
      <h2>Let's get started</h2>
      <p>Please provide your contact information to begin.</p>
      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label>First Name *</label>
            <input type="text" className="input-field" value={formData.personal.firstName} onChange={(e) => updateFormData('personal', 'firstName', e.target.value)} required />
          </div>
          <div>
            <label>Last Name *</label>
            <input type="text" className="input-field" value={formData.personal.lastName} onChange={(e) => updateFormData('personal', 'lastName', e.target.value)} required />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email *</label>
          <input type="email" className="input-field" value={formData.personal.email} onChange={(e) => updateFormData('personal', 'email', e.target.value)} required />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Phone Number *</label>
          <input type="tel" className="input-field" value={formData.personal.phone} onChange={(e) => updateFormData('personal', 'phone', e.target.value)} required />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Address *</label>
          <input type="text" className="input-field" value={formData.personal.address} onChange={(e) => updateFormData('personal', 'address', e.target.value)} required />
        </div>
      </div>
    </div>
  );

  const renderSetup = () => {
    const options = [
      { id: 'setup_bathtub', label: 'Bathtub' },
      { id: 'setup_walk_in_shower', label: 'Walk-in Shower' },
      { id: 'setup_convert_tub_to_shower', label: 'Convert Tub to Walk-in Shower' },
      { id: 'setup_tub_shower_combo', label: 'Tub & Walk-in Shower Combo' },
    ];
    return (
      <div className="step-container glass-panel">
        <h2>Select the bathroom set up *</h2>
        <div className="options-grid" style={{ marginTop: '1.5rem' }}>
          {options.map(opt => (
            <div 
              key={opt.id} 
              className={`option-card ${formData.setup === opt.id ? 'selected' : ''}`}
              onClick={() => updateFormData('setup', null, opt.id)}
            >
              <div className="custom-radio"></div>
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderShowerArea = () => (
    <div className="step-container glass-panel">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Shower Area Tiles *</h2>
        <p>Will you be providing the tiles or would you like us to supply them?</p>
        <div className="options-grid" style={{ marginTop: '1rem' }}>
          {[
            { id: 'tiles_provide_yes', label: 'Yes, please provide the tiles' },
            { id: 'tiles_provide_no', label: 'No, I (the homeowner) will provide the tiles' }
          ].map(opt => (
            <div key={opt.id} className={`option-card ${formData.tiles === opt.id ? 'selected' : ''}`} onClick={() => updateFormData('tiles', null, opt.id)}>
              <div className="custom-radio"></div><span>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Shower Glass Door *</h2>
        <p>Do you want us to provide and install a frameless 3/8” clear glass shower door? <br/><small>(Upgrades available for additional charge)</small></p>
        <div className="options-grid" style={{ marginTop: '1rem' }}>
          {[
            { id: 'glass_regular_frameless', label: 'Yes, please include the regular frameless glass door' },
            { id: 'glass_none', label: "No, I don't need a shower glass door" },
            { id: 'glass_curtain', label: 'No, I will provide a shower curtain' }
          ].map(opt => (
            <div key={opt.id} className={`option-card ${formData.glass === opt.id ? 'selected' : ''}`} onClick={() => updateFormData('glass', null, opt.id)}>
              <div className="custom-radio"></div><span>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2>Bathroom Floor *</h2>
        <p>Do you want to redo the bathroom floor?</p>
        <div className="options-grid" style={{ marginTop: '1rem' }}>
          {[
            { id: 'floor_new_tiles_we_supply', label: 'Yes, I want new tiles and baseboards (We supply the floor tiles)' },
            { id: 'floor_new_tiles_you_supply', label: 'Yes, I want new tiles and baseboards (I will supply the floor tiles)' },
            { id: 'floor_keep_as_is', label: 'No, keep the existing floor as is' }
          ].map(opt => (
            <div key={opt.id} className={`option-card ${formData.floor === opt.id ? 'selected' : ''}`} onClick={() => updateFormData('floor', null, opt.id)}>
              <div className="custom-radio"></div><span>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVanityPaint = () => (
    <div className="step-container glass-panel">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Paint *</h2>
        <div className="options-grid" style={{ marginTop: '1rem' }}>
          {[
            { id: 'paint_all', label: 'I want to paint all the walls and ceiling of the bathroom' },
            { id: 'paint_patch', label: 'I just want to patch and paint as needed around the shower area' }
          ].map(opt => (
            <div key={opt.id} className={`option-card ${formData.paint === opt.id ? 'selected' : ''}`} onClick={() => updateFormData('paint', null, opt.id)}>
              <div className="custom-radio"></div><span>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2>Vanity, Sink & Countertop *</h2>
        <p>Do you need us to provide and install a premade solid wood vanity, porcelain sink, and quartz countertop?</p>
        <div className="options-grid" style={{ marginTop: '1rem' }}>
          {[
            { id: 'vanity_single', label: 'Yes, I need a single sink vanity and countertop' },
            { id: 'vanity_double', label: 'Yes, I need a double sink vanity and countertop' },
            { id: 'vanity_own', label: 'No, I will provide my own full vanity' },
            { id: 'vanity_no_work', label: 'No work outside the shower area needs to be done' }
          ].map(opt => (
            <div key={opt.id} className={`option-card ${formData.vanity === opt.id ? 'selected' : ''}`} onClick={() => updateFormData('vanity', null, opt.id)}>
              <div className="custom-radio"></div><span>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMisc = () => (
    <div className="step-container glass-panel">
      <h2>Miscellaneous</h2>
      <p>Additional electrical and ventilation options</p>
      
      <div style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>How many new LED lights do you want us to install?</label>
          <input 
            type="number" 
            min="0"
            className="input-field" 
            style={{ width: '100px' }}
            value={formData.misc.led_lights_count} 
            onChange={(e) => updateFormData('misc', 'led_lights_count', parseInt(e.target.value) || 0)} 
          />
        </div>
        
        {[
          { key: 'replace_exhaust_fan', label: 'Do you need us to replace your exhaust fan?' },
          { key: 'new_exhaust_fan_vent', label: 'Do you need us to install a new exhaust fan with a vent outside?' },
          { key: 'raise_light_fixture', label: 'Do you need us to raise your light fixture above the vanity?' },
          { key: 'run_electrical_led_mirror', label: 'Do you need us to run electrical for an LED mirror?' }
        ].map(opt => (
          <div key={opt.key} className={`option-card ${formData.misc[opt.key] ? 'selected' : ''}`} style={{ marginBottom: '1rem' }} onClick={() => updateFormData('misc', opt.key, !formData.misc[opt.key])}>
            <div className="custom-radio"></div><span>{opt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResult = () => {
    if (!estimateData) return null;
    
    // Format currency
    const format = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

    return (
      <div className="step-container glass-panel result-container">
        <Calculator size={48} style={{ color: 'var(--accent-color)', margin: '0 auto' }} />
        <h2>Your Rough Estimate</h2>
        <div className="estimate-amount">{format(estimateData.total)}</div>
        <p>This is a preliminary estimate based on your selections. A final quote requires an in-person evaluation.</p>
        
        <div className="breakdown-list">
          <h3 style={{ marginBottom: '1rem' }}>Cost Breakdown</h3>
          {estimateData.breakdown.map((item, i) => (
            <div key={i} className="breakdown-item">
              <span>{item.label}</span>
              <span style={{ fontWeight: 500 }}>{format(item.cost)}</span>
            </div>
          ))}
        </div>

        <button className="btn primary-btn" style={{ marginTop: '2rem' }} onClick={() => window.location.reload()}>
          Start New Estimate
        </button>
      </div>
    );
  };

  const stepsContent = [
    renderPersonal,
    renderSetup,
    renderShowerArea,
    renderVanityPaint,
    renderMisc,
    renderResult
  ];

  const isCurrentStepValid = () => {
    if (currentStep === 0) {
      const p = formData.personal;
      return p.firstName && p.lastName && p.email && p.phone && p.address;
    }
    if (currentStep === 1) return formData.setup;
    if (currentStep === 2) return formData.tiles && formData.glass && formData.floor;
    if (currentStep === 3) return formData.paint && formData.vanity;
    return true; // Misc is optional
  };

  return (
    <div className="estimator-container">
      <div className="estimator-header">
        <h1>Modern Renovations</h1>
        <p>Bathroom Remodel Estimator</p>
      </div>

      {currentStep < STEPS.length - 1 && renderStepProgress()}

      {stepsContent[currentStep]()}

      {currentStep < STEPS.length - 1 && (
        <div className="step-actions">
          {currentStep > 0 ? (
            <button className="btn secondary-btn" onClick={prevStep}>
              <ArrowLeft size={18} /> Back
            </button>
          ) : <div></div>}
          
          <button 
            className="btn primary-btn" 
            onClick={nextStep}
            disabled={!isCurrentStepValid() || loading}
          >
            {loading ? 'Calculating...' : currentStep === STEPS.length - 2 ? 'Get Estimate' : 'Next Step'} 
            {!loading && currentStep < STEPS.length - 2 && <ArrowRight size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}
