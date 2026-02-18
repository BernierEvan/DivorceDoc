import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Home,
  ArrowRight,
  Scale,
  Wallet,
  Building2,
  HeartPulse,
  CheckSquare,
  Square,
  CheckCircle,
  Circle,
  Zap,
  BarChart3,
  Target,
  SearchCheck,
} from "lucide-react";
import { SEO, breadcrumbJsonLd } from "../components/SEO";

interface MethodOption {
  id: string;
  label: string;
  description: string;
}

interface CalculationOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  methods: MethodOption[];
}

const CALCULATION_OPTIONS: CalculationOption[] = [
  {
    id: "prestationCompensatoire",
    label: "Prestation Compensatoire",
    description:
      "Compense la disparité de niveau de vie entre les époux après le divorce.",
    icon: <Scale className="w-6 h-6" />,
    color: "text-teal-400",
    methods: [
      {
        id: "axelDepondt",
        label: "Méthode Calcul PC",
        description:
          "Approche détaillée : projections revenus sur 8 ans, patrimoine, pondération durée × âge, réparation retraite.",
      },
      {
        id: "pilote",
        label: "Méthode du Tiers Pondéré",
        description:
          "PC = (Différentiel annuel / 3) × (Durée / 2) × Coefficient d'âge. Intervalle ±10%.",
      },
      {
        id: "insee",
        label: "Méthode INSEE (UC OCDE)",
        description:
          "Capitalisation de la perte de niveau de vie sur 8 ans max. Taux 15% / 20% / 25%.",
      },
      {
        id: "paBased",
        label: "Méthode Pension Alimentaire",
        description:
          "PC = PA mensuelle × 12 × coefficient 8. Intervalle coefficient 6 à 10.",
      },
    ],
  },
  {
    id: "pensionAlimentaire",
    label: "Pension Alimentaire",
    description:
      "Contribution mensuelle à l'entretien et l'éducation des enfants.",
    icon: <Wallet className="w-6 h-6" />,
    color: "text-amber-400",
    methods: [
      {
        id: "baremeMJ",
        label: "Barème Ministère de la Justice 2026",
        description:
          "PA = (Revenu débiteur − RSA) × Taux selon nombre d'enfants et type de garde.",
      },
    ],
  },
  {
    id: "liquidation",
    label: "Liquidation (Soulte)",
    description:
      "Partage du patrimoine commun et calcul de la soulte éventuelle.",
    icon: <Building2 className="w-6 h-6" />,
    color: "text-indigo-400",
    methods: [
      {
        id: "communaute",
        label: "Régime Communauté (Acquêts)",
        description:
          "Soulte = (Patrimoine net + Récompenses débiteur − Récompenses créancier) / 2.",
      },
      {
        id: "separation",
        label: "Régime Séparation de Biens",
        description: "Soulte = Patrimoine net en indivision / 2.",
      },
    ],
  },
  {
    id: "resteAVivre",
    label: "Reste à Vivre",
    description:
      "Budget mensuel restant après toutes charges. Alerte si inférieur au seuil de pauvreté.",
    icon: <HeartPulse className="w-6 h-6" />,
    color: "text-emerald-400",
    methods: [
      {
        id: "budget",
        label: "Calcul Budgétaire Complet",
        description:
          "Reste = Revenus + PA reçue − Impôts − Loyer − Charges − PA versée.",
      },
    ],
  },
];

// ── Presets (sélection rapide) ──
interface Preset {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  calcs: Record<string, string[]>; // calcId → methodIds[]
}

