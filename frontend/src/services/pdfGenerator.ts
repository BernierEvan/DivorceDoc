import { jsPDF } from "jspdf";
import type { SimulationResult, FinancialData } from "./legalEngine";

// Design Standards
const COLOR_PRIMARY = "#0F172A"; // Slate 900
const COLOR_ACCENT = "#14B8A6"; // Teal 500
const COLOR_MUTED = "#64748B"; // Slate 500

export const pdfGenerator = {
  generateReport: (data: FinancialData, results: SimulationResult): void => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const sessionHash = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .toUpperCase()}`;
    const dateStr = new Date().toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // ── Helpers ──────────────────────────────────────────────
    const drawWatermark = () => {
      doc.saveGraphicsState();
      // @ts-expect-error - jsPDF GState for opacity
      doc.setGState(new doc.GState({ opacity: 0.12 }));
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(COLOR_PRIMARY);
      const text = "DOCUMENT NON OFFICIEL";
      const spacing = 60;
      for (let row = -pageHeight; row < pageHeight * 2; row += spacing) {
        for (let col = -pageWidth; col < pageWidth * 2; col += spacing * 2) {
          doc.text(text, col, row, { angle: 45 });
        }
      }
      doc.restoreGraphicsState();
    };

    const drawHeader = () => {
      doc.setFillColor(COLOR_PRIMARY);
      doc.rect(0, 0, pageWidth, 22, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("DivorceDoc", 20, 14);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLOR_ACCENT);
      doc.text("SIMULATION DU DIVORCE", 20, 19);
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(`ID: ${sessionHash}`, pageWidth - 20, 10, { align: "right" });
      doc.text(dateStr, pageWidth - 20, 14, { align: "right" });
      doc.setTextColor(156, 163, 175);
      doc.text("Aucune donnée conservée sur serveur", pageWidth - 20, 19, {
        align: "right",
      });
    };

    const drawSectionTitle = (num: string, title: string, topY: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(COLOR_PRIMARY);
      doc.text(`${num}. ${title.toUpperCase()}`, 20, topY);
      doc.setDrawColor(COLOR_ACCENT);
      doc.setLineWidth(0.5);
      doc.line(20, topY + 2, pageWidth - 20, topY + 2);
      return topY + 10;
    };

    const drawSubTitle = (letter: string, title: string, topY: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(COLOR_PRIMARY);
      doc.text(`${letter}. ${title}`, 25, topY);
      return topY + 7;
    };

    const textMuted = (txt: string, x: number, topY: number, size = 9) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      doc.setTextColor(COLOR_MUTED);
      doc.text(txt, x, topY);
      return topY + 4.5;
    };

    const textBold = (txt: string, x: number, topY: number, size = 10) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(COLOR_PRIMARY);
      doc.text(txt, x, topY);
      return topY + 5;
    };

    const newPage = () => {
      doc.addPage();
      drawWatermark();
      drawHeader();
      return 30;
    };

    const custodyLabel =
      results.custodyTypeUsed === "classic"
        ? "Classique"
        : results.custodyTypeUsed === "alternating"
          ? "Alternée"
          : "Réduite";

    const beneficiaryIsMe = data.myIncome < data.spouseIncome;
    const isPayer = data.myIncome > data.spouseIncome;

    // ══════════════════════════════════════════════════════════
    // PAGE 1 — MÉTHODOLOGIES & FORMULES (sans chiffres exacts)
    // ══════════════════════════════════════════════════════════
    drawWatermark();
    drawHeader();
    let y = 30;

    y = drawSectionTitle("1", "Méthodologies & Calculs Utilisés", y);

    // A — Prestation Compensatoire
    y = drawSubTitle("A", "Prestation Compensatoire", y);
    y = textBold("Méthode Pilote (Approche Temporelle)", 30, y, 9);
    y = textMuted(
      "Delta_Annuel = (Revenu_Payeur − Revenu_Bénéficiaire) × 12",
      30,
      y,
    );
    y = textMuted(
      "Coeff_Age : < 45 ans → 1.0 | 45-54 ans → 1.2 | 55+ ans → 1.5",
      30,
      y,
    );
    y = textMuted(
      "PC_Pilote = Delta_Annuel × (Durée_Mariage / 2) × Coeff_Age",
      30,
      y,
    );
    y = textMuted("Fourchette : Min = PC × 0.9  |  Max = PC × 1.1", 30, y);
    y += 3;
    y = textBold("Méthode INSEE (Unités de Consommation)", 30, y, 9);
    y = textMuted("UC_Avant = 1 + 0.5 + 0.3 × Nb_Enfants", 30, y);
    y = textMuted("Niveau_Vie_Avant = (Revenu_A + Revenu_B) / UC_Avant", 30, y);
    y = textMuted("UC_Après = 1 + 0.3 × Nb_Enfants", 30, y);
    y = textMuted("Niveau_Vie_Après = Revenu_Bénéficiaire / UC_Après", 30, y);
    y = textMuted(
      "Perte_Mensuelle = Max(0, Niveau_Vie_Avant − Niveau_Vie_Après)",
      30,
      y,
    );
    y = textMuted(
      "PC_INSEE = Perte_Mensuelle × 96 mois × Taux (15% min / 20% moy / 25% max)",
      30,
      y,
    );
    y += 3;
    y = textBold("Résultat Final", 30, y, 9);
    y = textMuted("PC_Finale = Moyenne(PC_Pilote, PC_INSEE)", 30, y);
    y += 4;

    // B — Pension Alimentaire
    y = drawSubTitle("B", "Pension Alimentaire", y);
    y = textMuted("Base = Revenu_Débiteur − RSA_Socle (645,50 €)", 30, y);
    y = textMuted("Taux selon barème Ministère de la Justice 2026 :", 30, y);
    y = textMuted(
      "  Classique  → 1 enf: 13.5% | 2 enf: 11.5% | 3+ enf: 10%",
      30,
      y,
    );
    y = textMuted(
      "  Alternée   → 1 enf: 9%    | 2 enf: 7.8%  | 3+ enf: 6.7%",
      30,
      y,
    );
    y = textMuted(
      "  Réduite    → 1 enf: 18%   | 2 enf: 15.5% | 3+ enf: 13%",
      30,
      y,
    );
    y = textMuted("PA_par_enfant = Base × Taux", 30, y);
    y = textMuted("PA_totale = PA_par_enfant × Nb_Enfants", 30, y);
    y += 4;

    // C — Liquidation & Soulte
    y = drawSubTitle("C", "Liquidation & Soulte", y);
    y = textMuted("Patrimoine_Net = Valeur_Vénale − Capital_Restant_Dû", 30, y);
    y = textMuted("Régime Communauté :", 30, y);
    y = textMuted(
      "  Soulte = Patrimoine_Net / 2 + (Récompense_Époux − Récompense_Utilisateur)",
      30,
      y,
    );
    y = textMuted("Régime Séparation :", 30, y);
    y = textMuted("  Soulte = Patrimoine_Net / 2", 30, y);
    y += 4;

    // D — Reste à Vivre
    y = drawSubTitle("D", "Reste à Vivre", y);
    y = textMuted("Revenus = Revenu_Net + PA_Reçue", 30, y);
    y = textMuted(
      "Charges = Impôts + Loyer_Crédit + Charges_Fixes + PA_Versée",
      30,
      y,
    );
    y = textMuted("Reste_à_Vivre = Revenus − Charges", 30, y);
    y = textMuted("Seuil de pauvreté 2026 : 1 216 € / mois", 30, y);

    // ══════════════════════════════════════════════════════════
    // PAGE 2 — DONNÉES SAISIES PAR L'UTILISATEUR
    // ══════════════════════════════════════════════════════════
    y = newPage();
    y = drawSectionTitle("2", "Données Saisies par l'Utilisateur", y);

    const leftX = 25;
    const rightX = pageWidth / 2 + 10;

    // Col 1: Situation
    y = textBold("Situation Personnelle", leftX, y);
    let col1Y = y;
    col1Y = textMuted(
      `• Âge de l'utilisateur : ${data.myAge} ans`,
      leftX,
      col1Y,
    );
    col1Y = textMuted(
      `• Âge du conjoint : ${data.spouseAge} ans`,
      leftX,
      col1Y,
    );
    col1Y = textMuted(
      `• Durée du mariage : ${data.marriageDuration} ans`,
      leftX,
      col1Y,
    );
    if (data.marriageDate) {
      col1Y = textMuted(
        `• Date de mariage : ${data.marriageDate}`,
        leftX,
        col1Y,
      );
    }
    col1Y = textMuted(
      `• Nombre d'enfants : ${data.childrenCount}`,
      leftX,
      col1Y,
    );
    col1Y = textMuted(`• Type de garde : ${custodyLabel}`, leftX, col1Y);
    if (data.divorceType) {
      col1Y = textMuted(
        `• Type de divorce : ${data.divorceType}`,
        leftX,
        col1Y,
      );
    }
    if (data.matrimonialRegime) {
      const regimeLabel =
        data.matrimonialRegime === "separation"
          ? "Séparation de biens"
          : "Communauté";
      col1Y = textMuted(`• Régime matrimonial : ${regimeLabel}`, leftX, col1Y);
    }

    // Col 2: Finances
    let col2Y = y;
    col2Y = textBold("Revenus & Charges Mensuelles", rightX, col2Y);
    col2Y = textMuted(
      `• Revenu net (utilisateur) : ${data.myIncome.toLocaleString()} €`,
      rightX,
      col2Y,
    );
    col2Y = textMuted(
      `• Revenu net (conjoint) : ${data.spouseIncome.toLocaleString()} €`,
      rightX,
      col2Y,
    );
    col2Y = textMuted(
      `• Impôts mensuels : ${(data.myTaxes || 0).toLocaleString()} €`,
      rightX,
      col2Y,
    );
    col2Y = textMuted(
      `• Loyer / Crédit immobilier : ${(data.myRent || 0).toLocaleString()} €`,
      rightX,
      col2Y,
    );
    col2Y = textMuted(
      `• Charges fixes : ${(data.myCharges || 0).toLocaleString()} €`,
      rightX,
      col2Y,
    );

    y = Math.max(col1Y, col2Y) + 8;

    y = textBold("Patrimoine Immobilier", leftX, y);
    y = textMuted(
      `• Valeur vénale du/des bien(s) : ${(data.assetsValue || 0).toLocaleString()} €`,
      leftX,
      y,
    );
    y = textMuted(
      `• Capital restant dû (CRD) : ${(data.assetsCRD || 0).toLocaleString()} €`,
      leftX,
      y,
    );
    y = textMuted(
      `• Récompense utilisateur : ${(data.rewardsAlice || 0).toLocaleString()} €`,
      leftX,
      y,
    );
    y = textMuted(
      `• Récompense époux : ${(data.rewardsBob || 0).toLocaleString()} €`,
      leftX,
      y,
    );

    // ══════════════════════════════════════════════════════════
    // PAGE 3 — PRESTATION COMPENSATOIRE (détail chiffré)
    // ══════════════════════════════════════════════════════════
    y = newPage();
    y = drawSectionTitle("3", "Prestation Compensatoire", y);

    // Summary box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, y, pageWidth - 40, 42, 3, 3, "F");

    const boxX = 30;
    let bY = y + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLOR_PRIMARY);
    doc.text("Méthode Pilote", boxX, bY);
    doc.text(
      `${results.details.pilote.value.toLocaleString()} €`,
      pageWidth - 30,
      bY,
      { align: "right" },
    );
    bY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED);
    doc.text(
      `Min: ${results.details.pilote.min.toLocaleString()} €   —   Max: ${results.details.pilote.max.toLocaleString()} €`,
      boxX,
      bY,
    );
    bY += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLOR_PRIMARY);
    doc.text("Méthode INSEE", boxX, bY);
    doc.text(
      `${results.details.insee.value.toLocaleString()} €`,
      pageWidth - 30,
      bY,
      { align: "right" },
    );
    bY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED);
    doc.text(
      `Min: ${results.details.insee.min.toLocaleString()} €   —   Max: ${results.details.insee.max.toLocaleString()} €`,
      boxX,
      bY,
    );
    bY += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLOR_ACCENT);
    doc.text("Moyenne Estimée", boxX, bY);
    doc.text(
      `${results.compensatoryAllowance.toLocaleString()} €`,
      pageWidth - 30,
      bY,
      { align: "right" },
    );

    y += 50;

    // Détail des calculs
    y = drawSubTitle("", "Détail des Calculs", y);

    const payerIncome = beneficiaryIsMe ? data.spouseIncome : data.myIncome;
    const beneficiaryIncome = beneficiaryIsMe
      ? data.myIncome
      : data.spouseIncome;
    const beneficiaryAge = beneficiaryIsMe ? data.myAge : data.spouseAge;
    const deltaMonthly = payerIncome - beneficiaryIncome;
    const deltaAnnual = deltaMonthly * 12;
    let ageCoeff = 1.0;
    if (beneficiaryAge >= 45 && beneficiaryAge < 55) ageCoeff = 1.2;
    if (beneficiaryAge >= 55) ageCoeff = 1.5;

    y = textBold("Méthode Pilote — Calcul Détaillé", 25, y, 9);
    y = textMuted(
      `Bénéficiaire : ${beneficiaryIsMe ? "Utilisateur" : "Conjoint"} (revenu le plus faible)`,
      30,
      y,
    );
    y = textMuted(
      `Revenu Payeur : ${payerIncome.toLocaleString()} € / mois`,
      30,
      y,
    );
    y = textMuted(
      `Revenu Bénéficiaire : ${beneficiaryIncome.toLocaleString()} € / mois`,
      30,
      y,
    );
    y = textMuted(
      `Écart mensuel : ${deltaMonthly.toLocaleString()} €  →  Annuel : ${deltaAnnual.toLocaleString()} €`,
      30,
      y,
    );
    y = textMuted(`Durée du mariage : ${data.marriageDuration} ans`, 30, y);
    y = textMuted(
      `Coefficient d'âge (${beneficiaryAge} ans) : ${ageCoeff}`,
      30,
      y,
    );
    y = textMuted(
      `PC_Pilote = ${deltaAnnual.toLocaleString()} × (${data.marriageDuration} / 2) × ${ageCoeff}`,
      30,
      y,
    );
    y = textBold(
      `= ${results.details.pilote.value.toLocaleString()} €`,
      30,
      y,
      9,
    );
    y = textMuted(
      `Fourchette : ${results.details.pilote.min.toLocaleString()} € — ${results.details.pilote.max.toLocaleString()} €`,
      30,
      y,
    );
    y += 5;

    const ucBefore = 1 + 0.5 + 0.3 * data.childrenCount;
    const totalIncomeAll = data.myIncome + data.spouseIncome;
    const nivVieBefore = totalIncomeAll / ucBefore;
    const ucAfter = 1 + 0.3 * data.childrenCount;
    const nivVieAfter = beneficiaryIncome / ucAfter;
    const lossMonthly = Math.max(0, nivVieBefore - nivVieAfter);

    y = textBold("Méthode INSEE — Calcul Détaillé", 25, y, 9);
    y = textMuted(
      `UC avant divorce : 1 + 0.5 + 0.3 × ${data.childrenCount} = ${ucBefore.toFixed(1)}`,
      30,
      y,
    );
    y = textMuted(
      `Revenus totaux du ménage : ${totalIncomeAll.toLocaleString()} € / mois`,
      30,
      y,
    );
    y = textMuted(
      `Niveau de vie avant : ${totalIncomeAll.toLocaleString()} / ${ucBefore.toFixed(1)} = ${Math.round(nivVieBefore).toLocaleString()} €`,
      30,
      y,
    );
    y = textMuted(
      `UC après divorce : 1 + 0.3 × ${data.childrenCount} = ${ucAfter.toFixed(1)}`,
      30,
      y,
    );
    y = textMuted(
      `Niveau de vie après : ${beneficiaryIncome.toLocaleString()} / ${ucAfter.toFixed(1)} = ${Math.round(nivVieAfter).toLocaleString()} €`,
      30,
      y,
    );
    y = textMuted(
      `Perte mensuelle : Max(0, ${Math.round(nivVieBefore).toLocaleString()} − ${Math.round(nivVieAfter).toLocaleString()}) = ${Math.round(lossMonthly).toLocaleString()} €`,
      30,
      y,
    );
    y = textMuted(
      `PC_INSEE = ${Math.round(lossMonthly).toLocaleString()} × 96 × 0.20 = ${results.details.insee.value.toLocaleString()} €`,
      30,
      y,
    );
    y = textBold(
      `= ${results.details.insee.value.toLocaleString()} €`,
      30,
      y,
      9,
    );
    y = textMuted(
      `Fourchette : ${results.details.insee.min.toLocaleString()} € — ${results.details.insee.max.toLocaleString()} €`,
      30,
      y,
    );
    y += 5;

    y = textBold("Moyenne Finale", 25, y, 9);
    y = textMuted(
      `(${results.details.pilote.value.toLocaleString()} + ${results.details.insee.value.toLocaleString()}) / 2 = ${results.compensatoryAllowance.toLocaleString()} €`,
      30,
      y,
    );

    // ══════════════════════════════════════════════════════════
    // PAGE 4 — PENSION ALIMENTAIRE (détail chiffré)
    // ══════════════════════════════════════════════════════════
    y = newPage();
    y = drawSectionTitle("4", "Pension Alimentaire", y);

    const paDirection = isPayer ? "à verser" : "à recevoir";

    // Summary box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, y, pageWidth - 40, 30, 3, 3, "F");
    bY = y + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLOR_PRIMARY);
    doc.text(`Pension Alimentaire (${paDirection})`, 30, bY);
    doc.setTextColor(COLOR_ACCENT);
    doc.text(
      `${results.childSupport.toLocaleString()} € / mois`,
      pageWidth - 30,
      bY,
      { align: "right" },
    );
    bY += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_MUTED);
    doc.text(`Type de garde : ${custodyLabel}`, 30, bY);
    bY += 5;
    doc.text(`Nombre d'enfants : ${data.childrenCount}`, 30, bY);
    if (results.childSupportPerChild > 0) {
      doc.text(
        `${results.childSupportPerChild.toLocaleString()} € / enfant`,
        pageWidth - 30,
        bY,
        { align: "right" },
      );
    }

    y += 38;

    // Détail des calculs
    y = drawSubTitle("", "Détail des Calculs", y);

    const RSA_SOLO = 645.5;
    const rRef = Math.max(0, payerIncome - RSA_SOLO);
    const rateKey = Math.min(data.childrenCount, 3);
    const CHILD_SUPPORT_RATES: Record<string, Record<number, number>> = {
      classic: { 1: 0.135, 2: 0.115, 3: 0.1 },
      alternating: { 1: 0.09, 2: 0.078, 3: 0.067 },
      reduced: { 1: 0.18, 2: 0.155, 3: 0.13 },
    };
    const custody = data.custodyType || "classic";
    const rateTable =
      CHILD_SUPPORT_RATES[custody] || CHILD_SUPPORT_RATES.classic;
    const rate = rateTable[rateKey] || 0.135;

    y = textMuted(
      `Débiteur : ${isPayer ? "Utilisateur" : "Conjoint"} (revenu le plus élevé)`,
      30,
      y,
    );
    y = textMuted(
      `Revenu du débiteur : ${payerIncome.toLocaleString()} € / mois`,
      30,
      y,
    );
    y = textMuted(`RSA Socle 2026 : ${RSA_SOLO} €`, 30, y);
    y = textMuted(
      `Base de référence = ${payerIncome.toLocaleString()} − ${RSA_SOLO} = ${rRef.toLocaleString()} €`,
      30,
      y,
    );
    y += 2;
    y = textMuted(`Type de garde : ${custodyLabel}`, 30, y);
    y = textMuted(
      `Nombre d'enfants : ${data.childrenCount}  →  Taux applicable : ${(rate * 100).toFixed(1)}%`,
      30,
      y,
    );
    y += 2;
    y = textMuted(
      `PA par enfant = ${rRef.toLocaleString()} × ${(rate * 100).toFixed(1)}% = ${results.childSupportPerChild.toLocaleString()} €`,
      30,
      y,
    );
    y = textMuted(
      `PA totale = ${results.childSupportPerChild.toLocaleString()} × ${data.childrenCount} = ${results.childSupport.toLocaleString()} € / mois`,
      30,
      y,
    );
    y += 4;

    if (data.childrenCount === 0) {
      y = textMuted(
        "Aucun enfant déclaré — Pension alimentaire non applicable.",
        30,
        y,
      );
    }

    // ══════════════════════════════════════════════════════════
    // PAGE 5 — LIQUIDATION & SOULTE (détail chiffré)
    // ══════════════════════════════════════════════════════════
    y = newPage();
    y = drawSectionTitle("5", "Liquidation & Soulte", y);

    const netAsset = (data.assetsValue || 0) - (data.assetsCRD || 0);
    const soulteDirection =
      results.liquidationShare > 0 ? "à verser" : "à recevoir";
    const soulteAbs = Math.abs(results.liquidationShare);

    // Summary box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, y, pageWidth - 40, 38, 3, 3, "F");
    bY = y + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLOR_PRIMARY);
    doc.text(`Soulte (${soulteDirection})`, 30, bY);
    doc.setTextColor(COLOR_ACCENT);
    doc.text(`${soulteAbs.toLocaleString()} €`, pageWidth - 30, bY, {
      align: "right",
    });
    bY += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_MUTED);
    doc.text(
      `Valeur vénale du/des bien(s) : ${(data.assetsValue || 0).toLocaleString()} €`,
      30,
      bY,
    );
    bY += 5;
    doc.text(
      `Capital restant dû : ${(data.assetsCRD || 0).toLocaleString()} €`,
      30,
      bY,
    );
    bY += 5;
    doc.text(
      `Récompense utilisateur : ${(data.rewardsAlice || 0).toLocaleString()} €`,
      30,
      bY,
    );
    doc.text(
      `Récompense époux : ${(data.rewardsBob || 0).toLocaleString()} €`,
      pageWidth - 30,
      bY,
      { align: "right" },
    );

    y += 46;

    // Détail des calculs
    y = drawSubTitle("", "Détail des Calculs", y);

    const regime =
      data.matrimonialRegime === "separation"
        ? "Séparation de biens"
        : "Communauté";
    y = textMuted(`Régime matrimonial : ${regime}`, 30, y);
    y = textMuted(
      `Valeur vénale : ${(data.assetsValue || 0).toLocaleString()} €`,
      30,
      y,
    );
    y = textMuted(
      `Capital restant dû (CRD) : ${(data.assetsCRD || 0).toLocaleString()} €`,
      30,
      y,
    );
    y = textMuted(
      `Patrimoine net = ${(data.assetsValue || 0).toLocaleString()} − ${(data.assetsCRD || 0).toLocaleString()} = ${netAsset.toLocaleString()} €`,
      30,
      y,
    );
    y += 2;

    if (data.matrimonialRegime === "separation") {
      y = textMuted(`Soulte = Patrimoine_Net / 2`, 30, y);
      y = textMuted(
        `Soulte = ${netAsset.toLocaleString()} / 2 = ${(netAsset / 2).toLocaleString()} €`,
        30,
        y,
      );
    } else {
      const rewardsDiff = (data.rewardsBob || 0) - (data.rewardsAlice || 0);
      y = textMuted(
        `Récompense utilisateur (A) : ${(data.rewardsAlice || 0).toLocaleString()} €`,
        30,
        y,
      );
      y = textMuted(
        `Récompense époux (B) : ${(data.rewardsBob || 0).toLocaleString()} €`,
        30,
        y,
      );
      y = textMuted(
        `Différentiel récompenses (B − A) : ${rewardsDiff.toLocaleString()} €`,
        30,
        y,
      );
      y += 2;
      y = textMuted(
        `Soulte = Patrimoine_Net / 2 + (Récompense_B − Récompense_A)`,
        30,
        y,
      );
      y = textMuted(
        `Soulte = ${netAsset.toLocaleString()} / 2 + ${rewardsDiff.toLocaleString()}`,
        30,
        y,
      );
      y = textBold(
        `= ${results.liquidationShare.toLocaleString()} €  (${soulteDirection})`,
        30,
        y,
        9,
      );
    }

    // ══════════════════════════════════════════════════════════
    // PAGE 6 — RESTE À VIVRE
    // ══════════════════════════════════════════════════════════
    y = newPage();
    y = drawSectionTitle("6", "Reste à Vivre de l'Utilisateur", y);

    // Summary box
    const rvColor = results.belowPovertyThreshold
      ? [200, 100, 0]
      : [20, 184, 166];
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, y, pageWidth - 40, 18, 3, 3, "F");
    bY = y + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(rvColor[0], rvColor[1], rvColor[2]);
    doc.text(
      `${results.remainingLiveable.toLocaleString()} € / mois`,
      pageWidth / 2,
      bY,
      { align: "center" },
    );
    if (results.belowPovertyThreshold) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(
        "Inférieur au seuil de pauvreté 2026 (1 216 € / mois)",
        pageWidth / 2,
        bY + 6,
        { align: "center" },
      );
      y += 28;
    } else {
      y += 24;
    }

    // Détail des calculs
    y = drawSubTitle("", "Détail des Calculs", y);

    y = textBold("Revenus", 30, y, 9);
    y = textMuted(`+ Revenu net : ${data.myIncome.toLocaleString()} €`, 30, y);
    if (results.budget.paReceived > 0) {
      y = textMuted(
        `+ Pension alimentaire reçue : ${results.budget.paReceived.toLocaleString()} €`,
        30,
        y,
      );
    }
    y = textMuted(
      `= Total Revenus : ${results.budget.totalRevenus.toLocaleString()} €`,
      30,
      y,
    );
    y += 3;

    y = textBold("Charges", 30, y, 9);
    if (results.budget.taxes > 0) {
      y = textMuted(
        `− Impôts : ${results.budget.taxes.toLocaleString()} €`,
        30,
        y,
      );
    }
    if (results.budget.rent > 0) {
      y = textMuted(
        `− Loyer / Crédit immobilier : ${results.budget.rent.toLocaleString()} €`,
        30,
        y,
      );
    }
    if (results.budget.fixedCharges > 0) {
      y = textMuted(
        `− Charges fixes : ${results.budget.fixedCharges.toLocaleString()} €`,
        30,
        y,
      );
    }
    if (results.budget.paPaid > 0) {
      y = textMuted(
        `− Pension alimentaire versée : ${results.budget.paPaid.toLocaleString()} €`,
        30,
        y,
      );
    }
    y = textMuted(
      `= Total Charges : ${results.budget.totalCharges.toLocaleString()} €`,
      30,
      y,
    );
    y += 3;

    y = textBold("Résultat", 30, y, 9);
    y = textMuted(
      `Reste à Vivre = ${results.budget.totalRevenus.toLocaleString()} − ${results.budget.totalCharges.toLocaleString()} = ${results.remainingLiveable.toLocaleString()} € / mois`,
      30,
      y,
    );

    // ══════════════════════════════════════════════════════════
    // PAGES 7+ — GRAPHIQUES
    // ══════════════════════════════════════════════════════════
    y = newPage();
    y = drawSectionTitle("7", "Analyses Graphiques", y);

    // A. Disparité Revenus
    y = drawSubTitle("A", "Disparité des Revenus", y);

    const totalIncome = data.myIncome + data.spouseIncome;
    const myShare = totalIncome > 0 ? data.myIncome / totalIncome : 0;
    const spouseShare = totalIncome > 0 ? data.spouseIncome / totalIncome : 0;
    const barWidth = 140;
    const barHeight = 14;
    const startX = 35;

    doc.setFillColor(20, 184, 166);
    doc.rect(startX, y, barWidth * myShare, barHeight, "F");
    doc.setFillColor(148, 163, 184);
    doc.rect(
      startX + barWidth * myShare,
      y,
      barWidth * spouseShare,
      barHeight,
      "F",
    );

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    if (myShare > 0.1) {
      doc.text(
        `${Math.round(myShare * 100)}%`,
        startX + (barWidth * myShare) / 2,
        y + 9,
        { align: "center" },
      );
    }
    if (spouseShare > 0.1) {
      doc.text(
        `${Math.round(spouseShare * 100)}%`,
        startX + barWidth * myShare + (barWidth * spouseShare) / 2,
        y + 9,
        { align: "center" },
      );
    }

    y += barHeight + 6;
    doc.setFontSize(8);
    doc.setFillColor(20, 184, 166);
    doc.rect(startX, y, 4, 4, "F");
    doc.setTextColor(COLOR_MUTED);
    doc.text(
      `Utilisateur (${data.myIncome.toLocaleString()} €)`,
      startX + 6,
      y + 3,
    );
    doc.setFillColor(148, 163, 184);
    doc.rect(startX + 80, y, 4, 4, "F");
    doc.text(
      `Conjoint (${data.spouseIncome.toLocaleString()} €)`,
      startX + 86,
      y + 3,
    );

    y += 18;

    // B. Budget Mensuel Estimé
    y = drawSubTitle("B", "Budget Mensuel Post-Divorce", y);

    const budgetItems = [
      {
        label: "Revenus",
        value: results.budget.totalRevenus,
        color: [20, 184, 166],
      },
      { label: "Impôts", value: results.budget.taxes, color: [251, 146, 60] },
      { label: "Logement", value: results.budget.rent, color: [239, 68, 68] },
      {
        label: "Charges",
        value: results.budget.fixedCharges,
        color: [168, 85, 247],
      },
      {
        label: "PA versée",
        value: results.budget.paPaid,
        color: [244, 63, 94],
      },
      {
        label: "Reste",
        value: Math.max(0, results.remainingLiveable),
        color: [99, 102, 241],
      },
    ].filter((i) => i.value > 0);

    const maxVal = Math.max(...budgetItems.map((i) => i.value)) || 1;
    const chartHeight = 50;
    const colWidth = budgetItems.length <= 4 ? 28 : 22;
    const gap = budgetItems.length <= 4 ? 12 : 8;
    const totalChartW =
      budgetItems.length * colWidth + (budgetItems.length - 1) * gap;
    let currentX = (pageWidth - totalChartW) / 2;

    budgetItems.forEach((item) => {
      const h = (item.value / maxVal) * chartHeight;
      const topY = y + (chartHeight - h);

      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(currentX, topY, colWidth, h, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(COLOR_PRIMARY);
      doc.text(
        `${item.value.toLocaleString()}€`,
        currentX + colWidth / 2,
        topY - 2,
        { align: "center" },
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(COLOR_MUTED);
      doc.text(item.label, currentX + colWidth / 2, y + chartHeight + 5, {
        align: "center",
      });

      currentX += colWidth + gap;
    });

    y += chartHeight + 20;

    // C. Prestation Compensatoire Comparaison
    y = drawSubTitle("C", "Comparaison Prestation Compensatoire", y);

    const pcItems = [
      {
        label: "Pilote Min",
        value: results.details.pilote.min,
        color: [20, 184, 166],
      },
      {
        label: "Pilote",
        value: results.details.pilote.value,
        color: [13, 148, 136],
      },
      {
        label: "Pilote Max",
        value: results.details.pilote.max,
        color: [15, 118, 110],
      },
      {
        label: "INSEE Min",
        value: results.details.insee.min,
        color: [99, 102, 241],
      },
      {
        label: "INSEE",
        value: results.details.insee.value,
        color: [79, 70, 229],
      },
      {
        label: "INSEE Max",
        value: results.details.insee.max,
        color: [67, 56, 202],
      },
    ];

    const maxPC = Math.max(...pcItems.map((i) => i.value)) || 1;
    const pcBarH = 50;
    const pcColW = 22;
    const pcGap = 6;
    const pcTotalW = pcItems.length * pcColW + (pcItems.length - 1) * pcGap;
    currentX = (pageWidth - pcTotalW) / 2;

    pcItems.forEach((item) => {
      const h = (item.value / maxPC) * pcBarH;
      const topY = y + (pcBarH - h);

      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(currentX, topY, pcColW, h, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(COLOR_PRIMARY);
      doc.text(
        `${item.value.toLocaleString()}€`,
        currentX + pcColW / 2,
        topY - 2,
        { align: "center" },
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(COLOR_MUTED);
      doc.text(item.label, currentX + pcColW / 2, y + pcBarH + 4, {
        align: "center",
      });

      currentX += pcColW + pcGap;
    });

    // Average line
    const avgLineY =
      y + pcBarH - (results.compensatoryAllowance / maxPC) * pcBarH;
    doc.setDrawColor(239, 68, 68);
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(
      (pageWidth - pcTotalW) / 2 - 5,
      avgLineY,
      (pageWidth + pcTotalW) / 2 + 5,
      avgLineY,
    );
    doc.setLineDashPattern([], 0);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(239, 68, 68);
    doc.text(
      `Moyenne: ${results.compensatoryAllowance.toLocaleString()} €`,
      pageWidth / 2,
      avgLineY - 3,
      { align: "center" },
    );

    // ── GLOBAL: Disclaimer + Footer on ALL pages ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Legal Disclaimer
      const disclaimerY = pageHeight - 55;
      doc.setDrawColor(252, 165, 165);
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(20, disclaimerY, pageWidth - 40, 32, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(185, 28, 28);
      doc.text("AVERTISSEMENT LÉGAL", 30, disclaimerY + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(
        "1. Ce document est une estimation mathématique et ne remplace pas un avocat.",
        30,
        disclaimerY + 13,
      );
      doc.text(
        "2. Seul un Juge aux Affaires Familiales peut fixer les montants définitifs.",
        30,
        disclaimerY + 18,
      );
      doc.text(
        "3. Les données sont déclaratives et n'ont pas été certifiées.",
        30,
        disclaimerY + 23,
      );

      // Footer
      const footerY = pageHeight - 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
      doc.setFontSize(7);
      doc.setTextColor(COLOR_MUTED);
      doc.text(`Page ${i} / ${pageCount}`, 20, footerY);
      doc.text(
        "Généré par DivorceDoc — Application d'Aide à la Décision",
        pageWidth - 20,
        footerY,
        { align: "right" },
      );
    }

    // Output
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rapport_Simulation_${sessionHash}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  },
};
