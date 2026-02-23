import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, ChevronLeft, Home, Scale } from "lucide-react";
import { legalEngine, type SimulationResult } from "../services/legalEngine";
import { InfoTooltip } from "../components/InfoTooltip";
import { SEO } from "../components/SEO";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState<any>(null);
  const [calculations, setCalculations] = useState<SimulationResult | null>(
    null,
  );

  // Calculation choices from CalculationChoicePage
  const [calcChoices, setCalcChoices] = useState<{
    selectedCalcs: string[];
    selectedMethods: Record<string, string[]>;
  } | null>(null);

  useEffect(() => {
    // Stage A: Load Data
    const rawData = localStorage.getItem("financialData");
    if (!rawData) {
      navigate("/");
      return;
    }

    const data = JSON.parse(rawData);
    setFinancialData(data);

    // Stage B: Execute Engine
    const result = legalEngine.calculate(data);
    setCalculations(result);

    // Stage C: Load calculation choices
    const choicesRaw = localStorage.getItem("calculationChoices");
    if (choicesRaw) {
      try {
        setCalcChoices(JSON.parse(choicesRaw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  if (!financialData || !calculations) return <div />;

  // Determine which sections are visible (if no choices saved, show all)
  const showPC =
    !calcChoices ||
    calcChoices.selectedCalcs.includes("prestationCompensatoire");

  // PC method visibility
  const pcMethods = calcChoices?.selectedMethods?.prestationCompensatoire || [
    "axelDepondt",
    "pilote",
    "insee",
  ];
  const showAxelDepondt = pcMethods.includes("axelDepondt");
  const showPilote = pcMethods.includes("pilote");
  const showInsee = pcMethods.includes("insee");
  const pcMethodCount = [showAxelDepondt, showPilote, showInsee].filter(
    Boolean,
  ).length;
  const multiplePCMethods = pcMethodCount > 1;

  // Determine displayed PC main value based on selected methods (dynamic average)
  const activePCValues: number[] = [];
  if (showAxelDepondt && calculations.details?.axelDepondt)
    activePCValues.push(calculations.details.axelDepondt.value);
  if (showPilote) activePCValues.push(calculations.details.pilote.value);
  if (showInsee) activePCValues.push(calculations.details.insee.value);
  const pcMainValue =
    activePCValues.length > 0
      ? Math.round(
          activePCValues.reduce((a, b) => a + b, 0) / activePCValues.length,
        )
      : calculations.compensatoryAllowance;

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col text-white pb-20">
      <SEO
        title="Résultats de la Simulation"
        description="Visualisez les résultats de votre simulation de divorce."
        path="/dashboard"
        noindex={true}
      />
      {/* Top Bar */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-black/20 backdrop-blur-md border-white/5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase text-glow">
          Tableau de Bord
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 group"
            title="Accueil"
          >
            <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
          </button>
          <button
            onClick={() =>
              navigate("/transition?from=dashboard-to-export&next=/export")
            }
            className="p-2.5 rounded-xl bg-[var(--accent-primary)]/15 hover:bg-[var(--accent-primary)]/25 transition group flex items-center justify-center"
            title="Télécharger le rapport"
          >
            <Download className="w-6 h-6 text-[var(--accent-primary)] group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="z-10 flex-1 px-4 py-6 pb-32 overflow-y-auto scrollbar-hide">
        <div className="pb-10 space-y-4 animate-fade-in">
          {/* Prominent Download Button */}
          <button
            onClick={() =>
              navigate("/transition?from=dashboard-to-export&next=/export")
            }
            className="w-full bg-[var(--color-plasma-cyan)] hover:bg-[var(--accent-hover)] text-white font-bold py-5 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2 sm:gap-3 group active:scale-95"
            style={{ color: "#ffffff" }}
          >
            <Download className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 group-hover:translate-y-0.5 transition-transform" />
            <span className="text-xs tracking-widest uppercase sm:text-base">
              Télécharger le rapport PDF
            </span>
          </button>

          {/* Compensatory Allowance */}
          {showPC && (
            <div className="relative col-span-2 p-6 overflow-hidden border glass-panel rounded-2xl border-white/10 group">
              <div className="absolute top-0 right-0 p-4 transition-opacity opacity-10 group-hover:opacity-20">
                <Scale className="w-24 h-24 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="mb-2 text-xs font-bold tracking-widest text-gray-400 uppercase leading-relaxed">
                  Prestation Compensatoire Estimée{" "}
                  <span className="inline-block align-middle ml-0.5">
                    <InfoTooltip content="La prestation compensatoire vise à compenser la disparité de niveau de vie entre les époux après le divorce. Elle est versée en capital (somme forfaitaire) par l'époux le plus aisé à celui qui subit une baisse de revenus." />
                  </span>
                </h3>
                <div className="flex flex-wrap items-baseline space-x-2">
                  <span className="text-4xl sm:text-5xl font-bold text-[var(--color-plasma-cyan)] text-glow">
                    {pcMainValue.toLocaleString()} €
                  </span>
                  <span className="text-sm text-gray-400">
                    {multiplePCMethods ? "moy." : "est."}
                  </span>
                </div>

                {/* Dual Method Details with Ranges */}
                <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                  {/* Pilote */}
                  {showPilote && (
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 hover:border-[var(--color-plasma-cyan)]/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">
                          Méthode du Tiers
                        </span>
                        <span className="font-mono text-[var(--color-plasma-cyan)]">
                          {calculations.details?.pilote.value.toLocaleString()}{" "}
                          €
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Insee */}
                  {showInsee && (
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 hover:border-[var(--color-plasma-cyan)]/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">
                          Méthode Insee
                        </span>
                        <span className="font-mono text-[var(--color-plasma-cyan)]">
                          {calculations.details?.insee.value.toLocaleString()} €
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Calcul PC */}
                  {showAxelDepondt && calculations.details?.axelDepondt && (
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 hover:border-[var(--color-plasma-cyan)]/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">
                          Méthode Calcul PC
                        </span>
                        <span className="font-mono text-[var(--color-plasma-cyan)]">
                          {calculations.details.axelDepondt.value.toLocaleString()}{" "}
                          €
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info about averaging when both methods selected */}
                {multiplePCMethods && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20">
                    <p className="text-xs text-[var(--accent-primary)]">
                      ✓ Résultat final = Moyenne des {pcMethodCount} méthodes
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
