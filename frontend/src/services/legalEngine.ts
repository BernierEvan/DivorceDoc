export interface FinancialData {
  myIncome: number;
  spouseIncome: number;
  marriageDuration: number;
  myAge: number;
  spouseAge: number;
  childrenCount: number;
  childrenAges?: number[]; // Âge de chaque enfant (pour calcul UC OCDE)
  custodyType: string;
  marriageDate?: string;
  divorceDate?: string; // Date de divorce ou de séparation
  metadata?: any;

  // Calcul PC method fields
  debtorGrossIncome?: number; // C16/C17 — Revenus actuels avant impôts
  debtorIncomeMode?: string; // "monthly" | "annual"
  debtorChildContribution?: number;
  debtorFutureIncome?: number;
  debtorFutureChildContribution?: number;
  debtorChangeDate?: string;
  debtorPropertyValue?: number;
  debtorPropertyYield?: number;
  creditorGrossIncome?: number; // C30/C31 — Revenus actuels avant impôts
  creditorIncomeMode?: string; // "monthly" | "annual"
  creditorChildContribution?: number;
  creditorFutureIncome?: number;
  creditorFutureChildContribution?: number;
  creditorChangeDate?: string;
  creditorPropertyValue?: number;
  creditorPropertyYield?: number;
  creditorRetirementGapYears?: number;
  creditorPreRetirementIncome?: number;
}

export interface SimulationResult {
  compensatoryAllowance: number;
  custodyTypeUsed: string;
  marriageDurationUsed: number;
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
    axelDepondt: {
      value: number;
      min: number;
      max: number;
      monthlyOver8Years: number;
      debtorMaxSavingsCapital: number;
      debtorMonthlySavings: number;
    };
    formula?: string;
  };
}

/**
 * Calcule la fraction d'année entre deux dates (identique à FRACTION.ANNEE Excel).
 */
