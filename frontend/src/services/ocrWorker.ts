import Tesseract from "tesseract.js";

// Validation Types
export interface ExtractedData {
  text: string;
  rawKeywords: {
    income?: number;
    netSocial?: number; // Priority 2026
    charges?: number;
    date?: string; // ISO format YYYY-MM-DD
    docType?: "payslip" | "bank" | "tax" | "unknown";
    relevanceScore?: number; // 0-1
    relevanceReason?: string;
  };
  confidence: number;
}

export const ocrWorker = {
  recognize: async (
    imagePathOrBuffer: string,
    hintText?: string,
  ): Promise<ExtractedData> => {
    // 1. Initialize Worker (French + English)
    const worker = await Tesseract.createWorker("fra+eng");

    // ── Pass 1: Primary recognition (PSM 6 — uniform text block) ──
    await worker.setParameters({
      preserve_interword_spaces: "1",
      tessedit_pageseg_mode: "6" as Tesseract.PSM,
      user_defined_dpi: "400",
      tessedit_ocr_engine_mode: "1",
      textord_tabfind_find_tables: "1",
      tessedit_char_whitelist:
        "0123456789€.,/:-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ",
    });
    const primaryRet = await worker.recognize(imagePathOrBuffer);

    // ── Pass 2: Numeric-only pass (improves digit accuracy for amounts) ──
    await worker.setParameters({
      preserve_interword_spaces: "1",
      tessedit_pageseg_mode: "6" as Tesseract.PSM,
      user_defined_dpi: "400",
      tessedit_ocr_engine_mode: "1",
      tessedit_char_whitelist: "0123456789,. ",
      tessedit_char_blacklist:
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ€:/-",
      classify_bln_numeric_mode: "1",
      load_system_dawg: "0",
      load_freq_dawg: "0",
      tessedit_enable_dict_correction: "0",
    });
    const numericRet = await worker.recognize(imagePathOrBuffer);

    // ── Pass 3 (conditional): Sparse text for tables if confidence is low ──
    let sparseText = "";
    if (primaryRet.data.confidence < 60) {
      await worker.setParameters({
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: "11" as Tesseract.PSM,
        user_defined_dpi: "400",
        tessedit_ocr_engine_mode: "1",
        textord_tabfind_find_tables: "1",
        tessedit_char_whitelist:
          "0123456789€.,/:-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ",
      });
      const sparseRet = await worker.recognize(imagePathOrBuffer);
      sparseText = sparseRet.data.text || "";
    }

    // 3. Build combined text & confidence
    const confidence = primaryRet.data.confidence;
    const text = sparseText
      ? `${primaryRet.data.text}\n${sparseText}`
      : primaryRet.data.text;

    // 4. Terminate
    await worker.terminate();

    // 5. Run Stage B: Extraction & Structuring
    const mergedText = hintText ? `${text}\n${hintText}` : text;
    const extracted = parseDocument(mergedText, numericRet.data.text || "");

    return {
      text: mergedText,
      rawKeywords: extracted,
      confidence,
    };
  },
};

/**
 * Stage B: Extraction and Cleaning Logic
 */
