import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Briefcase, Home, Wallet, ArrowRight } from "lucide-react";
import { InfoTooltip } from "../components/InfoTooltip";
import { SEO, breadcrumbJsonLd } from "../components/SEO";

const QuizPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Default ages
  const [myAge, setMyAge] = useState(42);
  const [spouseAge, setSpouseAge] = useState(44);
  const [jobStability, setJobStability] = useState("stable");
  // Patrimoine
  const [assetsValue, setAssetsValue] = useState(0);
  const [assetsCRD, setAssetsCRD] = useState(0);
  const [rewardsAlice, setRewardsAlice] = useState(0);
  const [rewardsBob, setRewardsBob] = useState(0);
  // Budget
  const [myTaxes, setMyTaxes] = useState(0);
  const [myRent, setMyRent] = useState(0);

  const handleNext = () => {
    // Save quiz data merged with profile data or separate
    const existingProfile = JSON.parse(
      localStorage.getItem("profileData") || "{}",
    );

    const updatedProfile = {
      ...existingProfile,
      myAge,
      spouseAge,
      jobStability,
      assetsValue,
      assetsCRD,
      rewardsAlice,
      rewardsBob,
      myTaxes,
      myRent,
    };

    localStorage.setItem("profileData", JSON.stringify(updatedProfile));
    navigate("/scanner");
  };

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative overflow-hidden text-white">
      <SEO
        title="Situation Personnelle — Simulation Divorce"
        description="Renseignez vos âges, situation professionnelle, charges mensuelles et patrimoine immobilier pour affiner le calcul de prestation compensatoire et pension alimentaire."
        path="/quiz"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Profil", path: "/profile" },
          { name: "Situation personnelle", path: "/quiz" },
        ])}
      />
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-plasma-cyan)]/10 rounded-full blur-[100px]" />

      {/* Header & Progress */}
      <div className="p-6 pt-8 z-10">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold tracking-[0.2em] text-gray-400">
            SITUATION PERSONNELLE
          </span>
          <div className="flex space-x-1">
            <div className="w-8 h-1 bg-white/20 rounded-full" />
            <div className="w-8 h-1 bg-[var(--color-plasma-cyan)] rounded-full" />
            <div className="w-8 h-1 bg-white/20 rounded-full" />
            <div className="w-8 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-glow mb-2">
          À propos de vous
        </h1>
        <p className="text-sm text-gray-400">
          Ces éléments affinent le calcul de la prestation compensatoire.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 animate-fade-in relative z-10 scrollbar-hide space-y-8">
        {/* Ages Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-6">
            <User className="w-3 h-3" /> <span>Âges des Époux</span>
            <InfoTooltip content="L'âge est un critère déterminant pour la méthode Pilote." />
          </label>

          <div className="space-y-6">
            {/* My Age */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Votre Âge</span>
                <span className="text-xl font-mono text-[var(--color-plasma-cyan)]">
                  {myAge} ans
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="90"
                value={myAge}
                onChange={(e) => setMyAge(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-plasma-cyan)]"
              />
            </div>

            {/* Spouse Age */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Âge Conjoint</span>
                <span className="text-xl font-mono text-[var(--color-plasma-cyan)]">
                  {spouseAge} ans
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="90"
                value={spouseAge}
                onChange={(e) => setSpouseAge(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-plasma-cyan)]"
              />
            </div>
          </div>
        </div>

        {/* Professional Situation (Flavor/Context) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-4">
            <Briefcase className="w-3 h-3" /> <span>Situation Pro.</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setJobStability("stable")}
              className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                jobStability === "stable"
                  ? "border-[var(--color-plasma-cyan)] bg-[var(--color-plasma-cyan)]/10 text-white"
                  : "border-white/5 bg-white/5 text-gray-400"
              }`}
            >
              Stable (CDI/Fonctionnaire)
            </button>
            <button
              onClick={() => setJobStability("precaire")}
              className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                jobStability === "precaire"
                  ? "border-[var(--color-plasma-cyan)] bg-[var(--color-plasma-cyan)]/10 text-white"
                  : "border-white/5 bg-white/5 text-gray-400"
              }`}
            >
              Précaire / Sans
            </button>
          </div>
        </div>

        {/* Budget Mensuel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-6">
            <Wallet className="w-3 h-3" /> <span>Charges Mensuelles</span>
            <InfoTooltip content="Ces montants sont déduits de vos revenus pour calculer votre Reste à Vivre après divorce." />
          </label>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Impôts mensuels (€)
              </label>
              <input
                type="number"
                min="0"
                value={myTaxes || ""}
                onChange={(e) => setMyTaxes(parseFloat(e.target.value) || 0)}
                placeholder="ex: 350"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-plasma-cyan)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Loyer ou Crédit immobilier (€/mois)
              </label>
              <input
                type="number"
                min="0"
                value={myRent || ""}
                onChange={(e) => setMyRent(parseFloat(e.target.value) || 0)}
                placeholder="ex: 800"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-plasma-cyan)] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Patrimoine Immobilier */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <label className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-6">
            <Home className="w-3 h-3" /> <span>Patrimoine Immobilier</span>
            <InfoTooltip content="Ces données servent au calcul de la soulte en cas de liquidation d’un bien commun." />
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
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-plasma-cyan)] outline-none"
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
                onChange={(e) => setAssetsCRD(parseFloat(e.target.value) || 0)}
                placeholder="ex: 120 000"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-plasma-cyan)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 flex items-center space-x-2">
                <span>Récompenses Époux A (apport propre/héritage) (€)</span>
                <InfoTooltip content="Les récompenses sont les sommes que la communauté doit rembourser à un époux qui a utilisé des fonds propres (héritage, donation, épargne antérieure) pour un bien commun. Elles ajustent le partage final de la soulte." />
              </label>
              <input
                type="number"
                min="0"
                value={rewardsAlice || ""}
                onChange={(e) =>
                  setRewardsAlice(parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-plasma-cyan)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Récompenses Époux B (apport propre/héritage) (€)
              </label>
              <input
                type="number"
                min="0"
                value={rewardsBob || ""}
                onChange={(e) => setRewardsBob(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-plasma-cyan)] outline-none"
              />
            </div>
          </div>
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
          onClick={handleNext}
          className="w-full bg-[var(--color-plasma-cyan)] hover:bg-cyan-300 text-[var(--color-deep-space)] font-bold py-5 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center space-x-3 group active:scale-95"
        >
          <span className="tracking-widest text-sm uppercase">
            Continuer vers Scan
          </span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default QuizPage;
