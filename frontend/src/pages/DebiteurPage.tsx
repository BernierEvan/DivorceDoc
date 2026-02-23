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

const DebiteurPage: React.FC = () => {
  const navigate = useNavigate();
  const currentPath = "/informations-debiteur";
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
  const [spouseBirthDate, setSpouseBirthDate] = useState(
    stored.spouseBirthDate,
  );
  const [spouseIncome, setSpouseIncome] = useState(stored.spouseIncome);
  const [noIncomeDebiteur, setNoIncomeDebiteur] = useState(
    stored.spouseIncome === "0",
  );

  const [debtorGrossIncome, setDebtorGrossIncome] = useState(
    stored.debtorGrossIncome,
  );
  const [debtorIncomeMode, setDebtorIncomeMode] = useState(
    stored.debtorIncomeMode || "monthly",
  );
  const [debtorChildContribution, setDebtorChildContribution] = useState(
    stored.debtorChildContribution,
  );
  const [debtorFutureIncome, setDebtorFutureIncome] = useState(
    stored.debtorFutureIncome,
  );
  const [debtorFutureChildContribution, setDebtorFutureChildContribution] =
    useState(stored.debtorFutureChildContribution);
  const [debtorChangeDate, setDebtorChangeDate] = useState(
    stored.debtorChangeDate,
  );
  const [debtorPropertyValue, setDebtorPropertyValue] = useState(
    stored.debtorPropertyValue,
  );
  const [debtorPropertyYield, setDebtorPropertyYield] = useState(
    stored.debtorPropertyYield || "3",
  );
  const [showYieldInput, setShowYieldInput] = useState(
    stored.debtorPropertyYield !== "" && stored.debtorPropertyYield !== "3",
  );
  const [debtorExpectsRevenueChange, setDebtorExpectsRevenueChange] = useState(
    stored.debtorExpectsRevenueChange || "no",
  );

  const { currentStep, advanceStep, allDone, isGuided } = useGuidedSteps(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const save = () => {
    saveFormData({
      spouseBirthDate,
      spouseIncome,
      debtorGrossIncome,
      debtorIncomeMode,
      debtorChildContribution,
      debtorFutureIncome,
      debtorFutureChildContribution,
      debtorChangeDate,
      debtorPropertyValue,
      debtorPropertyYield,
      debtorExpectsRevenueChange,
    });
  };

  const handleNext = () => {
    save();
    navigate(getNextPage(currentPath));
  };

  return (
    <div className="h-[100dvh] bg-[var(--color-deep-space)] flex flex-col relative text-white overflow-hidden">
      <SEO
        title="Informations Débiteur — Simulation Divorce"
        description="Renseignez les informations du débiteur : date de naissance, revenus et projections financières."
        path="/informations-debiteur"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Informations Débiteur", path: "/informations-debiteur" },
        ])}
      />

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-plasma-cyan)]/10 rounded-full blur-[100px]" />

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
          Informations Débiteur
        </h1>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-white/10 group flex items-center justify-center"
          title="Accueil"
        >
          <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
      </div>

      {/* Progress */}
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
          Informations Débiteur
        </h1>
        <p className="text-sm text-gray-400">
          Renseignez les informations du débiteur : identité, revenus et
          projections.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-28 sm:pb-32 animate-fade-in relative z-10 scrollbar-hide space-y-8">
        {/* Editorial Block */}
        <div className="p-5 border rounded-2xl border-white/10 bg-white/[0.02]">
          <h3 className="text-sm font-bold text-white mb-2">
            Le rôle du débiteur dans le calcul
          </h3>
          <p className="text-xs leading-relaxed text-gray-400">
            Le débiteur est le conjoint dont les revenus et le patrimoine sont
            supérieurs. C'est lui qui sera amené à verser la prestation
            compensatoire. Ses revenus nets servent aux méthodes Tiers Pondéré
            et INSEE, tandis que les revenus bruts et les projections
            financières alimentent la méthode Calcul PC (Axel&nbsp;Depondt).
            Plus les informations sont précises, plus la simulation reflétera
            fidèlement l'estimation judiciaire.
          </p>
        </div>

        <GuidedStep
          step={0}
          currentStep={currentStep}
          totalSteps={1}
          onAdvance={advanceStep}
          content="Renseignez les informations du débiteur : date de naissance, revenus et projections financières."
          stepLabel="Débiteur"
          isComplete={true}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-teal-400" />
              <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
                Informations Débiteur
              </span>
            </div>

            {/* Date de naissance */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                <Calendar className="w-3 h-3" />
                <span>Date de naissance</span>
                <InfoTooltip content="L'âge du débiteur est utilisé dans la méthode Pilote pour pondérer la prestation compensatoire." />
              </label>
              <input
                type="date"
                value={spouseBirthDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSpouseBirthDate(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
              />
              {spouseBirthDate && (
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Âge : {computeAge(spouseBirthDate)} ans
                </p>
              )}
            </div>

            {/* Net Social */}
            {needsNetIncome && (
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Wallet className="w-3 h-3" />
                  <span>Net Social (€/mois)</span>
                  <InfoTooltip content="Le revenu net mensuel du débiteur. Ce montant est comparé à celui du créancier pour déterminer la disparité de niveau de vie." />
                </label>
                <CurrencyInput
                  min="0"
                  value={spouseIncome}
                  onValueChange={setSpouseIncome}
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
            )}

            {/* Projections Débiteur (Calcul PC) */}
            {showAxelDepondtSteps && (
              <>
                {/* Revenus actuels avant impôts */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    <TrendingUp className="w-3 h-3" />
                    <span>Revenus actuels avant impôts</span>
                    <InfoTooltip content="Revenus bruts (avant impôts) du débiteur. Vous pouvez saisir le montant annuel ou mensuel." />
                  </label>
                  <div className="flex mb-3 rounded-lg overflow-hidden border border-white/10">
                    <button
                      type="button"
                      onClick={() => setDebtorIncomeMode("monthly")}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all ${debtorIncomeMode === "monthly" ? "bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)] border-b-2 border-[var(--color-plasma-cyan)]" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                    >
                      Mensuel
                    </button>
                    <button
                      type="button"
                      onClick={() => setDebtorIncomeMode("annual")}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all ${debtorIncomeMode === "annual" ? "bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)] border-b-2 border-[var(--color-plasma-cyan)]" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                    >
                      Annuel
                    </button>
                  </div>
                  <CurrencyInput
                    min="0"
                    value={debtorGrossIncome}
                    onValueChange={setDebtorGrossIncome}
                    placeholder={
                      debtorIncomeMode === "annual" ? "ex: 42 000" : "ex: 3 500"
                    }
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                  {debtorGrossIncome && (
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {debtorIncomeMode === "annual"
                        ? `≈ ${Math.round(parseFloat(debtorGrossIncome) / 12).toLocaleString()} €/mois`
                        : `≈ ${Math.round(parseFloat(debtorGrossIncome) * 12).toLocaleString()} €/an`}
                    </p>
                  )}
                </div>

                {/* Contribution aux charges des enfants */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    <Wallet className="w-3 h-3" />
                    <span>
                      Contribution mensuelle pour les enfants (€/mois)
                    </span>
                    <InfoTooltip content="Montant que le débiteur verse pour la contribution à l'entretien et l'éducation des enfants (pension alimentaire, etc.)." />
                  </label>
                  <CurrencyInput
                    min="0"
                    value={debtorChildContribution}
                    onValueChange={setDebtorChildContribution}
                    placeholder="ex: 400"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                </div>

                {/* Changement de revenus prévu ? */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      Un changement de revenus est-il prévu dans les 8
                      prochaines années ?
                    </span>
                    <InfoTooltip content="Si le débiteur anticipe un changement de revenus dans les 8 ans (retraite, promotion, fin de contrat…), répondez Oui pour renseigner les détails." />
                  </label>
                  <div className="flex rounded-lg overflow-hidden border border-white/10">
                    <button
                      type="button"
                      onClick={() => setDebtorExpectsRevenueChange("no")}
                      className={`flex-1 py-3 text-sm font-bold transition-all ${debtorExpectsRevenueChange === "no" ? "bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)] border-b-2 border-[var(--color-plasma-cyan)]" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                    >
                      Non
                    </button>
                    <button
                      type="button"
                      onClick={() => setDebtorExpectsRevenueChange("yes")}
                      className={`flex-1 py-3 text-sm font-bold transition-all ${debtorExpectsRevenueChange === "yes" ? "bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)] border-b-2 border-[var(--color-plasma-cyan)]" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                    >
                      Oui
                    </button>
                  </div>
                </div>

                {/* Conditional: future income fields */}
                {debtorExpectsRevenueChange === "yes" && (
                  <>
                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                      <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                        <Wallet className="w-3 h-3" />
                        <span>
                          Revenu mensuel prévisible avant impôts (€/mois)
                        </span>
                        <InfoTooltip content="Montant futur mensuel brut (avant impôts) attendu après le changement de situation." />
                      </label>
                      <CurrencyInput
                        min="0"
                        value={debtorFutureIncome}
                        onValueChange={setDebtorFutureIncome}
                        placeholder="ex: 3 000"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                      />
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                      <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                        <Wallet className="w-3 h-3" />
                        <span>
                          Contribution prévisible pour les enfants (€/mois)
                        </span>
                        <InfoTooltip content="Montant prévisible de la contribution aux charges des enfants après le changement de situation du débiteur." />
                      </label>
                      <CurrencyInput
                        min="0"
                        value={debtorFutureChildContribution}
                        onValueChange={setDebtorFutureChildContribution}
                        placeholder="ex: 300"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                      />
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                      <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                        <Calendar className="w-3 h-3" />
                        <span>Date prévisible des modifications</span>
                        <InfoTooltip content="Date prévue du changement de situation (retraite, fin de contrat, etc.)." />
                      </label>
                      <input
                        type="date"
                        value={debtorChangeDate}
                        onChange={(e) => setDebtorChangeDate(e.target.value)}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Patrimoine propre non producteur */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    <Wallet className="w-3 h-3" />
                    <span>Patrimoine propre non producteur de revenus (€)</span>
                    <InfoTooltip content="Valeur du patrimoine propre du débiteur actuellement non producteur de revenus (biens non loués, épargne non placée, etc.)." />
                  </label>
                  <CurrencyInput
                    min="0"
                    value={debtorPropertyValue}
                    onValueChange={setDebtorPropertyValue}
                    placeholder="ex: 200 000"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />

                  {/* Toggle yield rate */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowYieldInput((v) => !v);
                      if (!showYieldInput && debtorPropertyYield === "")
                        setDebtorPropertyYield("3");
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
                        <InfoTooltip content="Taux de rendement annuel estimé du patrimoine non productif. Par défaut 3 %. Ce taux est propre au débiteur." />
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={debtorPropertyYield}
                        onChange={(e) => setDebtorPropertyYield(e.target.value)}
                        placeholder="3"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                      />
                    </div>
                  )}
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

export default DebiteurPage;
