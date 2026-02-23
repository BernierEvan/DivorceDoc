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
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative text-white font-sans">
      <SEO
        title="Politique de Confidentialité — Privacy by Design"
        description="SimulDivorce : calculs 100 % locaux, données publicitaires Google limitées au strict nécessaire, envoi de documents par e-mail sur demande. Conforme RGPD."
        path="/privacy"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Confidentialité", path: "/privacy" },
        ])}
      />
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,_var(--accent-light)_0%,_transparent_50%)] opacity-30 pointer-events-none" />

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
          <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-muted)]">
            Privacy by Design
          </h1>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Vos données de simulation restent sur votre appareil. Seules les
            données strictement nécessaires à la publicité et à l'envoi de
            documents transitent par des services tiers.
          </p>
        </div>

        <Section title="1. Préambule" icon={Lock}>
          <p>
            L'application a été conçue selon le principe du{" "}
            <strong>Privacy by Design</strong> (Protection de la vie privée dès
            la conception). Tous les calculs de simulation sont réalisés
            directement sur votre appareil, sans serveur de traitement.
            Toutefois, certaines données transitent par des services tiers :
            données nécessaires à la publicité (Google Ads) et adresse e-mail
            pour l'envoi de documents sur votre demande.
          </p>
        </Section>

        <Section title="2. Responsable du Traitement">
          <p>
            Pour les données de simulation, le responsable de traitement au sens
            du RGPD est l'utilisateur lui-même sur son propre terminal. Pour les
            données publicitaires et l'envoi d'e-mails, le responsable de
            traitement est l'Éditeur.
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
            <li>Revenus, situation familiale.</li>
            <li>
              Traitement : Exclusivement local (JavaScript côté navigateur).
            </li>
            <li>
              Stockage : localStorage uniquement. Supprimé à la fermeture de
              session ou manuellement.
            </li>
          </ul>

          <h3 className="text-white font-bold mb-1">
            B. Données Publicitaires
          </h3>
          <ul className="list-disc pl-4 space-y-1 mb-4 text-gray-400">
            <li>
              Cookies & Identifiants (Google AdSense / Google Tag Manager).
            </li>
            <li>
              Données de navigation nécessaires au ciblage publicitaire (adresse
              IP, type d'appareil, pages visitées).
            </li>
            <li>
              Ces données sont transmises à Google conformément à leur politique
              de confidentialité.
            </li>
          </ul>

          <h3 className="text-white font-bold mb-1">
            C. Données d'Envoi de Documents
          </h3>
          <ul className="list-disc pl-4 space-y-1 text-gray-400">
            <li>
              Adresse e-mail (fournie volontairement pour recevoir un document).
            </li>
            <li>
              Sélection des calculs demandés (type de document, pas les données
              financières).
            </li>
            <li>
              Transmises à notre service d'envoi d'e-mails uniquement dans le
              but de délivrer le document.
            </li>
          </ul>
        </Section>

        <Section title="4. Base Légale">
          <p>
            Le traitement de vos données de simulation repose sur votre{" "}
            <strong>consentement explicite</strong>, recueilli au moment de la
            saisie de vos informations. Vous pouvez retirer ce consentement à
            tout moment en fermant simplement l'application ou en effaçant les
            données du navigateur.
          </p>
        </Section>

        <Section title="5. Destinataires & Transferts" icon={EyeOff}>
          <p>
            <strong>Données financières :</strong> Vos chiffres de simulation
            (revenus, situation familiale) restent sur votre appareil et ne sont
            transmis à aucun tiers.
          </p>
          <p>
            <strong>Publicité :</strong> Des données de navigation (adresse IP,
            pages visitées, type d'appareil) sont partagées avec Google dans le
            cadre de la diffusion publicitaire. Ces données sont strictement
            limitées au nécessaire.
          </p>
          <p>
            <strong>Envoi de documents :</strong> Si vous demandez l'envoi d'un
            document par e-mail, votre adresse e-mail et le type de document
            choisi sont transmis à notre service d'envoi.
          </p>
        </Section>

        <Section title="6. Sécurité des Données" icon={ServerOff}>
          <ul className="list-none space-y-2">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-[var(--color-plasma-cyan)] rounded-full" />
              <span>
                <strong>Traitement Local :</strong> Tous les calculs de
                simulation sont exécutés dans votre navigateur.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-[var(--color-plasma-cyan)] rounded-full" />
              <span>
                <strong>Isolation :</strong> Code sandboxé dans le navigateur.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-[var(--color-plasma-cyan)] rounded-full" />
              <span>
                <strong>Sans Base de Données :</strong> Aucun stockage Cloud de
                vos données financières.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              <span>
                <strong>Transmissions limitées :</strong> Données publicitaires
                (Google) et adresse e-mail (envoi de documents) uniquement.
              </span>
            </li>
          </ul>
        </Section>

        <Section title="7. Vos Droits (RGPD)">
          <ul className="space-y-2">
            <li>
              <strong>Droit à l'oubli :</strong> Effectif dès fermeture de
              session ou suppression des données du navigateur.
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

        <Section title="8. Modifications">
          <p>Toute mise à jour sera signalée par une notification in-app.</p>
        </Section>

        <div className="mt-12 p-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500 italic">
            "Vos données financières restent sur votre appareil. Notre modèle
            économique repose sur la publicité (données de navigation partagées
            avec Google) et non sur la revente de vos informations personnelles
            sensibles."
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
