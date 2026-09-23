import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import WizardPage from './pages/WizardPage';
import MatchingLoadingPage from './pages/MatchingLoadingPage';
import RecommendationResultsPage from './pages/RecommendationResultsPage';
import DashboardPage from './pages/DashboardPage';
import InternshipsExplorePage from './pages/InternshipsExplorePage';
import InternshipDetailPage from './pages/InternshipDetailPage';
import ApplicationsPage from './pages/ApplicationsPage';
import CertificatesPage from './pages/CertificatesPage';
import RecruiterDashboardPage from './pages/RecruiterDashboardPage';
import SettingsPage from './pages/SettingsPage';
import MentorRequestPage from './pages/MentorRequestPage';
import NotFoundPage from './pages/NotFoundPage';
import PricingPage from './pages/PricingPage';
import VisionPage from './pages/VisionPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F7F9FB] font-sans text-gray-900 selection:bg-secondary selection:text-primary">
          <Navbar />
          <main className="flex-grow pt-16">
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/internships" element={<InternshipsExplorePage />} />
                <Route path="/job/:id" element={<InternshipDetailPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/vision" element={<VisionPage />} />

                {/* Student / Candidate Only Routes */}
                <Route path="/wizard" element={
                  <ProtectedRoute allowedRole="candidate">
                    <WizardPage />
                  </ProtectedRoute>
                } />
                <Route path="/matching" element={
                  <ProtectedRoute allowedRole="candidate">
                    <MatchingLoadingPage />
                  </ProtectedRoute>
                } />
                <Route path="/results" element={
                  <ProtectedRoute allowedRole="candidate">
                    <RecommendationResultsPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRole="candidate">
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/applications" element={
                  <ProtectedRoute allowedRole="candidate">
                    <ApplicationsPage />
                  </ProtectedRoute>
                } />
                <Route path="/certificates" element={
                  <ProtectedRoute allowedRole="candidate">
                    <CertificatesPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute allowedRole="candidate">
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/mentor" element={
                  <ProtectedRoute allowedRole="candidate">
                    <MentorRequestPage />
                  </ProtectedRoute>
                } />

                {/* Corporate / Recruiter Only Routes */}
                <Route path="/recruiter" element={
                  <ProtectedRoute allowedRole="recruiter">
                    <RecruiterDashboardPage />
                  </ProtectedRoute>
                } />

                {/* Fallback 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

