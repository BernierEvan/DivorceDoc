import { jsPDF } from "jspdf";
import type { SimulationResult, FinancialData } from "./legalEngine";
import { getCalculationChoices } from "./divorceFormStore";

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
      doc.text("Calculs réalisés localement", pageWidth - 20, 19, {
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

    /** Saute de page si y dépasse la marge basse (20mm du bas) */
    const checkPageBreak = (currentY: number, needed = 10): number => {
      if (currentY + needed > pageHeight - 20) {
        return newPage();
      }
      return currentY;
    };

    const custodyLabel =
      results.custodyTypeUsed === "classic"
        ? "Classique"
        : results.custodyTypeUsed === "alternating"
          ? "Alternée"
          : "Réduite";

    const beneficiaryIsMe = data.myIncome < data.spouseIncome;
    const isPayer = data.myIncome > data.spouseIncome;

    // ── Calculation Choices ──────────────────────────────────
    const choices = getCalculationChoices();
    const hasChoices = choices.selectedCalcs.length > 0;
    const hasPC =
      !hasChoices || choices.selectedCalcs.includes("prestationCompensatoire");
    const hasPA =
      !hasChoices || choices.selectedCalcs.includes("pensionAlimentaire");
    const hasLiq = !hasChoices || choices.selectedCalcs.includes("liquidation");
    const hasRAV = !hasChoices || choices.selectedCalcs.includes("resteAVivre");

    const pcMethods = choices.selectedMethods.prestationCompensatoire || [
      "axelDepondt",
      "pilote",
      "insee",
      "paBased",
    ];
    const showPilote = hasPC && pcMethods.includes("pilote");
    const showInsee = hasPC && pcMethods.includes("insee");
    const showPaBased = hasPC && pcMethods.includes("paBased");
    const showAxelDepondt = hasPC && pcMethods.includes("axelDepondt");

    // Derived flags for data display
    const needsNetIncome =
      showPilote || showInsee || showPaBased || hasPA || hasRAV;
    const needsFamilyData = showInsee || showPaBased || hasPA;
    const needsGrossIncome = showAxelDepondt;

    // Dynamic PC average (only selected methods)
    const activePCValues: number[] = [];
    if (showAxelDepondt) activePCValues.push(results.details.axelDepondt.value);
    if (showPilote) activePCValues.push(results.details.pilote.value);
    if (showInsee) activePCValues.push(results.details.insee.value);
    if (showPaBased) activePCValues.push(results.details.paBased.value);
    const pcMainValue =
      activePCValues.length > 0
        ? Math.round(
            activePCValues.reduce((a, b) => a + b, 0) / activePCValues.length,
          )
        : results.compensatoryAllowance;

    // Dynamic section numbering
    let sectionNum = 0;
    const nextSection = () => String(++sectionNum);

    // ══════════════════════════════════════════════════════════
    // PAGE 1 — DONNÉES SAISIES PAR L'UTILISATEUR
    // ══════════════════════════════════════════════════════════
    drawWatermark();
    drawHeader();
    let y = 30;

    y = drawSectionTitle(nextSection(), "Données Saisies", y);

    const leftX = 25;
    const rightX = pageWidth / 2 + 10;

    // Col 1: Situation
    y = textBold("Situation Personnelle", leftX, y);
    let col1Y = y;
    col1Y = textMuted(`• Âge du créancier : ${data.myAge} ans`, leftX, col1Y);
    col1Y = textMuted(
      `• Âge du débiteur : ${data.spouseAge} ans`,
      leftX,
      col1Y,
    );
    const marriageDur =
      results.marriageDurationUsed || data.marriageDuration || 0;
    col1Y = textMuted(`• Durée du mariage : ${marriageDur} ans`, leftX, col1Y);
    if (data.marriageDate) {
      col1Y = textMuted(
        `• Date de mariage : ${data.marriageDate}`,
        leftX,
        col1Y,
      );
    }
    if (data.divorceDate) {
      col1Y = textMuted(
        `• Date de divorce / séparation : ${data.divorceDate}`,
        leftX,
        col1Y,
      );
    }
    if (needsFamilyData) {
      col1Y = textMuted(
        `• Nombre d'enfants : ${data.childrenCount}`,
        leftX,
        col1Y,
      );
      if (data.childrenCount > 0) {
        col1Y = textMuted(`• Type de garde : ${custodyLabel}`, leftX, col1Y);
      }
    }
    if (hasLiq && data.matrimonialRegime) {
      const regimeLabel =
        data.matrimonialRegime === "separation"
          ? "Séparation de biens"
          : "Communauté";
      col1Y = textMuted(`• Régime matrimonial : ${regimeLabel}`, leftX, col1Y);
    }

    // Col 2: Finances (net income)
    let col2Y = y;
    if (needsNetIncome) {
      col2Y = textBold("Revenus & Charges Mensuelles", rightX, col2Y);
      col2Y = textMuted(
        `• Revenu net (créancier) : ${data.myIncome.toLocaleString()} €`,
        rightX,
        col2Y,
      );
      col2Y = textMuted(
        `• Revenu net (débiteur) : ${data.spouseIncome.toLocaleString()} €`,
        rightX,
        col2Y,
      );
      if (hasRAV) {
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
      }
    }

    y = Math.max(col1Y, col2Y) + 8;

    // Gross income (Calcul PC)
    if (needsGrossIncome) {
      y = checkPageBreak(y, 30);
      y = textBold("Revenus Bruts (Calcul PC)", leftX, y);
      const dGrossLabel =
        data.debtorIncomeMode === "annual" ? "/ an" : "/ mois";
      const cGrossLabel =
        data.creditorIncomeMode === "annual" ? "/ an" : "/ mois";
      y = textMuted(
        `• Revenu brut débiteur : ${(data.debtorGrossIncome || 0).toLocaleString()} € ${dGrossLabel}`,
        leftX,
        y,
      );
      y = textMuted(
        `• Revenu brut créancier : ${(data.creditorGrossIncome || 0).toLocaleString()} € ${cGrossLabel}`,
        leftX,
        y,
      );
      if (data.debtorPropertyValue) {
        y = textMuted(
          `• Patrimoine débiteur : ${data.debtorPropertyValue.toLocaleString()} € (rendement ${data.debtorPropertyYield || 0}%)`,
          leftX,
          y,
        );
      }
      if (data.creditorPropertyValue) {
        y = textMuted(
          `• Patrimoine créancier : ${data.creditorPropertyValue.toLocaleString()} € (rendement ${data.creditorPropertyYield || 0}%)`,
          leftX,
          y,
        );
      }
      y += 4;
    }

    // Patrimoine Immobilier (only for Liquidation)
    if (hasLiq) {
      y = checkPageBreak(y, 25);
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
      if (data.matrimonialRegime !== "separation") {
        y = textMuted(
          `• Récompense créancier : ${(data.rewardsAlice || 0).toLocaleString()} €`,
          leftX,
          y,
        );
        y = textMuted(
          `• Récompense débiteur : ${(data.rewardsBob || 0).toLocaleString()} €`,
          leftX,
          y,
        );
      }
    }

    // ══════════════════════════════════════════════════════════
    // PRESTATION COMPENSATOIRE (détail chiffré) — conditional
    // ══════════════════════════════════════════════════════════
    const payerIncome = beneficiaryIsMe ? data.spouseIncome : data.myIncome;
    const beneficiaryIncome = beneficiaryIsMe
      ? data.myIncome
      : data.spouseIncome;
    const beneficiaryAge = beneficiaryIsMe ? data.myAge : data.spouseAge;
    const ages = data.childrenAges || [];

    if (hasPC) {
      y = newPage();
      y = drawSectionTitle(nextSection(), "Prestation Compensatoire", y);

      // Compute dynamic box height: 13px per method + 8px average line + padding
      const pcMethodEntries: {
        label: string;
        detail: { value: number; min: number; max: number };
      }[] = [];
      if (showPilote)
        pcMethodEntries.push({
          label: "Méthode du Tiers",
          detail: results.details.pilote,
        });
      if (showInsee)
        pcMethodEntries.push({
          label: "Méthode INSEE",
          detail: results.details.insee,
        });
      if (showPaBased)
        pcMethodEntries.push({
          label: "Méthode Pension Alimentaire",
          detail: results.details.paBased,
        });
      if (showAxelDepondt)
        pcMethodEntries.push({
          label: "Méthode Calcul PC",
          detail: results.details.axelDepondt,
        });

      const boxHeight = pcMethodEntries.length * 13 + 16; // 13 per entry + padding + average line
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, y, pageWidth - 40, boxHeight, 3, 3, "F");

      const boxX = 30;
      let bY = y + 8;

      pcMethodEntries.forEach((entry) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(COLOR_PRIMARY);
        doc.text(entry.label, boxX, bY);
        doc.text(
          `${entry.detail.value.toLocaleString()} €`,
          pageWidth - 30,
          bY,
          { align: "right" },
        );
        bY += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(COLOR_MUTED);
        doc.text(
          `Min: ${entry.detail.min.toLocaleString()} €   —   Max: ${entry.detail.max.toLocaleString()} €`,
          boxX,
          bY,
        );
        bY += 8;
      });

      // Average line (only if multiple methods)
      if (pcMethodEntries.length > 1) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLOR_ACCENT);
        doc.text("Moyenne Estimée", boxX, bY);
        doc.text(`${pcMainValue.toLocaleString()} €`, pageWidth - 30, bY, {
          align: "right",
        });
      }

      y += boxHeight + 8;

      // Détails des informations
      y = drawSubTitle("", "Détails des informations relatives aux calculs", y);

      if (showPilote) {
        y = textBold("Méthode du Tiers Pondéré", 25, y, 9);
        y = textMuted(
          `Bénéficiaire : ${beneficiaryIsMe ? "Créancier" : "Débiteur"} (revenu le plus faible)`,
          30,
          y,
        );
        y = textMuted(
          `Revenu du payeur : ${payerIncome.toLocaleString()} € / mois`,
          30,
          y,
        );
        y = textMuted(
          `Revenu du bénéficiaire : ${beneficiaryIncome.toLocaleString()} € / mois`,
          30,
          y,
        );
        y = textMuted(`Durée du mariage : ${marriageDur} ans`, 30, y);
        y = textMuted(`Âge du bénéficiaire : ${beneficiaryAge} ans`, 30, y);
        y += 5;
      }

      if (showInsee) {
        y = checkPageBreak(y, 30);
        y = textBold("Méthode INSEE (Unités de Consommation)", 25, y, 9);
        y = textMuted(
          `Revenus totaux du ménage : ${(data.myIncome + data.spouseIncome).toLocaleString()} € / mois`,
          30,
          y,
        );
        y = textMuted(`Nombre d'enfants : ${data.childrenCount}`, 30, y);
        if (data.childrenCount > 0 && ages.length > 0) {
          const agesStr = ages
            .slice(0, data.childrenCount)
            .map((a, i) => `E${i + 1}: ${a} ans`)
            .join(", ");
          y = textMuted(`Âges des enfants : ${agesStr}`, 30, y);
        }
        y = textMuted(`Type de garde : ${custodyLabel}`, 30, y);
        y = textMuted(
          `Revenu du bénéficiaire : ${beneficiaryIncome.toLocaleString()} € / mois`,
          30,
          y,
        );
        y += 5;
      }

      if (showPaBased) {
        y = checkPageBreak(y, 20);
        y = textBold("Méthode Pension Alimentaire", 25, y, 9);
        y = textMuted(
          `Pension alimentaire totale : ${results.childSupport.toLocaleString()} € / mois`,
          30,
          y,
        );
        y = textMuted(
          `Calcul : ${results.childSupport.toLocaleString()} € × 12 × 8 = ${results.details.paBased.value.toLocaleString()} €`,
          30,
          y,
        );
        y = textMuted(`Intervalle coefficient : 6 à 10`, 30, y);
        y += 5;
      }

      if (showAxelDepondt) {
        y = checkPageBreak(y, 20);
        y = textBold("Méthode Calcul PC", 25, y, 9);
        y = textMuted(
          `Capital : ${results.details.axelDepondt.value.toLocaleString()} € (±10%)`,
          30,
          y,
        );
        y = textMuted(
          `Mensuel sur 8 ans : ${results.details.axelDepondt.monthlyOver8Years.toLocaleString()} € / mois`,
          30,
          y,
        );
        y = textMuted(
          `Capacité d'épargne max débiteur : ${results.details.axelDepondt.debtorMaxSavingsCapital.toLocaleString()} €`,
          30,
          y,
        );
      }
    } // end hasPC

    // ══════════════════════════════════════════════════════════
    // PENSION ALIMENTAIRE (détail chiffré) — conditional
    // ══════════════════════════════════════════════════════════
    if (hasPA) {
      y = newPage();
      y = drawSectionTitle(nextSection(), "Pension Alimentaire", y);

      const paDirection = isPayer ? "à verser" : "à recevoir";

      // Summary box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, y, pageWidth - 40, 30, 3, 3, "F");
      let bYpa = y + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(COLOR_PRIMARY);
      doc.text(`Pension Alimentaire (${paDirection})`, 30, bYpa);
      doc.setTextColor(COLOR_ACCENT);
      doc.text(
        `${results.childSupport.toLocaleString()} € / mois`,
        pageWidth - 30,
        bYpa,
        { align: "right" },
      );
      bYpa += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(COLOR_MUTED);
      doc.text(`Type de garde : ${custodyLabel}`, 30, bYpa);
      bYpa += 5;
      doc.text(`Nombre d'enfants : ${data.childrenCount}`, 30, bYpa);
      if (results.childSupportPerChild > 0) {
        doc.text(
          `${results.childSupportPerChild.toLocaleString()} € / enfant`,
          pageWidth - 30,
          bYpa,
          { align: "right" },
        );
      }

      y += 38;

      // Détails des informations
      y = drawSubTitle("", "Détails des informations relatives aux calculs", y);

      const RSA_SOLO = 645.5;

      y = textMuted(
        `Débiteur : ${isPayer ? "Créancier" : "Débiteur"} (revenu le plus élevé)`,
        30,
        y,
      );
      y = textMuted(
        `Revenu du débiteur : ${payerIncome.toLocaleString()} € / mois`,
        30,
        y,
      );
      y = textMuted(`RSA Socle 2026 (référence) : ${RSA_SOLO} €`, 30, y);
      y += 2;
      y = textMuted(`Type de garde : ${custodyLabel}`, 30, y);
      y = textMuted(`Nombre d'enfants : ${data.childrenCount}`, 30, y);
      if (data.childrenCount > 0 && ages.length > 0) {
        const agesStr = ages
          .slice(0, data.childrenCount)
          .map((a, i) => `E${i + 1}: ${a} ans`)
          .join(", ");
        y = textMuted(`Âges des enfants : ${agesStr}`, 30, y);
      }
      y += 4;

      if (data.childrenCount === 0) {
        y = textMuted(
          "Aucun enfant déclaré — Pension alimentaire non applicable.",
          30,
          y,
        );
      }
    } // end hasPA

    // ══════════════════════════════════════════════════════════
    // LIQUIDATION & SOULTE (détail chiffré) — conditional
    // ══════════════════════════════════════════════════════════
    if (hasLiq) {
      y = newPage();
      y = drawSectionTitle(nextSection(), "Liquidation & Soulte", y);

      const soulteDirection =
        results.liquidationShare > 0 ? "à verser" : "à recevoir";
      const soulteAbs = Math.abs(results.liquidationShare);

      // Summary box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, y, pageWidth - 40, 38, 3, 3, "F");
      let bYliq = y + 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(COLOR_PRIMARY);
      doc.text(`Soulte (${soulteDirection})`, 30, bYliq);
      doc.setTextColor(COLOR_ACCENT);
      doc.text(`${soulteAbs.toLocaleString()} €`, pageWidth - 30, bYliq, {
        align: "right",
      });
      bYliq += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(COLOR_MUTED);
      doc.text(
        `Valeur vénale du/des bien(s) : ${(data.assetsValue || 0).toLocaleString()} €`,
        30,
        bYliq,
      );
      bYliq += 5;
      doc.text(
        `Capital restant dû : ${(data.assetsCRD || 0).toLocaleString()} €`,
        30,
        bYliq,
      );
      bYliq += 5;
      doc.text(
        `Récompense créancier : ${(data.rewardsAlice || 0).toLocaleString()} €`,
        30,
        bYliq,
      );
      doc.text(
        `Récompense débiteur : ${(data.rewardsBob || 0).toLocaleString()} €`,
        pageWidth - 30,
        bYliq,
        { align: "right" },
      );

      y += 46;

      // Détails des informations
      y = drawSubTitle("", "Détails des informations relatives aux calculs", y);

      const regime =
        data.matrimonialRegime === "separation"
          ? "Séparation de biens"
          : "Communauté réduite aux acquêts";
      y = textMuted(`Régime matrimonial : ${regime}`, 30, y);
      y = textMuted(
        `Valeur vénale du/des bien(s) : ${(data.assetsValue || 0).toLocaleString()} €`,
        30,
        y,
      );
      y = textMuted(
        `Capital restant dû (CRD) : ${(data.assetsCRD || 0).toLocaleString()} €`,
        30,
        y,
      );
      if (data.matrimonialRegime !== "separation") {
        y = textMuted(
          `Récompense créancier : ${(data.rewardsAlice || 0).toLocaleString()} €`,
          30,
          y,
        );
        y = textMuted(
          `Récompense débiteur : ${(data.rewardsBob || 0).toLocaleString()} €`,
          30,
          y,
        );
      }
    } // end hasLiq

    // ══════════════════════════════════════════════════════════
    // RESTE À VIVRE — conditional
    // ══════════════════════════════════════════════════════════
    if (hasRAV) {
      y = newPage();
      y = drawSectionTitle(nextSection(), "Reste à Vivre du Créancier", y);

      // Summary box
      const rvColor = results.belowPovertyThreshold
        ? [200, 100, 0]
        : [20, 184, 166];
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, y, pageWidth - 40, 18, 3, 3, "F");
      const bYrav = y + 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(rvColor[0], rvColor[1], rvColor[2]);
      doc.text(
        `${results.remainingLiveable.toLocaleString()} € / mois`,
        pageWidth / 2,
        bYrav,
        { align: "center" },
      );
      if (results.belowPovertyThreshold) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(
          "Inférieur au seuil de pauvreté 2026 (1 216 € / mois)",
          pageWidth / 2,
          bYrav + 6,
          { align: "center" },
        );
        y += 28;
      } else {
        y += 24;
      }

      // Détails des informations relatives aux calculs
      y = drawSubTitle("", "Détails des informations relatives aux calculs", y);

      y = textBold("Revenus", 30, y, 9);
      y = textMuted(`Revenu net : ${data.myIncome.toLocaleString()} €`, 30, y);
      if (results.budget.paReceived > 0) {
        y = textMuted(
          `Pension alimentaire reçue : ${results.budget.paReceived.toLocaleString()} €`,
          30,
          y,
        );
      }
      y += 3;

      y = textBold("Charges", 30, y, 9);
      if (results.budget.taxes > 0) {
        y = textMuted(
          `Impôts : ${results.budget.taxes.toLocaleString()} €`,
          30,
          y,
        );
      }
      if (results.budget.rent > 0) {
        y = textMuted(
          `Loyer / Crédit immobilier : ${results.budget.rent.toLocaleString()} €`,
          30,
          y,
        );
      }
      if (results.budget.fixedCharges > 0) {
        y = textMuted(
          `Charges fixes : ${results.budget.fixedCharges.toLocaleString()} €`,
          30,
          y,
        );
      }
      if (results.budget.paPaid > 0) {
        y = textMuted(
          `Pension alimentaire versée : ${results.budget.paPaid.toLocaleString()} €`,
          30,
          y,
        );
      }
    } // end hasRAV

    // ══════════════════════════════════════════════════════════
    // GRAPHIQUES — conditional
    // ══════════════════════════════════════════════════════════
    const showRevenueChart = needsNetIncome;
    const showBudgetChart = hasRAV;
    const showPCChart = hasPC && activePCValues.length > 0;

    if (showRevenueChart || showBudgetChart || showPCChart) {
      y = newPage();
      y = drawSectionTitle(nextSection(), "Analyses Graphiques", y);
      let chartLetter = "A";
      const nextChartLetter = () => {
        const letter = chartLetter;
        chartLetter = String.fromCharCode(chartLetter.charCodeAt(0) + 1);
        return letter;
      };

      // A. Disparité Revenus
      if (showRevenueChart) {
        y = drawSubTitle(nextChartLetter(), "Disparité des Revenus", y);

        const totalIncome = data.myIncome + data.spouseIncome;
        const myShare = totalIncome > 0 ? data.myIncome / totalIncome : 0;
        const spouseShare =
          totalIncome > 0 ? data.spouseIncome / totalIncome : 0;
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
          `Créancier (${data.myIncome.toLocaleString()} €)`,
          startX + 6,
          y + 3,
        );
        doc.setFillColor(148, 163, 184);
        doc.rect(startX + 80, y, 4, 4, "F");
        doc.text(
          `Débiteur (${data.spouseIncome.toLocaleString()} €)`,
          startX + 86,
          y + 3,
        );

        y += 18;
      } // end showRevenueChart

      // B. Budget Mensuel Estimé
      if (showBudgetChart) {
        y = drawSubTitle(nextChartLetter(), "Budget Mensuel Post-Divorce", y);

        const budgetItems = [
          {
            label: "Revenus",
            value: results.budget.totalRevenus,
            color: [20, 184, 166],
          },
          {
            label: "Impôts",
            value: results.budget.taxes,
            color: [251, 146, 60],
          },
          {
            label: "Logement",
            value: results.budget.rent,
            color: [239, 68, 68],
          },
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
      } // end showBudgetChart

      // C. Prestation Compensatoire Comparaison
      if (showPCChart) {
        y = checkPageBreak(y, 80);
        y = drawSubTitle(
          nextChartLetter(),
          "Comparaison Prestation Compensatoire",
          y,
        );

        const pcItems: { label: string; value: number; color: number[] }[] = [];
        if (showPilote) {
          pcItems.push(
            {
              label: "Tiers Min",
              value: results.details.pilote.min,
              color: [20, 184, 166],
            },
            {
              label: "Tiers",
              value: results.details.pilote.value,
              color: [13, 148, 136],
            },
            {
              label: "Tiers Max",
              value: results.details.pilote.max,
              color: [15, 118, 110],
            },
          );
        }
        if (showInsee) {
          pcItems.push(
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
          );
        }
        if (showPaBased) {
          pcItems.push(
            {
              label: "PA Min",
              value: results.details.paBased.min,
              color: [245, 158, 11],
            },
            {
              label: "PA",
              value: results.details.paBased.value,
              color: [234, 138, 0],
            },
            {
              label: "PA Max",
              value: results.details.paBased.max,
              color: [217, 119, 6],
            },
          );
        }
        if (showAxelDepondt) {
          pcItems.push(
            {
              label: "Cal. PC Min",
              value: results.details.axelDepondt.min,
              color: [168, 85, 247],
            },
            {
              label: "Cal. PC",
              value: results.details.axelDepondt.value,
              color: [147, 51, 234],
            },
            {
              label: "Cal. PC Max",
              value: results.details.axelDepondt.max,
              color: [126, 34, 206],
            },
          );
        }

        const maxPC = Math.max(...pcItems.map((i) => i.value)) || 1;
        const pcBarH = 50;
        const pcColW = pcItems.length <= 6 ? 22 : 18;
        const pcGap = pcItems.length <= 6 ? 8 : 4;
        const pcTotalW = pcItems.length * pcColW + (pcItems.length - 1) * pcGap;
        let currentX = (pageWidth - pcTotalW) / 2;

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

        // Average line (only if multiple methods)
        if (activePCValues.length > 1) {
          const avgLineY = y + pcBarH - (pcMainValue / maxPC) * pcBarH;
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
            `Moyenne: ${pcMainValue.toLocaleString()} €`,
            pageWidth / 2,
            avgLineY - 3,
            { align: "center" },
          );
        }
      } // end showPCChart
    } // end graphs section

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
