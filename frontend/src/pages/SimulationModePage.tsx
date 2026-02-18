import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Home,
  BookOpen,
  Zap,
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { SEO, breadcrumbJsonLd } from "../components/SEO";
import { useGuidedMode } from "../services/guidedMode";
import { getNavigationPages } from "../services/divorceFormStore";

const SimulationModePage: React.FC = () => {
  const navigate = useNavigate();
  const { mode, setMode } = useGuidedMode();

  const handleContinue = () => {
    if (!mode) return;
    const pages = getNavigationPages();
    navigate(pages[0] || "/recapitulatif");
  };

  return (
    <div className="h-[100dvh] bg-[var(--color-deep-space)] flex flex-col relative text-[var(--text-primary)] overflow-hidden">
      <SEO
        title="Mode de Simulation — DivorceDoc"
        description="Choisissez entre une simulation guidée avec explications pas-à-pas ou une simulation libre sans tooltips."
        path="/simulation-mode"
        noindex={true}
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Avertissement", path: "/disclaimer" },
          { name: "Choix des calculs", path: "/calculation-choice" },
          { name: "Mode de simulation", path: "/simulation-mode" },
        ])}
      />

      {/* Background blobs */}
      <div className="absolute top-20 left-1/4 w-80 h-80 bg-[var(--accent-primary)]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-[var(--color-plasma-cyan)]/5 rounded-full blur-[100px]" />

      {/* Header */}
      <div
        className="bg-black/20 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-50"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <button
          onClick={() => navigate("/calculation-choice")}
          className="p-2 rounded-full hover:bg-white/10 group flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase text-glow">
          Mode de Simulation
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
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 sm:pb-32 space-y-4 sm:space-y-6 relative z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 sm:mb-2">
            Comment souhaitez-vous procéder ?
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Choisissez un mode de simulation adapté à votre niveau de
            familiarité avec les notions juridiques.
          </p>
        </div>

        {/* Option: Guided */}
        <button
          onClick={() => setMode("guided")}
          className={`w-full text-left rounded-2xl border-2 transition-all duration-300 p-4 sm:p-6 group ${
            mode === "guided"
              ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 shadow-[0_0_30px_rgba(13,148,136,0.25)] ring-1 ring-[var(--accent-primary)]/30"
              : "border-transparent border-[1px] border-[var(--border-color)] bg-white/[0.02] hover:border-[var(--text-muted)]/30 hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div
              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                mode === "guided"
                  ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                  : "bg-white/5 text-gray-500 group-hover:text-gray-300"
              }`}
            >
              <BookOpen className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                <h3
                  className={`text-base sm:text-lg font-bold ${mode === "guided" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                >
                  Simulation Guidée
                </h3>
                {mode === "guided" && (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-primary)] shrink-0" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-2 sm:mb-4">
                Idéal si vous débutez. Chaque étape est accompagnée
                d'explications claires qui apparaissent automatiquement.
              </p>

              {/* Features list */}
              <div className="space-y-1.5 sm:space-y-2.5">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400" />
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-400">
                    Tooltips explicatifs automatiques sur chaque champ
                  </span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400" />
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-400">
                    Indications pas-à-pas à chaque étape
                  </span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-400">
                    Désactivable à tout moment via le bouton flottant
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* Option: Unguided */}
        <button
          onClick={() => setMode("unguided")}
          className={`w-full text-left rounded-2xl border-2 transition-all duration-300 p-4 sm:p-6 group ${
            mode === "unguided"
              ? "border-[var(--color-plasma-cyan)] bg-[var(--color-plasma-cyan)]/10 shadow-[0_0_30px_rgba(34,211,238,0.25)] ring-1 ring-[var(--color-plasma-cyan)]/30"
              : "border-transparent border-[1px] border-[var(--border-color)] bg-white/[0.02] hover:border-[var(--text-muted)]/30 hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div
              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                mode === "unguided"
                  ? "bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)]"
                  : "bg-white/5 text-gray-500 group-hover:text-gray-300"
              }`}
            >
              <Zap className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                <h3
                  className={`text-base sm:text-lg font-bold ${mode === "unguided" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                >
                  Simulation Libre
                </h3>
                {mode === "unguided" && (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-plasma-cyan)] shrink-0" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-2 sm:mb-4">
                Pour les utilisateurs avertis. Interface épurée, sans
                explications automatiques.
              </p>

              {/* Features list */}
              <div className="space-y-1.5 sm:space-y-2.5">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-400">
                    Interface rapide sans interruptions
                  </span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-400">
                    Informations accessibles via les icônes ℹ à côté des champs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* Info note */}
        <div className="px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02]">
          <p className="text-xs text-gray-500 leading-relaxed">
            💡 Quel que soit votre choix, les icônes{" "}
            <span className="text-[var(--accent-primary)]">ℹ</span> restent
            toujours disponibles à côté de chaque champ pour consulter les
            explications à votre rythme.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 w-full p-3 sm:p-6 bg-gradient-to-t from-[var(--color-deep-space)] to-transparent z-20"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
        }}
      >
        <button
          onClick={handleContinue}
          disabled={!mode}
          className={`w-full max-w-md mx-auto py-3 sm:py-5 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 sm:space-x-3 group active:scale-95 ${
            mode
              ? "bg-[var(--color-plasma-cyan)] hover:bg-[var(--accent-hover)] text-white shadow-[0_0_30px_rgba(34,211,238,0.3)]"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
          style={mode ? { color: "#ffffff" } : undefined}
        >
          <span className="text-xs sm:text-sm tracking-wider sm:tracking-widest uppercase">
            Commencer la simulation
          </span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default SimulationModePage;
