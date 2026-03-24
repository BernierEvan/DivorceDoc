import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AdUnit from "../components/AdUnit";
import { SEO } from "../components/SEO";

// ──────────────────────────────────────────────────────────────
// Editorial content variants — substantial publisher content
// to satisfy AdSense "pages with publisher content" requirement.
// ──────────────────────────────────────────────────────────────

interface ContentVariant {
  title: string;
  seoTitle: string;
  seoDescription: string;
  paragraphs: string[];
}

const CONTENT_VARIANTS: Record<string, ContentVariant> = {
  "/dashboard": {
    title: "Avant vos résultats — ce qu'il faut savoir",
    seoTitle: "Comprendre la Prestation Compensatoire — Avant vos résultats",
    seoDescription:
      "Informations essentielles sur la prestation compensatoire avant de consulter vos résultats de simulation de divorce.",
    paragraphs: [
      "La prestation compensatoire est un mécanisme fondamental du droit du divorce en France. Prévue aux articles 270 à 281 du Code Civil, elle vise à compenser la disparité de niveau de vie créée par la rupture du mariage entre les deux époux. Contrairement à la pension alimentaire, elle est en principe versée sous forme de capital (somme forfaitaire), bien que le juge puisse exceptionnellement ordonner un versement sous forme de rente.",
      "Le Juge aux Affaires Familiales (JAF) dispose d'un pouvoir d'appréciation souverain pour fixer le montant de la prestation compensatoire. Il prend en compte les critères listés à l'article 271 du Code Civil : durée du mariage, âge et état de santé des époux, qualification et situation professionnelle, conséquences des choix professionnels faits pendant la vie commune, patrimoine estimé après liquidation du régime matrimonial, et droits prévisibles à la retraite.",
      "Les résultats que vous allez consulter sont issus de méthodes de calcul doctrinales (Tiers Pondéré, INSEE, Calcul PC) utilisées par les praticiens du droit. Ils constituent une estimation indicative et ne sauraient se substituer à l'avis d'un avocat spécialisé en droit de la famille.",
    ],
  },
  "/export": {
    title: "Avant votre rapport — conseils pratiques",
    seoTitle: "Conseils Pratiques — Avant le téléchargement du rapport",
    seoDescription:
      "Conseils pour exploiter au mieux votre rapport de simulation de prestation compensatoire.",
    paragraphs: [
      "Votre rapport de simulation est un outil d'aide à la décision qui synthétise les résultats des différentes méthodes de calcul sélectionnées. Il peut être présenté à votre avocat comme base de discussion, mais ne constitue en aucun cas un document juridique opposable. Seul le jugement de divorce ou la convention homologuée fixe définitivement le montant de la prestation compensatoire.",
      "En cas de divorce par consentement mutuel (article 229-1 du Code Civil), les deux époux et leurs avocats respectifs négocient librement le montant de la prestation compensatoire. Un simulateur comme SimulDivorce permet d'objectiver la discussion en fournissant des fourchettes basées sur des barèmes reconnus. En cas de divorce contentieux, c'est le JAF qui tranche souverainement.",
      "Pensez à consulter la page « Sources & Méthodologie » pour comprendre les hypothèses de calcul utilisées. Les coefficients d'âge, les projections de revenus et les unités de consommation OCDE sont détaillés pour chaque méthode, afin de garantir la transparence de la simulation.",
    ],
  },
};

// ──────────────────────────────────────────────────────────────
// Countdown duration (seconds) before auto-redirect
// ──────────────────────────────────────────────────────────────
const COUNTDOWN_SECONDS = 12;
const SKIP_AFTER_SECONDS = 5; // "Skip" button appears after this

const InterstitialAdPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destination = searchParams.get("to") || "/dashboard";
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canSkip, setCanSkip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const content =
    CONTENT_VARIANTS[destination] || CONTENT_VARIANTS["/dashboard"];

  useEffect(() => {
    window.scrollTo(0, 0);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          navigate(destination, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const skipTimer = setTimeout(
      () => setCanSkip(true),
      SKIP_AFTER_SECONDS * 1000,
    );

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(skipTimer);
    };
  }, [destination, navigate]);

  const handleSkip = () => {
    clearInterval(timerRef.current);
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col text-white">
      <SEO
        title={content.seoTitle}
        description={content.seoDescription}
        path="/transition"
        noindex={true}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <h1 className="text-xs font-bold tracking-widest text-white uppercase">
          {content.title}
        </h1>
        <div className="flex items-center space-x-3">
          {canSkip ? (
            <button
              onClick={handleSkip}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg bg-[var(--color-plasma-cyan)]/20 hover:bg-[var(--color-plasma-cyan)]/40 text-[var(--color-plasma-cyan)] transition-all"
            >
              Continuer →
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[10px] uppercase tracking-widest font-mono">
                {countdown}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content + Ad */}
      <div className="flex-1 px-6 py-8 pb-24 space-y-6 overflow-y-auto">
        {/* Editorial content */}
        <article className="space-y-4">
          {content.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed text-gray-300 animate-fade-in"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {p}
            </p>
          ))}
        </article>

        {/* Ad unit — video/display ad surrounded by publisher content */}
        <div className="flex justify-center py-4">
          <AdUnit type="rectangle" />
        </div>

        {/* Additional editorial content below ad */}
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <p className="text-xs leading-relaxed text-gray-500">
            <strong className="text-gray-400">Rappel :</strong> SimulDivorce est
            un outil de simulation indicatif basé sur des barèmes publics
            (Ministère de la Justice, Code Civil, échelle OCDE). Il ne constitue
            pas un conseil juridique. Pour toute décision importante, consultez
            un avocat spécialisé en droit de la famille.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-full h-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-[var(--color-plasma-cyan)] transition-all duration-1000 ease-linear rounded-full"
            style={{
              width: `${((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100}%`,
            }}
          />
        </div>

        {/* Skip button (bottom) */}
        {canSkip && (
          <div className="flex justify-center pt-2 animate-fade-in">
            <button
              onClick={handleSkip}
              className="w-full max-w-md bg-[var(--color-plasma-cyan)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center space-x-2 group active:scale-95"
              style={{ color: "#ffffff" }}
            >
              <span className="text-sm tracking-widest uppercase">
                Continuer vers{" "}
                {destination === "/export"
                  ? "le rapport"
                  : "les résultats"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterstitialAdPage;