function parseDocument(text: string, numericText?: string) {
  const lines = text.split("\n");
  const data: {
    income?: number;
    netSocial?: number;
    charges?: number;
    date?: string;
    docType?: "payslip" | "bank" | "tax" | "unknown";
    relevanceScore?: number;
    relevanceReason?: string;
  } = {};

  // Regex Patterns
  const REGEX_MONEY =
    /([0-9OIlS]{1,3}(?:[\s.][0-9OIlS]{3})*(?:[,.][0-9OIlS]{2})?|[0-9OIlS]{4,})/g; // Matches 1 200,00 or 1.200,00 or 1200.00 or 2500 (with OCR noise)
  const REGEX_DATE = /(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/; // DD/MM/YYYY

  const normalizeLine = (line: string) =>
    line.toLowerCase().replace(/€/g, "").replace(/\s+/g, " ").trim();

  const getWindowText = (index: number, window: number) =>
    lines
      .slice(Math.max(0, index - window), index + window + 1)
      .map((l) => normalizeLine(l))
      .join(" ");

  const pickFromWindow = (index: number, window: number) => {
    const windowText = getWindowText(index, window);
    const amounts = extractAmounts(windowText, REGEX_MONEY);
    return amounts.length ? selectBestAmount(amounts) : null;
  };

  const analysis = analyzeRelevance(text);
  data.docType = analysis.docType;
  data.relevanceScore = analysis.score;
  data.relevanceReason = analysis.reasons.join(" | ");

  const labeledCandidates = extractLabeledCandidates(lines, REGEX_MONEY);
  if (labeledCandidates.netSocial) data.netSocial = labeledCandidates.netSocial;
  if (labeledCandidates.income) data.income = labeledCandidates.income;
  if (labeledCandidates.charges) data.charges = labeledCandidates.charges;

  // Payslip-specific labels (often in a single line near the bottom)
  const netSocialInline = extractInlineLabelAmount(lines, [
    /net\s*social/,
    /montant\s*net\s*social/,
  ]);
  if (netSocialInline) data.netSocial = netSocialInline;

  const netSocialLabelAmount = extractAmountNearLabel(lines, REGEX_MONEY, [
    /net\s*social/,
    /montant\s*net\s*social/,
  ]);
  if (netSocialLabelAmount) data.netSocial = netSocialLabelAmount;

  const netAPayerInline = extractInlineLabelAmount(lines, [
    /net\s*a\s*payer\s*au\s*salarie/,
  ]);
  if (netAPayerInline && !data.netSocial) data.netSocial = netAPayerInline;
  if (netAPayerInline && !data.income) data.income = netAPayerInline;

  const netAPayerLabelAmount = extractAmountNearLabel(lines, REGEX_MONEY, [
    /net\s*a\s*payer\s*au\s*salarie/,
    /net\s*a\s*payer\s*au\s*salarie\s*\(en\s*euros\)/,
  ]);
  if (netAPayerLabelAmount && !data.netSocial)
    data.netSocial = netAPayerLabelAmount;
  if (netAPayerLabelAmount && !data.income) data.income = netAPayerLabelAmount;

  lines.forEach((line, index) => {
    const cleanLine = normalizeLine(line);

    // 1. Income Detection (Priority: Net Social > Net à Payer > Salaire Net > Brut)
    if (
      cleanLine.includes("net social") ||
      cleanLine.includes("montant net social") ||
      cleanLine.includes("net a payer") ||
      cleanLine.includes("montant net a payer") ||
      cleanLine.includes("net a payer avant") ||
      cleanLine.includes("montant net a payer avant") ||
      cleanLine.includes("net a payer avant impot") ||
      cleanLine.includes("montant net a payer avant impot") ||
      cleanLine.includes("salaire net") ||
      cleanLine.includes("revenu net") ||
      cleanLine.includes("net imposable") ||
      cleanLine.includes("montant net imposable") ||
      cleanLine.includes("salaire brut") ||
      cleanLine.includes("revenu brut") ||
      cleanLine.includes("brut imposable") ||
      cleanLine.includes("montant brut imposable")
    ) {
      const amounts = extractAmounts(cleanLine, REGEX_MONEY);
      const selected = amounts.length
        ? selectBestAmount(amounts, true)
        : pickFromWindow(index, 1);
      if (selected !== null) {
        if (cleanLine.includes("net social")) data.netSocial = selected;
        else if (!data.netSocial) data.income = selected;
      }
    }

    // 2. Date Detection
    const dateMatch = line.match(REGEX_DATE);
    if (dateMatch && !data.date) {
      // Basic temporal validity check happens in Stage C (Validation Page), here we just extract
      // Format to ISO
      data.date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    }

    // 3. Charges Detection
    if (cleanLine.includes("total preleve") || cleanLine.includes("loyer")) {
      const amounts = extractAmounts(cleanLine, REGEX_MONEY);
      if (amounts.length) data.charges = selectBestAmount(amounts, true);
      else {
        const picked = pickFromWindow(index, 1);
        if (picked !== null) data.charges = picked;
      }
    }
  });

  // Fallback from numeric-only OCR pass
  if (numericText) {
    const fallbackAmounts = extractAmounts(numericText, REGEX_MONEY);
    const candidate = pickFallbackNetSocial(fallbackAmounts);

    if (candidate !== null) {
      if (!data.netSocial || data.netSocial < 800) data.netSocial = candidate;
      if (!data.income) data.income = data.netSocial;
    }
  }

  // Normalization: specific cleanups
  if (data.netSocial && !data.income) data.income = data.netSocial;
  return data;
}

function extractAmounts(line: string, regex: RegExp): number[] {
  const matches = [...line.matchAll(regex)].map((m) => m[0]);
  const values = matches
    .map((raw) => normalizeNumber(raw))
    .filter((val): val is number => val !== null);
  return values;
}

function normalizeNumber(raw: string): number | null {
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/[oO]/g, "0")
    .replace(/[Il]/g, "1")
    .replace(/S/g, "5");

  const hadSeparator = /[.,]/.test(cleaned);

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned;

  if (lastComma !== -1 || lastDot !== -1) {
    const decimalSep = lastComma > lastDot ? "," : ".";
    const parts = cleaned.split(decimalSep);
    const intPart = parts.slice(0, -1).join("").replace(/[.,]/g, "");
    const decPart = parts[parts.length - 1];
    normalized = `${intPart}.${decPart}`;
  } else {
    normalized = cleaned.replace(/[.,]/g, "");
  }

  let val = parseFloat(normalized);
  if (isNaN(val)) return null;

  // Heuristic: OCR may drop decimals (159995 -> 1599.95)
  if (!hadSeparator && val >= 100000 && val <= 5000000) {
    val = val / 100;
  }

  return val;
}