const PRESETS: Preset[] = [
  {
    id: "express",
    label: "Express",
    description:
      "Estimation rapide : deux méthodes de PC complémentaires. Peu d'informations requises.",
    icon: <Zap className="w-5 h-5" />,
    color: "text-amber-400",
    calcs: {
      prestationCompensatoire: ["pilote", "insee"],
    },
  },
  {
    id: "standard",
    label: "Standard",
    description:
      "Bon compromis précision / simplicité : trois méthodes de PC complémentaires + pension alimentaire.",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "text-sky-400",
    calcs: {
      prestationCompensatoire: ["pilote", "insee", "paBased"],
      pensionAlimentaire: ["baremeMJ"],
    },
  },
  {
    id: "pcPrecision",
    label: "PC — Précision maximale",
    description:
      "Les 4 méthodes de prestation compensatoire pour le résultat le plus fiable (moyenne). Inclut la pension alimentaire (requise par la méthode PA).",
    icon: <Target className="w-5 h-5" />,
    color: "text-teal-400",
    calcs: {
      prestationCompensatoire: ["axelDepondt", "pilote", "insee", "paBased"],
      pensionAlimentaire: ["baremeMJ"],
    },
  },
  {
    id: "complete",
    label: "Analyse complète",
    description:
      "Tous les calculs et toutes les méthodes : PC, pension alimentaire, liquidation et reste à vivre.",
    icon: <SearchCheck className="w-5 h-5" />,
    color: "text-emerald-400",
    calcs: {
      prestationCompensatoire: ["axelDepondt", "pilote", "insee", "paBased"],
      pensionAlimentaire: ["baremeMJ"],
      liquidation: ["communaute", "separation"],
      resteAVivre: ["budget"],
    },
  },
];

