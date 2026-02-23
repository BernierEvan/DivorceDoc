import React from "react";
import { useNavigate, Link } from "react-router-dom";

import { InfoTooltip } from "../components/InfoTooltip";
import { SEO, faqJsonLd } from "../components/SEO";

const landingFaq = faqJsonLd([
  {
    question: `Comment fonctionne le simulateur de divorce "SimulDivorce" ?`,
    answer:
      "SimulDivorce vous permet de saisir manuellement vos informations financières (revenus, situation familiale) pour simuler la prestation compensatoire. Les calculs sont réalisés localement sur votre appareil.",
  },
  {
    question: "Le simulateur de divorce est-il gratuit ?",
    answer:
      "Oui, SimulDivorce est 100% gratuit. Le service est financé par la publicité (Google AdSense). Aucun compte n'est requis.",
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer:
      "Oui, vos données financières de simulation sont traitées localement sur votre appareil. Des données de navigation sont partagées avec Google (publicité) et votre adresse e-mail peut être transmise si vous demandez l'envoi d'un document.",
  },
  {
    question: "Comment est calculée la prestation compensatoire ?",
    answer:
      "SimulDivorce utilise deux méthodes doctrinales reconnues : la méthode Pilote (différentiel de revenus × durée du mariage × coefficient d'âge) et la méthode INSEE (analyse des unités de consommation). Les résultats sont croisés pour fournir une fourchette indicative.",
  },
  {
    question: "Le résultat remplace-t-il un avocat ?",
    answer:
      "Non. SimulDivorce est un outil de simulation indicatif basé sur des barèmes publics (Ministère de la Justice, Code Civil). Il ne constitue pas un conseil juridique. Consultez un avocat spécialisé pour valider les résultats.",
  },
]);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center relative overflow-hidden text-center transition-colors duration-300">
      <SEO
        title="Simulateur Divorce Gratuit — Prestation Compensatoire"
        description="Simulez gratuitement votre prestation compensatoire. Calculs locaux et confidentiels. Trois méthodes croisées : Calcul PC, Tiers Pondéré, INSEE."
        path="/"
        jsonLd={landingFaq}
      />
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_var(--bg-secondary)_0%,_transparent_70%)] opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--accent-primary)] rounded-full blur-[150px] opacity-10 animate-pulse-glow" />

      {/* Header */}
      <div className="z-20 flex items-center w-full p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center">
            <span className="font-mono font-bold" style={{ color: "#ffffff" }}>
              D
            </span>
          </div>
          <span className="text-[var(--text-primary)] font-bold tracking-wider">
            SimulDivorce
          </span>
        </div>
      </div>

      <div className="z-10 flex flex-col items-center justify-center flex-1 w-full max-w-md p-6 pb-24">
        {/* Zero-G Entry Visualization */}
        <div className="relative flex items-center justify-center h-64 mb-10 preserve-3d">
          {/* Privacy Force Field (The Shield) */}
          <div className="absolute w-44 h-80 rounded-[3rem] border-2 border-[var(--accent-primary)] shadow-[0_0_30px_rgba(20,184,166,0.3)] animate-float" />
          <div className="absolute w-48 h-84 rounded-[3.5rem] border border-[var(--accent-primary)] opacity-30 animate-pulse-glow" />

          {/* The 3D Phone */}
          <div className="w-36 h-72 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] relative shadow-2xl animate-[float_6s_ease-in-out_infinite_1s] overflow-hidden">
            {/* Phone Screen Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-tertiary)] to-[var(--bg-primary)] opacity-90" />
            <div className="absolute left-0 right-0 flex justify-center bottom-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] blur-md opacity-20 animate-pulse" />
            </div>
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full shadow-[0_0_10px_var(--accent-primary)] animate-[bounce_2s_infinite]" />
          </div>
        </div>

        {/* Typography Manifesting */}
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-muted)] mb-4 tracking-tighter animate-[fadeIn_1s_ease-out_forwards] leading-tight">
          Prévoyez l'avenir, <br /> protégez votre vie privée.
        </h1>
        <div className="flex flex-col items-center mb-10 space-y-2 animate-[fadeIn_1s_ease-out_0.3s_forwards]">
          <p className="text-sm text-[var(--text-muted)] font-light">
            Aucun compte requis.{" "}
            <span className="text-[var(--accent-primary)] font-medium">
              Vos informations restent en sécurité.
            </span>
          </p>
          <InfoTooltip
            content="Nous ne demandons aucun document. Vous insérer seulement les informations nécessaires et le calcul est fait en local. Dès que vous fermez l'app, tout est effacé."
            label="Comment c'est possible ?"
          />
        </div>

        {/* Kinetic Button */}
        <button
          onClick={() => navigate("/disclaimer")}
          className="relative group w-full bg-[var(--bg-secondary)] hover:bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold py-5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--bg-primary)]/10 to-transparent translate-x-[-100%] group-hover:animate-[warp-speed_0.5s_linear]" />
          <span className="relative flex items-center justify-center space-x-3 text-lg tracking-wider">
            <span>Démarrer ma simulation gratuite</span>
          </span>
          <span className="relative text-[10px] block mt-1 opacity-70"></span>
        </button>

        {/* Mini Disclaimer */}
        <div className="max-w-sm mx-auto mt-4 px-4 py-2.5 rounded-xl border border-amber-500/50 bg-amber-500/15">
          <p className="text-xs font-semibold leading-relaxed text-center text-amber-500">
            ⚠ Outil à caractère informatif uniquement — aucune valeur
            juridique. Ne se substitue pas à l'avis d'un avocat ou d'un notaire.
          </p>
        </div>

        <Link
          to="/guide"
          className="mt-6 text-[var(--accent-primary)] hover:text-[var(--accent-hover)] text-xs uppercase tracking-widest font-bold border-b border-transparent hover:border-[var(--accent-primary)] transition-all pb-0.5"
        >
          Guide de préparation
        </Link>

        <nav className="flex mt-4 space-x-4" aria-label="Liens légaux">
          <Link
            to="/privacy"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm uppercase tracking-widest transition-colors"
          >
            Confidentialité
          </Link>
          <span className="text-[var(--text-muted)]" aria-hidden="true">
            •
          </span>
          <Link
            to="/terms"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm uppercase tracking-widest transition-colors"
          >
            CGU
          </Link>
        </nav>

        <nav
          className="flex flex-col items-center mt-4 space-y-2"
          aria-label="Ressources"
        >
          <Link
            to="/methodology"
            className="text-[var(--accent-primary)]/70 hover:text-[var(--accent-primary)] text-sm uppercase tracking-widest transition-colors flex items-center justify-center space-x-1"
          >
            <span className="w-1 h-1 bg-[var(--accent-primary)] rounded-full animate-pulse"></span>
            <span>Sources & Méthodologie</span>
          </Link>
          <Link
            to="/glossary"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm uppercase tracking-widest transition-colors"
          >
            Lexique
          </Link>
        </nav>
      </div>

      {/* Bottom Leaderboard Ad */}
      <div
        className="w-full bg-[var(--bg-tertiary)]/50 border-t border-[var(--border-color)] flex items-center justify-center z-20"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          minHeight: "4rem",
        }}
      >
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
          Google Ads Leaderboard
        </span>
      </div>
    </div>
  );
};

export default LandingPage;
