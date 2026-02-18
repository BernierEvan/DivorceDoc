/**
 * Shared form data store for the divorce calculation flow.
 *
 * All data-entry pages read/write to the same localStorage key so that
 * information is shared across pages and duplicate questions are avoided.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DivorceFormData {
  // Mariage
  marriageDate: string;
  divorceDate: string;

  // Identité
  myBirthDate: string;
  spouseBirthDate: string;

  // Revenus
  myIncome: string; // Net social créancier (string for empty-state)
  spouseIncome: string; // Revenu débiteur

  // Famille
  childrenCount: number;
  childrenAges: number[];
  custodyType: string; // "classic" | "alternating" | "reduced"

  // Régime
  matrimonialRegime: string; // "community" | "separation"

  // Capital (Liquidation)
  assetsValue: number;
  assetsCRD: number;
  rewardsAlice: number;
  rewardsBob: number;

  // Charges (Reste à vivre)
  myTaxes: number;
  myRent: number;
  myCharges: string; // Charges fixes (string for empty-state)

  // Projections Calcul PC — Débiteur
  debtorGrossIncome: string;
  debtorIncomeMode: string; // "monthly" | "annual"
  debtorChildContribution: string;
  debtorFutureIncome: string;
  debtorFutureChildContribution: string;
  debtorChangeDate: string;
  debtorPropertyValue: string;
  debtorPropertyYield: string;

  // Projections Calcul PC — Créancier
  creditorGrossIncome: string;
  creditorIncomeMode: string; // "monthly" | "annual"
  creditorChildContribution: string;
  creditorFutureIncome: string;
  creditorFutureChildContribution: string;
  creditorChangeDate: string;
  creditorPropertyValue: string;
  creditorPropertyYield: string;
  creditorRetirementGapYears: string;
  creditorPreRetirementIncome: string;
  debtorExpectsRevenueChange: string;
  creditorExpectsRevenueChange: string;
}

const STORAGE_KEY = "divorceFormData";

const INITIAL_FORM_DATA: DivorceFormData = {
  marriageDate: "",
  divorceDate: "",
  myBirthDate: "",
  spouseBirthDate: "",
  myIncome: "",
  spouseIncome: "",
  childrenCount: 0,
  childrenAges: [],
  custodyType: "classic",
  matrimonialRegime: "community",
  assetsValue: 0,
  assetsCRD: 0,
  rewardsAlice: 0,
  rewardsBob: 0,
  myTaxes: 0,
  myRent: 0,
  myCharges: "",
  debtorGrossIncome: "",
  debtorIncomeMode: "monthly",
  debtorChildContribution: "",
  debtorFutureIncome: "",
  debtorFutureChildContribution: "",
  debtorChangeDate: "",
  debtorPropertyValue: "",
  debtorPropertyYield: "",
  creditorGrossIncome: "",
  creditorIncomeMode: "monthly",
  creditorChildContribution: "",
  creditorFutureIncome: "",
  creditorFutureChildContribution: "",
  creditorChangeDate: "",
  creditorPropertyValue: "",
  creditorPropertyYield: "",
  creditorRetirementGapYears: "",
  creditorPreRetirementIncome: "",
  debtorExpectsRevenueChange: "no",
  creditorExpectsRevenueChange: "no",
};

// ---------------------------------------------------------------------------
// Load / Save helpers
// ---------------------------------------------------------------------------

export function loadFormData(): DivorceFormData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...INITIAL_FORM_DATA, ...JSON.parse(saved) };
  } catch {
    /* ignore */
  }
  return { ...INITIAL_FORM_DATA };
}

