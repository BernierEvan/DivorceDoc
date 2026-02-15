export interface FinancialData {
  myIncome: number;
  myCharges: number;
  myTaxes: number; // Impôts mensuels
  myRent: number; // Loyer ou crédit immobilier mensuel
  spouseIncome: number;
  marriageDuration: number;
  myAge: number;
  spouseAge: number;
  childrenCount: number;
  custodyType: string;
  assetsValue: number;
  assetsCRD: number;
  rewardsAlice: number; // Récompenses dues PAR la communauté À Alice
  rewardsBob: number; // Récompenses dues PAR la communauté À Bob
  divorceType?: string;
  marriageDate?: string;
  matrimonialRegime?: string;
  metadata?: any;
}

export interface SimulationResult {
  compensatoryAllowance: number;
  childSupport: number;
  childSupportPerChild: number;
  custodyTypeUsed: string;
  liquidationShare: number;
  remainingLiveable: number;
  belowPovertyThreshold: boolean;
  budget: {
    totalRevenus: number; // myIncome + paReceived
    totalCharges: number; // taxes + rent + charges + paPaid
    taxes: number;
    rent: number;
    fixedCharges: number;
    paPaid: number;
    paReceived: number;
  };
  details: {
    pilote: {
      value: number;
      min: number;
      max: number;
    };
    insee: {
      value: number;
      min: number;
      max: number;
    };
    formula?: string;
  };
}

// Barème Ministère de la Justice 2026
const RSA_SOLO = 645.5;
const SEUIL_PAUVRETE_2026 = 1216; // €/mois
const CHILD_SUPPORT_RATES: Record<string, Record<number, number>> = {
  classic: { 1: 0.135, 2: 0.115, 3: 0.1 },
  alternating: { 1: 0.09, 2: 0.078, 3: 0.067 },
  reduced: { 1: 0.18, 2: 0.155, 3: 0.13 },
};

