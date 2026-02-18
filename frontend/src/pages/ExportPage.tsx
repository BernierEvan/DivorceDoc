import React, { useState } from "react";

import { Share2, FileLock, Power, ChevronLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  legalEngine,
  type SimulationResult,
  type FinancialData,
} from "../services/legalEngine";
import { pdfGenerator } from "../services/pdfGenerator";
import { SEO } from "../components/SEO";

interface ExportData {
  financial: FinancialData;
  simulation: SimulationResult;
}

const ExportPage: React.FC = () => {
  const navigate = useNavigate();
  const [isImploding, setIsImploding] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const [data] = useState<ExportData | null>(() => {
    const raw = localStorage.getItem("financialData");
    if (!raw) return null;
    try {
      const financial = JSON.parse(raw);
      const simulation = legalEngine.calculate(financial);
      return { financial, simulation };
    } catch (e) {
      console.error("Failed to calculate export data", e);
      return null;
    }
  });

  const generatePDF = () => {
    if (!data) return;
    try {
      pdfGenerator.generateReport(data.financial, data.simulation);
    } catch (e) {
      console.error(e);
      alert(
        "Échec de la génération du rapport via le service PDF. (Code: PDF_GEN_02)",
      );
    }
  };

  const confirmWipe = () => {
    setShowExitModal(false);
    setIsImploding(true);
    // Simulate wipe duration
    setTimeout(() => {
      localStorage.clear();
      navigate("/");
      // In a real app, maybe show a "Session closed" toast on landing,
      // but navigating to "/" effectively closes the session.
    }, 1500);
  };

  if (isImploding) {
    return (
      <div className="h-screen bg-black flex items-center justify-center overflow-hidden relative">
        <div className="animate-implode flex flex-col items-center z-10">
          <div className="w-96 h-96 rounded-full bg-white blur-[100px] animate-pulse" />
        </div>
        <div className="absolute text-center z-20">
          <p
            className="font-bold tracking-widest text-xl uppercase mb-2"
            style={{ color: "#ffffff" }}
          >
            Session Clôturée
          </p>
          <p className="text-(--color-plasma-cyan) text-xs">
            Votre vie privée est préservée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-deep-space) flex flex-col items-center justify-center p-6 text-center relative">
      <SEO
        title="Export du Rapport"
        description="Téléchargez votre rapport de simulation de divorce."
        path="/export"
        noindex={true}
      />
      {/* Navigation Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
        <span className="text-xs font-bold tracking-[0.2em] text-white uppercase text-glow">
          Export
        </span>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group flex items-center justify-center"
          title="Accueil"
        >
          <Home className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
      </div>
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          opacity: 0.3,
        }}
      />

      <div className="glass-panel p-8 rounded-3xl w-full max-w-sm relative z-10 animate-fade-in border border-white/10">
        {/* Sealed Packet Visual */}
        <div className="w-24 h-24 bg-(--color-plasma-cyan)/10 rounded-full flex items-center justify-center mx-auto mb-6 relative group cursor-pointer hover:bg-(--color-plasma-cyan)/20 transition-all duration-500">
          <div className="absolute inset-0 rounded-full border border-(--color-plasma-cyan) opacity-30" />
          <FileLock className="w-10 h-10 text-(--color-plasma-cyan)" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 tracking-wide text-glow">
          Document récapitulatif
        </h1>
        <p className="text-gray-400 mb-8 text-sm">
          Votre document est prêt à être téléchargé.
        </p>

        <button
          onClick={generatePDF}
          className="w-full bg-(--color-plasma-cyan) hover:bg-(--accent-hover) text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] mb-6 flex items-center justify-center space-x-2 transition transform active:scale-95"
          style={{ color: "#ffffff" }}
        >
          <Share2 className="w-5 h-5" />
          <span className="uppercase tracking-widest text-xs">
            Télécharger l'estimation
          </span>
        </button>

        <div className="border-t border-white/10 pt-6 mt-2">
          <button
            onClick={() => setShowExitModal(true)}
            className="w-full group bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-medium py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300"
          >
            <Power className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest group-hover:text-red-400">
              Effacer les données et quitter
            </span>
          </button>
          <p className="text-[9px] text-gray-600 mt-2">
            L'effacement sera actif au niveau de la mémoire de votre navigateur,
            nous ne conservons rien.
          </p>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-xs w-full border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <h3 className="text-lg font-bold text-white mb-2">
              Confirmation finale
            </h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Voulez-vous vraiment quitter ? <br />
              <span className="text-red-400">
                Votre rapport PDF non téléchargé sera définitivement perdu
              </span>
              , car nous ne conservons rien sur nos serveurs.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold uppercase tracking-wider transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmWipe}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] transition"
                style={{ color: "#ffffff" }}
              >
                Tout Effacer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPage;
