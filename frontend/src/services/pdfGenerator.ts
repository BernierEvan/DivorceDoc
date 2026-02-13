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
      doc.setGState(new doc.GState({ opacity: 0.08 }));
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
    doc.text("SIMULATION CERTIFIÉE LOCALE", 20, 21);

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
      `${results.compensatory.mean} €`,
    );
    drawRow(
      "Pension Alimentaire (Total / mois)",
      `${results.childSupport.total} €`,
    );
    const soulteTxt = results.liquidation
      ? `${results.liquidation.soulteToPay} €`
      : "Non applicable";
    drawRow("Soulte à verser/recevoir", soulteTxt, true);

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
    doc.text(`• Garde: ${data.custodyType}`, leftColX, y);
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
    doc.text(`• Immobilier: ${data.assetsValue || 0} €`, rightColX, col2Y);
    col2Y += 5;
    doc.text(`• Crédit Restant: ${data.assetsCRD || 0} €`, rightColX, col2Y);
    col2Y += 5;

    y = Math.max(y, col2Y) + 10;

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

    // --- 5. DISCLAIMERS ---
    y = pageHeight - 60; // Stick to bottom area
    doc.setDrawColor(252, 165, 165); // Red 300
    doc.setFillColor(254, 242, 242); // Red 50
    doc.roundedRect(20, y, pageWidth - 40, 35, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28); // Red 700
    doc.text("AVERTISSEMENT LÉGAL IMPORTANT", 30, y + 8);

    doc.setFont("helvetica", "normal");
    doc.text(
      "1. Ce document est une estimation mathématique et ne remplace pas un avocat.",
      30,
      y + 16,
    );
    doc.text(
      "2. Seul un Juge aux Affaires Familiales peut fixer les montants définitifs.",
      30,
      y + 21,
    );
    doc.text(
      "3. Les données sont déclaratives et n'ont pas été certifiées.",
      30,
      y + 26,
    );

    // --- 6. FOOTER ---
    const footerY = pageHeight - 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED);
    doc.text("Page 1 / 1", 20, footerY);
    doc.text(
      "Généré par DivorceDoc - Application d'Aide à la Décision",
      pageWidth - 20,
      footerY,
      { align: "right" },
    );

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
