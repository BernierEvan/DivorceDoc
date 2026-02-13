import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Download,
  Share2,
  ChevronLeft,
  Info,
  TrendingUp,
  AlertTriangle,
  Edit2,
} from "lucide-react";
import { legalEngine, type SimulationResult } from "../services/legalEngine";
import { AdUnit } from "../components/AdUnit";
import { InfoTooltip } from "../components/InfoTooltip";
import { pdfGenerator } from "../services/pdfGenerator";
import { adManager } from "../services/adManager";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"data" | "charts">("data");
  const [financialData, setFinancialData] = useState<any>(null);
  const [calculations, setCalculations] = useState<SimulationResult | null>(
    null,
  );
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    // Stage A: Load Data
    const rawData = localStorage.getItem("financialData");
    if (!rawData) {
      navigate("/");
      return;
    }

    const data = JSON.parse(rawData);
    setFinancialData(data);

    // Stage B: Execute Engine
    const result = legalEngine.calculate(data);
    setCalculations(result);

    // Stage C: Ad Check
    // adManager.checkInterstitialRules();
  }, []);

  const handleExportPDF = () => {
    if (financialData && calculations) {
      pdfGenerator.generateReport(financialData, calculations);
      setShowExportMenu(false);
    }
  };

  if (!financialData || !calculations) return <div />;

  // Chart Data preparation
  const resourceData = [
    { name: "My Income", value: financialData.myIncome, color: "#22d3ee" }, // cyan
    {
      name: "Spouse Income",
      value: financialData.spouseIncome,
      color: "#9ca3af",
    }, // gray
  ];

  const budgetData = [
    { name: "Revenu", amount: financialData.myIncome },
    {
      name: "Reste",
      amount: calculations.resteAVivre ? calculations.resteAVivre.me : 0,
    },
    { name: "Charges", amount: financialData.myCharges },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col text-white pb-20 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-50">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase text-glow">
          Dashboard
        </h1>
        <div className="flex space-x-2">
          {/* PDF Export Button */}
          <button
            onClick={handleExportPDF}
            className="p-2 rounded-full bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)] hover:bg-[var(--color-plasma-cyan)] hover:text-black transition"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 px-6">
        <div className="bg-white/5 p-1 rounded-full flex relative">
          <div
            className={`absolute top-1 bottom-1 w-1/2 bg-[var(--color-plasma-cyan)]/10 rounded-full transition-all duration-300 ${activeTab === "charts" ? "translate-x-full" : "translate-x-0"}`}
          />
          <button
            onClick={() => setActiveTab("data")}
            className={`flex-1 py-2 rounded-full text-[10px] uppercase font-bold text-center z-10 transition-colors ${activeTab === "data" ? "text-[var(--color-plasma-cyan)]" : "text-gray-500"}`}
          >
            Données
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`flex-1 py-2 rounded-full text-[10px] uppercase font-bold text-center z-10 transition-colors ${activeTab === "charts" ? "text-[var(--color-plasma-cyan)]" : "text-gray-500"}`}
          >
            Graphiques
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide z-10 pb-32">
        {/* Reste à Vivre Warning */}
        {calculations.resteAVivre?.warning && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/40 rounded-xl animate-fade-in mx-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-orange-400 font-bold uppercase text-[10px] tracking-widest">
                Alerte Budget
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Votre "Reste à Vivre" estimé ({calculations.resteAVivre.me}€) est
              inférieur au seuil de pauvreté (1216€). Le juge pourrait réajuster
              les pensions.
            </p>
          </div>
        )}

        {/* Tab Content: Data */}
        {activeTab === "data" && (
          <div className="space-y-4 animate-fade-in pb-10">
            {/* Income Card */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">
                  My Income (Net Social)
                </p>
                <p className="text-xl font-mono text-[var(--color-plasma-cyan)]">
                  {financialData.myIncome}€
                </p>
              </div>
              <Edit2
                className="w-4 h-4 text-gray-600 cursor-pointer"
                onClick={() => navigate("/validation")}
              />
            </div>

            {/* Compensatory Card */}
            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] text-gray-400 uppercase flex items-center gap-1">
                  Prestation Compensatoire{" "}
                  <InfoTooltip content="La prestation compensatoire est une somme versee par l'un des epoux a l'autre pour compenser la disparite de niveau de vie causee par le divorce. Cette estimation est basee sur les methodes de calcul de l'INSEE et des baremes indicatifs. Seul un juge peut fixer le montant definitif." />
                </p>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white">
                  {calculations.compensatory.mean}€
                </span>
                <span className="text-xs text-gray-500">moyenne</span>
              </div>
              <div className="mt-2 text-[10px] text-gray-400 flex justify-between">
                <span>Min: {calculations.compensatory.min}€</span>
                <span>Max: {calculations.compensatory.max}€</span>
              </div>
            </div>

            {/* Child Support Card */}
            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <p className="text-[10px] text-gray-400 uppercase mb-2">
                Pension Alimentaire (Est.)
              </p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white">
                  {calculations.childSupport.total}€
                </span>
                <span className="text-xs text-gray-500">total / mois</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Based on Ministry 2026 Grid
              </p>
            </div>

            {/* Liquidation (Soulte) Card */}
            {calculations.liquidation && (
              <div className="glass-panel p-4 rounded-xl border border-white/10 bg-indigo-900/10">
                <p className="text-[10px] text-indigo-300 uppercase mb-2">
                  Liquidation (Soulte)
                </p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-white">
                    {calculations.liquidation.soulteToPay}€
                  </span>
                  <span className="text-xs text-gray-500">
                    à verser (si conservation bien)
                  </span>
                </div>
              </div>
            )}

            {/* Ad MPU */}
            <div className="flex justify-center mt-6">
              <AdUnit type="rectangle" />
            </div>
          </div>
        )}

        {/* Tab Content: Charts */}
        {activeTab === "charts" && (
          <div className="space-y-6 animate-fade-in pb-10">
            {/* Pie Chart */}
            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 text-center">
                Disparité Revenus
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  {/* @ts-ignore */}
                  <PieChart>
                    <Pie
                      data={resourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={5}
                    >
                      {resourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#000",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 text-center">
                Budget Post-Divorce (Mensuel)
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetData}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#333"
                      horizontal={false}
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        backgroundColor: "#000",
                        border: "1px solid #333",
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="var(--color-plasma-cyan)"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <AdUnit type="native" className="mt-4" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
