import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, Eye } from "lucide-react";

// Logigram Stage C: Safety Checks
const SAFETY_LIMIT_INCOME = 100000; // 100k/month

type ScanSessionItem = {
  text: string;
  keywords: {
    income?: number;
    netSocial?: number;
    charges?: number;
    date?: string;
  };
  confidence: number;
  category?: "bulletin" | "charges" | "revenus-conjoint";
  previewUrl?: string | null;
  timestamp: number;
};

const loadSessionData = (): ScanSessionItem[] => {
  const session = localStorage.getItem("scanSession");
  return session ? JSON.parse(session) : [];
};

const DataValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const sessionData = useMemo<ScanSessionItem[]>(() => loadSessionData(), []);

  // Helper to get latest item for a category
  const getLatestByCategory = (cat: string) =>
    [...sessionData].reverse().find((item) => item.category === cat);

  // Helper to sum charges
  const sumCharges = () =>
    sessionData
      .filter((item) => item.category === "charges")
      .reduce(
        (sum, item) =>
          sum +
          (item.keywords.charges ||
            item.keywords.income ||
            item.keywords.netSocial ||
            0),
        0,
      );

  const scannedData = sessionData[sessionData.length - 1] || null; // For backward compatibility/preview
  const imagePreview = scannedData?.previewUrl || null;
  const [showSource, setShowSource] = useState(false);

  // Form State
  const regime = "community";
  const [formData, setFormData] = useState(() => {
    const myDoc = getLatestByCategory("bulletin");
    const spouseDoc = getLatestByCategory("revenus-conjoint");
    const totalCharges = sumCharges();

    return {
      myIncome: myDoc?.keywords?.netSocial
        ? String(myDoc.keywords.netSocial)
        : myDoc?.keywords?.income
          ? String(myDoc.keywords.income)
          : "",
      myCharges: totalCharges > 0 ? String(totalCharges) : "",
      spouseIncome: spouseDoc?.keywords?.income
        ? String(spouseDoc.keywords.income)
        : spouseDoc?.keywords?.netSocial
          ? String(spouseDoc.keywords.netSocial)
          : "2000",
      date: myDoc?.keywords?.date || "",
    };
  });

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const confidence = useMemo<Record<string, "high" | "medium" | "low">>(() => {
    const computeConfidence = (
      value: string,
      ocrValue?: number,
      ocrConfidence?: number,
    ): "high" | "medium" | "low" => {
      const numeric = parseFloat(value);
      if (!value || isNaN(numeric)) return "low";
      if (!ocrValue) return "low";

      const diffRatio = Math.abs(numeric - ocrValue) / Math.max(ocrValue, 1);
      if (diffRatio <= 0.02 && (ocrConfidence || 0) >= 80) return "high";
      if (diffRatio <= 0.1 || (ocrConfidence || 0) >= 60) return "medium";
      return "low";
    };

    return {
      myIncome: computeConfidence(
        formData.myIncome,
        scannedData?.keywords?.netSocial ?? scannedData?.keywords?.income,
        scannedData?.confidence,
      ),
      myCharges: computeConfidence(
        formData.myCharges,
        scannedData?.keywords?.charges,
        scannedData?.confidence,
      ),
    };
  }, [formData.myIncome, formData.myCharges, scannedData]);

  const validateField = (name: string, value: string) => {
    let error = "";
    const num = parseFloat(value);

    if (name === "myIncome") {
      if (isNaN(num)) error = "Montant invalide";
      else if (num > SAFETY_LIMIT_INCOME) error = "Montant inhabituel (>100k)";

      // Cross-check (Stage C2: Net < Brut - Not applicable as we don't extract Brut, but can check vs Charges)
      if (num < parseFloat(formData.myCharges || "0")) {
        // Warning only
      }
    }
    return error;
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    // Stage C Check
    const incomeError = validateField("myIncome", formData.myIncome);
    if (incomeError) newErrors.myIncome = incomeError;
    if (!formData.myIncome || parseFloat(formData.myIncome) <= 0)
      newErrors.myIncome = "Revenu requis";
    if (parseFloat(formData.myIncome) < parseFloat(formData.myCharges)) {
      if (!window.confirm("Vos charges dépassent vos revenus. Confirmer ?"))
        return;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Stage E: Injection
    // We inject default values for fields not yet exposed in the UI to ensure the engine doesn't return NaN
    const finalPayload = {
      myIncome: parseFloat(formData.myIncome) || 0,
      myCharges: parseFloat(formData.myCharges) || 0,
      spouseIncome: parseFloat(formData.spouseIncome) || 0,

      // Default Assumptions for Demo (since UI doesn't ask these yet)
      marriageDuration: 12,
      myAge: 42,
      spouseAge: 44,
      childrenCount: 2,
      custodyType: "classic",
      assetsValue: 0,
      assetsCRD: 0,
      rewardsAlice: 0,
      rewardsBob: 0,

      regime: regime,
      metadata: {
        source: "OCR_DISPATCH",
        timestamp: Date.now(),
        isHumanVerified: true,
      },
    };

    localStorage.setItem("financialData", JSON.stringify(finalPayload));

    // Memory Cleanup (Stage 4)
    localStorage.removeItem("scannedData"); // Clear OCR buffer

    navigate("/dashboard");
  };

  const confidenceMessage =
    confidence.myIncome === "high"
      ? "Confiance élevée"
      : confidence.myIncome === "medium"
        ? "Confiance moyenne - Vérifiez le montant"
        : "Confiance faible - Vérifiez le montant";

  return (
    <div className="min-h-screen bg-(--color-deep-space) flex flex-col text-white pb-24">
      {/* Split View Header - Thumbnail (Stage 4 UX) */}
      <div className="bg-black/40 h-32 relative border-b border-white/10 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Aperçu document"
            className="h-full w-auto object-contain opacity-80"
          />
        ) : scannedData ? (
          <div className="text-xs text-gray-500 font-mono p-4">
            OCR Text Extract: {scannedData.text.slice(0, 50)}...
          </div>
        ) : (
          <span className="text-xs text-gray-600">No Document Source</span>
        )}
        <button
          onClick={() => setShowSource(true)}
          disabled={!imagePreview}
          className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/60 px-3 py-1 rounded-full border border-white/20 text-[10px] uppercase disabled:opacity-40"
        >
          <Eye className="w-3 h-3" /> <span>View Source</span>
        </button>
      </div>

      {showSource && imagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSource(false)}
        >
          <div
            className="max-w-4xl w-full bg-(--bg-secondary) border border-(--border-color) rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-(--border-color)">
              <h3 className="text-sm font-bold tracking-widest uppercase">
                Document Source
              </h3>
              <button
                onClick={() => setShowSource(false)}
                className="text-sm text-(--text-muted) hover:text-(--text-primary)"
              >
                Fermer
              </button>
            </div>
            <div className="bg-black/80 flex items-center justify-center p-4">
              <img
                src={imagePreview}
                alt="Document source"
                className="max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Body */}
      <div className="p-6 space-y-8 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <h1 className="text-xl font-bold">Validation des Données</h1>
          <p className="text-sm text-gray-400">
            Vérifiez les montants extraits avant calcul.
          </p>
        </div>

        {/* Confidence Matrix Visualization */}
        {/* Income Field */}
        <div
          className={`p-4 rounded-xl border transition-colors ${
            confidence.myIncome === "high"
              ? "bg-green-500/10 border-green-500/50"
              : confidence.myIncome === "medium"
                ? "bg-orange-500/10 border-orange-500/50"
                : "bg-white/5 border-white/10"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs uppercase tracking-widest text-gray-300">
              Votre Net Social
            </label>
            {confidence.myIncome === "high" && (
              <Check className="w-4 h-4 text-green-400" />
            )}
            {confidence.myIncome === "low" && (
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={formData.myIncome}
              onChange={(e) =>
                setFormData({ ...formData, myIncome: e.target.value })
              }
              onBlur={(e) =>
                setErrors((prev) => ({
                  ...prev,
                  myIncome: validateField("myIncome", e.target.value),
                }))
              }
              className="bg-transparent text-2xl font-mono text-white w-full outline-none focus:border-b border-(--color-plasma-cyan)"
              placeholder="0.00"
            />
            <span className="text-xl text-gray-500">€</span>
          </div>
          {errors.myIncome && (
            <div className="text-red-400 text-xs mt-2">{errors.myIncome}</div>
          )}
          {confidence.myIncome !== "high" && (
            <div className="text-orange-300 text-[10px] mt-1">
              {confidenceMessage}
            </div>
          )}
        </div>

        {/* Charges Field */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="text-xs uppercase tracking-widest text-gray-300 block mb-2">
            Charges Fixes
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={formData.myCharges}
              onChange={(e) =>
                setFormData({ ...formData, myCharges: e.target.value })
              }
              className="bg-transparent text-2xl font-mono text-white w-full outline-none border-b border-transparent focus:border-(--color-plasma-cyan)"
              placeholder="0.00"
            />
            <span className="text-xl text-gray-500">€</span>
          </div>
        </div>

        {/* Spouse Income (Manual) */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 opacity-70">
          <label className="text-xs uppercase tracking-widest text-gray-300 block mb-2">
            Revenu Conjoint (Est.)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={formData.spouseIncome}
              onChange={(e) =>
                setFormData({ ...formData, spouseIncome: e.target.value })
              }
              className="bg-transparent text-2xl font-mono text-white w-full outline-none border-b border-transparent focus:border-(--color-plasma-cyan)"
            />
            <span className="text-xl text-gray-500">€</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            Donnée non présente sur ce document
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-md border-t border-white/10 flex justify-between items-center z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-4 text-gray-400 hover:text-white"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-(--color-plasma-cyan) text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(20,184,166,0.5)] transition"
        >
          Valider & Calculer
        </button>
      </div>
    </div>
  );
};

export default DataValidationPage;
