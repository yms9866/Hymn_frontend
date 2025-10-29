import React, { useState, useEffect } from 'react';
import { sessionAPI, hymnAPI } from '../services/api';

const DeaconDashboard = () => {
  const [sessionStatus, setSessionStatus] = useState(null);
  const [hymns, setHymns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastSession, setLastSession] = useState(null);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionResponse, hymnsResponse, lastSessionResponse] = await Promise.all([
        sessionAPI.getStatus(),
        hymnAPI.list(),
        sessionAPI.getLastSession().catch(() => ({ data: { session: null } })) // Ignore error if no last session
      ]);
      
      setSessionStatus(sessionResponse.data);
      setHymns(hymnsResponse.data.hymns);
      setLastSession(lastSessionResponse.data.session);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const startSession = async (resumePrevious = false) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setShowResumeConfirm(false);
    
    try {
      const response = await sessionAPI.start(resumePrevious);
      setSuccess(response.data.message);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start session');
      setLoading(false);
    }
  };
  
  const handleResumeClick = () => {
    if (lastSession) {
      setShowResumeConfirm(true);
    }
  };

  const stopSession = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await sessionAPI.stop();
      setSuccess(response.data.message);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to stop session');
      setLoading(false);
    }
  };

  if (loading && !sessionStatus) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>Deacon Dashboard</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: '#374151' }}>Session Control</h3>
          
          {!sessionStatus?.has_active_session ? (
            <div>
              <div style={{ padding: '24px', background: '#f3f4f6', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                  {lastSession 
                    ? 'No active session. You can start a new session or resume the previous one.'
                    : 'No active session. Start a new session to allow students to read hymns.'
                  }
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => startSession(false)} 
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ fontSize: '16px' }}
                  >
                    {loading ? 'Starting...' : '▶ Start New Session'}
                  </button>
                  
                  {lastSession && (
                    <button
                      onClick={handleResumeClick}
                      className="btn btn-secondary"
                      disabled={loading}
                      style={{ fontSize: '16px' }}
                    >
                      {loading ? 'Resuming...' : '↻ Resume Last Session'}
                    </button>
                  )}
                </div>
                
                {lastSession && (
                  <div style={{ marginTop: '16px', padding: '12px', background: '#e5e7eb', borderRadius: '6px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4b5563' }}>
                      <strong>Last Session:</strong> {new Date(lastSession.completed_at).toLocaleString()}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#4b5563' }}>
                      Progress: {lastSession.read_hymns} / {lastSession.total_hymns} hymns completed
                    </p>
                  </div>
                )}
              </div>
              
              {showResumeConfirm && (
                <div className="modal" style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    maxWidth: '500px',
                    width: '90%',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h3 style={{ marginTop: 0 }}>Resume Last Session?</h3>
                    <p>You're about to resume the session from {new Date(lastSession.completed_at).toLocaleString()}.</p>
                    <p>Progress: {lastSession.read_hymns} / {lastSession.total_hymns} hymns were completed.</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                      <button 
                        onClick={() => setShowResumeConfirm(false)}
                        className="btn btn-outline"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => startSession(true)}
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Resuming...' : 'Yes, Resume Session'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ padding: '24px', background: '#dcfce7', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: '#166534', marginBottom: '8px' }}>✓ Session Active</h4>
                    <p style={{ color: '#15803d', marginBottom: '4px' }}>
                      Started: {new Date(sessionStatus.session.started_at).toLocaleString()}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534', lineHeight: '1' }}>
                          {sessionStatus.session.read_hymns}/{sessionStatus.session.total_hymns}
                        </div>
                        <div style={{ fontSize: '14px', color: '#15803d' }}>Hymns Completed</div>
                      </div>
                      <div style={{ flex: 1, maxWidth: '200px' }}>
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          backgroundColor: '#d1fae5', 
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(sessionStatus.session.read_hymns / sessionStatus.session.total_hymns) * 100}%`,
                            height: '100%',
                            backgroundColor: '#10b981',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#15803d', 
                          textAlign: 'right',
                          marginTop: '4px'
                        }}>
                          {Math.round((sessionStatus.session.read_hymns / sessionStatus.session.total_hymns) * 100)}% Complete
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={stopSession} 
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    {loading ? 'Stopping...' : '⏹ Stop Session'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', color: '#374151' }}>
            Available Hymns ({hymns.length})
          </h3>
          
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#4b5563' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#4b5563' }}>Geez Title</th>
                </tr>
              </thead>
              <tbody>
                {hymns.map((hymn) => (
                  <tr key={hymn.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 8px', color: '#6b7280' }}>{hymn.order}</td>
                    <td style={{ padding: '12px 8px', fontSize: '1.1em' }}>{hymn.title_geez || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeaconDashboard;
