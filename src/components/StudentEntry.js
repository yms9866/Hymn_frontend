import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentEntry = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (studentName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }
    
    // Store student name in localStorage
    localStorage.setItem('studentName', studentName.trim());
    
    // Navigate to student dashboard
    navigate('/student');
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '80px' }}>
      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#1f2937' }}>
          🙏 Hymn Online
        </h1>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#6b7280' }}>
          Student Entry
        </h2>
        
        <p style={{ textAlign: 'center', marginBottom: '32px', color: '#6b7280' }}>
          Enter your name to start reading hymns
        </p>
        
        {error && <div className="error" style={{ textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label className="label">Your Name</label>
            <input
              type="text"
              className="input"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                setError('');
              }}
              placeholder="Enter your full name"
              required
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px' }}
          >
            Continue
          </button>
        </form>

        <div style={{ marginTop: '32px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', textAlign: 'center' }}>
            <strong>Are you a Deacon?</strong>
          </p>
          <button 
            onClick={() => navigate('/deacon/login')}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Login as Deacon
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentEntry;
