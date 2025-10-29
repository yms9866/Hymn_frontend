import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DeaconLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'DEACON',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      navigate('/deacon');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '80px' }}>
      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#1f2937' }}>
          🙏 Hymn Online
        </h1>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#6b7280' }}>
          Deacon Login
        </h2>
        
        {error && <div className="error" style={{ textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              name="username"
              className="input"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In as Deacon'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/deacon/register" style={{ color: '#667eea', fontWeight: 600 }}>
            Register here
          </Link>
        </p>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            ← Back to Student Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeaconLogin;
