import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Download, ChevronLeft, Edit2, Scale } from "lucide-react";
import { legalEngine, type SimulationResult } from "../services/legalEngine";
import { AdUnit } from "../components/AdUnit";
import { InfoTooltip } from "../components/InfoTooltip";
import { SEO } from "../components/SEO";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"data" | "charts">("data");
  const [financialData, setFinancialData] = useState<any>(null);
  const [calculations, setCalculations] = useState<SimulationResult | null>(
    null,
  );

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

  if (!financialData || !calculations) return <div />;

  // Chart Data preparation
  const budgetData = [
    { name: "Revenu net", amount: calculations.budget.totalRevenus },
    { name: "Impôts", amount: -calculations.budget.taxes },
    { name: "Loyer/Crédit", amount: -calculations.budget.rent },
    { name: "Charges fixes", amount: -calculations.budget.fixedCharges },
    { name: "PA versée", amount: -calculations.budget.paPaid },
    { name: "Reste", amount: calculations.remainingLiveable },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col text-white pb-20 overflow-hidden">
      <SEO
        title="Résultats de la Simulation"
        description="Visualisez les résultats de votre simulation de divorce."
        path="/dashboard"
        noindex={true}
      />
      {/* Top Bar */}
      <div
        className="bg-black/20 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-50"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase text-glow">
          Dashboard
        </h1>
        <div className="flex space-x-2 mr-16">
          {/* Export Button - Navigates to Export Page */}
          <button
            onClick={() => navigate("/export")}
            className="p-2 rounded-full bg-(--color-plasma-cyan)/20 text-(--color-plasma-cyan) hover:bg-(--color-plasma-cyan) hover:text-black transition"
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
        {calculations.belowPovertyThreshold && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/40 rounded-xl animate-fade-in mx-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-orange-400 font-bold uppercase text-[10px] tracking-widest">
                Alerte Budget
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Votre "Reste à Vivre" estimé (
              {calculations.remainingLiveable.toLocaleString()}€) est inférieur
              au seuil de pauvreté 2026 (1 216€). Le juge pourrait réajuster les
              pensions.
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

            {/* Compensatory Allowance */}
            <div className="col-span-2 glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Scale className="w-24 h-24 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 flex items-center space-x-2">
                  <span>Prestation Compensatoire</span>
                  <InfoTooltip content="La prestation compensatoire vise à compenser la disparité de niveau de vie entre les époux après le divorce. Elle est versée en capital (somme forfaitaire) par l'époux le plus aisé à celui qui subit une baisse de revenus." />
                </h3>
                <div className="flex items-baseline space-x-2 flex-wrap">
                  <span className="text-4xl sm:text-5xl font-bold text-[var(--color-plasma-cyan)] text-glow">
                    {calculations.compensatoryAllowance.toLocaleString()} €
                  </span>
                  <span className="text-sm text-gray-400">est.</span>
                </div>

                {/* Dual Method Details with Ranges */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pilote */}
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5 hover:border-[var(--color-plasma-cyan)]/30 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-300">
                        Méthode Pilote
                      </span>
                      <span className="font-mono text-[var(--color-plasma-cyan)]">
                        {calculations.details?.pilote.value.toLocaleString()} €
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Intervalle:{" "}
                      {calculations.details?.pilote.min.toLocaleString()} —{" "}
                      {calculations.details?.pilote.max.toLocaleString()} €
                    </div>
                  </div>

                  {/* Insee */}
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5 hover:border-[var(--color-plasma-cyan)]/30 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-300">
                        Méthode Insee
                      </span>
                      <span className="font-mono text-[var(--color-plasma-cyan)]">
                        {calculations.details?.insee.value.toLocaleString()} €
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Intervalle:{" "}
                      {calculations.details?.insee.min.toLocaleString()} —{" "}
                      {calculations.details?.insee.max.toLocaleString()} €
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Child Support Card */}
            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <p className="text-[10px] text-gray-400 uppercase mb-2 flex items-center space-x-2">
                <span>Pension Alimentaire (Est.)</span>
                <InfoTooltip content="La pension alimentaire est une somme mensuelle versée par le parent débiteur pour contribuer à l'entretien et l'éducation des enfants. Son montant est calculé selon le barème du Ministère de la Justice en fonction des revenus du débiteur, du nombre d'enfants et du type de garde." />
              </p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white">
                  {calculations.childSupport.toLocaleString()}€
                </span>
                <span className="text-xs text-gray-500">total / mois</span>
              </div>
              {calculations.childSupportPerChild > 0 && (
                <div className="mt-2 text-[10px] text-gray-500 space-y-1">
                  <p>
                    {calculations.childSupportPerChild.toLocaleString()}€ par
                    enfant — Garde{" "}
                    {calculations.custodyTypeUsed === "classic"
                      ? "Classique"
                      : calculations.custodyTypeUsed === "alternating"
                        ? "Alternée"
                        : "Réduite"}
                  </p>
                  <p className="text-gray-600">
                    Barème Ministère de la Justice 2026
                  </p>
                </div>
              )}
            </div>

            {/* Liquidation (Soulte) Card */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 bg-indigo-900/10">
              <p className="text-[10px] text-indigo-300 uppercase mb-2 flex items-center space-x-2">
                <span>Liquidation (Soulte)</span>
                <InfoTooltip content="La soulte est le montant que l'un des époux doit verser à l'autre pour conserver un bien commun (ex: la maison). Elle est calculée comme la moitié du patrimoine net (valeur du bien − crédit restant), ajustée des récompenses (apports propres)." />
              </p>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-white">
                  {Math.abs(calculations.liquidationShare).toLocaleString()}€
                </span>
                <span className="text-xs text-gray-500">
                  {calculations.liquidationShare > 0
                    ? "à verser"
                    : calculations.liquidationShare < 0
                      ? "à recevoir"
                      : ""}
                </span>
              </div>
              {financialData.assetsValue > 0 && (
                <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
                  <p>
                    P<sub>net</sub> ={" "}
                    {financialData.assetsValue.toLocaleString()}€ −{" "}
                    {financialData.assetsCRD.toLocaleString()}€ ={" "}
                    {(
                      financialData.assetsValue - financialData.assetsCRD
                    ).toLocaleString()}
                    €
                  </p>
                  {(financialData.rewardsAlice > 0 ||
                    financialData.rewardsBob > 0) && (
                    <p>
                      Récompenses : A=
                      {financialData.rewardsAlice.toLocaleString()}€, B=
                      {financialData.rewardsBob.toLocaleString()}€
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Reste à Vivre (User) */}
            <div className="glass-panel p-5 rounded-xl border border-white/10">
              <p className="text-[10px] text-gray-400 uppercase mb-3 flex items-center space-x-2">
                <span>Votre Reste à Vivre</span>
                <InfoTooltip content="Le Reste à Vivre est le montant mensuel qui vous reste une fois toutes les charges déduites (impôts, loyer, charges fixes, pension alimentaire). Si ce montant est inférieur au seuil de pauvreté (1 216€/mois en 2026), le juge peut réajuster les pensions." />
              </p>
              <div className="flex items-baseline space-x-2 mb-3">
                <span
                  className={`text-3xl font-bold ${calculations.belowPovertyThreshold ? "text-orange-400" : "text-[var(--color-plasma-cyan)]"} text-glow`}
                >
                  {calculations.remainingLiveable.toLocaleString()}€
                </span>
                <span className="text-xs text-gray-500">/ mois</span>
              </div>
              {/* Budget Breakdown */}
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex justify-between text-green-400">
                  <span>+ Revenu net</span>
                  <span>{financialData.myIncome.toLocaleString()}€</span>
                </div>
                {calculations.budget.paReceived > 0 && (
                  <div className="flex justify-between text-green-400/70">
                    <span>+ PA reçue</span>
                    <span>
                      {calculations.budget.paReceived.toLocaleString()}€
                    </span>
                  </div>
                )}
                <div className="border-t border-white/5 my-1" />
                {calculations.budget.taxes > 0 && (
                  <div className="flex justify-between text-red-400/70">
                    <span>− Impôts</span>
                    <span>{calculations.budget.taxes.toLocaleString()}€</span>
                  </div>
                )}
                {calculations.budget.rent > 0 && (
                  <div className="flex justify-between text-red-400/70">
                    <span>− Loyer/Crédit</span>
                    <span>{calculations.budget.rent.toLocaleString()}€</span>
                  </div>
                )}
                {calculations.budget.fixedCharges > 0 && (
                  <div className="flex justify-between text-red-400/70">
                    <span>− Charges fixes</span>
                    <span>
                      {calculations.budget.fixedCharges.toLocaleString()}€
                    </span>
                  </div>
                )}
                {calculations.budget.paPaid > 0 && (
                  <div className="flex justify-between text-red-400/70">
                    <span>− PA versée</span>
                    <span>{calculations.budget.paPaid.toLocaleString()}€</span>
                  </div>
                )}
                <div className="border-t border-white/10 my-1" />
                <div
                  className={`flex justify-between font-bold ${calculations.belowPovertyThreshold ? "text-orange-400" : "text-[var(--color-plasma-cyan)]"}`}
                >
                  <span>= Reste à Vivre</span>
                  <span>
                    {calculations.remainingLiveable.toLocaleString()}€
                  </span>
                </div>
              </div>
            </div>

            {/* Ad MPU */}
            <div className="flex justify-center mt-6 col-span-1 md:col-span-2">
              <AdUnit type="rectangle" />
            </div>
          </div>
        )}

        {/* Tab Content: Charts */}
        {activeTab === "charts" && (
          <div className="space-y-6 animate-fade-in pb-10">
            {/* Chart 1: Prestation Compensatoire — Pilote vs Insee */}
            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 text-center">
                Prestation Compensatoire (Pilote vs Insee)
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Pilote",
                        value: calculations.details.pilote.value,
                        min: calculations.details.pilote.min,
                        max: calculations.details.pilote.max,
                      },
                      {
                        name: "Insee",
                        value: calculations.details.insee.value,
                        min: calculations.details.insee.min,
                        max: calculations.details.insee.max,
                      },
                      {
                        name: "Moyenne",
                        value: calculations.compensatoryAllowance,
                        min: 0,
                        max: 0,
                      },
                    ]}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
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
                      width={70}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        backgroundColor: "#0a0a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                      formatter={(val: number | undefined) => [
                        `${(val ?? 0).toLocaleString()} €`,
                        "",
                      ]}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#22d3ee"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Pension Alimentaire */}
            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 text-center">
                Pension Alimentaire
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Par enfant",
                        amount: calculations.childSupportPerChild,
                      },
                      {
                        name: "Total / mois",
                        amount: calculations.childSupport,
                      },
                    ]}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
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
                        backgroundColor: "#0a0a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                      formatter={(val: number | undefined) => [
                        `${(val ?? 0).toLocaleString()} €`,
                        "",
                      ]}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#facc15"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Liquidation (Soulte) */}
            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 text-center">
                Liquidation (Soulte)
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Valeur bien",
                        amount: financialData.assetsValue || 0,
                      },
                      { name: "CRD", amount: -(financialData.assetsCRD || 0) },
                      { name: "Soulte", amount: calculations.liquidationShare },
                    ]}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
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
                        backgroundColor: "#0a0a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                      formatter={(val: number | undefined) => [
                        `${Math.abs(val ?? 0).toLocaleString()} €`,
                        "",
                      ]}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#818cf8"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Reste à Vivre Budget */}
            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 text-center">
                Budget Post-Divorce (Mensuel)
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetData}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
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
                      width={90}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        backgroundColor: "#0a0a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                      formatter={(val: number | undefined) => [
                        `${Math.abs(val ?? 0).toLocaleString()} €`,
                        "",
                      ]}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={18}>
                      {budgetData.map((entry, index) => (
                        <Cell
                          key={`budget-${index}`}
                          fill={entry.amount >= 0 ? "#22d3ee" : "#ef4444"}
                        />
                      ))}
                    </Bar>
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
