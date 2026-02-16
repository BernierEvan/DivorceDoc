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
  childrenAges?: number[]; // Âge de chaque enfant (pour calcul UC OCDE)
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
  marriageDurationUsed: number;
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
  classic: { 1: 0.135, 2: 0.115, 3: 0.1, 4: 0.088, 5: 0.08, 6: 0.072 },
  alternating: { 1: 0.09, 2: 0.078, 3: 0.067, 4: 0.059, 5: 0.053, 6: 0.048 },
  reduced: { 1: 0.18, 2: 0.155, 3: 0.133, 4: 0.117, 5: 0.106, 6: 0.095 },
};

/**
 * Calcule les UC enfants selon l'échelle OCDE modifiée :
 *   - Enfant < 14 ans  → 0.3 UC
 *   - Enfant ≥ 14 ans  → 0.5 UC
 * Si childrenAges n'est pas fourni, tous les enfants sont supposés < 14 ans (0.3 UC).
 */
function computeChildrenUC(
  childrenCount: number,
  childrenAges?: number[],
): number {
  if (childrenCount <= 0) return 0;
  if (!childrenAges || childrenAges.length === 0) {
    return 0.3 * childrenCount; // Fallback : tous < 14
  }
  // Utiliser les âges fournis ; si moins d'âges que d'enfants, supposer < 14 pour les manquants
  let uc = 0;
  for (let i = 0; i < childrenCount; i++) {
    const age = i < childrenAges.length ? childrenAges[i] : 0;
    uc += age >= 14 ? 0.5 : 0.3;
  }
  return uc;
}

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

    // --- METHODE DU TIERS PONDERE (Approche Temporelle) ---
    // Réf : aidefamille.fr — Méthode du tiers de la différence pondérée par la durée
    // PC = (DeltaAnnuel / 3) * (Duration / 2) * CoeffAge
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
      pcPilote = (deltaAnnual / 3) * (duration / 2) * ageCoeff;
    }

    // Standard Deviation (+/- 10%) for Pilote Range
    const piloteMin = pcPilote * 0.9;
    const piloteMax = pcPilote * 1.1;

    // --- APPROCHE NIVEAU DE VIE (Unités de Consommation OCDE/INSEE) ---
    // Ref : Échelle d'équivalence OCDE modifiée (insee.fr/fr/metadonnees/definition/c1802)
    // Cadre juridique : Art. 270-271, 275 C.civ.
    //   - La PC compense la disparité de niveau de vie créée par le divorce
    //   - Versements échelonnés : 8 ans max (Art. 275 C.civ.)
    //   - La PC n'a pas pour objet d'égaliser les niveaux de vie (Cass. civ. 8 juil. 2015)
    const custody = data.custodyType || "classic";

    // 1. UC Avant Divorce (Ménage complet — Échelle OCDE modifiée)
    //    1er adulte = 1 UC, 2e adulte = 0.5 UC
    //    Enfant < 14 ans = 0.3 UC, Enfant ≥ 14 ans = 0.5 UC
    const childrenUC = computeChildrenUC(data.childrenCount, data.childrenAges);
    const ucBefore = 1 + 0.5 + childrenUC;
    const totalIncome = data.myIncome + data.spouseIncome;
    const standardLivingBefore = totalIncome / ucBefore;

    // 2. UC Après Divorce (Bénéficiaire)
    //    Garde alternée → enfants partagés entre les deux foyers (0.5 × UC enfant)
    const childUcShare = custody === "alternating" ? 0.5 : 1;
    const ucAfter = 1 + childrenUC * childUcShare;
    const standardLivingAfter = beneficiaryIncome / ucAfter;

    // 3. Disparité de niveau de vie
    const lossMonthly = Math.max(0, standardLivingBefore - standardLivingAfter);

    // 4. Capitalisation — « Méthode des 20% » (aidefamille.fr)
    //    Réf : pratique courante avocats/magistrats
    //    Période = min(durée du mariage, 8 ans) — Art. 275 C.civ.
    //    La PC ne vise pas l'égalisation totale (Cass. civ. 8 juil. 2015)
    //    Taux : 20% de la disparité (coefficient couramment retenu)
    //      - Min  : 15% (approche conservatrice)
    //      - Moyen: 20% (standard — méthode des 20%)
    //      - Max  : 25% (fortes disparités / longs mariages)
    const periodYears = Math.min(duration, 8);
    const periodMonths = periodYears * 12;

    const pcInseeMin = lossMonthly * periodMonths * 0.15;
    const pcInsee = lossMonthly * periodMonths * 0.2;
    const pcInseeMax = lossMonthly * periodMonths * 0.25;

    // Resultat final (Moyenne des Moyennes)
    const finalPC = Math.round((pcPilote + pcInsee) / 2);

    // ---------------------------------------------------------
    // 2. CALCUL PENSION ALIMENTAIRE (PA)
    // Barème Ministère de la Justice — Table de Référence 2026
    // PA = (Revenu_Débiteur − RSA_Socle) × Taux × NbEnfants
    // ---------------------------------------------------------

    let paPerChild = 0;
    let paTotal = 0;

    if (data.childrenCount > 0) {
      const rRef = Math.max(0, payerIncome - RSA_SOLO);

      // Clamp children count to 1-6 for rate lookup (barème Ministère de la Justice)
      const rateKey = Math.min(data.childrenCount, 6);
      const rateTable =
        CHILD_SUPPORT_RATES[custody] || CHILD_SUPPORT_RATES.classic;
      const rate = rateTable[rateKey] || 0.135;

      paPerChild = Math.round(rRef * rate);
      paTotal = paPerChild * data.childrenCount;
    }

    // ---------------------------------------------------------
    // 3. LIQUIDATION DU RÉGIME MATRIMONIAL
    // Réf : Art. 1467-1475 C.civ. (liquidation et partage de la communauté)
    // ---------------------------------------------------------
    const netAsset = (data.assetsValue || 0) - (data.assetsCRD || 0);
    let soulteToPay = 0;

    if (data.matrimonialRegime === "separation") {
      // SÉPARATION DE BIENS — pas de communauté, pas de récompenses.
      // La soulte ne concerne que les biens en indivision (co-propriété).
      // On suppose ici une indivision 50/50 sur les biens déclarés.
      soulteToPay = netAsset / 2;
    } else {
      // COMMUNAUTÉ RÉDUITE AUX ACQUÊTS (régime légal par défaut)
      // Art. 1467 : liquidation de la masse commune, active et passive.
      // Art. 1468 : compte de récompenses pour chaque époux.
      // Art. 1470 : balance des récompenses → prélèvement ou rapport.
      // Art. 1475 : après prélèvements, le reliquat se partage par moitié.
      //
      // Formule complète :
      //   Part(Alice) = R_CA + (M − R_CA − R_CB) / 2 = (M + R_CA − R_CB) / 2
      //   Part(Bob)   = R_CB + (M − R_CA − R_CB) / 2 = (M + R_CB − R_CA) / 2
      //
      // La soulte (si Alice conserve le bien) = Part de Bob
      //   Soulte = (M + R_CB − R_CA) / 2
      //
      // NB : Ce calcul simplifié ne prend en compte que les récompenses
      //      dues PAR la communauté À chaque époux (apport propre / héritage).
      //      Les récompenses dues PAR un époux À la communauté (emploi de
      //      fonds communs pour un bien propre) ne sont pas modélisées ici.
      const rewardsAlice = data.rewardsAlice || 0; // R_CA : communauté doit à Alice
      const rewardsBob = data.rewardsBob || 0; // R_CB : communauté doit à Bob
      soulteToPay = (netAsset + rewardsBob - rewardsAlice) / 2;
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
      marriageDurationUsed: duration,
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
        formula: `Méthode des 20% (UC OCDE/INSEE) — Période max 8 ans (Art. 275 C.civ.)`,
      },
    };
  },
};
