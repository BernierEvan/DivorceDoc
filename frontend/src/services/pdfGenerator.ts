import { jsPDF } from "jspdf";
import type { SimulationResult, FinancialData } from "./legalEngine";

// Design Standards
const COLOR_PRIMARY = "#0F172A"; // Slate 900
const COLOR_ACCENT = "#14B8A6"; // Teal 500
const COLOR_MUTED = "#64748B"; // Slate 500
const COLOR_BG_LIGHT = "#F8FAFC"; // Slate 50

export const pdfGenerator = {
  generateReport: (data: FinancialData, results: SimulationResult): void => {
    // 1. Initialize
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 15;

    // Helper: Draw Watermark Pattern (45 degrees, 8-10% opacity)
    const drawWatermark = () => {
      doc.saveGraphicsState();
      // Set very low opacity for watermark (8%)
      // @ts-expect-error - jsPDF GState for opacity
      doc.setGState(new doc.GState({ opacity: 0.15 }));
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(COLOR_PRIMARY);

      // Create diagonal pattern across page
      const text = "DOCUMENT NON OFFICIEL";
      const spacing = 60;

      for (let row = -pageHeight; row < pageHeight * 2; row += spacing) {
        for (let col = -pageWidth; col < pageWidth * 2; col += spacing * 2) {
          doc.text(text, col, row, { angle: 45 });
        }
      }
      doc.restoreGraphicsState();
    };

    // Apply watermark first (behind all content)
    drawWatermark();

    // Helper: Draw Section Title
    const drawSectionTitle = (num: string, title: string, topY: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(COLOR_PRIMARY);
      doc.text(`${num}. ${title.toUpperCase()}`, 20, topY);
      doc.setDrawColor(COLOR_ACCENT);
      doc.setLineWidth(0.5);
      doc.line(20, topY + 2, pageWidth - 20, topY + 2);
      return topY + 12; // Return new Y
    };

    // --- 1. EN-TÊTE ET IDENTIFICATION ---

    // Header Block
    doc.setFillColor(COLOR_PRIMARY);
    doc.rect(0, 0, pageWidth, 25, "F");

    // Logo Text (Left)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("DivorceDoc", 20, 16);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLOR_ACCENT);
    doc.text("SIMULATION DU DIVORCE", 20, 21);

    // Meta Data (Right)
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

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`ID: ${sessionHash}`, pageWidth - 20, 10, { align: "right" });
    doc.text(dateStr, pageWidth - 20, 15, { align: "right" });
    doc.setTextColor(156, 163, 175); // Gray 400
    doc.text("Aucune donnée conservée sur serveur", pageWidth - 20, 21, {
      align: "right",
    });

    y = 40;

    // --- 2. SYNTHÈSE DES ESTIMATIONS (DASHBOARD) ---
    // Gray Box Background
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.roundedRect(20, y, pageWidth - 40, 45, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(COLOR_PRIMARY);
    doc.text("SYNTHÈSE", 30, y + 10);

    // Table Header
    let rowY = y + 18;

    const drawRow = (label: string, value: string, isLast = false) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(COLOR_MUTED);
      doc.text(label, 30, rowY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLOR_PRIMARY);
      doc.text(value, pageWidth - 30, rowY, { align: "right" });

      if (!isLast) {
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.line(30, rowY + 3, pageWidth - 30, rowY + 3);
        rowY += 10;
      }
    };

    drawRow(
      "Prestation Compensatoire (Moyenne)",
      `${results.compensatoryAllowance.toLocaleString()} €`,
    );
    // Breakdown
    drawRow(
      "  - Méthode Pilote",
      `${results.details?.pilote.value.toLocaleString()} €`,
    );
    drawRow(
      "  - Méthode Insee",
      `${results.details?.insee.value.toLocaleString()} €`,
    );
    const custodyLabel =
      results.custodyTypeUsed === "classic"
        ? "Classique"
        : results.custodyTypeUsed === "alternating"
          ? "Alternée"
          : "Réduite";
    drawRow(
      `Pension Alimentaire (Garde ${custodyLabel})`,
      `${results.childSupport.toLocaleString()} € / mois`,
    );
    if (results.childSupportPerChild > 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      rowY += 4;
      doc.text(
        `    ${results.childSupportPerChild.toLocaleString()} € par enfant — Barème MJ 2026`,
        30,
        rowY,
      );
      rowY += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }
    const soulteTxt = results.liquidationShare
      ? `${Math.abs(results.liquidationShare).toLocaleString()} € ${results.liquidationShare > 0 ? "(à verser)" : "(à recevoir)"}`
      : "Non applicable";
    drawRow("Soulte à verser/recevoir", soulteTxt, true);
    if (data.assetsValue > 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      rowY += 4;
      const pNet = data.assetsValue - (data.assetsCRD || 0);
      doc.text(
        `    Pnet = ${data.assetsValue.toLocaleString()} − ${(data.assetsCRD || 0).toLocaleString()} = ${pNet.toLocaleString()} €`,
        30,
        rowY,
      );
      if ((data.rewardsAlice || 0) > 0 || (data.rewardsBob || 0) > 0) {
        rowY += 4;
        doc.text(
          `    Récompenses : A=${(data.rewardsAlice || 0).toLocaleString()} €, B=${(data.rewardsBob || 0).toLocaleString()} €`,
          30,
          rowY,
        );
      }
      rowY += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }

    y += 55;

    // --- 3. DÉTAIL DES DONNÉES SAISIES (INPUTS) ---
    y = drawSectionTitle("3", "Données Saisies", y);

    const leftColX = 25;
    const rightColX = pageWidth / 2 + 10;

    doc.setFontSize(10);

    // Column 1: Foyer
    doc.setFont("helvetica", "bold");
    doc.text("Situation du Foyer", leftColX, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLOR_MUTED);
    doc.text(`• Durée Mariage: ${data.marriageDuration} ans`, leftColX, y);
    y += 5;
    doc.text(`• Enfants: ${data.childrenCount}`, leftColX, y);
    y += 5;
    doc.text(
      `• Garde: ${data.custodyType === "classic" ? "Classique" : data.custodyType === "alternating" ? "Alternée" : "Réduite"}`,
      leftColX,
      y,
    );
    y += 5;

    // Column 2: Finances (Reset Y for col 2, but we need max Y for next section)
    let col2Y = y - 15 - 6; // Back up
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLOR_PRIMARY);
    doc.text("Revenus & Patrimoine", rightColX, col2Y);
    col2Y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLOR_MUTED);
    doc.text(`• Rev. Client: ${data.myIncome} € (Net)`, rightColX, col2Y);
    col2Y += 5;
    doc.text(
      `• Rev. Conjoint: ${data.spouseIncome} € (Net est.)`,
      rightColX,
      col2Y,
    );
    col2Y += 5;
    doc.text(`• Impôts: ${data.myTaxes || 0} € / mois`, rightColX, col2Y);
    col2Y += 5;
    doc.text(`• Loyer/Crédit: ${data.myRent || 0} € / mois`, rightColX, col2Y);
    col2Y += 5;
    doc.text(
      `• Charges fixes: ${data.myCharges || 0} € / mois`,
      rightColX,
      col2Y,
    );
    col2Y += 5;
    doc.text(`• Immobilier: ${data.assetsValue || 0} €`, rightColX, col2Y);
    col2Y += 5;
    doc.text(`• Crédit Restant: ${data.assetsCRD || 0} €`, rightColX, col2Y);
    col2Y += 5;

    y = Math.max(y, col2Y) + 10;

    // Budget Summary
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLOR_PRIMARY);
    doc.text("Reste à Vivre (Budget)", leftColX, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLOR_MUTED);
    doc.text(
      `+ Revenu net: ${results.budget.totalRevenus.toLocaleString()} €`,
      leftColX,
      y,
    );
    y += 5;
    if (results.budget.taxes > 0) {
      doc.text(
        `− Impôts: ${results.budget.taxes.toLocaleString()} €`,
        leftColX,
        y,
      );
      y += 5;
    }
    if (results.budget.rent > 0) {
      doc.text(
        `− Loyer/Crédit: ${results.budget.rent.toLocaleString()} €`,
        leftColX,
        y,
      );
      y += 5;
    }
    if (results.budget.fixedCharges > 0) {
      doc.text(
        `− Charges fixes: ${results.budget.fixedCharges.toLocaleString()} €`,
        leftColX,
        y,
      );
      y += 5;
    }
    if (results.budget.paPaid > 0) {
      doc.text(
        `− PA versée: ${results.budget.paPaid.toLocaleString()} €`,
        leftColX,
        y,
      );
      y += 5;
    }
    doc.setFont("helvetica", "bold");
    if (results.belowPovertyThreshold) {
      doc.setTextColor(200, 100, 0);
    } else {
      doc.setTextColor(COLOR_PRIMARY);
    }
    doc.text(
      `= Reste à Vivre: ${results.remainingLiveable.toLocaleString()} € / mois`,
      leftColX,
      y,
    );
    if (results.belowPovertyThreshold) {
      y += 5;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(200, 100, 0);
      doc.text(
        "⚠ Inférieur au seuil de pauvreté 2026 (1 216 €/mois)",
        leftColX,
        y,
      );
      doc.setFontSize(10);
    }
    y += 10;

    // --- 4. JUSTIFICATION DES CALCULS ---
    y = drawSectionTitle("4", "Methodologie & Calculs", y);

    // A. PC
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLOR_PRIMARY);
    doc.text("A. Prestation Compensatoire (Methode mixte)", 25, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLOR_MUTED);
    doc.setFontSize(9);

    const delta = Math.abs((data.spouseIncome - data.myIncome) * 12);
    doc.text("Ecart de revenus annuel (Delta R): " + delta + " EUR", 25, y);
    y += 5;
    doc.text("Duree (D): " + data.marriageDuration + " ans", 25, y);
    y += 5;
    doc.text("Formule simplifiee: (Delta R / 2) x (D / 12) x Coeff_Age", 25, y);
    y += 8;

    // B. PA
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLOR_PRIMARY);
    doc.setFontSize(10);
    doc.text("B. Pension Alimentaire", 25, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLOR_MUTED);
    doc.setFontSize(9);
    doc.text(`Base: Revenu Débiteur - RSA Socle (635 €)`, 25, y);
    y += 5;
    doc.text(`Barème Ministère 2026: Table ${data.custodyType}`, 25, y);
    y += 10;

    // --- 5. ANALYSES GRAPHIQUES ---
    doc.addPage();
    drawWatermark();
    y = 20;

    y = drawSectionTitle("5", "Analyses Graphiques", y);

    // A. Disparité Revenus (Barre Empilée)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLOR_PRIMARY);
    doc.setFontSize(10);
    doc.text("A. Disparité des Revenus", 25, y);
    y += 8;

    const totalIncome = data.myIncome + data.spouseIncome;
    const myShare = totalIncome > 0 ? data.myIncome / totalIncome : 0;
    const spouseShare = totalIncome > 0 ? data.spouseIncome / totalIncome : 0;

    const barWidth = 140;
    const barHeight = 12;
    const startX = 35;

    // Draw My Share (Cyan)
    doc.setFillColor(20, 184, 166); // Teal 500
    doc.rect(startX, y, barWidth * myShare, barHeight, "F");

    // Draw Spouse Share (Slate)
    doc.setFillColor(148, 163, 184); // Slate 400
    doc.rect(
      startX + barWidth * myShare,
      y,
      barWidth * spouseShare,
      barHeight,
      "F",
    );

    // Labels inside bars
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    if (myShare > 0.1) {
      doc.text(
        `${Math.round(myShare * 100)}%`,
        startX + (barWidth * myShare) / 2,
        y + 8,
        { align: "center" },
      );
    }
    if (spouseShare > 0.1) {
      doc.text(
        `${Math.round(spouseShare * 100)}%`,
        startX + barWidth * myShare + (barWidth * spouseShare) / 2,
        y + 8,
        { align: "center" },
      );
    }

    // Legend below
    y += barHeight + 6;
    doc.setFontSize(8);
    // My Legend
    doc.setFillColor(20, 184, 166);
    doc.rect(startX, y, 4, 4, "F");
    doc.setTextColor(COLOR_MUTED);
    doc.text("Mes Revenus", startX + 6, y + 3);
    // Spouse Legend
    doc.setFillColor(148, 163, 184);
    doc.rect(startX + 60, y, 4, 4, "F");
    doc.text("Revenus Conjoint", startX + 66, y + 3);

    y += 15;

    // B. Budget Post-Divorce (Vertical Bars)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLOR_PRIMARY);
    doc.setFontSize(10);
    doc.text("B. Budget Mensuel Estimé", 25, y);
    y += 10;

    const budgetItems = [
      { label: "Revenus", value: data.myIncome, color: [20, 184, 166] }, // Teal
      { label: "Charges", value: data.myCharges, color: [239, 68, 68] }, // Red
      {
        label: "Reste",
        value: results.remainingLiveable,
        color: [99, 102, 241], // Indigo
      },
    ];

    const maxVal = Math.max(...budgetItems.map((i) => i.value)) || 1;
    const chartHeight = 40;
    const colWidth = 30;
    const gap = 15;
    let currentX = 45; // Start chart X

    budgetItems.forEach((item) => {
      const h = (item.value / maxVal) * chartHeight;
      const topY = y + (chartHeight - h);

      // Draw Bar
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(currentX, topY, colWidth, h, "F");

      // Draw Value on Top
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(COLOR_PRIMARY);
      doc.text(`${item.value}€`, currentX + colWidth / 2, topY - 2, {
        align: "center",
      });

      // Draw Label below
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLOR_MUTED);
      doc.text(item.label, currentX + colWidth / 2, y + chartHeight + 5, {
        align: "center",
      });

      currentX += colWidth + gap;
    });

    // --- 6. GLOBAL ELEMENTS (Footer & Disclaimer on ALL Pages) ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // 1. Legal Disclaimer (Bottom)
      const disclaimerY = pageHeight - 60;
      doc.setDrawColor(252, 165, 165); // Red 300
      doc.setFillColor(254, 242, 242); // Red 50
      doc.roundedRect(20, disclaimerY, pageWidth - 40, 35, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(185, 28, 28); // Red 700
      doc.text("AVERTISSEMENT LÉGAL IMPORTANT", 30, disclaimerY + 8);

      doc.setFont("helvetica", "normal");
      doc.text(
        "1. Ce document est une estimation mathématique et ne remplace pas un avocat.",
        30,
        disclaimerY + 16,
      );
      doc.text(
        "2. Seul un Juge aux Affaires Familiales peut fixer les montants définitifs.",
        30,
        disclaimerY + 21,
      );
      doc.text(
        "3. Les données sont déclaratives et n'ont pas été certifiées.",
        30,
        disclaimerY + 26,
      );

      // 2. Footer
      const footerY = pageHeight - 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

      doc.setFontSize(8);
      doc.setTextColor(COLOR_MUTED);
      doc.text(`Page ${i} / ${pageCount}`, 20, footerY);
      doc.text(
        "Généré par DivorceDoc - Application d'Aide à la Décision",
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
