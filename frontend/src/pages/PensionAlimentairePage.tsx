import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ArrowRight,
  ChevronLeft,
  Home,
  Wallet as WalletIcon,
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
  getNextPage,
  getPreviousPage,
  getPageIndex,
  getTotalPages,
} from "../services/divorceFormStore";

/**
 * Pension Alimentaire data-entry page.
 *
 * This page is only shown when Prestation Compensatoire is NOT selected
 * (because PC already asks for all the fields PA needs).
 */
const PensionAlimentairePage: React.FC = () => {
  const navigate = useNavigate();
  const currentPath = "/pension-alimentaire";
  const pageIdx = getPageIndex(currentPath);
  const totalPages = getTotalPages();

  const stored = loadFormData();

  const [myIncome, setMyIncome] = useState(stored.myIncome);
  const [spouseIncome, setSpouseIncome] = useState(stored.spouseIncome);
  const [childrenCount, setChildrenCount] = useState(stored.childrenCount);
  const [childrenAges, setChildrenAges] = useState<number[]>(
    stored.childrenAges,
  );
  const [custodyType, setCustodyType] = useState(stored.custodyType);

  const [noIncomeCreancier, setNoIncomeCreancier] = useState(
    stored.myIncome === "0",
  );
  const [noIncomeDebiteur, setNoIncomeDebiteur] = useState(
    stored.spouseIncome === "0",
  );
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeModalError, setIncomeModalError] = useState("");

  const { currentStep, advanceStep, allDone, isGuided } = useGuidedSteps(2);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNext = () => {
    // Income validation
    const myIncVal = parseFloat(myIncome) || 0;
    const spIncVal = parseFloat(spouseIncome) || 0;
    if (myIncVal <= 0 && !noIncomeCreancier) {
      setIncomeModalError(
        "Veuillez renseigner le revenu du créancier ou cocher « Aucun Revenu ».",
      );
      setShowIncomeModal(true);
      return;
    }
    if (spIncVal <= 0 && !noIncomeDebiteur) {
      setIncomeModalError(
        "Veuillez renseigner le revenu du débiteur ou cocher « Aucun Revenu ».",
      );
      setShowIncomeModal(true);
      return;
    }
    saveFormData({
      myIncome,
      spouseIncome,
      childrenCount,
      childrenAges,
      custodyType,
    });
    navigate(getNextPage(currentPath));
  };

  return (
    <div className="h-[100dvh] bg-[var(--color-deep-space)] flex flex-col relative text-white overflow-hidden">
      <SEO
        title="Pension Alimentaire — Simulation Divorce"
        description="Renseignez les informations nécessaires au calcul de la pension alimentaire : revenus et situation familiale."
        path="/pension-alimentaire"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Pension Alimentaire", path: "/pension-alimentaire" },
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
          Pension Alimentaire
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
          Pension Alimentaire
        </h1>
        <p className="text-sm text-gray-400">
          Contribution mensuelle à l'entretien et l'éducation des enfants.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-28 sm:pb-32 animate-fade-in relative z-10 scrollbar-hide space-y-8">
        {/* ── Section 1: Revenus ── */}
        <GuidedStep
          step={0}
          currentStep={currentStep}
          totalSteps={2}
          onAdvance={advanceStep}
          content="Indiquez les revenus nets mensuels des deux parties. La pension alimentaire est calculée sur le revenu du débiteur (celui qui gagne le plus) selon le barème du Ministère de la Justice."
          stepLabel="Revenus"
          isComplete={true}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <WalletIcon className="w-4 h-4 text-amber-400" />
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                Pension Alimentaire — Revenus
              </span>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-6">
                <WalletIcon className="w-3 h-3" /> <span>Revenus Mensuels</span>
                <InfoTooltip content="Le barème du Ministère de la Justice 2026 utilise le revenu du débiteur (le parent qui gagne davantage) diminué du RSA pour calculer la pension alimentaire par enfant." />
              </label>

              <div className="space-y-5">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Net Social Créancier (€/mois)
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
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center space-x-2">
                    <span>Revenu Débiteur (€/mois)</span>
                    <InfoTooltip content="Le revenu net mensuel de votre conjoint. Ce montant est comparé au vôtre pour déterminer qui est le débiteur de la pension alimentaire." />
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={spouseIncome}
                    onChange={(e) => setSpouseIncome(e.target.value)}
                    placeholder="ex: 3 500"
                    disabled={noIncomeDebiteur}
                    className={`w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none ${noIncomeDebiteur ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <label className="flex items-center space-x-2 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noIncomeDebiteur}
                      onChange={(e) => {
                        setNoIncomeDebiteur(e.target.checked);
                        if (e.target.checked) setSpouseIncome("0");
                      }}
                      className="w-3.5 h-3.5 rounded border-white/20 bg-transparent accent-[var(--color-plasma-cyan)]"
                    />
                    <span className="text-xs text-gray-400">Aucun Revenu</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </GuidedStep>

        {/* ── Section 2: Famille ── */}
        <GuidedStep
          step={1}
          currentStep={currentStep}
          totalSteps={2}
          onAdvance={advanceStep}
          content="Indiquez le nombre d'enfants et le type de garde. Le barème du Ministère de la Justice applique un taux différent selon le nombre d'enfants et le mode de garde choisi."
          stepLabel="Famille"
          isComplete={true}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <WalletIcon className="w-4 h-4 text-amber-400" />
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                Pension Alimentaire — Famille
              </span>
            </div>

            {/* Children Count */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                <Users className="w-3 h-3" /> <span>Enfants</span>
              </label>
              <div className="flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-2">
                <button
                  onClick={() => {
                    const n = Math.max(0, childrenCount - 1);
                    setChildrenCount(n);
                    setChildrenAges((prev) => prev.slice(0, n));
                  }}
                  className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] flex items-center justify-center text-xl font-bold transition"
                >
                  -
                </button>
                <span className="text-2xl font-mono text-[var(--color-plasma-cyan)]">
                  {childrenCount}
                </span>
                <button
                  onClick={() => {
                    setChildrenCount(childrenCount + 1);
                    setChildrenAges((prev) => [...prev, 0]);
                  }}
                  className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] flex items-center justify-center text-xl font-bold transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children Ages */}
            {childrenCount > 0 && (
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Users className="w-3 h-3" /> <span>Âge des Enfants</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: childrenCount }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="w-16 text-xs text-gray-400 shrink-0">
                        Enfant {i + 1}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={childrenAges[i] ?? 0}
                        onChange={(e) => {
                          const newAges = [...childrenAges];
                          newAges[i] = parseInt(e.target.value) || 0;
                          setChildrenAges(newAges);
                        }}
                        className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none text-center w-full"
                      />
                      <span className="text-xs text-gray-500 shrink-0">
                        ans
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custody Type */}
            {childrenCount > 0 && (
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Users className="w-3 h-3" /> <span>Type de Garde</span>
                </label>
                <div className="space-y-3">
                  {[
                    { key: "classic", label: "Classique (Droit de visite)" },
                    { key: "alternating", label: "Alternée (50/50)" },
                    { key: "reduced", label: "Réduite (Élargi)" },
                  ].map((g) => (
                    <button
                      key={g.key}
                      onClick={() => setCustodyType(g.key)}
                      className={`w-full p-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
                        custodyType === g.key
                          ? "border-[var(--color-plasma-cyan)] bg-[var(--color-plasma-cyan)]/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                          : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

export default PensionAlimentairePage;
