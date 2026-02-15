import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ScannerPage from "./pages/ScannerPage";
import DataValidationPage from "./pages/DataValidationPage";
import DashboardPage from "./pages/DashboardPage";
import ExportPage from "./pages/ExportPage";
import ProfilePage from "./pages/ProfilePage";
import QuizPage from "./pages/QuizPage";

import GuidePage from "./pages/GuidePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import MethodologyPage from "./pages/MethodologyPage";
import GlossaryPage from "./pages/GlossaryPage";
import ThemeToggle from "./components/ThemeToggle";
import Footer from "./components/Footer";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <OfflineIndicator />
      <ThemeToggle />
      <PWAInstallPrompt />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/validation" element={<DataValidationPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/export" element={<ExportPage />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
