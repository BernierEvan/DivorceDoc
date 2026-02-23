import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ArrowRight,
  ChevronLeft,
  Home,
  User,
  Wallet,
  TrendingUp,
  Percent,
} from "lucide-react";
import { InfoTooltip } from "../components/InfoTooltip";
import { CurrencyInput } from "../components/CurrencyInput";
import { GuidedStep, useGuidedSteps } from "../components/GuidedTooltip";
import { GuidedHeaderTour } from "../components/GuidedHeaderTour";
import { SEO, breadcrumbJsonLd } from "../components/SEO";
import {
  loadFormData,
  saveFormData,
  computeAge,
  getNextPage,
  getPreviousPage,
  getPageIndex,
  getTotalPages,
  getCalculationChoices,
} from "../services/divorceFormStore";

const CreancierPage: React.FC = () => {
  const navigate = useNavigate();
  const currentPath = "/informations-creancier";
  const pageIdx = getPageIndex(currentPath);
  const totalPages = getTotalPages();

  const stored = loadFormData();

  // ── Method flags ──
  const { selectedMethods } = getCalculationChoices();
  const pcMethods = selectedMethods.prestationCompensatoire || [];
  const showAxelDepondtSteps = pcMethods.includes("axelDepondt");
  const needsNetIncome =
    pcMethods.includes("pilote") || pcMethods.includes("insee");

  // Local state
  const [myBirthDate, setMyBirthDate] = useState(stored.myBirthDate);
  const [myIncome, setMyIncome] = useState(stored.myIncome);
  const [noIncomeCreancier, setNoIncomeCreancier] = useState(
    stored.myIncome === "0",
  );

  const [creditorGrossIncome, setCreditorGrossIncome] = useState(
    stored.creditorGrossIncome,
  );
  const [creditorIncomeMode, setCreditorIncomeMode] = useState(
    stored.creditorIncomeMode || "monthly",
  );
  const [creditorChildContribution, setCreditorChildContribution] = useState(
    stored.creditorChildContribution,
  );
  const [creditorFutureIncome, setCreditorFutureIncome] = useState(
    stored.creditorFutureIncome,
  );
  const [creditorFutureChildContribution, setCreditorFutureChildContribution] =
    useState(stored.creditorFutureChildContribution);
  const [creditorChangeDate, setCreditorChangeDate] = useState(
    stored.creditorChangeDate,
  );
  const [creditorPropertyValue, setCreditorPropertyValue] = useState(
    stored.creditorPropertyValue,
  );
  const [creditorPropertyYield, setCreditorPropertyYield] = useState(
    stored.creditorPropertyYield || "3",
  );
  const [showYieldInput, setShowYieldInput] = useState(
    stored.creditorPropertyYield !== "" && stored.creditorPropertyYield !== "3",
  );
  const [creditorRetirementGapYears, setCreditorRetirementGapYears] = useState(
    stored.creditorRetirementGapYears,
  );
  const [creditorPreRetirementIncome, setCreditorPreRetirementIncome] =
    useState(stored.creditorPreRetirementIncome);
  const [creditorExpectsRevenueChange, setCreditorExpectsRevenueChange] =
    useState(stored.creditorExpectsRevenueChange || "no");

  const { currentStep, advanceStep, allDone, isGuided } = useGuidedSteps(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const save = () => {
    saveFormData({
      myBirthDate,
      myIncome,
      creditorGrossIncome,
      creditorIncomeMode,
      creditorChildContribution,
      creditorFutureIncome,
      creditorFutureChildContribution,
      creditorChangeDate,
      creditorPropertyValue,
      creditorPropertyYield,
      creditorRetirementGapYears,
      creditorPreRetirementIncome,
      creditorExpectsRevenueChange,
    });
  };

  const handleNext = () => {
    if (needsNetIncome) {
      const myIncVal = parseFloat(myIncome) || 0;
      if (myIncVal <= 0 && !noIncomeCreancier) {
        // Simple fallback — just proceed (validation is soft)
      }
    }
    save();
    navigate(getNextPage(currentPath));
  };

  return (
    <div className="h-[100dvh] bg-[var(--color-deep-space)] flex flex-col relative text-white overflow-hidden">
      <SEO
        title="Informations Créancier — Simulation Divorce"
        description="Renseignez les informations du créancier : date de naissance, revenus, projections financières et écart de retraite."
        path="/informations-creancier"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Informations Créancier", path: "/informations-creancier" },
        ])}
      />

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-plasma-cyan)]/10 rounded-full blur-[100px]" />

      {/* Header */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-black/20 backdrop-blur-md border-white/5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <button
          onClick={() => navigate(getPreviousPage(currentPath))}
          className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase text-glow">
          Informations Créancier
        </h1>
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 group"
          title="Accueil"
        >
          <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
      </div>

      {/* Progress */}
      <div className="z-10 px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
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
        <h1 className="mb-2 text-2xl font-bold text-white text-glow">
          Informations Créancier
        </h1>
        <p className="text-sm text-gray-400">
          Renseignez les informations du créancier : identité, revenus,
          projections et retraite.
        </p>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-4 space-y-8 overflow-y-auto sm:px-6 pb-28 sm:pb-32 animate-fade-in scrollbar-hide">
        {/* Editorial Block */}
        <div className="p-5 border rounded-2xl border-white/10 bg-white/[0.02]">
          <h3 className="text-sm font-bold text-white mb-2">
            Le rôle du créancier dans le calcul
          </h3>
          <p className="text-xs leading-relaxed text-gray-400">
            Le créancier est le conjoint qui perçoit la prestation
            compensatoire, généralement celui dont la situation financière est
            la plus défavorable après la séparation. Ses revenus, ses
            éventuelles interruptions de carrière et son patrimoine sont des
            éléments déterminants. La méthode Calcul PC prend en compte l'écart
            de retraite lié aux années sans cotisation pendant le mariage.
          </p>
        </div>

        <GuidedStep
          step={0}
          currentStep={currentStep}
          totalSteps={1}
          onAdvance={advanceStep}
          content="Renseignez les informations du créancier : date de naissance, revenus, projections financières et écart de retraite."
          stepLabel="Créancier"
          isComplete={true}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold tracking-widest text-teal-400 uppercase">
                Informations Créancier
              </span>
            </div>

            {/* Date de naissance */}
            <div className="p-6 border glass-panel rounded-2xl border-white/10">
              <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                <Calendar className="w-3 h-3" />
                <span>Date de naissance</span>
                <InfoTooltip content="L'âge du créancier est utilisé dans la méthode Pilote. Plus le créancier est âgé, plus le coefficient est élevé." />
              </label>
              <input
                type="date"
                value={myBirthDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setMyBirthDate(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
              />
              {myBirthDate && (
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Âge : {computeAge(myBirthDate)} ans
                </p>
              )}
            </div>

            {/* Net Social */}
            {needsNetIncome && (
              <div className="p-6 border glass-panel rounded-2xl border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Wallet className="w-3 h-3" />
                  <span>Net Social (€/mois)</span>
                  <InfoTooltip content="Le revenu net mensuel du créancier. Ce montant est comparé à celui du débiteur pour déterminer la disparité de niveau de vie." />
                </label>
                <CurrencyInput
                  min="0"
                  value={myIncome}
                  onValueChange={setMyIncome}
                  placeholder="ex: 2 500"
                  disabled={noIncomeCreancier}
                  className={`w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none ${noIncomeCreancier ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                <label className="flex items-center mt-2 space-x-2 cursor-pointer select-none">
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
            )}

            {/* Projections Créancier (Calcul PC) */}
            {showAxelDepondtSteps && (
              <>
                {/* Revenus actuels avant impôts */}
                <div className="p-6 border glass-panel rounded-2xl border-white/10">
                  <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    <TrendingUp className="w-3 h-3" />
                    <span>Revenus actuels avant impôts</span>
                    <InfoTooltip content="Revenus bruts (avant impôts) du créancier. Vous pouvez saisir le montant annuel ou mensuel." />
                  </label>
                  <div className="flex mb-3 overflow-hidden border rounded-lg border-white/10">
                    <button
                      type="button"
                      onClick={() => setCreditorIncomeMode("monthly")}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all ${creditorIncomeMode === "monthly" ? "bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)] border-b-2 border-[var(--color-plasma-cyan)]" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                    >
                      Mensuel
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreditorIncomeMode("annual")}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all ${creditorIncomeMode === "annual" ? "bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)] border-b-2 border-[var(--color-plasma-cyan)]" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                    >
                      Annuel
                    </button>
                  </div>
                  <CurrencyInput
                    min="0"
                    value={creditorGrossIncome}
                    onValueChange={setCreditorGrossIncome}
                    placeholder={
                      creditorIncomeMode === "annual"
                        ? "ex: 24 000"
                        : "ex: 2 000"
                    }
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                  {creditorGrossIncome && (
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {creditorIncomeMode === "annual"
                        ? `≈ ${Math.round(parseFloat(creditorGrossIncome) / 12).toLocaleString()} €/mois`
                        : `≈ ${Math.round(parseFloat(creditorGrossIncome) * 12).toLocaleString()} €/an`}
                    </p>
                  )}
                </div>

                {/* Contribution aux charges des enfants */}
                <div className="p-6 border glass-panel rounded-2xl border-white/10">
                  <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    <Wallet className="w-3 h-3" />
                    <span>
                      Contribution mensuelle pour les enfants (€/mois)
                    </span>
                    <InfoTooltip content="Montant que le créancier verse pour la contribution aux charges des enfants." />
                  </label>
                  <CurrencyInput
                    min="0"
                    value={creditorChildContribution}
                    onValueChange={setCreditorChildContribution}
                    placeholder="ex: 200"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                </div>

                {/* Changement de revenus prévu ? */}
                <div className="p-6 border glass-panel rounded-2xl border-white/10">
                  <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      Un changement de revenus est-il prévu dans les 8
                      prochaines années ?
                    </span>
                    <InfoTooltip content="Si le créancier anticipe un changement de revenus dans les 8 ans (reprise d'emploi, retraite, promotion…), répondez Oui pour renseigner les détails." />
                  </label>
                  <div className="flex overflow-hidden border rounded-lg border-white/10">
                    <button
                      type="button"
                      onClick={() => setCreditorExpectsRevenueChange("no")}
                      className={`flex-1 py-3 text-sm font-bold transition-all ${creditorExpectsRevenueChange === "no" ? "bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)] border-b-2 border-[var(--color-plasma-cyan)]" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                    >
                      Non
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreditorExpectsRevenueChange("yes")}
                      className={`flex-1 py-3 text-sm font-bold transition-all ${creditorExpectsRevenueChange === "yes" ? "bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)] border-b-2 border-[var(--color-plasma-cyan)]" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                    >
                      Oui
                    </button>
                  </div>
                </div>

                {/* Conditional: future income fields */}
                {creditorExpectsRevenueChange === "yes" && (
                  <>
                    <div className="p-6 border glass-panel rounded-2xl border-white/10">
                      <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                        <Wallet className="w-3 h-3" />
                        <span>
                          Revenu mensuel prévisible avant impôts (€/mois)
                        </span>
                        <InfoTooltip content="Montant futur mensuel brut (avant impôts) attendu après le changement de situation." />
                      </label>
                      <CurrencyInput
                        min="0"
                        value={creditorFutureIncome}
                        onValueChange={setCreditorFutureIncome}
                        placeholder="ex: 1 800"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                      />
                    </div>

                    <div className="p-6 border glass-panel rounded-2xl border-white/10">
                      <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                        <Wallet className="w-3 h-3" />
                        <span>
                          Contribution prévisible pour les enfants (€/mois)
                        </span>
                        <InfoTooltip content="Montant prévisible de la contribution aux charges des enfants après le changement de situation du créancier." />
                      </label>
                      <CurrencyInput
                        min="0"
                        value={creditorFutureChildContribution}
                        onValueChange={(v) =>
                          setCreditorFutureChildContribution(v)
                        }
                        placeholder="ex: 150"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                      />
                    </div>

                    <div className="p-6 border glass-panel rounded-2xl border-white/10">
                      <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                        <Calendar className="w-3 h-3" />
                        <span>Date prévisible des modifications</span>
                        <InfoTooltip content="Date prévue du changement de situation du créancier." />
                      </label>
                      <input
                        type="date"
                        value={creditorChangeDate}
                        onChange={(e) => setCreditorChangeDate(e.target.value)}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Patrimoine propre non producteur */}
                <div className="p-6 border glass-panel rounded-2xl border-white/10">
                  <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    <Wallet className="w-3 h-3" />
                    <span>Patrimoine propre non producteur de revenus (€)</span>
                    <InfoTooltip content="Valeur du patrimoine propre du créancier actuellement non producteur de revenus." />
                  </label>
                  <CurrencyInput
                    min="0"
                    value={creditorPropertyValue}
                    onValueChange={setCreditorPropertyValue}
                    placeholder="ex: 100 000"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />

                  {/* Toggle yield rate */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowYieldInput((v) => !v);
                      if (!showYieldInput && creditorPropertyYield === "")
                        setCreditorPropertyYield("3");
                    }}
                    className="mt-3 text-[10px] uppercase tracking-widest text-[var(--color-plasma-cyan)] hover:underline flex items-center space-x-1"
                  >
                    <Percent className="w-3 h-3" />
                    <span>
                      {showYieldInput
                        ? "Masquer le taux de rendement"
                        : "Modifier le taux de rendement ?"}
                    </span>
                  </button>

                  {showYieldInput && (
                    <div className="mt-3">
                      <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                        <Percent className="w-3 h-3" />
                        <span>Taux de rendement estimé (%)</span>
                        <InfoTooltip content="Taux de rendement annuel estimé du patrimoine non productif. Par défaut 3 %. Ce taux est propre au créancier." />
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={creditorPropertyYield}
                        onChange={(e) =>
                          setCreditorPropertyYield(e.target.value)
                        }
                        placeholder="3"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Écart de retraite */}
                <div className="p-6 border glass-panel rounded-2xl border-white/10">
                  <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    <Wallet className="w-3 h-3" />
                    <span>
                      Années sans cotisations retraite pendant le mariage
                    </span>
                    <InfoTooltip content="Nombre d'années sans cotisations retraite pendant le mariage (interruption de carrière, etc.). Laissez 0 si non applicable." />
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={creditorRetirementGapYears}
                    onChange={(e) =>
                      setCreditorRetirementGapYears(e.target.value)
                    }
                    placeholder="ex: 5"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                </div>

                <div className="p-6 border glass-panel rounded-2xl border-white/10">
                  <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    <Wallet className="w-3 h-3" />
                    <span>
                      Revenu mensuel avant cessation d'activité (€/mois)
                    </span>
                    <InfoTooltip content="Revenu mensuel moyen du créancier avant la cessation d'activité, utilisé pour calculer la réparation forfaitaire du déficit de retraite." />
                  </label>
                  <CurrencyInput
                    min="0"
                    value={creditorPreRetirementIncome}
                    onValueChange={setCreditorPreRetirementIncome}
                    placeholder="ex: 2 000"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </GuidedStep>
      </div>

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
          <span className="text-xs tracking-wider uppercase sm:text-sm sm:tracking-widest">
            <span className="sm:hidden">Valider</span>
            <span className="hidden sm:inline">Valider et poursuivre</span>
          </span>
          <ArrowRight className="w-4 h-4 transition-transform sm:w-5 sm:h-5 group-hover:translate-x-1" />
        </button>
      </div>
      <GuidedHeaderTour />
    </div>
  );
};

export default CreancierPage;