const CalculationChoicePage: React.FC = () => {
  const navigate = useNavigate();

  // Load saved choices from localStorage (lazy initialization)
  const [selectedCalcs, setSelectedCalcs] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("calculationChoices");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedCalcs) return new Set(parsed.selectedCalcs);
      } catch {
        /* ignore */
      }
    }
    return new Set();
  });

  const [selectedMethods, setSelectedMethods] = useState<
    Record<string, Set<string>>
  >(() => {
    const saved = localStorage.getItem("calculationChoices");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedMethods) {
          const methods: Record<string, Set<string>> = {};
          for (const [key, val] of Object.entries(parsed.selectedMethods)) {
            methods[key] = new Set(val as string[]);
          }
          return methods;
        }
      } catch {
        /* ignore */
      }
    }
    return {};
  });

  // Active preset tracking
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Apply a preset: replace all selections
  const applyPreset = (preset: Preset) => {
    const newCalcs = new Set(Object.keys(preset.calcs));
    const newMethods: Record<string, Set<string>> = {};
    for (const [calcId, methodIds] of Object.entries(preset.calcs)) {
      newMethods[calcId] = new Set(methodIds);
    }
    setSelectedCalcs(newCalcs);
    setSelectedMethods(newMethods);
    setActivePresetId(preset.id);
  };

  // Toggle a calculation
  const toggleCalc = (calcId: string) => {
    setActivePresetId(null);
    setSelectedCalcs((prev) => {
      const next = new Set(prev);
      if (next.has(calcId)) {
        next.delete(calcId);
        // Also remove all methods for this calc
        setSelectedMethods((pm) => {
          const nm = { ...pm };
          delete nm[calcId];
          return nm;
        });
      } else {
        next.add(calcId);
        // Auto-select all methods when enabling a calc
        const calc = CALCULATION_OPTIONS.find((c) => c.id === calcId);
        if (calc) {
          const allMethodIds = calc.methods.map((m) => m.id);
          setSelectedMethods((pm) => {
            const nm = { ...pm, [calcId]: new Set(allMethodIds) };
            // If enabling PC and it includes paBased, auto-select PA + baremeMJ
            if (
              calcId === "prestationCompensatoire" &&
              allMethodIds.includes("paBased")
            ) {
              nm["pensionAlimentaire"] = new Set(["baremeMJ"]);
            }
            return nm;
          });
          // Also add pensionAlimentaire to selectedCalcs if PC includes paBased
          if (
            calcId === "prestationCompensatoire" &&
            allMethodIds.includes("paBased")
          ) {
            next.add("pensionAlimentaire");
          }
        }
      }

      // If "resteAVivre" is being checked, auto-check everything
      if (calcId === "resteAVivre" && !prev.has("resteAVivre")) {
        const allCalcIds = CALCULATION_OPTIONS.map((c) => c.id);
        const allMethodSets: Record<string, Set<string>> = {};
        for (const c of CALCULATION_OPTIONS) {
          allMethodSets[c.id] = new Set(c.methods.map((m) => m.id));
        }
        setSelectedMethods(allMethodSets);
        return new Set(allCalcIds);
      }

      return next;
    });
  };

  // Toggle a specific method within a calculation
  const toggleMethod = (calcId: string, methodId: string) => {
    setActivePresetId(null);
    setSelectedMethods((prev) => {
      const current = prev[calcId] || new Set<string>();
      const next = new Set(current);
      const isAdding = !next.has(methodId);

      if (isAdding) {
        next.add(methodId);
        // Auto-select the calc if not already
        setSelectedCalcs((pc) => {
          const nc = new Set(pc);
          nc.add(calcId);
          return nc;
        });
      } else {
        next.delete(methodId);
        // If no methods left, deselect the calc
        if (next.size === 0) {
          setSelectedCalcs((pc) => {
            const nc = new Set(pc);
            nc.delete(calcId);
            return nc;
          });
        }
      }

      const result = { ...prev, [calcId]: next };

      // Auto-toggle Pension Alimentaire when paBased is toggled within Prestation Compensatoire
      if (calcId === "prestationCompensatoire" && methodId === "paBased") {
        if (isAdding) {
          // Auto-select pensionAlimentaire + baremeMJ
          result["pensionAlimentaire"] = new Set(["baremeMJ"]);
          setSelectedCalcs((pc) => {
            const nc = new Set(pc);
            nc.add("pensionAlimentaire");
            return nc;
          });
        } else {
          // Auto-deselect pensionAlimentaire
          delete result["pensionAlimentaire"];
          setSelectedCalcs((pc) => {
            const nc = new Set(pc);
            nc.delete("pensionAlimentaire");
            return nc;
          });
        }
      }

      return result;
    });
  };

  // Select all methods for a given calc
  const selectAllMethods = (calcId: string) => {
    setActivePresetId(null);
    const calc = CALCULATION_OPTIONS.find((c) => c.id === calcId);
    if (!calc) return;
    setSelectedCalcs((prev) => new Set([...prev, calcId]));
    setSelectedMethods((prev) => ({
      ...prev,
      [calcId]: new Set(calc.methods.map((m) => m.id)),
    }));
  };

  // Save and continue
  const handleContinue = () => {
    const toSave = {
      selectedCalcs: Array.from(selectedCalcs),
      selectedMethods: Object.fromEntries(
        Object.entries(selectedMethods).map(([k, v]) => [k, Array.from(v)]),
      ),
    };
    localStorage.setItem("calculationChoices", JSON.stringify(toSave));
    navigate("/simulation-mode");
  };

  const hasSelection = selectedCalcs.size > 0;

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative text-[var(--text-primary)]">
      <SEO
        title="Choix des Calculs — Simulation Divorce"
        description="Sélectionnez les calculs à effectuer : prestation compensatoire, pension alimentaire, liquidation (soulte), reste à vivre."
        path="/calculations"
        noindex={true}
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Avertissement", path: "/disclaimer" },
          { name: "Choix des calculs", path: "/calculations" },
        ])}
      />

      {/* Header */}
      <div
        className="bg-black/20 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-50"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <button
          onClick={() => navigate("/disclaimer")}
          className="p-2 rounded-full hover:bg-white/10 group flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase text-glow">
          Choix des Calculs
        </h1>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-white/10 group flex items-center justify-center"
          title="Accueil"
        >
          <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Que souhaitez-vous calculer ?
          </h2>
          <p className="text-sm text-gray-400">
            Sélectionnez un ou plusieurs calculs. Pour chaque calcul, choisissez
            les méthodes à appliquer.
          </p>
        </div>

        {/* ── Sélection rapide (Presets) ── */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Sélection rapide</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 group ${
                    isActive
                      ? "border-[var(--color-plasma-cyan)] bg-[var(--color-plasma-cyan)]/10 shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-1 ring-[var(--color-plasma-cyan)]/30"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`mt-0.5 ${isActive ? "text-[var(--color-plasma-cyan)]" : preset.color} transition-colors`}
                    >
                      {preset.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold ${isActive ? "text-[var(--color-plasma-cyan)]" : "text-[var(--text-primary)]"}`}
                      >
                        {preset.label}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                    {isActive && (
                      <CheckCircle className="w-4 h-4 text-[var(--color-plasma-cyan)] shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 border-t border-white/10" />
          <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">
            ou personnalisez
          </span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {CALCULATION_OPTIONS.map((calc) => {
          const isSelected = selectedCalcs.has(calc.id);
          const calcMethods = selectedMethods[calc.id] || new Set<string>();
          const allMethodsSelected = calc.methods.every((m) =>
            calcMethods.has(m.id),
          );

          return (
            <div
              key={calc.id}
              className={`rounded-2xl border-2 transition-all duration-300 ${
                isSelected
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 shadow-[0_0_25px_rgba(13,148,136,0.2)] ring-1 ring-[var(--accent-primary)]/30"
                  : "border-transparent border-[1px] border-[var(--border-color)] bg-white/[0.02] hover:border-[var(--text-muted)]/30"
              }`}
            >
              {/* Calc Header — clickable to toggle */}
              <button
                onClick={() => toggleCalc(calc.id)}
                className="w-full p-5 flex items-start space-x-4 text-left"
              >
                <div
                  className={`mt-0.5 transition-colors ${isSelected ? calc.color : "text-gray-500"}`}
                >
                  {calc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h3
                      className={`font-bold text-base ${isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                    >
                      {calc.label}
                    </h3>
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {calc.description}
                  </p>
                </div>
              </button>

              {/* Methods — show when calc is selected */}
              {isSelected && calc.methods.length > 0 && (
                <div className="px-5 pb-5 pt-0 space-y-3 animate-fade-in">
                  <div className="border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                        Méthodes de calcul
                      </span>
                      {calc.methods.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllMethods(calc.id);
                          }}
                          className={`text-xs px-3 py-1 rounded-full transition ${
                            allMethodsSelected
                              ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {allMethodsSelected
                            ? "✓ Toutes sélectionnées"
                            : "Tout sélectionner (moyenne)"}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {calc.methods.map((method) => {
                        const isMethodSelected = calcMethods.has(method.id);
                        return (
                          <button
                            key={method.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMethod(calc.id, method.id);
                            }}
                            className={`w-full p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                              isMethodSelected
                                ? "border-[var(--accent-primary)]/60 bg-[var(--accent-primary)]/15"
                                : "border-[var(--border-color)] bg-[var(--bg-primary)]/60 hover:border-[var(--text-muted)]/30"
                            }`}
                          >
                            {isMethodSelected ? (
                              <CheckCircle className="w-4 h-4 text-[var(--accent-primary)] mt-0.5 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium ${isMethodSelected ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
                              >
                                {method.label}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Info about averaging when multiple methods selected */}
                    {calcMethods.size > 1 && (
                      <div className="mt-3 px-3 py-2 rounded-lg bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20">
                        <p className="text-xs text-[var(--accent-primary)]">
                          ✓ Les {calcMethods.size} méthodes seront calculées
                          individuellement. Le résultat final sera la moyenne
                          des résultats obtenus.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Info rest à vivre */}
        <div className="px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs text-emerald-400">
            💡 Cocher « Reste à Vivre » sélectionne automatiquement tous les
            calculs, car le budget dépend de la pension alimentaire, de la
            prestation compensatoire et de la liquidation.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[var(--color-deep-space)] to-transparent z-20"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
        }}
      >
        <button
          onClick={handleContinue}
          disabled={!hasSelection}
          className={`w-full max-w-md mx-auto py-5 rounded-2xl font-bold transition-all flex items-center justify-center space-x-3 group active:scale-95 ${
            hasSelection
              ? "bg-[var(--color-plasma-cyan)] hover:bg-[var(--accent-hover)] text-white shadow-[0_0_30px_rgba(34,211,238,0.3)]"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
          style={hasSelection ? { color: "#ffffff" } : undefined}
        >
          <span className="tracking-widest text-sm uppercase">
            Configurer mon profil
          </span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CalculationChoicePage;
