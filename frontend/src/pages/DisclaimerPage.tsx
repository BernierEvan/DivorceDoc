import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  LogOut,
  Scale,
  FileWarning,
  Ban,
} from "lucide-react";
import { SEO, breadcrumbJsonLd } from "../components/SEO";

const DisclaimerPage: React.FC = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const handleContinue = () => {
    if (!accepted) return;
    localStorage.setItem("disclaimerAccepted", "true");

    // Auto-select all PC methods (skip CalculationChoicePage)
    const autoChoices = {
      selectedCalcs: ["prestationCompensatoire"],
      selectedMethods: {
        prestationCompensatoire: ["axelDepondt", "pilote", "insee"],
      },
    };
    localStorage.setItem("calculationChoices", JSON.stringify(autoChoices));

    // Auto-set guided mode (skip SimulationModePage)
    localStorage.setItem("simulationMode", "guided");

    navigate("/prestation-compensatoire");
  };

  const handleQuit = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative text-white">
      <SEO
        title="Avertissement Juridique — SimulDivorce"
        description="Avertissement : cet outil ne constitue pas un conseil juridique. Prenez connaissance des limitations avant de commencer la simulation."
        path="/disclaimer"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Avertissement", path: "/disclaimer" },
        ])}
      />

      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />

      {/* Header */}
      <div className="p-6 pt-10 z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
          <ShieldAlert className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white text-glow mb-2">
          Avertissement Important
        </h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Veuillez lire attentivement les informations ci-dessous avant de
          continuer.
        </p>
      </div>

      {/* Disclaimer Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-10 z-10 scrollbar-hide">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Block 1 — Pas de valeur juridique */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-0.5">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Aucune valeur juridique
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Les résultats fournis par SimulDivorce sont de simples{" "}
                  <strong className="text-white">
                    estimations indicatives
                  </strong>{" "}
                  à caractère purement informatif. Ils ne constituent en aucun
                  cas un acte juridique, un conseil juridique, ni un avis
                  d'avocat ou de notaire.
                </p>
              </div>
            </div>
          </div>

          {/* Block 2 — Non recevable */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-0.5">
                <Ban className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Non recevable devant un juge
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Les estimations produites par cet outil{" "}
                  <strong className="text-white">ne sont pas recevables</strong>{" "}
                  devant un juge aux affaires familiales (JAF), un tribunal
                  judiciaire, ou toute autre juridiction. Elles ne peuvent en
                  aucun cas se substituer à une décision de justice.
                </p>
              </div>
            </div>
          </div>

          {/* Block 3 — Pas de substitution */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-0.5">
                <FileWarning className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Ne remplace pas un professionnel du droit
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Cet outil ne remplace pas la consultation d'un{" "}
                  <strong className="text-white">avocat</strong>, d'un{" "}
                  <strong className="text-white">notaire</strong>, ou de tout
                  autre professionnel du droit compétent. Pour toute situation
                  réelle de divorce, il est impératif de faire appel à un
                  conseil juridique qualifié.
                </p>
              </div>
            </div>
          </div>

          {/* Block 4 — Limites */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Limites de la simulation
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Les calculs reposent sur des formules doctrinales simplifiées
                  et des barèmes publics (Ministère de la Justice, INSEE). Ils
                  ne tiennent pas compte de l'ensemble des critères que le juge
                  peut retenir : sacrifices de carrière, patrimoine futur, état
                  de santé, etc. Les montants réels peuvent différer
                  significativement.
                </p>
              </div>
            </div>
          </div>

          {/* Block 5 — Responsabilité */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Absence de responsabilité
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  L'éditeur de SimulDivorce décline toute responsabilité quant à
                  l'utilisation qui pourrait être faite des résultats de cette
                  simulation. En poursuivant, vous reconnaissez avoir pris
                  connaissance de ces limitations et les accepter pleinement.
                </p>
              </div>
            </div>
          </div>

          {/* Checkbox */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 mt-6">
            <label className="flex items-start space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-3 h-3 sm:w-4 sm:h-4 shrink-0 accent-[var(--color-plasma-cyan)] cursor-pointer rounded"
              />
              <span className="text-sm text-gray-200 leading-relaxed">
                J'ai lu et compris les avertissements ci-dessus. Je reconnais
                que cette simulation{" "}
                <strong className="text-white">
                  n'a aucune valeur juridique
                </strong>
                , n'est{" "}
                <strong className="text-white">
                  pas recevable devant un tribunal
                </strong>{" "}
                et ne remplace en aucun cas l'avis d'un professionnel du droit.
                Je souhaite néanmoins poursuivre à titre informatif.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="space-y-3 mt-2">
            <button
              onClick={handleContinue}
              disabled={!accepted}
              className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 sm:space-x-3 group active:scale-95 ${
                accepted
                  ? "bg-[var(--color-plasma-cyan)] hover:bg-[var(--accent-hover)] text-white shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                  : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
              }`}
              style={{ color: accepted ? "#ffffff" : undefined }}
            >
              <span className="text-xs sm:text-sm tracking-wider sm:tracking-widest uppercase">
                <span className="sm:hidden">J'accepte et continue</span>
                <span className="hidden sm:inline">
                  J'accepte et je continue
                </span>
              </span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleQuit}
              className="w-full py-3 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="tracking-widest text-xs uppercase">
                Abandonner et quitter
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
