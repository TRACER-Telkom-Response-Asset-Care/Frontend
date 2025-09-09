import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CreateReportPage from './pages/CreateReportPage';
import ReportDetailPage from './pages/ReportDetailPage'; // <-- Import the new page

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/create-report" element={<CreateReportPage />} />
        <Route path="/report/:reportId" element={<ReportDetailPage />} /> {/* <-- Add new dynamic route */}
        <Route path="/" element={<LoginPage />} /> 
      </Routes>
    </div>
  );
}

export default App;