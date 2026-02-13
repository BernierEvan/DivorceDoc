import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Book,
  Scale,
  Wallet,
  FileText,
  Activity,
} from "lucide-react";

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
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative overflow-hidden text-white font-sans">
      {/* Background */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,_#1e1b4b_0%,_transparent_50%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between z-10 sticky top-0 bg-[var(--color-deep-space)]/90 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
        <span className="text-xs font-bold tracking-[0.2em] text-white uppercase text-glow">
          Lexique Juridique
        </span>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Terminologie 2026</h1>
          <p className="text-sm text-gray-400">
            Comprendre le vocabulaire de la procédure et de l'algorithme.
          </p>
        </div>

        {/* 1. Procédure */}
        <Section title="1. Procédure" icon={Scale}>
          <Definition
            term="Consentement Mutuel"
            def="Procédure amiable sans juge (si accord total). Réduit les frais et la durée."
          />
          <Definition
            term="Divorce Contentieux"
            def="Procédure devant le JAF. Utilisé en cas de désaccord. Incertitude plus élevée."
          />
          <Definition
            term="Date de Jouissance Divise"
            def="Date pivot pour l'évaluation des biens à partager."
          />
          <Definition
            term="Ordonnance de Protection"
            def="Mesure d'urgence modifiant les priorités de calcul des charges."
          />
        </Section>

        {/* 2. Revenus (OCR) */}
        <Section title="2. Revenus & OCR" icon={Book}>
          <Definition
            term="Net Social"
            def={
              <span>
                <strong>Obligatoire 2026.</strong> Montant pivot (Brut -
                Cotisations) utilisé par l'algorithme.
              </span>
            }
          />
          <Definition
            term="Revenu Fiscal de Référence (RFR)"
            def="Indicateur de solvabilité globale sur l'avis d'imposition."
          />
          <Definition
            term="Disparité de Niveau de Vie"
            def="Différence mathématique entre les situations post-divorce A et B."
          />
        </Section>

        {/* 3. Patrimoine */}
        <Section title="3. Patrimoine & Liquidation" icon={Wallet}>
          <Definition
            term="Soulte"
            def={
              <div>
                Somme versée pour conserver un bien commun.
                <div className="mt-2 font-mono text-[10px] bg-black/30 p-2 rounded">
                  Soulte = (Valeur - CRD) / 2
                </div>
              </div>
            }
          />
          <Definition
            term="Récompense"
            def="Correction comptable quand des fonds propres ont financé un bien commun."
          />
          <Definition
            term="Actif / Passif Communautaire"
            def="Biens acquis vs Dettes contractées pendant le mariage."
          />
        </Section>

        {/* 4. Prestations */}
        <Section title="4. Prestations" icon={Activity}>
          <Definition
            term="Prestation Compensatoire (PC)"
            def="Capital pour compenser la disparité (Fourchette Jurisprudentielle)."
          />
          <Definition
            term="Contribution (CEEE)"
            def="Pension alimentaire pour les enfants (Barème Ministère)."
          />
          <Definition
            term="Reste à Vivre"
            def="Budget disponible après charges fixes (Seuil pauvreté monitoré)."
          />
        </Section>

        {/* 5. Acronymes */}
        <Section title="5. Acronymes" icon={FileText}>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-white/5 text-gray-300">
                <tr className="bg-white/5">
                  <td className="px-4 py-2 font-bold text-[var(--color-plasma-cyan)]">
                    JAF
                  </td>
                  <td className="px-4 py-2">Juge aux Affaires Familiales</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-[var(--color-plasma-cyan)]">
                    ONC
                  </td>
                  <td className="px-4 py-2">Ordonnance de Non-Conciliation</td>
                </tr>
                <tr className="bg-white/5">
                  <td className="px-4 py-2 font-bold text-[var(--color-plasma-cyan)]">
                    CRD
                  </td>
                  <td className="px-4 py-2">
                    Capital Restant Dû (Amortissement)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-[var(--color-plasma-cyan)]">
                    UC
                  </td>
                  <td className="px-4 py-2">Unité de Consommation (INSEE)</td>
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
