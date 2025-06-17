import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Layout } from './components/Layout/Layout';
import { LoadingSpinner } from './components/Layout/LoadingSpinner';
import { ErrorMessage } from './components/Layout/ErrorMessage';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { PatientDetail } from './pages/PatientDetail';
import { DietPlans } from './pages/DietPlans';
import { ExercisePrograms } from './pages/ExercisePrograms';
import { Appointments } from './pages/Appointments';
import { EmailReminders } from './pages/EmailReminders';
import { Accounting } from './pages/Accounting';
import { Contracts } from './pages/Contracts';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { ENV } from './config/environment';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { loading, error, refreshData } = useData();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refreshData} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/diet-plans" element={<DietPlans />} />
        <Route path="/exercise-programs" element={<ExercisePrograms />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/email-reminders" element={<EmailReminders />} />
        <Route path="/accounting" element={<Accounting />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
};

function App() {
  // Auto-detect base path
  const basePath = ENV.getBasePath();
  
  // Debug info (remove in production)
  React.useEffect(() => {
    console.log('🚀 Deployment Info:', ENV.getDeploymentInfo());
  }, []);

  return (
    <AuthProvider>
      <Router basename={basePath}>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;