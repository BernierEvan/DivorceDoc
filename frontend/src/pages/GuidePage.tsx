import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ChevronLeft,
  CheckCircle,
  Shield,
  Camera,
  CreditCard,
  Home,
  Users,
  Lightbulb,
} from "lucide-react";

const GuidePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative overflow-hidden text-white font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-plasma-cyan)]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between z-10 sticky top-0 bg-[var(--color-deep-space)]/80 backdrop-blur-md border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
        <h1 className="text-sm font-bold tracking-widest text-white uppercase text-glow">
          Guide de Préparation
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 space-y-12">
        {/* 1. Introduction */}
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Pourquoi bien préparer vos documents ?
          </h2>
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              Pour que notre simulateur puisse calculer avec précision votre
              prestation compensatoire ou la liquidation de votre régime
              matrimonial, il doit analyser des données réelles. En préparant
              vos documents à l'avance, vous évitez les erreurs d'interprétation
              et garantissez une simulation conforme à la jurisprudence
              actuelle.
            </p>
            <div className="flex items-start space-x-3 bg-[var(--color-plasma-cyan)]/10 p-4 rounded-xl border border-[var(--color-plasma-cyan)]/20">
              <Shield className="w-5 h-5 text-[var(--color-plasma-cyan)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--color-plasma-cyan)]">
                <span className="font-bold uppercase tracking-wider block mb-1">
                  Rappel Confidentialité
                </span>
                Tous les documents listés ci-dessous seront analysés directement
                sur votre appareil. Rien ne sera envoyé sur nos serveurs.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Liste exhaustive */}
        <section className="animate-fade-in delay-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
            Liste des pièces
          </h3>

          <div className="grid gap-4">
            {/* Category A */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <div className="flex items-center mb-4 space-x-3">
                <div className="bg-indigo-500/20 p-2 rounded-lg">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                </div>
                <h4 className="font-bold text-lg">Situation Pro & Revenus</h4>
              </div>
              <ul className="space-y-3 text-sm text-gray-300 pl-2 border-l-2 border-white/5">
                <li>
                  <strong className="text-white">Avis d'imposition</strong> (les
                  2 derniers)
                </li>
                <li>
                  <strong className="text-white">Bulletins de paie</strong> (3
                  derniers + Décembre)
                </li>
                <li>Justificatifs de revenus fonciers ou mobiliers</li>
              </ul>
            </div>

            {/* Category B */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <div className="flex items-center mb-4 space-x-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Home className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="font-bold text-lg">Patrimoine & Actifs</h4>
              </div>
              <ul className="space-y-3 text-sm text-gray-300 pl-2 border-l-2 border-white/5">
                <li>
                  <strong className="text-white">Actes de propriété</strong>{" "}
                  (Estimation biens immobiliers)
                </li>
                <li>
                  <strong className="text-white">
                    Tableaux d'amortissement
                  </strong>{" "}
                  (Capital Restant Dû)
                </li>
                <li>Relevés d'épargne (Livrets, Assurance-vie, PEA)</li>
              </ul>
            </div>

            {/* Category C & D */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <div className="flex items-center mb-4 space-x-3">
                <div className="bg-orange-500/20 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <h4 className="font-bold text-lg">Charges & État Civil</h4>
              </div>
              <ul className="space-y-3 text-sm text-gray-300 pl-2 border-l-2 border-white/5">
                <li>Justificatifs de loyer / charges copropriété</li>
                <li>Factures récurrentes & Frais enfants</li>
                <li>Livret de famille & Contrat de mariage</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Guide Technique */}
        <section className="animate-fade-in delay-200">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
            Guide Technique (OCR)
          </h3>
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Camera className="w-32 h-32" />
            </div>
            <ul className="space-y-4 relative z-10">
              <li className="flex space-x-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 shrink-0" />
                <p className="text-sm text-gray-300">
                  <strong className="text-white block mb-0.5">
                    Luminosité
                  </strong>{" "}
                  Privilégiez la lumière naturelle. Évitez le flash.
                </p>
              </li>
              <li className="flex space-x-3">
                <div className="w-5 h-5 border-2 border-gray-400 rounded shrink-0" />
                <p className="text-sm text-gray-300">
                  <strong className="text-white block mb-0.5">Cadrage</strong>{" "}
                  Posez sur surface contrastée. Alignez les bords.
                </p>
              </li>
              <li className="flex space-x-3">
                <FileText className="w-5 h-5 text-[var(--color-plasma-cyan)] shrink-0" />
                <p className="text-sm text-gray-300">
                  <strong className="text-white block mb-0.5">Original</strong>{" "}
                  Privilégiez les PDF numériques si possible.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Check-list */}
        <section className="animate-fade-in delay-300">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
            Check-list Finale
          </h3>
          <div className="space-y-3">
            {[
              "Mes 3 dernières fiches de paie",
              "Dernier avis d'imposition complet",
              "Montant approx. dettes communes",
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/5"
              >
                <div className="w-5 h-5 rounded-full border border-[var(--color-plasma-cyan)] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-plasma-cyan)] opacity-0 hover:opacity-100 transition duration-300 cursor-pointer" />
                </div>
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Note Sécurité */}
        <section className="animate-fade-in delay-500 text-center px-4 pb-8">
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            L'application ne stocke aucune des pièces. Une fois la session
            fermée, la liste est inaccessible.
            <br />
            L'utilisation de documents falsifiés faussera les résultats.
          </p>
        </section>
      </div>
    </div>
  );
};

export default GuidePage;
