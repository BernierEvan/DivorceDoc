import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Home,
  BookOpen,
  Scale,
  FileText,
  Database,
  ShieldCheck,
} from "lucide-react";
import { SEO, breadcrumbJsonLd } from "../components/SEO";

const MethodologyPage: React.FC = () => {
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

  const Table = ({
    headers,
    rows,
  }: {
    headers: string[];
    rows: string[][];
  }) => (
    <div className="overflow-hidden rounded-xl border border-white/10 glass-panel">
      <table className="w-full text-xs text-left">
        <thead className="bg-white/5 uppercase tracking-wider text-gray-400">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-gray-300">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-white/5 transition">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative overflow-hidden text-white font-sans">
      <SEO
        title="Méthodologie et Sources Juridiques — Code Civil, Barèmes 2026"
        description="Transparence sur les sources juridiques et algorithmes de DivorceDoc : Code Civil (Art. 270-281, 371-2), barème pension alimentaire MJ 2026, méthodes Pilote et INSEE pour la prestation compensatoire."
        path="/methodology"
        type="article"
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Méthodologie", path: "/methodology" },
        ])}
      />
      {/* Background */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,_#1e1b4b_0%,_transparent_50%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between z-10 sticky top-0 bg-[var(--color-deep-space)]/90 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
        <span className="text-xs font-bold tracking-[0.2em] text-white uppercase text-glow">
          Méthodologie
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
        {/* Intro */}
        <div className="mb-10 text-center">
          <h1 className="text-xl font-bold mb-2">
            Sources Juridiques & Algorithmiques
          </h1>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Transparence sur les règles de droit et les modèles mathématiques
            utilisés par DivorceDoc (v2026).
          </p>
        </div>

        {/* 1. Cadre Légal */}
        <Section title="1. Cadre Légal : Code Civil" icon={BookOpen}>
          <Table
            headers={["Domaine", "Articles", "Portée"]}
            rows={[
              [
                "Prestation Compensatoire",
                "Art. 270 à 281",
                "Critères de disparité et modalités de versement.",
              ],
              [
                "Pension Alimentaire",
                "Art. 371-2",
                "Obligation d'entretien proportionnelle aux ressources.",
              ],
              [
                "Régimes Matrimoniaux",
                "Art. 1400+",
                "Règles de liquidation (Communauté/Séparation).",
              ],
              [
                "Preuve des Revenus",
                "Art. 272",
                "Obligation de déclaration sur l'honneur.",
              ],
            ]}
          />
        </Section>

        {/* 2. Référentiels Calcul */}
        <Section title="2. Référentiels de Calcul" icon={Scale}>
          <div className="glass-panel p-4 rounded-xl border border-white/10 mb-4">
            <h3 className="text-xs font-bold text-[var(--color-plasma-cyan)] mb-2">
              A. Pension Alimentaire
            </h3>
            <p className="text-xs text-gray-300 mb-2">
              Basé sur la{" "}
              <strong>
                Table de Référence du Ministère de la Justice (Janvier 2026)
              </strong>
              .
            </p>
            <div className="font-mono text-[10px] bg-black/30 p-2 rounded border border-white/5">
              Formule : PA = (Revenu_Debiteur - RSA_Socle) × %_Enfants
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-white/10">
            <h3 className="text-xs font-bold text-[var(--color-plasma-cyan)] mb-2">
              B. Prestation Compensatoire
            </h3>
            <p className="text-xs text-gray-300 mb-2">
              Méthodes doctrinales croisées :
            </p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-gray-400">
              <li>
                <strong>Méthode Pilote :</strong> Différentiel revenus × Durée ×
                Coeff. Âge.
              </li>
              <li>
                <strong>Méthode INSEE :</strong> Analyse des unités de
                consommation (UC).
              </li>
            </ul>
          </div>
        </Section>

        {/* 3. Données Fiscales */}
        <Section title="3. Sources Fiscales (OCR)" icon={FileText}>
          <p className="text-xs text-gray-400 mb-4">
            L'IA extrait les données définies par le Code Général des Impôts
            (CGI) :
          </p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center">
              <Database className="w-3 h-3 mr-2 text-gray-500" />{" "}
              <strong>Revenu Fiscal de Référence (RFR) :</strong> Art. 1417 CGI.
            </li>
            <li className="flex items-center">
              <Database className="w-3 h-3 mr-2 text-gray-500" />{" "}
              <strong>Montant Net Social :</strong> Base de ressources réelles.
            </li>
          </ul>
        </Section>

        {/* 4. Conformité IA */}
        <Section title="4. Conformité Numérique & IA" icon={ShieldCheck}>
          <Table
            headers={["Règlement", "Conformité"]}
            rows={[
              [
                "RGPD (Art. 5.1.c)",
                "Minimisation : Architecture Stateless (RAM uniquement).",
              ],
              [
                "EU AI Act (2026)",
                "Système à faible risque. Transparence algorithmique.",
              ],
            ]}
          />
        </Section>
      </div>
    </div>
  );
};

export default MethodologyPage;
