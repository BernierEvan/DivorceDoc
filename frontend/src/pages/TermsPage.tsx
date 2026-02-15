import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Scale,
  AlertTriangle,
  CloudOff,
  UserCheck,
  ShieldOff,
  Copyright,
  DollarSign,
  Flag,
} from "lucide-react";
import { SEO, breadcrumbJsonLd } from "../components/SEO";

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  const Section = ({
    title,
    children,
    icon: Icon,
    isWarning = false,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: any;
    isWarning?: boolean;
  }) => (
    <section className="animate-fade-in mb-10">
      <div className="flex items-center mb-4 space-x-2">
        {Icon && (
          <Icon
            className={`w-5 h-5 ${isWarning ? "text-yellow-500" : "text-[var(--color-plasma-cyan)]"}`}
          />
        )}
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          {title}
        </h2>
      </div>
      <div
        className={`glass-panel p-6 rounded-2xl border ${isWarning ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/10"} text-sm text-gray-300 leading-relaxed space-y-4`}
      >
        {children}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative overflow-hidden text-white font-sans">
      <SEO
        title="Conditions Générales d'Utilisation (CGU)"
        description="CGU de DivorceDoc : simulateur de divorce gratuit à vocation informative. Architecture stateless, aucun stockage, limitation de responsabilité."
        path="/terms"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "CGU", path: "/terms" },
        ])}
      />
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,_#1e1b4b_0%,_transparent_50%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between z-10 sticky top-0 bg-[var(--color-deep-space)]/90 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
        <span className="text-xs font-bold tracking-[0.2em] text-white uppercase text-glow">
          CGU
        </span>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
        {/* Title */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-[var(--color-plasma-cyan)]/10 rounded-full mb-6 border border-[var(--color-plasma-cyan)]/20 animate-pulse-glow">
            <Scale className="w-8 h-8 text-[var(--color-plasma-cyan)]" />
          </div>
          <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Dernière mise à jour : Février 2026
          </p>
        </div>

        <Section title="1. Objet du Service" icon={Scale}>
          <p>
            La plateforme (ci-après "l'Application") propose un outil de
            simulation automatisé permettant d'estimer les conséquences
            financières d'un divorce.
          </p>
          <p>
            L'Application utilise une technologie d'OCR locale pour extraire des
            données et générer des rapports de synthèse.
          </p>
        </Section>

        <Section
          title="2. Avertissement (Disclaimer)"
          icon={AlertTriangle}
          isWarning={true}
        >
          <strong className="block text-yellow-400 mb-2 font-bold tracking-wider">
            L'UTILISATION DE L'APPLICATION NE CONSTITUE EN AUCUN CAS UN CONSEIL
            JURIDIQUE.
          </strong>
          <ul className="list-disc pl-4 space-y-2">
            <li>
              <strong className="text-white">Nature du service :</strong> Simple
              outil mathématique basé sur des barèmes publics.
            </li>
            <li>
              <strong className="text-white">Absence de conseil :</strong>{" "}
              L'Éditeur n'est pas avocat ni notaire. Résultats indicatifs.
            </li>
            <li>
              <strong className="text-white">
                Nécessité d'un professionnel :
              </strong>{" "}
              Consultez un avocat pour valider tout résultat.
            </li>
          </ul>
        </Section>

        <Section title="3. Accès & Fonctionnement Stateless" icon={CloudOff}>
          <ul className="space-y-2">
            <li>
              <strong>Gratuité :</strong> Service financé par la publicité.
            </li>
            <li>
              <strong>Architecture Locale :</strong> Traitement intégral sur
              votre appareil.
            </li>
            <li>
              <strong>Absence de Stockage :</strong> La fermeture de session
              entraîne la suppression irréversible des données.
            </li>
          </ul>
        </Section>

        <Section title="4. Responsabilité Utilisateur" icon={UserCheck}>
          <p>Vous êtes seul responsable de :</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>L'exactitude des documents importés.</li>
            <li>L'usage personnel (non commercial) du service.</li>
            <li>La vérification humaine de chaque chiffre extrait.</li>
          </ul>
        </Section>

        <Section title="5. Limitation de Responsabilité" icon={ShieldOff}>
          <p>L'Éditeur n'est pas responsable :</p>
          <ul className="list-disc pl-4 mt-2 space-y-1 text-gray-400">
            <li>Des erreurs OCR (Tesseract.js).</li>
            <li>Des divergences avec les décisions judiciaires réelles.</li>
            <li>Des pertes de données par fermeture accidentelle.</li>
            <li>Des bugs liés à la publicité tierce.</li>
          </ul>
        </Section>

        <Section title="6. Propriété Intellectuelle" icon={Copyright}>
          <p>
            Tous les éléments (code, algo, design) sont la propriété exclusive
            de l'Éditeur. Reproduction interdite.
          </p>
        </Section>

        <Section title="7. Publicité & Monétisation" icon={DollarSign}>
          <p>
            Le service est financé par <strong>Google AdSense/AdMob</strong>.
          </p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>L'Utilisateur accepte l'exposition publicitaire.</li>
            <li>
              L'Éditeur peut restreindre l'accès en cas d'utilisation de
              bloqueur de publicité.
            </li>
          </ul>
        </Section>

        <Section title="8. Protection des Données" icon={Flag}>
          <p>
            Aucune donnée personnelle sensible n'est collectée par l'Éditeur
            (RGPD). Voir{" "}
            <a
              href="/privacy"
              className="text-[var(--color-plasma-cyan)] underline"
            >
              Politique de Confidentialité
            </a>
            .
          </p>
        </Section>

        <Section title="9. Juridiction">
          <p>
            Droit français applicable. Compétence exclusive des tribunaux de
            [Votre Ville].
          </p>
        </Section>
      </div>
    </div>
  );
};

export default TermsPage;
