import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  Home,
  HeartPulse,
  Wallet,
  AlertTriangle,
  X,
} from "lucide-react";
import { InfoTooltip } from "../components/InfoTooltip";
import { GuidedStep, useGuidedSteps } from "../components/GuidedTooltip";
import { GuidedHeaderTour } from "../components/GuidedHeaderTour";
import { SEO, breadcrumbJsonLd } from "../components/SEO";
import {
  loadFormData,
  saveFormData,
  isFieldAlreadyAsked,
  getNextPage,
  getPreviousPage,
  getPageIndex,
  getTotalPages,
} from "../services/divorceFormStore";

const ResteAVivrePage: React.FC = () => {
  const navigate = useNavigate();
  const currentPath = "/reste-a-vivre";
  const pageIdx = getPageIndex(currentPath);
  const totalPages = getTotalPages();

  const stored = loadFormData();

  // myIncome may already have been asked in PC or PA
  const incomeAlreadyAsked = isFieldAlreadyAsked("myIncome", currentPath);

  const [myIncome, setMyIncome] = useState(stored.myIncome);
  const [myTaxes, setMyTaxes] = useState(stored.myTaxes);
  const [myRent, setMyRent] = useState(stored.myRent);
  const [myCharges, setMyCharges] = useState(stored.myCharges);

  const [noIncomeCreancier, setNoIncomeCreancier] = useState(
    stored.myIncome === "0",
  );
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeModalError, setIncomeModalError] = useState("");

  const showIncomeSection = !incomeAlreadyAsked;

  const guidedSections = useMemo(() => {
    const sections: string[] = [];
    if (showIncomeSection) sections.push("revenus");
    sections.push("charges");
    return sections;
  }, [showIncomeSection]);

  const { currentStep, advanceStep, allDone, isGuided } = useGuidedSteps(
    guidedSections.length,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNext = () => {
    // Income validation (only when income section is shown)
    if (showIncomeSection) {
      const myIncVal = parseFloat(myIncome) || 0;
      if (myIncVal <= 0 && !noIncomeCreancier) {
        setIncomeModalError(
          "Veuillez renseigner votre revenu ou cocher \u00ab Aucun Revenu \u00bb.",
        );
        setShowIncomeModal(true);
        return;
      }
    }
    const toSave: Record<string, unknown> = {
      myTaxes,
      myRent,
      myCharges,
    };
    if (showIncomeSection) {
      toSave.myIncome = myIncome;
    }
    saveFormData(toSave as any);
    navigate(getNextPage(currentPath));
  };

  const stepIdx = (name: string) => guidedSections.indexOf(name);

  return (
    <div className="h-[100dvh] bg-[var(--color-deep-space)] flex flex-col relative text-white overflow-hidden">
      <SEO
        title="Reste à Vivre — Simulation Divorce"
        description="Renseignez vos charges mensuelles pour calculer votre reste à vivre après divorce."
        path="/reste-a-vivre"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Reste à Vivre", path: "/reste-a-vivre" },
        ])}
      />

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-plasma-cyan)]/10 rounded-full blur-[100px]" />

      {/* Header */}
      <div
        className="bg-black/20 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-50"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <button
          onClick={() => navigate(getPreviousPage(currentPath))}
          className="p-2 rounded-full hover:bg-white/10 group flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase text-glow">
          Reste à Vivre
        </h1>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-white/10 group flex items-center justify-center"
          title="Accueil"
        >
          <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
      </div>

      {/* Progress + Subtitle */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 z-10">
        <div className="flex justify-end mb-6">
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1 rounded-full ${i === pageIdx ? "bg-[var(--color-plasma-cyan)]" : "bg-[var(--border-color)]"}`}
              />
            ))}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-glow mb-2">
          Reste à Vivre
        </h1>
        <p className="text-sm text-gray-400">
          Budget mensuel restant après toutes charges. Alerte si inférieur au
          seuil de pauvreté.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-28 sm:pb-32 animate-fade-in relative z-10 scrollbar-hide space-y-8">
        {/* ── Section: Revenus (only if not already asked) ── */}
        {showIncomeSection && (
          <GuidedStep
            step={stepIdx("revenus")}
            currentStep={currentStep}
            totalSteps={guidedSections.length}
            onAdvance={advanceStep}
            content="Indiquez votre revenu net mensuel. Ce montant constitue la base du calcul de votre reste à vivre."
            stepLabel="Revenus"
            isComplete={true}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                  Reste à Vivre — Revenus
                </span>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Wallet className="w-3 h-3" />{" "}
                  <span>Net Social Créancier</span>
                  <InfoTooltip content="Votre revenu net social mensuel tel qu'il apparaît sur votre bulletin de paie." />
                </label>
                <input
                  type="number"
                  min="0"
                  value={myIncome}
                  onChange={(e) => setMyIncome(e.target.value)}
                  placeholder="ex: 2 500"
                  disabled={noIncomeCreancier}
                  className={`w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none ${noIncomeCreancier ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                <label className="flex items-center space-x-2 mt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={noIncomeCreancier}
                    onChange={(e) => {
                      setNoIncomeCreancier(e.target.checked);
                      if (e.target.checked) setMyIncome("0");
                    }}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-transparent accent-[var(--color-plasma-cyan)]"
                  />
                  <span className="text-xs text-gray-400">Aucun Revenu</span>
                </label>
              </div>
            </div>
          </GuidedStep>
        )}

        {/* ── Section: Charges ── */}
        <GuidedStep
          step={stepIdx("charges")}
          currentStep={currentStep}
          totalSteps={guidedSections.length}
          onAdvance={advanceStep}
          content="Les charges mensuelles (impôts, loyer, charges fixes) sont déduites de vos revenus pour calculer votre Reste à Vivre après divorce. Soyez précis pour une estimation fiable."
          stepLabel="Charges"
          isComplete={true}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                Reste à Vivre — Charges
              </span>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-6">
                <Wallet className="w-3 h-3" /> <span>Charges Mensuelles</span>
                <InfoTooltip content="Ces montants sont déduits de vos revenus pour calculer votre Reste à Vivre après divorce. Reste = Revenus + PA reçue − Impôts − Loyer − Charges − PA versée." />
              </label>

              <div className="space-y-5">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Impôts mensuels (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={myTaxes || ""}
                    onChange={(e) =>
                      setMyTaxes(parseFloat(e.target.value) || 0)
                    }
                    placeholder="ex: 350"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Loyer ou Crédit immobilier (€/mois)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={myRent || ""}
                    onChange={(e) => setMyRent(parseFloat(e.target.value) || 0)}
                    placeholder="ex: 800"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center space-x-2">
                    <span>Charges fixes (€/mois)</span>
                    <InfoTooltip content="Charges récurrentes obligatoires hors loyer et impôts : assurances, mutuelles, crédits à la consommation, pensions alimentaires éventuelles…" />
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={myCharges}
                    onChange={(e) => setMyCharges(e.target.value)}
                    placeholder="ex: 200"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </GuidedStep>
      </div>

      {/* Income Modal */}
      {showIncomeModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setShowIncomeModal(false);
            setIncomeModalError("");
          }}
        >
          <div
            className="bg-[var(--color-deep-space)] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Revenu requis</h3>
              </div>
              <button
                onClick={() => {
                  setShowIncomeModal(false);
                  setIncomeModalError("");
                }}
                className="text-gray-400 hover:text-white transition p-2 rounded-full hover:bg-white/10 cursor-pointer"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                {incomeModalError}
              </p>
              <button
                onClick={() => {
                  setShowIncomeModal(false);
                  setIncomeModalError("");
                }}
                className="w-full bg-[var(--color-plasma-cyan)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95"
                style={{ color: "#ffffff" }}
              >
                <span className="tracking-widest text-sm uppercase">
                  Compris
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className={`fixed bottom-0 left-0 w-full p-3 sm:p-6 bg-gradient-to-t from-[var(--color-deep-space)] to-transparent z-20 ${isGuided && !allDone ? "pointer-events-none" : ""}`}
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
        }}
      >
        <button
          onClick={handleNext}
          className={`w-full max-w-md mx-auto bg-[var(--color-plasma-cyan)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 sm:py-5 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center space-x-2 sm:space-x-3 group active:scale-95 ${isGuided && !allDone ? "opacity-20 blur-[3px]" : ""}`}
          style={{ color: "#ffffff" }}
        >
          <span className="text-xs sm:text-sm tracking-wider sm:tracking-widest uppercase">
            <span className="sm:hidden">Valider</span>
            <span className="hidden sm:inline">Valider et poursuivre</span>
          </span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      <GuidedHeaderTour />
    </div>
  );
};

export default ResteAVivrePage;
