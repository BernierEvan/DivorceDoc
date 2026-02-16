import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, Eye, ChevronLeft, Home } from "lucide-react";
import { SEO } from "../components/SEO";

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

  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [showSource, setShowSource] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Ensure current index is valid when sessionData changes
  React.useEffect(() => {
    if (sessionData.length > 0 && currentPreviewIndex >= sessionData.length) {
      setCurrentPreviewIndex(0);
    } else if (sessionData.length > 0 && currentPreviewIndex < 0) {
      setCurrentPreviewIndex(0);
    }
  }, [sessionData.length]);

  const scannedData = sessionData[currentPreviewIndex] || null;
  const imagePreview = scannedData?.previewUrl || null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPreviewIndex((prev) =>
      prev > 0 ? prev - 1 : sessionData.length - 1,
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPreviewIndex((prev) =>
      prev < sessionData.length - 1 ? prev + 1 : 0,
    );
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  // Form State
  // Form State
  const [formData, setFormData] = useState(() => {
    const myDoc = getLatestByCategory("bulletin");
    const spouseDoc = getLatestByCategory("revenus-conjoint");
    const totalCharges = sumCharges();

    // Load pre-filled profile data
    let profile = {};
    try {
      const stored = localStorage.getItem("profileData");
      if (stored) profile = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse profileData", e);
    }

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

      // New Fields (Priority: Profile > OCR > Default)
      marriageDate: (profile as any).date || myDoc?.keywords?.date || "",
      childrenCount:
        (profile as any).children !== undefined
          ? String((profile as any).children)
          : "2",
      childrenAges: (profile as any).childrenAges || ([] as number[]),
      divorceType: (profile as any).divorceType || "amiable",
      matrimonialRegime: (profile as any).regime || "community",
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

  const handleNextStep = () => {
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
    const profileData = JSON.parse(localStorage.getItem("profileData") || "{}");

    const finalPayload = {
      myIncome: parseFloat(formData.myIncome) || 0,
      myCharges: parseFloat(formData.myCharges) || 0,
      spouseIncome: parseFloat(formData.spouseIncome) || 0,

      // New Fields Injection
      marriageDate: formData.marriageDate,
      childrenCount: parseInt(formData.childrenCount) || 0,
      childrenAges: (formData.childrenAges || []).map(
        (a: number) => Number(a) || 0,
      ),
      divorceType: formData.divorceType,
      matrimonialRegime: formData.matrimonialRegime,

      // From Profile/Quiz — Calculer la durée du mariage depuis la date
      marriageDuration: (() => {
        const dateStr = formData.marriageDate;
        if (dateStr) {
          const start = new Date(dateStr);
          const now = new Date();
          const diffYears =
            (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          if (!isNaN(diffYears) && diffYears > 0) return Math.round(diffYears);
        }
        return 0;
      })(),
      myAge: profileData.myAge || 42,
      spouseAge: profileData.spouseAge || 44,
      custodyType: profileData.custodyType || "classic",
      myTaxes: profileData.myTaxes || 0,
      myRent: profileData.myRent || 0,
      assetsValue: profileData.assetsValue || 0,
      assetsCRD: profileData.assetsCRD || 0,
      rewardsAlice: profileData.rewardsAlice || 0,
      rewardsBob: profileData.rewardsBob || 0,

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
      <SEO
        title="Vérification des Données"
        description="Vérifiez les données extraites de vos documents."
        path="/validation"
        noindex={true}
      />
      {/* Navigation Header */}
      <div className="p-4 flex items-center justify-between z-10 sticky top-0 bg-[var(--color-deep-space)]/90 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
        <span className="text-xs font-bold tracking-[0.2em] text-white uppercase text-glow">
          Vérification des Données
        </span>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition group flex items-center justify-center"
          title="Accueil"
        >
          <Home className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
      </div>
      {/* Split View Header - Thumbnail (Stage 4 UX) */}
      <div className="bg-black/40 h-32 relative border-b border-white/10 flex items-center justify-center overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        {/* Carousel Navigation - Left */}
        {sessionData.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-all"
          >
            {"<"}
          </button>
        )}

        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Aperçu document"
            className="h-full w-auto object-contain opacity-80 cursor-pointer hover:opacity-100 transition-opacity"
            onClick={() => setShowSource(true)}
          />
        ) : scannedData ? (
          <div className="text-xs text-gray-500 font-mono p-4">
            Extrait OCR : {scannedData.text.slice(0, 50)}...
          </div>
        ) : (
          <span className="text-xs text-gray-600">Aucun document source</span>
        )}

        {/* Carousel Navigation - Right */}
        {sessionData.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-all"
          >
            {">"}
          </button>
        )}

        {/* Counter and Full Screen Button */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-2">
          {sessionData.length > 1 && (
            <span className="text-[10px] bg-black/60 px-2 py-1 rounded-full text-white/60">
              {currentPreviewIndex + 1} / {sessionData.length}
            </span>
          )}
          <button
            onClick={() => setShowSource(true)}
            disabled={!imagePreview}
            className="flex items-center space-x-1 bg-black/60 px-3 py-1 rounded-full border border-white/20 text-[10px] uppercase disabled:opacity-40 hover:bg-white/10 transition-colors"
          >
            <Eye className="w-3 h-3" /> <span>Zoom</span>
          </button>
        </div>
      </div>

      {showSource && imagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowSource(false)}
        >
          <div
            className="w-full h-full max-w-6xl max-h-[90vh] flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 z-20">
              <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">
                Document Source Original
              </h3>
              <div className="flex items-center space-x-4">
                {/* Zoom Controls */}
                <div className="flex items-center bg-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-white/10 text-white"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-mono">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-white/10 text-white"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowSource(false);
                    setZoomLevel(1); // Reset zoom on close
                  }}
                  className="text-sm text-white/60 hover:text-white"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable if zoomed */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/50 rounded-2xl border border-white/10 relative">
              {/* Modal Carousel Navigation - Left */}
              {sessionData.length > 1 && (
                <button
                  onClick={handlePrev}
                  className="fixed left-4 top-1/2 -translate-y-1/2 z-30 p-4 bg-black/50 hover:bg-black/90 rounded-full text-white/50 hover:text-white transition-all backdrop-blur-sm"
                >
                  {"<"}
                </button>
              )}

              <img
                src={imagePreview}
                alt="Document source"
                className="transition-transform duration-200 ease-out origin-center"
                style={{
                  transform: `scale(${zoomLevel})`,
                  cursor: zoomLevel > 1 ? "grab" : "default",
                }}
              />

              {/* Modal Carousel Navigation - Right */}
              {sessionData.length > 1 && (
                <button
                  onClick={handleNext}
                  className="fixed right-4 top-1/2 -translate-y-1/2 z-30 p-4 bg-black/50 hover:bg-black/90 rounded-full text-white/50 hover:text-white transition-all backdrop-blur-sm"
                >
                  {">"}
                </button>
              )}
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
            {confidence.myIncome === "low" &&
              parseFloat(formData.myIncome) < 800 && (
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
          {confidence.myIncome !== "high" &&
            parseFloat(formData.myIncome) < 800 && (
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
          {errors.myCharges && (
            <div className="text-red-400 text-xs mt-2">{errors.myCharges}</div>
          )}
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
            Donnée non extraite de ce document
          </div>
        </div>

        {/* Marriage Date */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="text-xs uppercase tracking-widest text-gray-300 block mb-2">
            Date de Mariage
          </label>
          <input
            type="date"
            value={formData.marriageDate}
            onChange={(e) =>
              setFormData({ ...formData, marriageDate: e.target.value })
            }
            className="bg-transparent text-lg font-mono text-white w-full outline-none border-b border-transparent focus:border-(--color-plasma-cyan)"
          />
          {errors.marriageDate && (
            <div className="text-red-400 text-xs mt-2">
              {errors.marriageDate}
            </div>
          )}
        </div>

        {/* Children Count */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="text-xs uppercase tracking-widest text-gray-300 block mb-2">
            Nombre d'enfants
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={formData.childrenCount}
            onChange={(e) => {
              const count = parseInt(e.target.value) || 0;
              // Ajuster le tableau des âges à la nouvelle taille
              const currentAges = formData.childrenAges || [];
              const newAges = Array.from({ length: count }, (_, i) =>
                i < currentAges.length ? currentAges[i] : 0,
              );
              setFormData({
                ...formData,
                childrenCount: e.target.value,
                childrenAges: newAges,
              });
            }}
            className="bg-transparent text-2xl font-mono text-white w-full outline-none border-b border-transparent focus:border-(--color-plasma-cyan)"
          />
        </div>

        {/* Children Ages */}
        {parseInt(formData.childrenCount) > 0 && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <label className="text-xs uppercase tracking-widest text-gray-300 block">
              Âge des enfants
            </label>
            <p className="text-[10px] text-gray-500">
              L'âge détermine le poids UC (OCDE modifiée) : &lt;14 ans = 0.3 UC,
              ≥14 ans = 0.5 UC
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({
                length: parseInt(formData.childrenCount) || 0,
              }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 w-16 shrink-0">
                    Enfant {i + 1}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.childrenAges?.[i] ?? 0}
                    onChange={(e) => {
                      const newAges = [...(formData.childrenAges || [])];
                      newAges[i] = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, childrenAges: newAges });
                    }}
                    className="bg-transparent text-lg font-mono text-white w-full outline-none border-b border-white/20 focus:border-(--color-plasma-cyan) text-center"
                  />
                  <span className="text-xs text-gray-500 shrink-0">
                    ans (
                    {(formData.childrenAges?.[i] ?? 0) >= 14 ? "0.5" : "0.3"}{" "}
                    UC)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divorce Type */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="text-xs uppercase tracking-widest text-gray-300 block mb-2">
            Type de Divorce
          </label>
          <select
            value={formData.divorceType}
            onChange={(e) =>
              setFormData({ ...formData, divorceType: e.target.value })
            }
            className="bg-transparent text-lg font-mono text-white w-full outline-none border-b border-transparent focus:border-(--color-plasma-cyan) [&>option]:bg-black"
          >
            <option value="amiable">Amiable</option>
            <option value="contentious">Contentieux</option>
          </select>
        </div>

        {/* Matrimonial Regime */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="text-xs uppercase tracking-widest text-gray-300 block mb-2">
            Régime Matrimonial
          </label>
          <select
            value={formData.matrimonialRegime}
            onChange={(e) =>
              setFormData({ ...formData, matrimonialRegime: e.target.value })
            }
            className="bg-transparent text-lg font-mono text-white w-full outline-none border-b border-transparent focus:border-(--color-plasma-cyan) [&>option]:bg-black"
          >
            <option value="community">Communauté</option>
            <option value="separation">Séparation de biens</option>
          </select>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div
        className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-md border-t border-white/10 flex justify-between items-center z-50"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-4 text-gray-400 hover:text-white"
        >
          Retour
        </button>
        <button
          onClick={handleNextStep}
          className="bg-(--color-plasma-cyan) text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(20,184,166,0.5)] transition"
        >
          Valider & Calculer
        </button>
      </div>
    </div>
  );
};

export default DataValidationPage;
