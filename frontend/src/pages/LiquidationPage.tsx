import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, Home, Building2 } from "lucide-react";
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

const LiquidationPage: React.FC = () => {
  const navigate = useNavigate();
  const currentPath = "/liquidation";
  const pageIdx = getPageIndex(currentPath);
  const totalPages = getTotalPages();

  const stored = loadFormData();

  // Determine whether regime was already asked on a previous page
  const regimeAlreadyAsked = isFieldAlreadyAsked(
    "matrimonialRegime",
    currentPath,
  );

  const [matrimonialRegime, setMatrimonialRegime] = useState(
    stored.matrimonialRegime,
  );
  const [assetsValue, setAssetsValue] = useState(stored.assetsValue);
  const [assetsCRD, setAssetsCRD] = useState(stored.assetsCRD);
  const [rewardsAlice, setRewardsAlice] = useState(stored.rewardsAlice);
  const [rewardsBob, setRewardsBob] = useState(stored.rewardsBob);

  // Dynamic step count: regime section only if not already asked
  const showRegimeSection = !regimeAlreadyAsked;
  const showRewardsSection = matrimonialRegime !== "separation";

  const guidedSections = useMemo(() => {
    const sections: string[] = [];
    if (showRegimeSection) sections.push("regime");
    sections.push("capital");
    if (showRewardsSection) sections.push("recompenses");
    return sections;
  }, [showRegimeSection, showRewardsSection]);

  const { currentStep, advanceStep, allDone, isGuided } = useGuidedSteps(
    guidedSections.length,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNext = () => {
    saveFormData({
      matrimonialRegime,
      assetsValue,
      assetsCRD,
      rewardsAlice: matrimonialRegime === "separation" ? 0 : rewardsAlice,
      rewardsBob: matrimonialRegime === "separation" ? 0 : rewardsBob,
    });
    navigate(getNextPage(currentPath));
  };

  // Helper to get step index for a section
  const stepIdx = (name: string) => guidedSections.indexOf(name);

  return (
    <div className="h-[100dvh] bg-[var(--color-deep-space)] flex flex-col relative text-white overflow-hidden">
      <SEO
        title="Liquidation (Soulte) — Simulation Divorce"
        description="Renseignez les informations nécessaires au calcul de la liquidation du régime matrimonial et de la soulte."
        path="/liquidation"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Liquidation (Soulte)", path: "/liquidation" },
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
          Liquidation (Soulte)
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
          Liquidation (Soulte)
        </h1>
        <p className="text-sm text-gray-400">
          Partage du patrimoine commun et calcul de la soulte éventuelle.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-28 sm:pb-32 animate-fade-in relative z-10 scrollbar-hide space-y-8">
        {/* ── Section: Régime (only if not already asked) ── */}
        {showRegimeSection && (
          <GuidedStep
            step={stepIdx("regime")}
            currentStep={currentStep}
            totalSteps={guidedSections.length}
            onAdvance={advanceStep}
            content="Sélectionnez votre régime matrimonial. Le mode de calcul de la soulte diffère selon le régime : communauté (avec récompenses) ou séparation de biens (indivision simple)."
            stepLabel="Régime"
            isComplete={true}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                  Liquidation (Soulte) — Régime
                </span>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                  <span>Régime Matrimonial</span>
                  <InfoTooltip content="Le régime matrimonial détermine comment les biens sont partagés. En communauté, les biens acquis pendant le mariage sont partagés à 50/50 après déduction des récompenses. En séparation, seuls les biens en indivision sont partagés." />
                </label>
                <div className="space-y-3">
                  {[
                    { key: "community", label: "Communauté" },
                    { key: "separation", label: "Séparation de biens" },
                  ].map((r) => (
                    <button
                      key={r.key}
                      onClick={() => setMatrimonialRegime(r.key)}
                      className={`w-full p-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
                        matrimonialRegime === r.key
                          ? "border-[var(--color-plasma-cyan)] bg-[var(--color-plasma-cyan)]/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                          : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GuidedStep>
        )}

        {/* ── Section: Capital ── */}
        <GuidedStep
          step={stepIdx("capital")}
          currentStep={currentStep}
          totalSteps={guidedSections.length}
          onAdvance={advanceStep}
          content="Renseignez la valeur vénale du bien immobilier (prix de marché) et le capital restant dû sur le crédit. Le patrimoine net = Valeur − CRD."
          stepLabel="Capital"
          isComplete={true}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                Liquidation (Soulte) — Capital
              </span>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-6">
                <Home className="w-3 h-3" /> <span>Patrimoine Immobilier</span>
                <InfoTooltip content="Ces données servent au calcul de la soulte en cas de liquidation d'un bien commun ou en indivision." />
              </label>

              <div className="space-y-5">
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center space-x-2">
                    <span>Valeur vénale du bien (€)</span>
                    <InfoTooltip content="C'est le prix de marché du bien immobilier, estimé par un agent immobilier ou un expert. Il sert de base pour le calcul du patrimoine net et de la soulte." />
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={assetsValue || ""}
                    onChange={(e) =>
                      setAssetsValue(parseFloat(e.target.value) || 0)
                    }
                    placeholder="ex: 250 000"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center space-x-2">
                    <span>Capital Restant Dû (CRD) (€)</span>
                    <InfoTooltip content="Le Capital Restant Dû est le montant qu'il reste à rembourser sur le crédit immobilier. Il est déduit de la valeur du bien pour obtenir le patrimoine net (Pnet = Valeur − CRD)." />
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={assetsCRD || ""}
                    onChange={(e) =>
                      setAssetsCRD(parseFloat(e.target.value) || 0)
                    }
                    placeholder="ex: 120 000"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                  />
                </div>

                {/* Net preview */}
                {assetsValue > 0 && (
                  <div className="text-xs text-[var(--text-muted)] mt-1 p-3 bg-white/5 rounded-lg">
                    Patrimoine net :{" "}
                    <span className="font-mono text-[var(--color-plasma-cyan)]">
                      {(assetsValue - assetsCRD).toLocaleString("fr-FR")} €
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GuidedStep>

        {/* ── Section: Récompenses (Only for Communauté) ── */}
        {showRewardsSection && (
          <GuidedStep
            step={stepIdx("recompenses")}
            currentStep={currentStep}
            totalSteps={guidedSections.length}
            onAdvance={advanceStep}
            content="Les récompenses sont les sommes que la communauté doit rembourser à chaque époux ayant utilisé des fonds propres (héritage, donation, épargne antérieure) pour un bien commun. Elles ajustent le partage final de la soulte."
            stepLabel="Récompenses"
            isComplete={true}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                  Liquidation (Soulte) — Récompenses
                </span>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-6">
                  <span>Récompenses</span>
                  <InfoTooltip content="Les récompenses sont les apports propres de chaque époux (héritage, donation, épargne antérieure) utilisés pour acquérir un bien commun. Elles sont déduites de la part de l'autre époux lors du calcul de la soulte." />
                </label>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 flex items-center space-x-2">
                      <span>
                        Récompenses Créancier (apport propre/héritage) (€)
                      </span>
                      <InfoTooltip content="Somme propre du créancier apportée à la communauté. Elle sera ajoutée à sa part lors du partage." />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={rewardsAlice || ""}
                      onChange={(e) =>
                        setRewardsAlice(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Récompenses Débiteur (apport propre/héritage) (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={rewardsBob || ""}
                      onChange={(e) =>
                        setRewardsBob(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--color-plasma-cyan)] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </GuidedStep>
        )}
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

export default LiquidationPage;
