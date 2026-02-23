import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Home,
  Book,
  Scale,
  Users,
  Calculator,
} from "lucide-react";
import { SEO, breadcrumbJsonLd, faqJsonLd } from "../components/SEO";

const GlossaryPage: React.FC = () => {
  const navigate = useNavigate();

  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <section className="mb-8 animate-fade-in">
      <div className="flex items-center space-x-2 mb-4 border-b border-white/10 pb-2">
        <Icon className="w-5 h-5 text-[var(--color-plasma-cyan)]" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-white">
          {title}
        </h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );

  const Definition = ({
    term,
    def,
  }: {
    term: string;
    def: React.ReactNode;
  }) => (
    <div className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-white/10 transition">
      <h3 className="text-xs font-bold text-[var(--color-plasma-cyan)] uppercase tracking-wide mb-2">
        {term}
      </h3>
      <div className="text-sm text-gray-300 leading-relaxed">{def}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative text-white font-sans">
      <SEO
        title="Lexique du Divorce — Définitions 2026"
        description="Définitions claires des termes juridiques du divorce : prestation compensatoire, créancier, débiteur, tiers pondéré, unités de consommation."
        path="/glossary"
        type="article"
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Lexique", path: "/glossary" },
          ]),
          faqJsonLd([
            {
              question: "Qu'est-ce que la prestation compensatoire ?",
              answer:
                "La prestation compensatoire est un capital versé pour compenser la disparité de niveau de vie causée par le divorce (art. 270 à 281 du Code Civil). Elle est estimée via plusieurs méthodes (Calcul PC, Tiers Pondéré, INSEE). Les calculs sont réalisés localement sur votre appareil.",
            },
            {
              question: "Que signifie créancier et débiteur dans un divorce ?",
              answer:
                "Le créancier est l'époux qui perçoit la prestation compensatoire (celui qui subit la disparité de revenus). Le débiteur est celui qui la verse (celui qui a les revenus les plus élevés).",
            },
            {
              question: "Qu'est-ce que la méthode du Tiers Pondéré ?",
              answer:
                "La méthode du Tiers Pondéré (dite Pilote) calcule la prestation compensatoire à partir du différentiel de revenus nets, pondéré par la durée du mariage et l'âge du bénéficiaire.",
            },
          ]),
        ]}
      />
      {/* Background */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,_var(--accent-light)_0%,_transparent_50%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between z-10 sticky top-0 bg-[var(--color-deep-space)]/90 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
        <span className="text-xs font-bold tracking-[0.2em] text-white uppercase text-glow">
          Lexique
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Terminologie 2026</h1>
          <p className="text-sm text-gray-400">
            Comprendre le vocabulaire utilisé dans le simulateur.
          </p>
        </div>

        {/* 1. Acteurs */}
        <Section title="1. Acteurs du Divorce" icon={Users}>
          <Definition
            term="Créancier"
            def="L'époux qui perçoit la prestation compensatoire. C'est celui dont les revenus sont les plus faibles après le divorce. Le simulateur identifie automatiquement le créancier."
          />
          <Definition
            term="Débiteur"
            def="L'époux qui verse la prestation compensatoire. C'est celui dont les revenus sont les plus élevés. Si les revenus sont inversés, le simulateur effectue un échange automatique."
          />
          <Definition
            term="JAF (Juge aux Affaires Familiales)"
            def="Magistrat compétent pour trancher les litiges liés au divorce, à la garde des enfants et aux prestations financières."
          />
        </Section>

        {/* 2. Méthodes de Calcul PC */}
        <Section title="2. Méthodes de Calcul (PC)" icon={Calculator}>
          <Definition
            term="Méthode Calcul PC"
            def="Méthode de calcul de la prestation compensatoire basée sur les revenus bruts projetés sur 8 ans, le patrimoine, la pondération durée × âge et la réparation retraite. Nécessite les revenus bruts, le patrimoine non productif et les données de retraite."
          />
          <Definition
            term="Méthode du Tiers Pondéré (Pilote)"
            def="Calcul du différentiel de revenus nets annuels, pondéré par la durée du mariage et un coefficient d'âge du bénéficiaire. Méthode rapide basée uniquement sur les revenus nets mensuels."
          />
          <Definition
            term="Méthode INSEE (UC OCDE)"
            def="Analyse basée sur les unités de consommation de l'OCDE. Prend en compte les enfants (âge et nombre), le type de garde et les revenus nets pour calculer la perte de niveau de vie du créancier."
          />
        </Section>

        {/* 3. Revenus */}
        <Section title="3. Revenus" icon={Book}>
          <Definition
            term="Net Social"
            def="Montant obligatoire sur les bulletins de paie depuis 2024. Correspond au brut moins les cotisations sociales. C'est la base de calcul pour les méthodes Tiers Pondéré et INSEE."
          />
          <Definition
            term="Revenu Brut"
            def="Revenu avant déduction des cotisations sociales. Utilisé par la méthode Calcul PC (saisie en mensuel ou annuel)."
          />
          <Definition
            term="Disparité de Niveau de Vie"
            def="Différence de situation financière entre les deux époux après le divorce. C'est le fondement de la prestation compensatoire."
          />
          <Definition
            term="RSA Socle"
            def="Revenu de Solidarité Active — montant de référence utilisé dans certains barèmes de calcul."
          />
        </Section>

        {/* 4. Famille */}
        <Section title="4. Famille & Garde" icon={Users}>
          <Definition
            term="Garde Classique (Droit de visite et d'hébergement)"
            def="L'enfant réside principalement chez un parent."
          />
          <Definition
            term="Garde Alternée"
            def="L'enfant réside à parts égales chez les deux parents."
          />
          <Definition
            term="Garde Réduite"
            def="Droit de visite réduit. Le parent a l'enfant la majeure partie du temps."
          />
          <Definition
            term="Unité de Consommation (UC)"
            def="Échelle OCDE utilisée par la méthode INSEE : 1er adulte = 1, 2e adulte = 0,5, enfant < 14 ans = 0,3, enfant ≥ 14 ans = 0,5. Permet de comparer les niveaux de vie des ménages."
          />
        </Section>

        {/* 5. Prestation Compensatoire */}
        <Section title="5. Prestation Compensatoire" icon={Scale}>
          <Definition
            term="Prestation Compensatoire (PC)"
            def="Capital versé en une fois ou sous forme de rente pour compenser la disparité de niveau de vie causée par le divorce. Estimée via 3 méthodes croisées (Calcul PC, Tiers Pondéré, INSEE)."
          />
        </Section>

        {/* 6. Acronymes */}
        <Section title="6. Acronymes" icon={Scale}>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-white/5 text-gray-300">
                <tr className="bg-white/5">
                  <td className="px-4 py-2 font-bold text-[var(--color-plasma-cyan)]">
                    PC
                  </td>
                  <td className="px-4 py-2">Prestation Compensatoire</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-[var(--color-plasma-cyan)]">
                    JAF
                  </td>
                  <td className="px-4 py-2">Juge aux Affaires Familiales</td>
                </tr>
                <tr className="bg-white/5">
                  <td className="px-4 py-2 font-bold text-[var(--color-plasma-cyan)]">
                    UC
                  </td>
                  <td className="px-4 py-2">Unité de Consommation (OCDE)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-[var(--color-plasma-cyan)]">
                    RSA
                  </td>
                  <td className="px-4 py-2">Revenu de Solidarité Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default GlossaryPage;