export function saveFormData(partial: Partial<DivorceFormData>): void {
  const current = loadFormData();
  const merged = { ...current, ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

// ---------------------------------------------------------------------------
// Calculation choices helpers
// ---------------------------------------------------------------------------

export interface CalculationChoices {
  selectedCalcs: string[];
  selectedMethods: Record<string, string[]>;
}

export function getCalculationChoices(): CalculationChoices {
  try {
    const saved = localStorage.getItem("calculationChoices");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        selectedCalcs: parsed.selectedCalcs || [],
        selectedMethods: parsed.selectedMethods || {},
      };
    }
  } catch {
    /* ignore */
  }
  return { selectedCalcs: [], selectedMethods: {} };
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

/**
 * Returns the ordered list of data-entry page paths the user must visit,
 * based on the calculations they selected. The last entry is always
 * "/recapitulatif".
 *
 * If Prestation Compensatoire is selected it covers all fields needed by
 * Pension Alimentaire, so the PA page is skipped.
 */
export function getNavigationPages(): string[] {
  const { selectedCalcs } = getCalculationChoices();
  const pages: string[] = [];

  const hasPC = selectedCalcs.includes("prestationCompensatoire");
  const hasPA = selectedCalcs.includes("pensionAlimentaire");
  const hasLiq = selectedCalcs.includes("liquidation");
  const hasRAV = selectedCalcs.includes("resteAVivre");

  if (hasPC) {
    pages.push("/prestation-compensatoire");
  }

  // PA fields are a strict subset of PC fields. Show PA page only when PC is
  // NOT selected.
  if (hasPA && !hasPC) {
    pages.push("/pension-alimentaire");
  }

  if (hasLiq) {
    pages.push("/liquidation");
  }

  if (hasRAV) {
    pages.push("/reste-a-vivre");
  }

  // Always end with the recap page
  pages.push("/recapitulatif");

  return pages;
}

export function getPageIndex(currentPath: string): number {
  return getNavigationPages().indexOf(currentPath);
}

export function getTotalPages(): number {
  return getNavigationPages().length;
}

export function getNextPage(currentPath: string): string {
  const pages = getNavigationPages();
  const idx = pages.indexOf(currentPath);
  if (idx >= 0 && idx < pages.length - 1) return pages[idx + 1];
  return "/dashboard"; // After recap → dashboard
}

export function getPreviousPage(currentPath: string): string {
  const pages = getNavigationPages();
  const idx = pages.indexOf(currentPath);
  if (idx > 0) return pages[idx - 1];
  return "/simulation-mode"; // Before first data page
}

// ---------------------------------------------------------------------------
// Context-aware field helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when a specific field has already been asked on a page that
 * appears *before* the given current path in the navigation sequence.
 */
export function isFieldAlreadyAsked(
  field: string,
  currentPath: string,
): boolean {
  const pages = getNavigationPages();
  const currentIdx = pages.indexOf(currentPath);
  if (currentIdx <= 0) return false;

  // Which fields are "owned" by each page type
  const PAGE_FIELDS: Record<string, string[]> = {
    "/prestation-compensatoire": [
      "marriageDate",
      "divorceDate",
      "myBirthDate",
      "spouseBirthDate",
      "myIncome",
      "spouseIncome",
      "childrenCount",
      "childrenAges",
      "custodyType",
      "matrimonialRegime",
      "debtorGrossIncome",
      "debtorIncomeMode",
      "debtorChildContribution",
      "debtorFutureIncome",
      "debtorFutureChildContribution",
      "debtorChangeDate",
      "debtorPropertyValue",
      "debtorPropertyYield",
      "creditorGrossIncome",
      "creditorIncomeMode",
      "creditorChildContribution",
      "creditorFutureIncome",
      "creditorFutureChildContribution",
      "creditorChangeDate",
      "creditorPropertyValue",
      "creditorPropertyYield",
      "creditorRetirementGapYears",
      "creditorPreRetirementIncome",
      "debtorExpectsRevenueChange",
      "creditorExpectsRevenueChange",
    ],
    "/pension-alimentaire": [
      "myIncome",
      "spouseIncome",
      "childrenCount",
      "custodyType",
    ],
    "/liquidation": [
      "assetsValue",
      "assetsCRD",
      "rewardsAlice",
      "rewardsBob",
      "matrimonialRegime",
    ],
    "/reste-a-vivre": ["myIncome", "myTaxes", "myRent", "myCharges"],
  };

  for (let i = 0; i < currentIdx; i++) {
    const pageFields = PAGE_FIELDS[pages[i]] || [];
    if (pageFields.includes(field)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Age helper
// ---------------------------------------------------------------------------

export function computeAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

// ---------------------------------------------------------------------------
// Build FinancialData payload (for DashboardPage)
// ---------------------------------------------------------------------------

export function buildFinancialPayload(
  formData: DivorceFormData,
): Record<string, unknown> {
  const marriageDuration = (() => {
    if (formData.marriageDate) {
      const start = new Date(formData.marriageDate);
      const end = formData.divorceDate
        ? new Date(formData.divorceDate)
        : new Date();
      const diffYears =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (!isNaN(diffYears) && diffYears > 0) return Math.round(diffYears);
    }
    return 0;
  })();

  return {
    myIncome: parseFloat(formData.myIncome) || 0,
    myCharges: parseFloat(formData.myCharges) || 0,
    spouseIncome: parseFloat(formData.spouseIncome) || 0,
    marriageDate: formData.marriageDate,
    divorceDate: formData.divorceDate,
    childrenCount: formData.childrenCount || 0,
    childrenAges: (formData.childrenAges || []).map((a) => Number(a) || 0),
    matrimonialRegime: formData.matrimonialRegime || "community",
    marriageDuration,
    myAge: computeAge(formData.myBirthDate) || 42,
    spouseAge: computeAge(formData.spouseBirthDate) || 44,
    custodyType: formData.custodyType || "classic",
    myTaxes: formData.myTaxes || 0,
    myRent: formData.myRent || 0,
    assetsValue: formData.assetsValue || 0,
    assetsCRD: formData.assetsCRD || 0,
    rewardsAlice: formData.rewardsAlice || 0,
    rewardsBob: formData.rewardsBob || 0,
    debtorGrossIncome: parseFloat(formData.debtorGrossIncome) || 0,
    debtorIncomeMode: formData.debtorIncomeMode || "monthly",
    debtorChildContribution: parseFloat(formData.debtorChildContribution) || 0,
    debtorFutureIncome: parseFloat(formData.debtorFutureIncome) || 0,
    debtorFutureChildContribution:
      parseFloat(formData.debtorFutureChildContribution) || 0,
    debtorChangeDate: formData.debtorChangeDate,
    debtorPropertyValue: parseFloat(formData.debtorPropertyValue) || 0,
    debtorPropertyYield: parseFloat(formData.debtorPropertyYield) || 0,
    creditorGrossIncome: parseFloat(formData.creditorGrossIncome) || 0,
    creditorIncomeMode: formData.creditorIncomeMode || "monthly",
    creditorChildContribution:
      parseFloat(formData.creditorChildContribution) || 0,
    creditorFutureIncome: parseFloat(formData.creditorFutureIncome) || 0,
    creditorFutureChildContribution:
      parseFloat(formData.creditorFutureChildContribution) || 0,
    creditorChangeDate: formData.creditorChangeDate,
    creditorPropertyValue: parseFloat(formData.creditorPropertyValue) || 0,
    creditorPropertyYield: parseFloat(formData.creditorPropertyYield) || 0,
    creditorRetirementGapYears:
      parseFloat(formData.creditorRetirementGapYears) || 0,
    creditorPreRetirementIncome:
      parseFloat(formData.creditorPreRetirementIncome) || 0,
    metadata: {
      source: "FORM_INPUT",
      timestamp: Date.now(),
      isHumanVerified: true,
    },
  };
}
