import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Home,
  Shield,
  Lock,
  Fingerprint,
  EyeOff,
  ServerOff,
} from "lucide-react";
import { SEO, breadcrumbJsonLd } from "../components/SEO";

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  const Section = ({
    title,
    children,
    icon: Icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: any;
  }) => (
    <section className="animate-fade-in mb-10">
      <div className="flex items-center mb-4 space-x-2">
        {Icon && <Icon className="w-5 h-5 text-[var(--color-plasma-cyan)]" />}
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          {title}
        </h2>
      </div>
      <div className="glass-panel p-6 rounded-2xl border border-white/10 text-sm text-gray-300 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative overflow-hidden text-white font-sans">
      <SEO
        title="Politique de Confidentialité — Privacy by Design"
        description="DivorceDoc ne collecte aucune donnée personnelle. Traitement 100% local (Tesseract.js), RAM uniquement, zéro stockage Cloud. Conforme RGPD et AI Act."
        path="/privacy"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Confidentialité", path: "/privacy" },
        ])}
      />
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,_#1e1b4b_0%,_transparent_50%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between z-10 sticky top-0 bg-[var(--color-deep-space)]/90 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
        <span className="text-xs font-bold tracking-[0.2em] text-white uppercase text-glow">
          Politique de Confidentialité
        </span>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group flex items-center justify-center"
          title="Accueil"
        >
          <Home className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
        {/* Preamble */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-[var(--color-plasma-cyan)]/10 rounded-full mb-6 border border-[var(--color-plasma-cyan)]/20 animate-pulse-glow">
            <Shield className="w-8 h-8 text-[var(--color-plasma-cyan)]" />
          </div>
          <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Privacy by Design
          </h1>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Votre vie privée est garantie par l'absence physique de vos données
            sur nos systèmes.
          </p>
        </div>

        <Section title="1. Préambule" icon={Lock}>
          <p>
            L'application a été conçue selon le principe du{" "}
            <strong>Privacy by Design</strong> (Protection de la vie privée dès
            la conception). Contrairement aux services classiques, nous avons
            fait le choix technologique de supprimer le serveur de traitement.
          </p>
        </Section>

        <Section title="2. Responsable du Traitement">
          <p>
            Puisque l'application ne collecte aucune donnée personnelle sur ses
            serveurs, le responsable de traitement au sens du RGPD est
            l'utilisateur lui-même sur son propre terminal.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Pour la gestion des services tiers (Publicité) :<br />
            Entité : X<br />
            Contact DPO : X
          </p>
        </Section>

        <Section title="3. Nature des Données" icon={Fingerprint}>
          <h3 className="text-white font-bold mb-1">
            A. Données de Simulation (Sensibles)
          </h3>
          <ul className="list-disc pl-4 space-y-1 mb-4 text-gray-400">
            <li>Revenus, patrimoine, avis d'imposition.</li>
            <li>Traitement : Exclusivement local via Tesseract.js.</li>
            <li>Stockage : RAM uniquement. Persistance : 0 minute.</li>
          </ul>

          <h3 className="text-white font-bold mb-1">
            B. Données Techniques & Pub
          </h3>
          <ul className="list-disc pl-4 space-y-1 text-gray-400">
            <li>Cookies & Identifiants (Google AdSense/AdMob).</li>
            <li>Données de navigation anonymisées.</li>
          </ul>
        </Section>

        <Section title="4. Base Légale">
          <p>
            Le traitement de vos données de simulation repose sur votre{" "}
            <strong>consentement explicite</strong> (Art. 6.1.a du RGPD),
            recueilli au moment de l'importation de vos documents. Vous pouvez
            retirer ce consentement à tout moment en fermant simplement
            l'application.
          </p>
        </Section>

        <Section title="5. Destinataires & Transferts" icon={EyeOff}>
          <p>
            <strong>Données financières :</strong> AUCUN tiers n'a accès à vos
            chiffres. Ni l'éditeur, ni Google, ni aucune autorité.
          </p>
          <p>
            <strong>Publicité :</strong> Publicités non personnalisées par
            défaut, sauf consentement aux cookies.
          </p>
        </Section>

        <Section title="6. Sécurité des Données" icon={ServerOff}>
          <ul className="list-none space-y-2">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-[var(--color-plasma-cyan)] rounded-full" />
              <span>
                <strong>Chiffrement Local :</strong> Opérations via API
                sécurisées.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-[var(--color-plasma-cyan)] rounded-full" />
              <span>
                <strong>Isolation :</strong> Code sandboxé.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-[var(--color-plasma-cyan)] rounded-full" />
              <span>
                <strong>Sans Base de Données :</strong> Aucun stockage Cloud.
              </span>
            </li>
          </ul>
        </Section>

        <Section title="7. Vos Droits (RGPD)">
          <ul className="space-y-2">
            <li>
              <strong>Droit à l'oubli :</strong> Effectif dès fermeture session.
            </li>
            <li>
              <strong>Droit à la portabilité :</strong> Via "Télécharger le
              rapport PDF".
            </li>
            <li>
              <strong>Droit d'opposition :</strong> Refus des cookies
              publicitaires possible.
            </li>
          </ul>
        </Section>

        <Section title="8. Intelligence Artificielle Locale">
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <p className="text-xs">
              Conformément au <strong>AI Act (2024)</strong> :
            </p>
            <ul className="list-disc pl-4 mt-2 space-y-1 text-xs text-gray-400">
              <li>Extraction automatisée locale.</li>
              <li>Décision finale par validation humaine.</li>
              <li>Pas d'entraînement de modèles tiers.</li>
            </ul>
          </div>
        </Section>

        <Section title="9. Modifications">
          <p>Toute mise à jour sera signalée par une notification in-app.</p>
        </Section>

        <div className="mt-12 p-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500 italic">
            "En utilisant l’application, vous restez maître de vos informations
            du début à la fin. Notre modèle économique repose sur votre
            attention (publicité) et non sur la revente de votre intimité."
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
