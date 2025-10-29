import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import StudentEntry from './components/StudentEntry';
import StudentDashboard from './components/StudentDashboard';
import DeaconLogin from './components/DeaconLogin';
import DeaconRegister from './components/DeaconRegister';
import DeaconDashboard from './components/DeaconDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Student Routes - No Authentication */}
          <Route path="/" element={<StudentEntry />} />
          <Route path="/student" element={<StudentDashboard />} />
          
          {/* Deacon Routes - Require Authentication */}
          <Route path="/deacon/login" element={<DeaconLogin />} />
          <Route path="/deacon/register" element={<DeaconRegister />} />
          <Route 
            path="/deacon" 
            element={
              <PrivateRoute>
                <DeaconDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
