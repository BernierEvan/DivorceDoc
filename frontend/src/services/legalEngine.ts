export interface FinancialData {
  myIncome: number;
  spouseIncome: number;
  myCharges: number;
  marriageDuration: number; // Years
  myAge: number;
  spouseAge: number;
  childrenCount: number;
  custodyType: "classic" | "alternating" | "reduced";
  assetsValue?: number; // Immobilier
  assetsCRD?: number; // Capital Restant Dû
  rewardsAlice?: number; // Rewards due to Me
  rewardsBob?: number; // Rewards due to Spouse
}

export interface SimulationResult {
  compensatory: {
    min: number;
    mean: number;
    max: number;
    details: {
      pilote: number;
      insee: number;
    };
  };
  childSupport: {
    perChild: number;
    total: number;
  };
  liquidation?: {
    netAsset: number; // Actif Net Communauté
    soulteToPay: number; // How much I have to pay (if positive) or receive (if negative)
  };
  resteAVivre?: {
    me: number;
    spouse: number;
    warning: boolean;
  };
}

const LEGAL_CONSTANTS_2026 = {
  RSA_SOLO: 645.5,
  SMIC_NET: 1450.0,
  SEUIL_PAUVRETE: 1216.0, // 60% median
  COEFF_AGE: {
    UNDER_45: 1.0, // Spec A.1 says < 45 = 1.0
    FROM_45_TO_55: 1.2,
    OVER_55: 1.5,
  },
  CHILD_SUPPORT_RATES: {
    classic: { 1: 0.135, 2: 0.115, 3: 0.1 },
    alternating: { 1: 0.09, 2: 0.078, 3: 0.067 },
    reduced: { 1: 0.18, 2: 0.155, 3: 0.13 },
  },
};

export const legalEngine = {
  calculate: (inputData: FinancialData): SimulationResult => {
    // Sanitize Inputs: Ensure no undefined/NaN propagates
    const data = {
      ...inputData,
      myIncome: inputData.myIncome || 0,
      spouseIncome: inputData.spouseIncome || 0,
      myCharges: inputData.myCharges || 0,
      marriageDuration: inputData.marriageDuration || 0,
      myAge: inputData.myAge || 0,
      spouseAge: inputData.spouseAge || 0,
      childrenCount: inputData.childrenCount || 0,
    };

    // --- 1. PRESTATION COMPENSATOIRE (ALGORITHME A) ---
    /*
     * Base Légale: Code Civil Art. 270 à 281.
     * Méthodes Croisées: Pilote & INSEE.
     */
    // A.1 Méthode Pilote
    const deltaRevenuAnnual = Math.abs(
      (data.spouseIncome - data.myIncome) * 12,
    );
    // Determine Age Coeff of the RECEIVER (Usually the one with less income)
    const receiverAge =
      data.myIncome < data.spouseIncome ? data.myAge : data.spouseAge;
    let coeffAge = LEGAL_CONSTANTS_2026.COEFF_AGE.UNDER_45;
    if (receiverAge >= 45 && receiverAge <= 55)
      coeffAge = LEGAL_CONSTANTS_2026.COEFF_AGE.FROM_45_TO_55;
    if (receiverAge > 55) coeffAge = LEGAL_CONSTANTS_2026.COEFF_AGE.OVER_55;

    const pcPilote = deltaRevenuAnnual * (data.marriageDuration / 2) * coeffAge;

    // A.2 Méthode Insee (Simplified for Simulation)
    // Loss of Living Standard ~ 20% of Gap over 8 years
    const pcInsee = deltaRevenuAnnual * 0.2 * 8;

    const pcMean = Math.round((pcPilote + pcInsee) / 2);

    // --- 2. PENSION ALIMENTAIRE (ALGORITHME B) ---
    /*
     * CALCUL DE PENSION ALIMENTAIRE (CONTRIBUTION)
     * Base Légale: Code Civil Art. 371-2 et 373-2-2.
     * Référentiel: Table de référence du Ministère de la Justice (2026).
     * Formule: PA = (Revenu_Debiteur - RSA_Socle) * Coeff_Garde
     */
    const debtorIncome = data.myIncome;
    const rRef = Math.max(0, debtorIncome - LEGAL_CONSTANTS_2026.RSA_SOLO);

    // Select Rate (Fixing type checks)
    let rate = 0;
    if (data.childrenCount > 0) {
      const count = Math.min(data.childrenCount, 3) as 1 | 2 | 3; // Clamp to 3 for map key
      rate = LEGAL_CONSTANTS_2026.CHILD_SUPPORT_RATES[data.custodyType][count];
    }

    const paPerChild = Math.round(rRef * rate);
    const paTotal = paPerChild * data.childrenCount;

    // --- 3. LIQUIDATION (ALGORITHME C) ---
    let liquidationResult = undefined;
    if (data.assetsValue && data.assetsCRD !== undefined) {
      const netAsset = data.assetsValue - data.assetsCRD;
      const rewardsDiff = (data.rewardsBob || 0) - (data.rewardsAlice || 0); // Assuming Alice is User

      // Soulte: Amount I have to PAY to keep the house
      // Soulte = P_net / 2 + (Rewards_Spouse - Rewards_Me)
      // If I keep the house, I owe half net value + any rewards owed to spouse.
      const soulteToPay = netAsset / 2 + rewardsDiff;

      liquidationResult = {
        netAsset,
        soulteToPay: Math.round(soulteToPay),
      };
    }

    // --- 4. RESTE A VIVRE (ALGORITHME D) ---
    // Projection Post-Divorce for User
    // Income - Taxes(est 20%) - Charges - PA Paid - PC Paid (if annualised)
    // Simplified: Net Income - Charges - PA (assuming debtor).
    const resteMe = data.myIncome - data.myCharges - paTotal;
    const resteSpouse = data.spouseIncome; // Simplified

    return {
      compensatory: {
        min: Math.round(Math.min(pcPilote, pcInsee)),
        mean: pcMean,
        max: Math.round(Math.max(pcPilote, pcInsee)),
        details: { pilote: Math.round(pcPilote), insee: Math.round(pcInsee) },
      },
      childSupport: {
        perChild: paPerChild,
        total: paTotal,
      },
      liquidation: liquidationResult,
      resteAVivre: {
        me: Math.round(resteMe),
        spouse: Math.round(resteSpouse),
        warning: resteMe < LEGAL_CONSTANTS_2026.SEUIL_PAUVRETE,
      },
    };
  },
};
