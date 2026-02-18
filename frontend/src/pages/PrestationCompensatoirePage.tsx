import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  ArrowRight,
  AlertTriangle,
  X,
  ChevronLeft,
  Home,
  User,
  Wallet,
  Scale,
  TrendingUp,
} from "lucide-react";
import { InfoTooltip } from "../components/InfoTooltip";
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

const PrestationCompensatoirePage: React.FC = () => {
  const navigate = useNavigate();
  const currentPath = "/prestation-compensatoire";
  const pageIdx = getPageIndex(currentPath);
  const totalPages = getTotalPages();

  // Load stored data
  const stored = loadFormData();

  // Local state
  const [marriageDate, setMarriageDate] = useState(stored.marriageDate);
  const [divorceDate, setDivorceDate] = useState(stored.divorceDate);
  const [myBirthDate, setMyBirthDate] = useState(stored.myBirthDate);
  const [spouseBirthDate, setSpouseBirthDate] = useState(
    stored.spouseBirthDate,
  );
  const [myIncome, setMyIncome] = useState(stored.myIncome);
  const [spouseIncome, setSpouseIncome] = useState(stored.spouseIncome);
  const [childrenCount, setChildrenCount] = useState(stored.childrenCount);
  const [childrenAges, setChildrenAges] = useState<number[]>(
    stored.childrenAges,
  );
  const [custodyType, setCustodyType] = useState(stored.custodyType);
  const [matrimonialRegime] = useState(stored.matrimonialRegime);

  const [noIncomeCreancier, setNoIncomeCreancier] = useState(
    stored.myIncome === "0",
  );
  const [noIncomeDebiteur, setNoIncomeDebiteur] = useState(
    stored.spouseIncome === "0",
  );

  const [showDateModal, setShowDateModal] = useState(false);
  const [dateModalError, setDateModalError] = useState("");
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeModalError, setIncomeModalError] = useState("");

  // ── Method flags ──
  const { selectedMethods } = getCalculationChoices();
  const pcMethods = selectedMethods.prestationCompensatoire || [];
  const showAxelDepondtSteps = pcMethods.includes("axelDepondt");
  const needsNetIncome =
    pcMethods.includes("pilote") ||
    pcMethods.includes("insee") ||
    pcMethods.includes("paBased");
  const needsFamilyData =
    pcMethods.includes("insee") || pcMethods.includes("paBased");

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
    stored.debtorPropertyYield,
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
    stored.creditorPropertyYield,
  );
  const [creditorRetirementGapYears, setCreditorRetirementGapYears] = useState(
    stored.creditorRetirementGapYears,
  );
  const [creditorPreRetirementIncome, setCreditorPreRetirementIncome] =
    useState(stored.creditorPreRetirementIncome);
  const [debtorExpectsRevenueChange, setDebtorExpectsRevenueChange] = useState(
    stored.debtorExpectsRevenueChange || "no",
  );
  const [creditorExpectsRevenueChange, setCreditorExpectsRevenueChange] =
    useState(stored.creditorExpectsRevenueChange || "no");

  const guidedSections = useMemo(() => {
    const s: string[] = ["mariage", "identite"];
    if (needsNetIncome) {
      s.push("revenus");
    }
    if (showAxelDepondtSteps) {
      s.push("projDebiteur", "projCreancier");
    }
    if (needsFamilyData) {
      s.push("famille");
    }
    return s;
  }, [showAxelDepondtSteps, needsNetIncome, needsFamilyData]);

  const { currentStep, advanceStep, allDone, isGuided } = useGuidedSteps(
    guidedSections.length,
  );

  const stepIdx = (name: string) => guidedSections.indexOf(name);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const save = () => {
    saveFormData({
      marriageDate,
      divorceDate,
      myBirthDate,
      spouseBirthDate,
      myIncome,
      spouseIncome,
      childrenCount,
      childrenAges,
      custodyType,
      matrimonialRegime,
      debtorGrossIncome,
      debtorIncomeMode,
      debtorChildContribution,
      debtorFutureIncome,
      debtorFutureChildContribution,
      debtorChangeDate,
      debtorPropertyValue,
      debtorPropertyYield,
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
      debtorExpectsRevenueChange,
      creditorExpectsRevenueChange,
    });
  };

  const handleNext = () => {
    if (!marriageDate) {
      setDateModalError("Veuillez entrer une date de mariage pour continuer.");
      setShowDateModal(true);
      return;
    }
    if (new Date(marriageDate) > new Date()) {
      setDateModalError("La date de mariage ne peut pas être dans le futur.");
      setShowDateModal(true);
      return;
    }
    // Income validation (only needed for Pilote / INSEE / PA-based methods)
    if (needsNetIncome) {
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
    }
    save();
    navigate(getNextPage(currentPath));
  };

  const handleModalConfirm = () => {
    if (!marriageDate) {
      setDateModalError("Veuillez entrer une date de mariage.");
      return;
    }
    if (new Date(marriageDate) > new Date()) {
      setDateModalError("La date de mariage ne peut pas être dans le futur.");
      return;
    }
    setShowDateModal(false);
    setDateModalError("");
    save();
    navigate(getNextPage(currentPath));
  };

  return (
    <div className="h-[100dvh] bg-[var(--color-deep-space)] flex flex-col relative text-white overflow-hidden">
      <SEO
        title="Prestation Compensatoire — Simulation Divorce"
        description="Renseignez les informations nécessaires au calcul de la prestation compensatoire : mariage, identité, revenus, famille."
        path="/prestation-compensatoire"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          {
            name: "Prestation Compensatoire",
            path: "/prestation-compensatoire",
          },
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
          Prestation Compensatoire
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
          Prestation Compensatoire
        </h1>
        <p className="text-sm text-gray-400">
          Renseignez les informations nécessaires au calcul de la prestation
          compensatoire.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-28 sm:pb-32 animate-fade-in relative z-10 scrollbar-hide space-y-8">
        {/* ── Section 1: Mariage ── */}
        <GuidedStep
          step={stepIdx("mariage")}
          currentStep={currentStep}
          totalSteps={guidedSections.length}
          onAdvance={advanceStep}
          content="Entrez la date de votre mariage et, si connue, la date de divorce ou séparation. La durée du mariage est un critère clé de la prestation compensatoire."
          stepLabel="Mariage"
          isComplete={!!marriageDate}
        >
          <div className="space-y-6">
            {/* Category label */}
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-teal-400" />
              <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
                Prestation Compensatoire — Mariage
              </span>
            </div>

            {/* Marriage Date */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                <Calendar className="w-3 h-3" /> <span>Date de Mariage</span>
              </label>
              <input
                type="date"
                value={marriageDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setMarriageDate(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
              />
            </div>

            {/* Divorce Date */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                <Calendar className="w-3 h-3" />{" "}
                <span>Date de Divorce / Séparation</span>
                <InfoTooltip content="Indiquez la date du prononcé du divorce, ou à défaut la date de séparation effective. Cette date sert à calculer la durée du mariage." />
              </label>
              <input
                type="date"
                value={divorceDate}
                min={marriageDate || undefined}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDivorceDate(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
              />
              {marriageDate && divorceDate && (
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Durée du mariage :{" "}
                  {Math.max(
                    0,
                    Math.round(
                      (new Date(divorceDate).getTime() -
                        new Date(marriageDate).getTime()) /
                        (1000 * 60 * 60 * 24 * 365.25),
                    ),
                  )}{" "}
                  ans
                </p>
              )}
            </div>
          </div>
        </GuidedStep>

        {/* ── Section 2: Identité ── */}
        <GuidedStep
          step={stepIdx("identite")}
          currentStep={currentStep}
          totalSteps={guidedSections.length}
          onAdvance={advanceStep}
          content="L'âge des parties est utilisé dans la méthode Pilote pour pondérer la prestation compensatoire. Plus le créancier est âgé, plus le coefficient est élevé."
          stepLabel="Identité"
          isComplete={true}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-teal-400" />
              <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
                Prestation Compensatoire — Identité
              </span>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-6">
                <User className="w-3 h-3" /> <span>Dates de Naissance</span>
                <InfoTooltip content="L'âge est un critère déterminant pour la méthode Pilote. Il est calculé automatiquement à partir de la date de naissance." />
              </label>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm mb-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Date de naissance — Créancier</span>
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

                <div>
                  <label className="flex items-center space-x-2 text-sm mb-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Date de naissance — Débiteur</span>
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
              </div>
            </div>
          </div>
        </GuidedStep>

        {/* ── Section 3: Revenus (for Pilote / INSEE / PA-based) ── */}
        {needsNetIncome && (
          <GuidedStep
            step={stepIdx("revenus")}
            currentStep={currentStep}
            totalSteps={guidedSections.length}
            onAdvance={advanceStep}
            content="Indiquez les revenus nets mensuels du créancier et du débiteur. La différence de revenus détermine la disparité de niveau de vie, base du calcul de la prestation compensatoire."
            stepLabel="Revenus"
            isComplete={true}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-teal-400" />
                <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
                  Prestation Compensatoire — Revenus
                </span>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-6">
                  <Wallet className="w-3 h-3" /> <span>Revenus Mensuels</span>
                  <InfoTooltip content="Le Net Social sert de base pour le calcul de la prestation compensatoire, de la pension alimentaire et du reste à vivre." />
                </label>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 flex items-center space-x-2">
                      <span>Net Social Débiteur (€/mois)</span>
                      <InfoTooltip content="Le revenu net mensuel de votre conjoint (débiteur). Ce montant est comparé au vôtre pour déterminer la disparité de niveau de vie." />
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
                      <span className="text-xs text-gray-400">
                        Aucun Revenu
                      </span>
                    </label>
                  </div>
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
                      <span className="text-xs text-gray-400">
                        Aucun Revenu
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </GuidedStep>
        )}

        {/* ── Section (conditional): Projections Débiteur ── */}
        {showAxelDepondtSteps && (
          <GuidedStep
            step={stepIdx("projDebiteur")}
            currentStep={currentStep}
            totalSteps={guidedSections.length}
            onAdvance={advanceStep}
            content="Renseignez les revenus bruts et projections du débiteur pour la méthode Calcul PC : revenus avant impôts, contributions enfants, patrimoine."
            stepLabel="Projections Débiteur"
            isComplete={true}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
                  Calcul PC — Projections Débiteur
                </span>
              </div>

              {/* Revenus actuels avant impôts */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Wallet className="w-3 h-3" />
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
                <input
                  type="number"
                  min="0"
                  value={debtorGrossIncome}
                  onChange={(e) => setDebtorGrossIncome(e.target.value)}
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
                  <span>Contribution mensuelle pour les enfants (€/mois)</span>
                  <InfoTooltip content="Montant que le débiteur verse pour la contribution à l'entretien et l'éducation des enfants (pension alimentaire, etc.)." />
                </label>
                <input
                  type="number"
                  min="0"
                  value={debtorChildContribution}
                  onChange={(e) => setDebtorChildContribution(e.target.value)}
                  placeholder="ex: 400"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                />
              </div>

              {/* Changement de revenus prévu ? */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    Un changement de revenus est-il prévu dans les 8 prochaines
                    années ?
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
                    <input
                      type="number"
                      min="0"
                      value={debtorFutureIncome}
                      onChange={(e) => setDebtorFutureIncome(e.target.value)}
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
                    <input
                      type="number"
                      min="0"
                      value={debtorFutureChildContribution}
                      onChange={(e) =>
                        setDebtorFutureChildContribution(e.target.value)
                      }
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
                <input
                  type="number"
                  min="0"
                  value={debtorPropertyValue}
                  onChange={(e) => setDebtorPropertyValue(e.target.value)}
                  placeholder="ex: 200 000"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                />
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Wallet className="w-3 h-3" />
                  <span>Taux estimé de rendement annuel (%)</span>
                  <InfoTooltip content="Taux de rendement annuel estimé que pourrait produire ce patrimoine s'il était exploité (ex: 3%)." />
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={debtorPropertyYield}
                  onChange={(e) => setDebtorPropertyYield(e.target.value)}
                  placeholder="ex: 3"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                />
              </div>
            </div>
          </GuidedStep>
        )}

        {/* ── Section (conditional): Projections Créancier ── */}
        {showAxelDepondtSteps && (
          <GuidedStep
            step={stepIdx("projCreancier")}
            currentStep={currentStep}
            totalSteps={guidedSections.length}
            onAdvance={advanceStep}
            content="Renseignez les revenus bruts et projections du créancier : revenus avant impôts, contributions enfants, patrimoine, écart de retraite."
            stepLabel="Projections Créancier"
            isComplete={true}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
                  Calcul PC — Projections Créancier
                </span>
              </div>

              {/* Revenus actuels avant impôts */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Wallet className="w-3 h-3" />
                  <span>Revenus actuels avant impôts</span>
                  <InfoTooltip content="Revenus bruts (avant impôts) du créancier. Vous pouvez saisir le montant annuel ou mensuel." />
                </label>
                <div className="flex mb-3 rounded-lg overflow-hidden border border-white/10">
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
                <input
                  type="number"
                  min="0"
                  value={creditorGrossIncome}
                  onChange={(e) => setCreditorGrossIncome(e.target.value)}
                  placeholder={
                    creditorIncomeMode === "annual" ? "ex: 24 000" : "ex: 2 000"
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
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Wallet className="w-3 h-3" />
                  <span>Contribution mensuelle pour les enfants (€/mois)</span>
                  <InfoTooltip content="Montant que le créancier verse pour la contribution aux charges des enfants." />
                </label>
                <input
                  type="number"
                  min="0"
                  value={creditorChildContribution}
                  onChange={(e) => setCreditorChildContribution(e.target.value)}
                  placeholder="ex: 200"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                />
              </div>

              {/* Changement de revenus prévu ? */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    Un changement de revenus est-il prévu dans les 8 prochaines
                    années ?
                  </span>
                  <InfoTooltip content="Si le créancier anticipe un changement de revenus dans les 8 ans (reprise d'emploi, retraite, promotion…), répondez Oui pour renseigner les détails." />
                </label>
                <div className="flex rounded-lg overflow-hidden border border-white/10">
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
                  <div className="glass-panel p-6 rounded-2xl border border-white/10">
                    <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                      <Wallet className="w-3 h-3" />
                      <span>
                        Revenu mensuel prévisible avant impôts (€/mois)
                      </span>
                      <InfoTooltip content="Montant futur mensuel brut (avant impôts) attendu après le changement de situation." />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={creditorFutureIncome}
                      onChange={(e) => setCreditorFutureIncome(e.target.value)}
                      placeholder="ex: 1 800"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                    />
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-white/10">
                    <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                      <Wallet className="w-3 h-3" />
                      <span>
                        Contribution prévisible pour les enfants (€/mois)
                      </span>
                      <InfoTooltip content="Montant prévisible de la contribution aux charges des enfants après le changement de situation du créancier." />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={creditorFutureChildContribution}
                      onChange={(e) =>
                        setCreditorFutureChildContribution(e.target.value)
                      }
                      placeholder="ex: 150"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                    />
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-white/10">
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
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Wallet className="w-3 h-3" />
                  <span>Patrimoine propre non producteur de revenus (€)</span>
                  <InfoTooltip content="Valeur du patrimoine propre du créancier actuellement non producteur de revenus." />
                </label>
                <input
                  type="number"
                  min="0"
                  value={creditorPropertyValue}
                  onChange={(e) => setCreditorPropertyValue(e.target.value)}
                  placeholder="ex: 100000"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                />
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Wallet className="w-3 h-3" />
                  <span>Taux estimé de rendement annuel (%)</span>
                  <InfoTooltip content="Taux de rendement annuel estimé que pourrait produire ce patrimoine s'il était exploité (ex: 3%)." />
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={creditorPropertyYield}
                  onChange={(e) => setCreditorPropertyYield(e.target.value)}
                  placeholder="ex: 3"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                />
              </div>

              {/* Écart de retraite */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
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

              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <Wallet className="w-3 h-3" />
                  <span>
                    Revenu mensuel avant cessation d'activité (€/mois)
                  </span>
                  <InfoTooltip content="Revenu mensuel moyen du créancier avant la cessation d'activité, utilisé pour calculer la réparation forfaitaire du déficit de retraite." />
                </label>
                <input
                  type="number"
                  min="0"
                  value={creditorPreRetirementIncome}
                  onChange={(e) =>
                    setCreditorPreRetirementIncome(e.target.value)
                  }
                  placeholder="ex: 2000"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                />
              </div>
            </div>
          </GuidedStep>
        )}

        {/* ── Section 4: Famille (for INSEE / PA-based) ── */}
        {needsFamilyData && (
          <GuidedStep
            step={stepIdx("famille")}
            currentStep={currentStep}
            totalSteps={guidedSections.length}
            onAdvance={advanceStep}
            content="Les informations familiales (enfants, garde) influencent le calcul de la prestation compensatoire via les unités de consommation (UC OCDE) et déterminent également le montant de la pension alimentaire."
            stepLabel="Famille"
            isComplete={true}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-teal-400" />
                <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
                  Prestation Compensatoire — Famille
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
                    <InfoTooltip content="L'âge de chaque enfant détermine les unités de consommation OCDE (< 14 ans = 0.3 UC, ≥ 14 ans = 0.5 UC) et influence le calcul de la prestation compensatoire." />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: childrenCount }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-400 shrink-0">
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
                          className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none text-center w-20 min-w-[5rem]"
                        />
                        <span className="text-sm text-gray-500 shrink-0">
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
        )}
      </div>

      {/* Date Modal */}
      {showDateModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setShowDateModal(false);
            setDateModalError("");
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
                <h3 className="text-lg font-bold text-white">
                  Date de mariage requise
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDateModal(false);
                  setDateModalError("");
                }}
                className="text-gray-400 hover:text-white transition p-2 rounded-full hover:bg-white/10 cursor-pointer"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                {dateModalError ||
                  "Veuillez entrer votre date de mariage pour continuer la simulation."}
              </p>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Date de mariage
                </label>
                <input
                  type="date"
                  value={marriageDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setMarriageDate(e.target.value);
                    setDateModalError("");
                  }}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                />
              </div>
              <button
                onClick={handleModalConfirm}
                className="w-full bg-[var(--color-plasma-cyan)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95"
                style={{ color: "#ffffff" }}
              >
                <span className="tracking-widest text-sm uppercase">
                  Continuer
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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

export default PrestationCompensatoirePage;
