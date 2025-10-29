import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { sessionAPI, hymnAPI } from '../services/api';

// Get API URL from environment or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [sessionStatus, setSessionStatus] = useState(null);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('amharic');
  const [hasStarted, setHasStarted] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('hasStarted') === 'true';
  });

  useEffect(() => {
    console.log('useEffect triggered - hasStarted:', hasStarted, 'studentName:', studentName);
    
    // Get student name from localStorage
    const name = localStorage.getItem('studentName');
    console.log('Retrieved name from localStorage:', name);
    
    if (!name) {
      console.log('No student name found, redirecting to home');
      navigate('/');
      return;
    }
    
    // Only update if the name has changed
    if (name !== studentName) {
      console.log('Updating studentName state to:', name);
      setStudentName(name);
    }
    
    // Always check session status when component mounts or student name changes
    if (hasStarted) {
      console.log('hasStarted is true, calling fetchSessionStatus');
      fetchSessionStatus()
        .then(data => console.log('fetchSessionStatus completed with data:', data))
        .catch(err => {
          console.error('Error in fetchSessionStatus:', err);
          setLoading(false);
        });
    } else {
      console.log('hasStarted is false, not fetching session status');
      setLoading(false);
    }
  }, [navigate, studentName, hasStarted]);

  // Log when loading state changes
  useEffect(() => {
    console.log('Loading state changed to:', loading);
  }, [loading]);

  const fetchSessionStatus = async () => {
    try {
      console.log('Fetching session status for student:', studentName);
      setLoading(true);
      setError('');
      
      if (!studentName) {
        const errorMsg = 'No student name available for session status check';
        console.error(errorMsg);
        setError('Student name is not set. Please refresh the page.');
        setLoading(false);
        throw new Error(errorMsg);
      }
      
      // Log the exact URL being called
      const url = `${API_URL}/session/status/?student_name=${encodeURIComponent(studentName)}`;
      console.log('Making API call to:', url);
      
      // Make the request with minimal configuration
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          // Explicitly no Authorization header
        },
        withCredentials: false // Important: don't send cookies
      });
      
      console.log('Session status response:', response);
      
      if (!response || !response.data) {
        const errorMsg = 'Invalid response from server';
        console.error(errorMsg, response);
        setError('Invalid response from server. Please try again.');
        setLoading(false);
        throw new Error(errorMsg);
      }
      
      console.log('Session status data:', response.data);
      
      // Update session status
      setSessionStatus(response.data);
      
      // If there's an active assignment, set it
      if (response.data.user_assignment) {
        console.log('Found assignment:', response.data.user_assignment);
        setCurrentAssignment(response.data.user_assignment);
      } else {
        console.log('No assignment found for student');
        setCurrentAssignment(null);
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch session status';
      const errorDetails = err.response?.data?.details || '';
      console.error('Error fetching session status:', errorMessage, errorDetails, err);
      setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
      setLoading(false);
      throw err;
    }
  };

  const fetchNextHymn = async () => {
    if (!studentName) {
      setError('Student name is not set. Please refresh the page.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching next hymn for student:', studentName);
      const response = await hymnAPI.getNext(studentName);
      console.log('Next hymn response:', response.data);
      
      // Check if the response indicates the student already has an assignment
      if (response.data.message && response.data.message.includes('already have an assigned hymn')) {
        // If we already have an assignment, use that one
        if (response.data.assignment) {
          setCurrentAssignment(response.data.assignment);
          console.log('Using existing assignment:', response.data.assignment);
        } else {
          // If no assignment is provided, clear the current assignment to try again
          setCurrentAssignment(null);
          setError('You already have an assigned hymn. Please wait a moment...');
          // Try to refresh the assignment after a short delay
          setTimeout(fetchSessionStatus, 1000);
        }
      } 
      // Check if session is complete
      else if (response.data.session_complete) {
        setSessionComplete(true);
        setCurrentAssignment(null);
        setError('You have completed all hymns in this session.');
      } 
      // If we got a new assignment
      else if (response.data.assignment) {
        setCurrentAssignment(response.data.assignment);
        console.log('Assigned new hymn:', response.data.assignment);
      } 
      // If no assignment was returned but session is not complete
      else {
        setError('No hymn was assigned. Please try again.');
        setCurrentAssignment(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch next hymn';
      const errorDetails = err.response?.data?.details || '';
      const suggestion = err.response?.data?.suggestion || '';
      console.error('Error fetching next hymn:', errorMessage, errorDetails, err);
      
      // Handle 409 Conflict specifically
      if (err.response?.status === 409) {
        setError(`${errorMessage}. ${suggestion || 'Please try again.'}`);
      } else {
        setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
      }
      
      // If there was an error, make sure to clear the current assignment
      // to prevent the user from getting stuck
      setCurrentAssignment(null);
    } finally {
      setLoading(false);
    }
  };

  const [sessionComplete, setSessionComplete] = useState(false);

  const finishHymn = async () => {
    if (!currentAssignment) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Mark current hymn as read
      console.log('Marking hymn as read:', currentAssignment.id, 'for student:', studentName);
      const response = await hymnAPI.finish(currentAssignment.id, studentName);
      console.log('Finish hymn response:', response.data);
      
      // Refresh the session status to get updated counts
      await fetchSessionStatus();
      
      // Check if session is complete from the response
      if (response.data && response.data.session_complete) {
        console.log('Session complete');
        setSessionComplete(true);
        setCurrentAssignment(null);
      } else {
        console.log('Fetching next hymn...');
        // Automatically fetch the next hymn
        await fetchNextHymn();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to mark hymn as read';
      const errorDetails = err.response?.data?.details || '';
      const suggestion = err.response?.data?.suggestion || '';
      console.error('Error finishing hymn:', errorMessage, errorDetails, err);
      
      // Set a more user-friendly error message
      if (err.response?.status === 409) {
        setError(`${errorMessage}. ${suggestion || 'Please try again.'}`);
      } else {
        setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update localStorage when hasStarted changes
  useEffect(() => {
    localStorage.setItem('hasStarted', hasStarted);
  }, [hasStarted]);

  const handleLogout = () => {
    // Reset all states and clear localStorage
    setHasStarted(false);
    setSessionComplete(false);
    setCurrentAssignment(null);
    setSessionStatus(null);
    localStorage.removeItem('studentName');
    localStorage.removeItem('hasStarted');
    navigate('/');
  };

  // Show loading state
  if (loading && !sessionStatus) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen if not started
  if (!hasStarted) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ color: '#1e40af', marginBottom: '24px' }}>
            {selectedLanguage === 'english' ? 'WELCOME TO PRAYER' : 
             selectedLanguage === 'amharic' ? 'የዘወተረ ጸሎት' : 
             'የዘወትር ጸሎት'}
          </h1>
          
          <div style={{ margin: '24px 0' }}>
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="input"
              style={{ 
                padding: '10px 16px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                marginBottom: '24px'
              }}
            >
              <option value="english">English</option>
              <option value="amharic">Amharic</option>
              <option value="geez">Ge'ez</option>
            </select>
          </div>
          
          <button 
            onClick={() => {
              setHasStarted(true);
              fetchSessionStatus().catch(console.error);
            }} 
            className="btn btn-primary"
            style={{ 
              fontSize: '18px', 
              padding: '12px 32px',
              marginTop: '16px'
            }}
          >
            {selectedLanguage === 'english' ? 'Start Hymns' : 
             selectedLanguage === 'amharic' ? 'ጸሎቶችን ይጀምሩ' : 
             'ጸሎታት ይጅምሩ'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ marginBottom: '4px' }}>Student Dashboard</h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Welcome, {studentName}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Change Name
          </button>
        </div>

        {!sessionStatus?.has_active_session && (
          <div style={{ padding: '32px', textAlign: 'center', background: '#fef3c7', borderRadius: '8px' }}>
            <h3 style={{ color: '#92400e', marginBottom: '8px' }}>No Active Session</h3>
            <p style={{ color: '#78350f' }}>Wait for a deacon to start a session</p>
          </div>
        )}

        {sessionStatus?.has_active_session && (
          <>
            <div style={{ marginBottom: '24px', padding: '16px', background: '#dcfce7', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: '#166534', marginBottom: '8px' }}>✓ Session Active</h3>
                  <p style={{ color: '#15803d', marginBottom: '4px' }}>
                    Started by: {sessionStatus.session.started_by_name}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                    {sessionStatus.session.read_hymns}/{sessionStatus.session.total_hymns}
                  </div>
                  <div style={{ fontSize: '14px', color: '#15803d' }}>Hymns Completed</div>
                </div>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#166534', fontSize: '14px' }}>Your Progress:</span>
                  <span style={{ fontWeight: 'bold', color: '#166534' }}>
                    {sessionStatus.read_hymns_count || 0} {sessionStatus.read_hymns_count === 1 ? 'hymn' : 'hymns'} read
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#d1fae5', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      width: `${(sessionStatus.read_hymns_count / sessionStatus.session.total_hymns) * 100}%`,
                      height: '100%',
                      backgroundColor: '#10b981',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            {!currentAssignment && (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                {sessionComplete ? (
                  <div>
                    <h3 style={{ color: '#166534', marginBottom: '16px' }}>🎉 Session Complete! 🎉</h3>
                    <p style={{ color: '#4b5563', marginBottom: '24px' }}>
                      You've completed all the hymns in this session. Great job!
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ marginBottom: '24px', fontSize: '18px', color: '#6b7280' }}>
                      Ready to read your next hymn?
                    </p>
                    <button 
                      onClick={fetchNextHymn} 
                      className="btn btn-primary"
                      disabled={loading}
                      style={{ fontSize: '18px', padding: '16px 32px' }}
                    >
                      {loading ? 'Loading...' : 'Get Next Hymn'}
                    </button>
                  </>
                )}
              </div>
            )}

            {currentAssignment && (
              <div className="hymn-card">
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ color: '#1f2937' }}>
                    {currentAssignment.hymn[`title_${selectedLanguage}`]}
                  </h3>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="input"
                    style={{ width: 'auto', marginBottom: 0 }}
                  >
                    <option value="english">English</option>
                    <option value="amharic">Amharic</option>
                    <option value="geez">Ge'ez</option>
                  </select>
                </div>

                <div className="hymn-text">
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                    {currentAssignment.hymn[`text_${selectedLanguage}`]}
                  </pre>
                </div>

                <button 
                  onClick={finishHymn} 
                  className="btn btn-success"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '16px', fontSize: '16px' }}
                >
                  {loading ? 'Processing...' : 'Mark as Read & Continue'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
