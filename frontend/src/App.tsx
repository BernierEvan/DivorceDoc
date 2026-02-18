import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import DashboardPage from "./pages/DashboardPage";
import ExportPage from "./pages/ExportPage";
import CalculationChoicePage from "./pages/CalculationChoicePage";
import SimulationModePage from "./pages/SimulationModePage";
import PrestationCompensatoirePage from "./pages/PrestationCompensatoirePage";
import PensionAlimentairePage from "./pages/PensionAlimentairePage";
import LiquidationPage from "./pages/LiquidationPage";
import ResteAVivrePage from "./pages/ResteAVivrePage";
import RecapitulatifPage from "./pages/RecapitulatifPage";

import GuidePage from "./pages/GuidePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import MethodologyPage from "./pages/MethodologyPage";
import GlossaryPage from "./pages/GlossaryPage";
import ThemeToggle from "./components/ThemeToggle";
import Footer from "./components/Footer";
import OfflineIndicator from "./components/OfflineIndicator";
import { GuidedModeProvider } from "./services/guidedMode";
import { GuidedModeToggle } from "./components/GuidedModeToggle";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const CenteredLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="max-w-4xl mx-auto w-full">
    {children}
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <GuidedModeProvider>
      <ScrollToTop />
      <OfflineIndicator />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/disclaimer"
          element={
            <CenteredLayout>
              <DisclaimerPage />
            </CenteredLayout>
          }
        />
        <Route
          path="/calculation-choice"
          element={
            <CenteredLayout>
              <CalculationChoicePage />
            </CenteredLayout>
          }
        />
        <Route
          path="/simulation-mode"
          element={
            <CenteredLayout>
              <SimulationModePage />
            </CenteredLayout>
          }
        />
        <Route
          path="/guide"
          element={
            <CenteredLayout>
              <GuidePage />
            </CenteredLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <CenteredLayout>
              <PrivacyPage />
            </CenteredLayout>
          }
        />
        <Route
          path="/terms"
          element={
            <CenteredLayout>
              <TermsPage />
            </CenteredLayout>
          }
        />
        <Route
          path="/methodology"
          element={
            <CenteredLayout>
              <MethodologyPage />
            </CenteredLayout>
          }
        />
        <Route
          path="/glossary"
          element={
            <CenteredLayout>
              <GlossaryPage />
            </CenteredLayout>
          }
        />
        {/* New data-entry pages (by calculation type) */}
        <Route
          path="/prestation-compensatoire"
          element={
            <CenteredLayout>
              <PrestationCompensatoirePage />
            </CenteredLayout>
          }
        />
        <Route
          path="/pension-alimentaire"
          element={
            <CenteredLayout>
              <PensionAlimentairePage />
            </CenteredLayout>
          }
        />
        <Route
          path="/liquidation"
          element={
            <CenteredLayout>
              <LiquidationPage />
            </CenteredLayout>
          }
        />
        <Route
          path="/reste-a-vivre"
          element={
            <CenteredLayout>
              <ResteAVivrePage />
            </CenteredLayout>
          }
        />
        <Route
          path="/recapitulatif"
          element={
            <CenteredLayout>
              <RecapitulatifPage />
            </CenteredLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <CenteredLayout>
              <DashboardPage />
            </CenteredLayout>
          }
        />
        <Route
          path="/export"
          element={
            <CenteredLayout>
              <ExportPage />
            </CenteredLayout>
          }
        />
      </Routes>
      <ThemeToggle />
      <GuidedModeToggle />
    </GuidedModeProvider>
  );
};

export default App;