function yearFrac(d1: string | Date, d2: string | Date): number {
  const a = d1 instanceof Date ? d1 : new Date(d1);
  const b = d2 instanceof Date ? d2 : new Date(d2);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  return Math.abs(b.getTime() - a.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

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

    // Calculate Duration from Dates if available
    let duration = data.marriageDuration;
    if (data.marriageDate) {
      const start = new Date(data.marriageDate);
      const end = data.divorceDate ? new Date(data.divorceDate) : new Date();
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
    //   - La PC compense la disparité de niveau de vie créée par le divorce
    //   - Versements échelonnés : 8 ans max
    //   - La PC n'a pas pour objet d'égaliser les niveaux de vie
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
    //    Période = min(durée du mariage, 8 ans)
    //    La PC ne vise pas l'égalisation totale
    //    Taux : 20% de la disparité (coefficient couramment retenu)
    //      - Min  : 15% (approche conservatrice)
    //      - Moyen: 20% (standard — méthode des 20%)
    //      - Max  : 25% (fortes disparités / longs mariages)
    const periodYears = Math.min(duration, 8);
    const periodMonths = periodYears * 12;

    const pcInseeMin = lossMonthly * periodMonths * 0.15;
    const pcInsee = lossMonthly * periodMonths * 0.2;
    const pcInseeMax = lossMonthly * periodMonths * 0.25;

    // --- MÉTHODE CALCUL PC (Approche Détaillée / Magistrat) ---
    // Réf : Grille de calcul utilisée par les magistrats et avocats
    // Utilise des revenus BRUTS (avant impôts), PAS les revenus nets.
    //
    // Le débiteur = celui qui gagne le plus (qui PAIE la PC).
    // Le créancier = celui qui gagne le moins (qui REÇOIT la PC).
    // Si l'utilisateur a saisi les revenus à l'envers, on intervertit
    // automatiquement toutes les données débiteur ↔ créancier.

    const refDateStr =
      data.divorceDate || new Date().toISOString().split("T")[0];
    const marriageDurExact = data.marriageDate
      ? yearFrac(data.marriageDate, refDateStr)
      : duration;

    // --- Déterminer le sens : le « débiteur » doit être celui qui gagne le plus ---
    const rawDGross = data.debtorGrossIncome || 0;
    const rawDMonthly =
      data.debtorIncomeMode === "annual" ? rawDGross / 12 : rawDGross;
    const rawCGross = data.creditorGrossIncome || 0;
    const rawCMonthly =
      data.creditorIncomeMode === "annual" ? rawCGross / 12 : rawCGross;

    const shouldSwap = rawCMonthly > rawDMonthly;

    // Fonctions helper pour lire les bons champs après swap éventuel
    const dGrossIncome = shouldSwap
      ? data.creditorGrossIncome || 0
      : data.debtorGrossIncome || 0;
    const dIncomeMode = shouldSwap
      ? data.creditorIncomeMode || "monthly"
      : data.debtorIncomeMode || "monthly";
    const dChildContribIn = shouldSwap
      ? data.creditorChildContribution || 0
      : data.debtorChildContribution || 0;
    const dFutureIncIn = shouldSwap
      ? data.creditorFutureIncome || 0
      : data.debtorFutureIncome || 0;
    const dFutureChildIn = shouldSwap
      ? data.creditorFutureChildContribution || 0
      : data.debtorFutureChildContribution || 0;
    const dChangeDateIn = shouldSwap
      ? data.creditorChangeDate || ""
      : data.debtorChangeDate || "";
    const dPropValueIn = shouldSwap
      ? data.creditorPropertyValue || 0
      : data.debtorPropertyValue || 0;
    const dPropYieldIn = shouldSwap
      ? data.creditorPropertyYield || 0
      : data.debtorPropertyYield || 0;

    const cGrossIncome = shouldSwap
      ? data.debtorGrossIncome || 0
      : data.creditorGrossIncome || 0;
    const cIncomeMode = shouldSwap
      ? data.debtorIncomeMode || "monthly"
      : data.creditorIncomeMode || "monthly";
    const cChildContribIn = shouldSwap
      ? data.debtorChildContribution || 0
      : data.creditorChildContribution || 0;
    const cFutureIncIn = shouldSwap
      ? data.debtorFutureIncome || 0
      : data.creditorFutureIncome || 0;
    const cFutureChildIn = shouldSwap
      ? data.debtorFutureChildContribution || 0
      : data.creditorFutureChildContribution || 0;
    const cChangeDateIn = shouldSwap
      ? data.debtorChangeDate || ""
      : data.creditorChangeDate || "";
    const cPropValueIn = shouldSwap
      ? data.debtorPropertyValue || 0
      : data.creditorPropertyValue || 0;
    const cPropYieldIn = shouldSwap
      ? data.debtorPropertyYield || 0
      : data.creditorPropertyYield || 0;

    // --- Revenus Débiteur (C16-C28) ---
    // C17 = Revenus actuels mensuels avant impôts (brut)
    const dMonthly =
      dIncomeMode === "annual" ? dGrossIncome / 12 : dGrossIncome; // C17
    const dChildContrib = dChildContribIn; // C18
    const dC19 = dMonthly - dChildContrib; // C19

    const dFutureIncome = dFutureIncIn; // C20
    const dFutureChildContrib = dFutureChildIn; // C21
    const dC22 = dFutureIncome > 0 ? dFutureIncome - dFutureChildContrib : dC19; // C22

    let dC24 = dC19; // C24 = revenu mensuel moyen prévisible
    if (dFutureIncome > 0 && dChangeDateIn) {
      const yBefore = Math.max(
        0,
        Math.min(8, yearFrac(refDateStr, dChangeDateIn)),
      );
      dC24 = (yBefore * dC19 + (8 - yBefore) * dC22) / 8;
    }

    const dPropValue = dPropValueIn; // C25
    const dPropYield = dPropYieldIn / 100; // C26 = A26/100
    const dC27 = (dPropValue * dPropYield) / 12; // C27
    const dC28 = dC27 + dC24; // C28 = revenu mensuel moyen prévisible corrigé

    // --- Revenus Créancier (C30-C42) ---
    // C31 = Revenus actuels mensuels avant impôts (brut)
    const cMonthly =
      cIncomeMode === "annual" ? cGrossIncome / 12 : cGrossIncome; // C31
    const cChildContrib = cChildContribIn; // C32
    const cC33 = cMonthly - cChildContrib; // C33

    const cFutureIncome = cFutureIncIn; // C34
    const cFutureChildContrib = cFutureChildIn; // C35
    const cC36 = cFutureIncome > 0 ? cFutureIncome - cFutureChildContrib : cC33; // C36

    let cC38 = cC33; // C38 = revenu mensuel moyen prévisible
    if (cFutureIncome > 0 && cChangeDateIn) {
      const yBefore = Math.max(
        0,
        Math.min(8, yearFrac(refDateStr, cChangeDateIn)),
      );
      cC38 = (yBefore * cC33 + (8 - yBefore) * cC36) / 8;
    }

    const cPropValue = cPropValueIn; // C39
    const cPropYield = cPropYieldIn / 100; // C40 = A40/100
    const cC41 = (cPropValue * cPropYield) / 12; // C41
    const cC42 = cC41 + cC38; // C42 = revenu mensuel moyen prévisible corrigé

    // --- Disparité (C44-C50) ---
    const adC44 = dC28 - cC42; // C44 = différence mensuelle
    const adC46 = adC44 * 0.6; // C46 = pondération × 0.6
    const adC47 = adC46 * marriageDurExact; // C47 = disparité × durée mariage

    // Coefficient d'âge (C49) — basé sur l'âge exact du créancier (celui qui reçoit la PC)
    // Si on a inversé les rôles, le « vrai » créancier est le conjoint (spouseAge).
    const creditorAgeExact = shouldSwap ? data.spouseAge || 0 : data.myAge || 0;
    let adC49: number;
    if (creditorAgeExact < 62) {
      adC49 = 0.01 * creditorAgeExact + 0.82;
    } else {
      adC49 = -0.01 * creditorAgeExact + 2.06;
    }
    adC49 = Math.round(adC49 * 100) / 100;

    const adC50 = adC49 * adC47; // C50 = disparité corrélée âge + durée

    // --- Retraite (C51-C53) — données du vrai créancier (après swap éventuel) ---
    const retGapYears = data.creditorRetirementGapYears || 0; // C51 (toujours saisi côté créancier UI)
    const retPreIncome = data.creditorPreRetirementIncome || 0; // C52
    const adC53 = retPreIncome * retGapYears; // C53

    // --- Résultat Calcul PC (C56-C59) ---
    const pcAxelDepondt = Math.max(0, adC53 + adC50); // C56
    const adDebtorMaxSavings = 0.3 * 96 * dC24; // C57
    const adMonthly8Y = pcAxelDepondt / (12 * 8); // C58
    const adDebtorMonthlySavings = adDebtorMaxSavings / 96; // C59

    const pcAxelMin = pcAxelDepondt * 0.9;
    const pcAxelMax = pcAxelDepondt * 1.1;

    // Resultat final (Moyenne des trois méthodes)
    const methodValues = [pcPilote, pcInsee, pcAxelDepondt];
    const finalPC = Math.round(
      methodValues.reduce((a, b) => a + b, 0) / methodValues.length,
    );

    return {
      compensatoryAllowance: Math.round(finalPC),
      custodyTypeUsed: custody,
      marriageDurationUsed: duration,
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
        axelDepondt: {
          value: Math.round(pcAxelDepondt),
          min: Math.round(pcAxelMin),
          max: Math.round(pcAxelMax),
          monthlyOver8Years: Math.round(adMonthly8Y),
          debtorMaxSavingsCapital: Math.round(adDebtorMaxSavings),
          debtorMonthlySavings: Math.round(adDebtorMonthlySavings),
        },
        formula: `Méthode des 20% (UC OCDE/INSEE) — Période max 8 ans`,
      },
    };
  },
};
