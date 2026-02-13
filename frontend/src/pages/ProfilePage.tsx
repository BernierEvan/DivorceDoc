import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, HeartHandshake, ArrowRight } from "lucide-react";
import { InfoTooltip } from "../components/InfoTooltip";
import { AdUnit } from "../components/AdUnit";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [divorceType, setDivorceType] = useState("consent");
  const [date, setDate] = useState("");
  const [children, setChildren] = useState(0);
  const [regime, setRegime] = useState("community");

  const handleNext = () => {
    // Save profile data
    localStorage.setItem(
      "profileData",
      JSON.stringify({ divorceType, date, children, regime }),
    );
    navigate("/scanner");
  };

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative overflow-hidden text-white">
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

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[var(--color-deep-space)] to-transparent z-20">
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
