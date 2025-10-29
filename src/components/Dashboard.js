import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import DeaconDashboard from './DeaconDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user.role === 'STUDENT' ? <StudentDashboard /> : <DeaconDashboard />}
    </>
  );
};

export default Dashboard;
