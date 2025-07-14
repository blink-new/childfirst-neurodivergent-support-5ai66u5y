import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/toaster';
import PinAuth from './components/PinAuth';
import Dashboard from './components/Dashboard';
import VoiceRecording from './components/VoiceRecording';
import IncidentTimeline from './components/IncidentTimeline';
import EducationalResources from './components/EducationalResources';
import LegalTools from './components/LegalTools';
import Settings from './components/Settings';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('childfirst_authenticated');
    const authTime = localStorage.getItem('childfirst_auth_time');
    
    if (authStatus === 'true' && authTime) {
      const timeDiff = Date.now() - parseInt(authTime);
      // Auto-logout after 30 minutes of inactivity
      if (timeDiff < 30 * 60 * 1000) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('childfirst_authenticated');
        localStorage.removeItem('childfirst_auth_time');
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleAuthentication = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      localStorage.setItem('childfirst_authenticated', 'true');
      localStorage.setItem('childfirst_auth_time', Date.now().toString());
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('childfirst_authenticated');
    localStorage.removeItem('childfirst_auth_time');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PinAuth onAuthenticate={handleAuthentication} />;
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/record" element={<VoiceRecording />} />
          <Route path="/timeline" element={<IncidentTimeline />} />
          <Route path="/resources" element={<EducationalResources />} />
          <Route path="/legal" element={<LegalTools />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;