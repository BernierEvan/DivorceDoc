import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  Home,
  Scale,
  CheckCircle,
} from "lucide-react";
import { SEO, breadcrumbJsonLd } from "../components/SEO";
import {
  loadFormData,
  computeAge,
  buildFinancialPayload,
  getCalculationChoices,
  getPreviousPage,
  getPageIndex,
  getTotalPages,
  type DivorceFormData,
} from "../services/divorceFormStore";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (d: string) => {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(d));
  } catch {
    return d;
  }
};

const formatCurrency = (n: number | string) => {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (!num && num !== 0) return "—";
  return num.toLocaleString("fr-FR") + " €";
};

const custodyLabel = (t: string) =>
  t === "classic"
    ? "Classique (Droit de visite)"
    : t === "alternating"
      ? "Alternée (50/50)"
      : t === "reduced"
        ? "Réduite (Élargi)"
        : t;

// ---------------------------------------------------------------------------
// Row component: a single key ➜ value line
// ---------------------------------------------------------------------------
const Row: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-baseline justify-between py-2 border-b border-white/5 last:border-0">
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-sm font-mono text-[var(--text-primary)] text-right">
      {value}
    </span>
  </div>
);

// ---------------------------------------------------------------------------
// Section component: a card grouping rows under a category header
// ---------------------------------------------------------------------------
const Section: React.FC<{
  icon: React.ReactNode;
  color: string;
  category: string;
  subcategory: string;
  children: React.ReactNode;
}> = ({ icon, color, category, subcategory, children }) => (
  <div className="space-y-3 animate-fade-in">
    <div className="flex items-center space-x-2">
      <div className={color}>{icon}</div>
      <span className={`text-xs uppercase tracking-widest font-bold ${color}`}>
        {category} — {subcategory}
      </span>
    </div>
    <div className="p-5 space-y-0 border glass-panel rounded-2xl border-white/10">
      {children}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const RecapitulatifPage: React.FC = () => {
  const navigate = useNavigate();
  const currentPath = "/recapitulatif";
  const pageIdx = getPageIndex(currentPath);
  const totalPages = getTotalPages();

  const formData: DivorceFormData = useMemo(() => loadFormData(), []);
  const choices = useMemo(() => getCalculationChoices(), []);
  const [now] = useState(() => Date.now());
  const marriageDurationLabel = useMemo(() => {
    if (!formData.marriageDate) return "";
    const end = formData.divorceDate
      ? new Date(formData.divorceDate).getTime()
      : now;
    const years = Math.max(
      0,
      Math.round(
        (end - new Date(formData.marriageDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      ),
    );
    return `${years} ans`;
  }, [formData.marriageDate, formData.divorceDate, now]);

  const hasPC = choices.selectedCalcs.includes("prestationCompensatoire");
  const showAxelDepondt =
    hasPC &&
    (choices.selectedMethods.prestationCompensatoire || []).includes(
      "axelDepondt",
    );
  const pcNeedsNetIncome =
    hasPC &&
    ((choices.selectedMethods.prestationCompensatoire || []).includes(
      "pilote",
    ) ||
      (choices.selectedMethods.prestationCompensatoire || []).includes(
        "insee",
      ));
  const pcNeedsFamilyData =
    hasPC &&
    (choices.selectedMethods.prestationCompensatoire || []).includes("insee");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleValidate = () => {
    // Build the financial payload expected by DashboardPage
    const payload = buildFinancialPayload(formData);
    localStorage.setItem("financialData", JSON.stringify(payload));
    navigate("/transition?from=recap-to-dashboard&next=/dashboard");
  };

  return (
    <div className="h-[100dvh] bg-[var(--color-deep-space)] flex flex-col relative text-white overflow-hidden">
      <SEO
        title="Récapitulatif — Simulation Divorce"
        description="Vérifiez toutes les informations saisies avant de lancer le calcul."
        path="/recapitulatif"
        noindex={true}
        jsonLd={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Récapitulatif", path: "/recapitulatif" },
        ])}
      />

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-plasma-cyan)]/10 rounded-full blur-[100px]" />

      {/* Header */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-black/20 backdrop-blur-md border-white/5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <button
          onClick={() => navigate(getPreviousPage(currentPath))}
          className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase text-glow">
          Récapitulatif
        </h1>
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 group"
          title="Accueil"
        >
          <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
      </div>

      {/* Progress + Subtitle */}
      <div className="z-10 px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
        <div className="flex justify-end mb-6">
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1 rounded-full ${i === pageIdx ? "bg-[var(--color-plasma-cyan)]" : "bg-[var(--border-color)]"}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center mb-2 space-x-3">
          <CheckCircle className="w-6 h-6 text-[var(--color-plasma-cyan)]" />
          <h1 className="text-2xl font-bold text-white text-glow">
            Récapitulatif
          </h1>
        </div>
        <p className="text-sm text-gray-400">
          Vérifiez vos informations avant de lancer le calcul.
        </p>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-4 space-y-6 overflow-y-auto sm:px-6 pb-28 sm:pb-32 animate-fade-in scrollbar-hide">
        {/* Editorial Block */}
        <div className="p-5 border rounded-2xl border-white/10 bg-white/[0.02]">
          <h3 className="text-sm font-bold text-white mb-2">
            Avant de valider
          </h3>
          <p className="text-xs leading-relaxed text-gray-400">
            Prenez le temps de vérifier chaque information. Les montants
            calculés dépendent directement de la précision des données saisies.
            Une erreur sur la date de mariage ou les revenus peut entraîner un
            écart significatif. Si vous constatez une anomalie, utilisez le
            bouton retour pour corriger. Le calcul est réalisé localement sur
            votre appareil.
          </p>
        </div>

        {/* ════════════════════════════════════════ */}
        {/* PRESTATION COMPENSATOIRE                */}
        {/* ════════════════════════════════════════ */}
        {hasPC && (
          <>
            <Section
              icon={<Scale className="w-4 h-4" />}
              color="text-teal-400"
              category="Prestation Compensatoire"
              subcategory="Mariage"
            >
              <Row
                label="Date de mariage"
                value={formatDate(formData.marriageDate)}
              />
              <Row
                label="Date de divorce / séparation"
                value={
                  formData.divorceDate
                    ? formatDate(formData.divorceDate)
                    : "Non renseignée (date du jour)"
                }
              />
              {formData.marriageDate && (
                <Row label="Durée du mariage" value={marriageDurationLabel} />
              )}
            </Section>

            <Section
              icon={<Scale className="w-4 h-4" />}
              color="text-teal-400"
              category="Prestation Compensatoire"
              subcategory="Identité"
            >
              <Row
                label="Créancier"
                value={
                  formData.myBirthDate
                    ? `${formatDate(formData.myBirthDate)} (${computeAge(formData.myBirthDate)} ans)`
                    : "—"
                }
              />
              <Row
                label="Débiteur"
                value={
                  formData.spouseBirthDate
                    ? `${formatDate(formData.spouseBirthDate)} (${computeAge(formData.spouseBirthDate)} ans)`
                    : "—"
                }
              />
            </Section>

            {pcNeedsNetIncome && (
              <Section
                icon={<Scale className="w-4 h-4" />}
                color="text-teal-400"
                category="Prestation Compensatoire"
                subcategory="Revenus"
              >
                <Row
                  label="Net Social Créancier"
                  value={formatCurrency(formData.myIncome)}
                />
                <Row
                  label="Revenu Débiteur"
                  value={formatCurrency(formData.spouseIncome)}
                />
              </Section>
            )}

            {showAxelDepondt && (
              <Section
                icon={<Scale className="w-4 h-4" />}
                color="text-teal-400"
                category="Prestation Compensatoire"
                subcategory="Projections Débiteur"
              >
                <Row
                  label="Revenu brut"
                  value={`${formatCurrency(formData.debtorGrossIncome)} (${formData.debtorIncomeMode === "annual" ? "annuel" : "mensuel"})`}
                />
                <Row
                  label="Contribution mensuelle enfants"
                  value={formatCurrency(formData.debtorChildContribution)}
                />
                {parseFloat(formData.debtorFutureIncome) > 0 && (
                  <>
                    <Row
                      label="Revenu prévisible avant impôts"
                      value={formatCurrency(formData.debtorFutureIncome)}
                    />
                    <Row
                      label="Contribution prévisible enfants"
                      value={formatCurrency(
                        formData.debtorFutureChildContribution,
                      )}
                    />
                    <Row
                      label="Date prévisible"
                      value={
                        formData.debtorChangeDate
                          ? formatDate(formData.debtorChangeDate)
                          : "—"
                      }
                    />
                  </>
                )}
                <Row
                  label="Patrimoine propre non producteur"
                  value={formatCurrency(formData.debtorPropertyValue)}
                />
                <Row
                  label="Taux rendement annuel"
                  value={`${formData.debtorPropertyYield || "0"} %`}
                />
              </Section>
            )}

            {showAxelDepondt && (
              <Section
                icon={<Scale className="w-4 h-4" />}
                color="text-teal-400"
                category="Prestation Compensatoire"
                subcategory="Projections Créancier"
              >
                <Row
                  label="Revenu brut"
                  value={`${formatCurrency(formData.creditorGrossIncome)} (${formData.creditorIncomeMode === "annual" ? "annuel" : "mensuel"})`}
                />
                <Row
                  label="Contribution mensuelle enfants"
                  value={formatCurrency(formData.creditorChildContribution)}
                />
                {parseFloat(formData.creditorFutureIncome) > 0 && (
                  <>
                    <Row
                      label="Revenu prévisible avant impôts"
                      value={formatCurrency(formData.creditorFutureIncome)}
                    />
                    <Row
                      label="Contribution prévisible enfants"
                      value={formatCurrency(
                        formData.creditorFutureChildContribution,
                      )}
                    />
                    <Row
                      label="Date prévisible"
                      value={
                        formData.creditorChangeDate
                          ? formatDate(formData.creditorChangeDate)
                          : "—"
                      }
                    />
                  </>
                )}
                <Row
                  label="Patrimoine propre non producteur"
                  value={formatCurrency(formData.creditorPropertyValue)}
                />
                <Row
                  label="Taux rendement annuel"
                  value={`${formData.creditorPropertyYield || "0"} %`}
                />
                <Row
                  label="Années sans cotisations retraite"
                  value={`${formData.creditorRetirementGapYears || "0"} ans`}
                />
                <Row
                  label="Revenu avant cessation d'activité"
                  value={formatCurrency(formData.creditorPreRetirementIncome)}
                />
              </Section>
            )}

            {pcNeedsFamilyData && (
              <Section
                icon={<Scale className="w-4 h-4" />}
                color="text-teal-400"
                category="Prestation Compensatoire"
                subcategory="Famille"
              >
                <Row label="Nombre d'enfants" value={formData.childrenCount} />
                {formData.childrenCount > 0 &&
                  formData.childrenAges.length > 0 && (
                    <Row
                      label="Âges des enfants"
                      value={formData.childrenAges
                        .slice(0, formData.childrenCount)
                        .map((a) => `${a} ans`)
                        .join(", ")}
                    />
                  )}
                {formData.childrenCount > 0 && (
                  <Row
                    label="Type de garde"
                    value={custodyLabel(formData.custodyType)}
                  />
                )}
              </Section>
            )}
          </>
        )}

        {/* Info note */}
        <div className="px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02]">
          <p className="text-xs leading-relaxed text-gray-500">
            💡 Vous pouvez revenir en arrière pour modifier les informations
            saisies. Le bouton « Valider & Calculer » lancera le calcul avec les
            données ci-dessus.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 w-full p-3 sm:p-6 bg-gradient-to-t from-[var(--color-deep-space)] to-transparent z-20"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
        }}
      >
        <button
          onClick={handleValidate}
          className="w-full max-w-md mx-auto bg-[var(--color-plasma-cyan)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 sm:py-5 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center space-x-2 sm:space-x-3 group active:scale-95"
          style={{ color: "#ffffff" }}
        >
          <span className="text-xs tracking-wider uppercase sm:text-sm sm:tracking-widest">
            Valider & Calculer
          </span>
          <ArrowRight className="w-4 h-4 transition-transform sm:w-5 sm:h-5 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default RecapitulatifPage;
