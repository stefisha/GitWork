import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MagicBlockProvider } from './contexts/MagicBlockContext';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <MagicBlockProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
          </Route>
          {/* 404 catch-all route - must be last */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </MagicBlockProvider>
  );
}

export default App;
