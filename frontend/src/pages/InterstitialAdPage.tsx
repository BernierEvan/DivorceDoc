import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, Shield, Scale } from "lucide-react";
import { SEO } from "../components/SEO";

// ---------------------------------------------------------------------------
// Editorial content variants — one per interstitial position
// ---------------------------------------------------------------------------

interface EditorialVariant {
  title: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  paragraphs: { heading: string; text: string; icon: React.ReactNode }[];
}

const VARIANTS: Record<string, EditorialVariant> = {
  "recap-to-dashboard": {
    title: "Comprendre vos résultats",
    seoTitle: "Comprendre les résultats — Prestation Compensatoire",
    seoDescription:
      "Comment interpréter les résultats de votre simulation de prestation compensatoire : méthodes de calcul, fourchettes et limites.",
    intro:
      "Avant de consulter vos résultats, voici quelques clefs de lecture pour mieux les interpréter.",
    paragraphs: [
      {
        heading: "Des fourchettes, pas un montant unique",
        text: "SimulDivorce croise plusieurs méthodes doctrinales (Calcul PC / Axel Depondt, Tiers Pondéré, INSEE). Chacune produit une estimation différente. Le résultat final est la moyenne de ces méthodes, présenté comme une fourchette indicative — et non un chiffre définitif.",
        icon: <Scale className="w-5 h-5 text-teal-400 shrink-0" />,
      },
      {
        heading: "Une simulation, pas un jugement",
        text: "Les montants calculés reposent sur des barèmes publics et des formules simplifiées. Ils ne tiennent pas compte de l'ensemble des critères retenus par le juge (sacrifices de carrière, état de santé, patrimoine futur). Consultez un avocat pour valider ces résultats.",
        icon: <Shield className="w-5 h-5 text-amber-400 shrink-0" />,
      },
      {
        heading: "Sources et transparence",
        text: "Toutes les méthodes utilisées sont documentées dans notre page Méthodologie. Le détail des sources juridiques (Code civil art. 270-281, barèmes du Ministère de la Justice) est librement consultable.",
        icon: <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />,
      },
    ],
  },
  "dashboard-to-export": {
    title: "Avant de télécharger",
    seoTitle: "Conseils avant export — Rapport de simulation",
    seoDescription:
      "Conseils pratiques avant de télécharger votre rapport de simulation de divorce : vérification, confidentialité et utilisation.",
    intro:
      "Votre rapport va être généré. Voici quelques points importants à garder en tête.",
    paragraphs: [
      {
        heading: "Vérifiez vos données",
        text: "Le rapport PDF reprend fidèlement les données que vous avez saisies. Si certaines informations vous semblent incorrectes, vous pouvez revenir en arrière pour les corriger avant de télécharger. Un rapport basé sur des données erronées perd toute utilité.",
        icon: <Scale className="w-5 h-5 text-teal-400 shrink-0" />,
      },
      {
        heading: "Confidentialité du document",
        text: "Le rapport est généré localement sur votre appareil. Il n'est pas envoyé à nos serveurs et n'est accessible qu'à vous. Si vous choisissez l'envoi par e-mail, votre adresse sera transmise uniquement à notre service d'expédition.",
        icon: <Shield className="w-5 h-5 text-amber-400 shrink-0" />,
      },
      {
        heading: "Utilisation du rapport",
        text: "Ce document est un outil d'aide à la décision à caractère informatif. Il peut servir de base de discussion avec votre avocat, mais il n'a aucune valeur juridique et ne peut être produit devant un juge.",
        icon: <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Interstitial page component
// ---------------------------------------------------------------------------

const SKIP_DELAY_SECONDS = 5;

const InterstitialAdPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const variantKey = searchParams.get("from") || "recap-to-dashboard";
  const nextPage = searchParams.get("next") || "/dashboard";
  const variant = VARIANTS[variantKey] || VARIANTS["recap-to-dashboard"];

  const [countdown, setCountdown] = useState(SKIP_DELAY_SECONDS);
  const canSkip = countdown <= 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleContinue = useCallback(() => {
    navigate(nextPage);
  }, [navigate, nextPage]);

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative text-white">
      <SEO
        title={variant.seoTitle}
        description={variant.seoDescription}
        noindex={true}
      />

      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--color-plasma-cyan)]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          {variant.title}
        </h1>
        <p className="text-sm text-gray-400 mb-8 text-center max-w-md">
          {variant.intro}
        </p>

        {/* Editorial paragraphs */}
        <div className="w-full max-w-lg space-y-4 mb-8">
          {variant.paragraphs.map((p, i) => (
            <div
              key={i}
              className="p-5 border rounded-2xl border-white/10 bg-white/[0.02]"
            >
              <div className="flex items-start space-x-3">
                {p.icon}
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {p.heading}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-400">
                    {p.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Video Ad placeholder ── */}
        <div className="w-full max-w-lg aspect-video bg-black/30 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
          <span className="text-xs uppercase tracking-widest text-gray-500">
            Espace publicitaire vidéo
          </span>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!canSkip}
          className={`px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center space-x-2 group ${
            canSkip
              ? "bg-[var(--color-plasma-cyan)] hover:bg-[var(--accent-hover)] text-white shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95"
              : "bg-white/5 text-gray-500 cursor-not-allowed"
          }`}
          style={canSkip ? { color: "#ffffff" } : undefined}
        >
          <span>{canSkip ? "Continuer" : `Continuer dans ${countdown}s`}</span>
          {canSkip && (
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
};

export default InterstitialAdPage;