export const legalEngine = {
  calculate: (data: FinancialData): SimulationResult => {
    // ---------------------------------------------------------
    // 1. CALCUL PRESTATION COMPENSATOIRE (PC)
    // ---------------------------------------------------------

    // Determine Beneficiary (who earns less?)
    const beneficiaryIsMe = data.myIncome < data.spouseIncome;
    const beneficiaryIncome = beneficiaryIsMe
      ? data.myIncome
      : data.spouseIncome;
    const payerIncome = beneficiaryIsMe ? data.spouseIncome : data.myIncome;
    const beneficiaryAge = beneficiaryIsMe ? data.myAge : data.spouseAge;

    // --- METHODE PILOTE (Approche Temporelle) ---
    // PC = DeltaAnnuel * (Duration / 2) * CoeffAge
    const deltaMonthly = payerIncome - beneficiaryIncome;
    const deltaAnnual = deltaMonthly * 12;

    // Calculate Duration from Date if available
    let duration = data.marriageDuration;
    if (data.marriageDate) {
      const start = new Date(data.marriageDate);
      const end = new Date();
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      if (!isNaN(diffYears)) {
        duration = Math.round(diffYears);
      }
    }

    let ageCoeff = 1.0;
    if (beneficiaryAge >= 45 && beneficiaryAge < 55) ageCoeff = 1.2;
    if (beneficiaryAge >= 55) ageCoeff = 1.5;

    let pcPilote = 0;
    if (deltaAnnual > 0) {
      pcPilote = deltaAnnual * (duration / 2) * ageCoeff;
    }

    // Standard Deviation (+/- 10%) for Pilote Range
    const piloteMin = pcPilote * 0.9;
    const piloteMax = pcPilote * 1.1;

    // --- METHODE INSEE (Unités de Consommation) ---
    // 1. UC Avant Divorce (Ménage complet)
    // Adulte 1 + Adulte 2 (0.5) + Enfants (0.3 each)
    const ucBefore = 1 + 0.5 + 0.3 * data.childrenCount;
    const totalIncome = data.myIncome + data.spouseIncome;
    const standardLivingBefore = totalIncome / ucBefore;

    // 2. UC Après Divorce (Bénéficiaire)
    // On suppose que le parent bénéficiaire a la charge principale
    const ucAfter = 1 + 0.3 * data.childrenCount;
    const standardLivingAfter = beneficiaryIncome / ucAfter;

    // 3. Perte et Compensation
    const lossMonthly = Math.max(0, standardLivingBefore - standardLivingAfter);
    // Range: 15% (Min) to 25% (Max) over 8 years (96 months)
    // Mean at 20%
    const pcInseeMin = lossMonthly * 96 * 0.15;
    const pcInseeMax = lossMonthly * 96 * 0.25;
    const pcInsee = lossMonthly * 96 * 0.2; // Mean

    // Resultat final (Moyenne des Moyennes)
    const finalPC = Math.round((pcPilote + pcInsee) / 2);

    // ---------------------------------------------------------
    // 2. CALCUL PENSION ALIMENTAIRE (PA)
    // Barème Ministère de la Justice — Table de Référence 2026
    // PA = (Revenu_Débiteur − RSA_Socle) × Taux × NbEnfants
    // ---------------------------------------------------------

    let paPerChild = 0;
    let paTotal = 0;
    const custody = data.custodyType || "classic";

    if (data.childrenCount > 0) {
      const rRef = Math.max(0, payerIncome - RSA_SOLO);

      // Clamp children count to 1-3 for rate lookup
      const rateKey = Math.min(data.childrenCount, 3) as 1 | 2 | 3;
      const rateTable =
        CHILD_SUPPORT_RATES[custody] || CHILD_SUPPORT_RATES.classic;
      const rate = rateTable[rateKey] || 0.135;

      paPerChild = Math.round(rRef * rate);
      paTotal = paPerChild * data.childrenCount;
    }

    // ---------------------------------------------------------
    // 3. LIQUIDATION (Assets)
    // ---------------------------------------------------------
    const netAsset = (data.assetsValue || 0) - (data.assetsCRD || 0);
    let soulteToPay = 0;

    if (data.matrimonialRegime === "separation") {
      soulteToPay = netAsset / 2;
    } else {
      // COMMUNAUTE (Default)
      const rewardsDiff = (data.rewardsBob || 0) - (data.rewardsAlice || 0);
      soulteToPay = netAsset / 2 + rewardsDiff;
    }

    // ---------------------------------------------------------
    // 4. RESTE A VIVRE (BUDGET)
    // Reste = ΣRevenus − ΣCharges
    // Revenus = RevenuNet + PA reçue
    // Charges = Impôts + Loyer/Crédit + Charges fixes + PA versée
    // ---------------------------------------------------------
    const isPayer = data.myIncome > data.spouseIncome;
    const paPaid = isPayer ? paTotal : 0;
    const paReceived = isPayer ? 0 : paTotal;

    const taxes = data.myTaxes || 0;
    const rent = data.myRent || 0;
    const fixedCharges = data.myCharges || 0;

    const totalRevenus = data.myIncome + paReceived;
    const totalCharges = taxes + rent + fixedCharges + paPaid;
    const remaining = totalRevenus - totalCharges;

    return {
      compensatoryAllowance: Math.round(finalPC),
      childSupport: Math.round(paTotal),
      childSupportPerChild: paPerChild,
      custodyTypeUsed: custody,
      liquidationShare: Math.round(soulteToPay),
      remainingLiveable: Math.round(remaining),
      belowPovertyThreshold: remaining < SEUIL_PAUVRETE_2026,
      budget: {
        totalRevenus: Math.round(totalRevenus),
        totalCharges: Math.round(totalCharges),
        taxes: Math.round(taxes),
        rent: Math.round(rent),
        fixedCharges: Math.round(fixedCharges),
        paPaid: Math.round(paPaid),
        paReceived: Math.round(paReceived),
      },
      details: {
        pilote: {
          value: Math.round(pcPilote),
          min: Math.round(piloteMin),
          max: Math.round(piloteMax),
        },
        insee: {
          value: Math.round(pcInsee),
          min: Math.round(pcInseeMin),
          max: Math.round(pcInseeMax),
        },
        formula: `Moyenne Globale Estimée`,
      },
    };
  },
};
