import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  HeartHandshake,
  ArrowRight,
  AlertTriangle,
  X,
} from "lucide-react";
import { InfoTooltip } from "../components/InfoTooltip";
import { AdUnit } from "../components/AdUnit";
import { SEO, breadcrumbJsonLd } from "../components/SEO";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [divorceType, setDivorceType] = useState("consent");
  const [date, setDate] = useState("");
  const [children, setChildren] = useState(0);
  const [regime, setRegime] = useState("community");
  const [custodyType, setCustodyType] = useState("classic");
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateModalError, setDateModalError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNext = () => {
    if (!date) {
      setDateModalError("Veuillez entrer une date de mariage pour continuer.");
      setShowDateModal(true);
      return;
    }
    if (new Date(date) > new Date()) {
      setDateModalError("La date de mariage ne peut pas être dans le futur.");
      setShowDateModal(true);
      return;
    }

    // Save profile data
    localStorage.setItem(
      "profileData",
      JSON.stringify({ divorceType, date, children, regime, custodyType }),
    );
    navigate("/quiz");
  };

  const handleModalConfirm = () => {
    if (!date) {
      setDateModalError("Veuillez entrer une date de mariage.");
      return;
    }
    if (new Date(date) > new Date()) {
      setDateModalError("La date de mariage ne peut pas être dans le futur.");
      return;
    }
    setShowDateModal(false);
    setDateModalError("");
    // Save and navigate
    localStorage.setItem(
      "profileData",
      JSON.stringify({ divorceType, date, children, regime, custodyType }),
    );
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative overflow-hidden text-white">
      <SEO
        title="Configuration du Profil — Simulation Divorce"
        description="Configurez votre profil pour la simulation de divorce : type de divorce, date de mariage, enfants, régime matrimonial et garde. Étape 1 du simulateur gratuit DivorceDoc."
        path="/profile"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Profil", path: "/profile" },
        ])}
      />
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-plasma-cyan)]/10 rounded-full blur-[100px]" />

      {/* Header & Progress */}
      <div className="p-6 pt-8 z-10">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold tracking-[0.2em] text-gray-400">
            CONFIGURATION
          </span>
          <div className="flex space-x-1">
            <div className="w-8 h-1 bg-[var(--color-plasma-cyan)] rounded-full" />
            <div className="w-8 h-1 bg-white/20 rounded-full" />
            <div className="w-8 h-1 bg-white/20 rounded-full" />
            <div className="w-8 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-glow mb-2">
          Profile Setup
        </h1>
        <p className="text-sm text-gray-400">
          Initialize basic legal parameters.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 animate-fade-in relative z-10 scrollbar-hide space-y-8">
        {/* Type of Divorce */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
            <HeartHandshake className="w-3 h-3" /> <span>Divorce Type</span>
            <InfoTooltip
              content="Consentement mutuel (Amiable) : les deux époux s'accordent sur le divorce et ses conséquences.

Divorce pour faute : un époux reproche à l'autre une violation grave des devoirs du mariage.

Altération du lien conjugal : le divorce est prononcé après une séparation de fait d'au moins 1 an."
            />
          </label>
          <select
            value={divorceType}
            onChange={(e) => setDivorceType(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-plasma-cyan)] outline-none appearance-none"
          >
            <option value="consent">Mutual Consent (Amiable)</option>
            <option value="fault">Fault-Based</option>
            <option value="separation">Alteration of Bond</option>
          </select>
        </div>

        {/* Marriage Date */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
            <Calendar className="w-3 h-3" /> <span>Date of Marriage</span>
          </label>
          <input
            type="date"
            value={date}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-plasma-cyan)] outline-none"
          />
        </div>

        {/* Children Counter */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
            <Users className="w-3 h-3" /> <span>Children</span>
          </label>
          <div className="flex items-center justify-between bg-black/50 rounded-xl p-2">
            <button
              onClick={() => setChildren(Math.max(0, children - 1))}
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xl font-bold transition"
            >
              -
            </button>
            <span className="text-2xl font-mono text-[var(--color-plasma-cyan)]">
              {children}
            </span>
            <button
              onClick={() => setChildren(children + 1)}
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xl font-bold transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Custody Type - Only show if children > 0 */}
        {children > 0 && (
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

        {/* Regime Buttons */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
            <span>Matrimonial Regime</span>
            <InfoTooltip content="C'est l'ensemble des règles qui fixent le sort de vos biens. Par défaut (sans contrat de mariage), vous êtes sous le régime de la communauté réduite aux acquêts." />
          </label>
          <div className="space-y-3">
            {["community", "separation", "participation"].map((r) => (
              <button
                key={r}
                onClick={() => setRegime(r)}
                className={`w-full p-4 rounded-xl border text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                  regime === r
                    ? "border-[var(--color-plasma-cyan)] bg-[var(--color-plasma-cyan)]/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Native Ad (AD_02) */}
        <AdUnit type="native" className="animate-fade-in delay-500" />
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
            {/* Header */}
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

            {/* Content */}
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
                  value={date}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setDateModalError("");
                  }}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-plasma-cyan)] outline-none"
                />
              </div>
              <button
                onClick={handleModalConfirm}
                className="w-full bg-[var(--color-plasma-cyan)] hover:bg-cyan-300 text-[var(--color-deep-space)] font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95"
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

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[var(--color-deep-space)] to-transparent z-20"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
        }}
      >
        <button
          onClick={handleNext}
          className="w-full bg-[var(--color-plasma-cyan)] hover:bg-cyan-300 text-[var(--color-deep-space)] font-bold py-5 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center space-x-3 group active:scale-95"
        >
          <span className="tracking-widest text-sm uppercase">
            Continue to Scan
          </span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