function selectBestAmount(amounts: number[], preferMax = false): number {
  const sorted = [...amounts].sort((a, b) => b - a);
  const plausible = sorted.filter((val) => val >= 300 && val <= 50000);
  if (!plausible.length) return sorted[0];

  const fourDigit = plausible.filter((val) => val >= 1000 && val <= 20000);
  if (fourDigit.length) {
    return preferMax ? fourDigit[0] : fourDigit[fourDigit.length - 1];
  }

  if (preferMax) return plausible[0];
  const mid = plausible.find((val) => val >= 800 && val <= 20000);
  return mid ?? plausible[plausible.length - 1];
}

function pickFallbackNetSocial(amounts: number[]): number | null {
  const candidates = amounts.filter((val) => val >= 800 && val <= 20000);
  if (!candidates.length) return null;
  const sorted = [...candidates].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

type RelevanceAnalysis = {
  docType: "payslip" | "bank" | "tax" | "unknown";
  score: number;
  reasons: string[];
};

function analyzeRelevance(text: string): RelevanceAnalysis {
  const t = text.toLowerCase();
  const scoreHits = (terms: string[]) =>
    terms.reduce((acc, term) => (t.includes(term) ? acc + 1 : acc), 0);

  const payslipTerms = [
    "bulletin de paie",
    "net social",
    "montant net social",
    "MONTANT NET SOCIAL",
    "net a payer au salarie",
    "net a payer au salarie (en euros)",
    "net a payer",
    "net a payer avant",
    "salaire",
    "employeur",
    "urssaf",
    "cotisations",
    "brut",
  ];
  const bankTerms = [
    "releve de compte",
    "solde",
    "iban",
    "bic",
    "debit",
    "credit",
    "banque",
  ];
  const taxTerms = [
    "avis d'imposition",
    "revenu fiscal",
    "impot",
    "direction generale",
    "foyer fiscal",
  ];

  const payslipScore = scoreHits(payslipTerms);
  const bankScore = scoreHits(bankTerms);
  const taxScore = scoreHits(taxTerms);

  const maxScore = Math.max(payslipScore, bankScore, taxScore);
  const docType =
    maxScore === payslipScore && maxScore > 0
      ? "payslip"
      : maxScore === bankScore && maxScore > 0
        ? "bank"
        : maxScore === taxScore && maxScore > 0
          ? "tax"
          : "unknown";

  const score = Math.min(1, maxScore / 4);
  const reasons = [
    `payslip:${payslipScore}`,
    `bank:${bankScore}`,
    `tax:${taxScore}`,
  ];

  return { docType, score, reasons };
}

type CandidateField = "netSocial" | "income" | "charges";

function extractLabeledCandidates(lines: string[], regex: RegExp) {
  const patterns: Record<CandidateField, RegExp[]> = {
    netSocial: [/net\s*social/, /montant\s*net\s*social/],
    income: [
      /net\s*a\s*payer\s*au\s*salarie/,
      /net\s*a\s*payer/,
      /net\s*a\s*payer\s*avant/,
      /salaire\s*net/,
      /revenu\s*net/,
      /net\s*imposable/,
      /brut\s*imposable/,
    ],
    charges: [/total\s*prelev/, /loyer/, /charges/],
  };

  const candidates: Record<CandidateField, number[]> = {
    netSocial: [],
    income: [],
    charges: [],
  };

  const normalizeLine = (line: string) =>
    line.toLowerCase().replace(/€/g, "").replace(/\s+/g, " ").trim();

  const getWindowText = (index: number, window: number) =>
    lines
      .slice(Math.max(0, index - window), index + window + 1)
      .map((l) => normalizeLine(l))
      .join(" ");

  lines.forEach((line, index) => {
    const cleanLine = normalizeLine(line);
    (Object.keys(patterns) as CandidateField[]).forEach((field) => {
      if (patterns[field].some((p) => p.test(cleanLine))) {
        const direct = extractAmounts(cleanLine, regex);
        const window = extractAmounts(getWindowText(index, 1), regex);
        const pool = direct.length ? direct : window;
        candidates[field].push(...pool);
      }
    });
  });

  return {
    netSocial: candidates.netSocial.length
      ? selectBestAmount(candidates.netSocial, true)
      : undefined,
    income: candidates.income.length
      ? selectBestAmount(candidates.income, true)
      : undefined,
    charges: candidates.charges.length
      ? selectBestAmount(candidates.charges, true)
      : undefined,
  };
}

function extractAmountNearLabel(
  lines: string[],
  regex: RegExp,
  labels: RegExp[],
): number | null {
  const normalizeLine = (line: string) =>
    line.toLowerCase().replace(/€/g, "").replace(/\s+/g, " ").trim();
  const normalizeLabelLine = (line: string) =>
    normalizeLine(line)
      .replace(/0/g, "o")
      .replace(/1/g, "l")
      .replace(/5/g, "s");

  for (let i = 0; i < lines.length; i++) {
    const clean = normalizeLine(lines[i]);
    const cleanLabel = normalizeLabelLine(lines[i]);
    if (!labels.some((label) => label.test(clean) || label.test(cleanLabel)))
      continue;

    // Try same line after label
    const labelMatch = labels
      .map((label) => clean.match(label) || cleanLabel.match(label))
      .find(Boolean);
    if (labelMatch && typeof labelMatch.index === "number") {
      const afterLabel = clean.slice(labelMatch.index + labelMatch[0].length);
      const amountsAfter = extractAmounts(afterLabel, regex);
      const pickedAfter = pickPlausibleSalary(amountsAfter);
      if (pickedAfter !== null) return pickedAfter;
    }

    // Same line fallback
    const amountsSame = extractAmounts(clean, regex);
    const pickedSame = pickPlausibleSalary(amountsSame);
    if (pickedSame !== null) return pickedSame;

    // Scan next 3 lines (tables often put amount below)
    for (let j = 1; j <= 3; j++) {
      if (i + j >= lines.length) break;
      const next = normalizeLine(lines[i + j]);
      const amountsNext = extractAmounts(next, regex);
      const pickedNext = pickPlausibleSalary(amountsNext);
      if (pickedNext !== null) return pickedNext;
    }

    // Try previous line if OCR split label/amount
    if (i > 0) {
      const prev = normalizeLine(lines[i - 1]);
      const amountsPrev = extractAmounts(prev, regex);
      const pickedPrev = pickPlausibleSalary(amountsPrev);
      if (pickedPrev !== null) return pickedPrev;
    }
  }

  return null;
}

function pickPlausibleSalary(amounts: number[]): number | null {
  if (!amounts.length) return null;
  const candidates = amounts
    .filter((val) => val >= 300 && val <= 50000)
    .map((value) => ({
      value,
      hasDecimal: Math.abs(value % 1) > 0,
    }));
  if (!candidates.length) return null;

  const scored = candidates.map((c) => {
    let score = 0;
    if (c.hasDecimal) score += 3;
    if (c.value >= 1000 && c.value <= 3000) score += 4;
    else if (c.value >= 800 && c.value <= 20000) score += 2;
    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score || b.value - a.value);
  return scored[0].value;
}

function extractInlineLabelAmount(
  lines: string[],
  labels: RegExp[],
): number | null {
  const normalizeLine = (line: string) =>
    line.toLowerCase().replace(/€/g, "").replace(/\s+/g, " ").trim();

  const labelRegex = labels.length
    ? new RegExp(labels.map((l) => l.source).join("|"), "i")
    : null;
  if (!labelRegex) return null;

  for (const line of lines) {
    const clean = normalizeLine(line);
    if (!labelRegex.test(clean)) continue;
    const match = clean.match(/([0-9oils\s.,]{3,})$/i);
    if (!match) continue;
    const values = extractAmounts(
      match[1],
      /([0-9OIlS]{1,3}(?:[\s.][0-9OIlS]{3})*(?:[,.][0-9OIlS]{2})?|[0-9OIlS]{4,})/g,
    );
    const picked = pickPlausibleSalary(values);
    if (picked !== null) return picked;
  }
  return null;
}


