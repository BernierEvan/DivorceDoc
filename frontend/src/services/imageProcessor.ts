import * as pdfjsLib from "pdfjs-dist";

// Worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = import.meta.env.BASE_URL + "pdf.worker.min.mjs";

interface ProcessOptions {
  maxWidth?: number;
  deskew?: boolean;
  ocrMode?: "auto" | "binarize" | "grayscale";
  pdfScale?: number;
}

export const imageProcessor = {
  /**
   * Main pipeline entry point
   */
  processImage: async (
    file: File,
    options?: ProcessOptions,
  ): Promise<string> => {
    // 1. Ingest (Bitmap or PDF)
    const bitmap = await ingestFile(file, options?.pdfScale || 3.0);

    // 2. Setup Canvas (Offscreen if available for performance)
    const { canvas, ctx } = getCanvas(bitmap.width, bitmap.height);

    // 3. Scaling (Constraint: Max 3500px)
    const MAX_WIDTH = options?.maxWidth || 3500;
    if (canvas.width > MAX_WIDTH) {
      const scale = MAX_WIDTH / canvas.width;
      canvas.width = MAX_WIDTH;
      canvas.height = canvas.height * scale;
    }

    // Draw initial image
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    // 4. Colorimetric Pipeline
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Pass 1: Global Statistics & Grayscale Conversion
    // Formula: Y = 0.2126R + 0.7152G + 0.0722B
    let grayBuffer = new Uint8Array(data.length / 4);
    let histogram = new Array(256).fill(0);
    let totalBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const val = Math.floor(y);

      grayBuffer[i / 4] = val;
      histogram[val]++;
      totalBrightness += val;
    }

    // QA: Brightness Check
    const meanBrightness = totalBrightness / grayBuffer.length;
    if (meanBrightness < 40) {
      throw "OCR_03"; // Too dark
    }

    // Pass 2: Histogram Equalization (Contrast Normalization)
    const cdf = calculateCDF(histogram, grayBuffer.length);
    for (let j = 0; j < grayBuffer.length; j++) {
      grayBuffer[j] = cdf[grayBuffer[j]];
    }

    // Pass 2b: Contrast Boost
    for (let j = 0; j < grayBuffer.length; j++) {
      const boosted = (grayBuffer[j] - 128) * 1.35 + 128;
      grayBuffer[j] = clampByte(boosted);
    }

    // Pass 3: Otsu Binarization (Dynamic Thresholding)
    // Re-calculate histogram of Equalized image for accurate Otsu?
    // Actually, standard pipeline: Grayscale -> Otsu is robust. Equalization helps if lighting is bad.
    // Let's compute Otsu on the *Contrast Stretched* buffer.

    // Refined: We'll just apply Otsu to the equalized buffer.
    // Recalculating histogram for Otsu on equalized data
    const histEq = new Array(256).fill(0);
    for (let p of grayBuffer) histEq[p]++;
    const finalThreshold = calculateOtsuThreshold(histEq, grayBuffer.length);

    const mode = options?.ocrMode || "auto";
    const contrast = calculateStdDev(grayBuffer);
    const shouldBinarize =
      mode === "binarize" || (mode === "auto" && contrast < 45);

    // Apply Threshold or keep grayscale
    for (let i = 0; i < grayBuffer.length; i++) {
      const val = shouldBinarize
        ? grayBuffer[i] > finalThreshold
          ? 255
          : 0
        : grayBuffer[i];
      const idx = i * 4;
      data[idx] = val; // R
      data[idx + 1] = val; // G
      data[idx + 2] = val; // B
      // Alpha unchanged
    }

    // 5. QA: Blur Detection (Laplacian Variance on the Grayscale buffer BEFORE binarization would be better, but we do it here or pass separate buffer)
    // We'll proceed.

    ctx.putImageData(imageData, 0, 0);

    // 6. Output & Cleanup
    const resultUrl = await canvasToUrl(canvas);

    // Explicit Memory Release
    if (canvas instanceof OffscreenCanvas) {
      // Offscreen canvas doesn't need explicit free in JS usually, but we help GC
      canvas.width = 0;
      canvas.height = 0;
    }

    // Clean bitmap
    bitmap.close && bitmap.close();

    return resultUrl;
  },
};

export const extractPdfText = async (file: File): Promise<string> => {
  if (file.type !== "application/pdf") return "";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1);
  const content = await page.getTextContent();
  const text = content.items
    .map((item) => ("str" in item ? item.str : ""))
    .filter(Boolean)
    .join("\n");
  return text;
};

export type PdfKeyValues = {
  text: string;
  netSocial?: number;
  income?: number;
  charges?: number;
  date?: string;
};

export const extractPdfKeyValues = async (
  file: File,
): Promise<PdfKeyValues> => {
  if (file.type !== "application/pdf") return { text: "" };

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1);
  const content = await page.getTextContent();
  const items = content.items as Array<{
    str: string;
    transform: number[];
  }>;

  const lines = groupTextLines(items);
  const text = lines.map((line) => line.text).join("\n");

  const netSocial = findAmountOnLabeledLine(lines, [
    /net\s*social/,
    /montant\s*net\s*social/,
  ]);
  const netAPayer = findAmountOnLabeledLine(lines, [
    /net\s*a\s*payer\s*au\s*salarie/,
    /net\s*a\s*payer\s*au\s*salarie\s*\(en\s*euros\)/,
  ]);
  const charges = findAmountOnLabeledLine(lines, [/total\s*prelev/, /loyer/]);
  const date = extractDateFromLines(lines);

  return {
    text,
    netSocial: netSocial ?? netAPayer ?? undefined,
    income: netAPayer ?? netSocial ?? undefined,
    charges: charges ?? undefined,
    date: date ?? undefined,
  };
};

// --- Helpers ---

// Get Canvas (Offscreen preferably)
function getCanvas(w: number, h: number) {
  if (typeof OffscreenCanvas !== "undefined") {
    const c = new OffscreenCanvas(w, h);
    return {
      canvas: c,
      ctx: c.getContext("2d") as OffscreenCanvasRenderingContext2D,
    };
  }
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { canvas: c, ctx: c.getContext("2d") as CanvasRenderingContext2D };
}

// Ingest File to ImageBitmap
async function ingestFile(file: File, pdfScale = 3.0): Promise<ImageBitmap> {
  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: pdfScale });

    // PDF.js needs a real canvas or OffscreenCanvas to render
    const { canvas, ctx } = getCanvas(viewport.width, viewport.height);
    await page.render({ canvas: null, canvasContext: ctx as any, viewport })
      .promise;
    return createImageBitmap(canvas);
  } else {
    return createImageBitmap(file);
  }
}

// Histogram CDF
function calculateCDF(histogram: number[], totalPixels: number): number[] {
  const cdf = new Array(256).fill(0);
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += histogram[i];
    cdf[i] = Math.floor((sum / totalPixels) * 255);
  }
  return cdf;
}

// Otsu's Method
function calculateOtsuThreshold(histogram: number[], total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVar = 0;
  let threshold = 0;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > maxVar) {
      maxVar = varBetween;
      threshold = t;
    }
  }
  return threshold;
}

// Canvas to Base64/Blob URL
async function canvasToUrl(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): Promise<string> {
  if (canvas instanceof OffscreenCanvas) {
    const blob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.8,
    });
    return URL.createObjectURL(blob);
  } else {
    return canvas.toDataURL("image/jpeg", 0.8);
  }
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function calculateStdDev(buffer: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) sum += buffer[i];
  const mean = sum / buffer.length;
  let variance = 0;
  for (let i = 0; i < buffer.length; i++) {
    const diff = buffer[i] - mean;
    variance += diff * diff;
  }
  return Math.sqrt(variance / buffer.length);
}

type TextLine = {
  y: number;
  items: Array<{ x: number; text: string }>;
  text: string;
};

function groupTextLines(
  items: Array<{ str: string; transform: number[] }>,
): TextLine[] {
  const buckets: Array<{
    y: number;
    items: Array<{ x: number; text: string }>;
  }> = [];

  items.forEach((item) => {
    const x = item.transform[4];
    const y = item.transform[5];
    const text = item.str?.toString() ?? "";
    if (!text.trim()) return;

    const bucket = buckets.find((b) => Math.abs(b.y - y) < 2);
    if (bucket) {
      bucket.items.push({ x, text });
    } else {
      buckets.push({ y, items: [{ x, text }] });
    }
  });

  const lines = buckets
    .map((b) => {
      const itemsSorted = b.items.sort((a, b) => a.x - b.x);
      const lineText = itemsSorted.map((i) => i.text).join(" ");
      return { y: b.y, items: itemsSorted, text: lineText };
    })
    .sort((a, b) => b.y - a.y);

  return lines;
}

function normalizeLine(line: string): string {
  return line.toLowerCase().replace(/€/g, "").replace(/\s+/g, " ").trim();
}

function extractAmountsFromText(text: string): number[] {
  const regex =
    /([0-9OIlS]{1,3}(?:[\s.][0-9OIlS]{3})*(?:[,.][0-9OIlS]{2})?|[0-9OIlS]{4,})/g;
  const matches = [...text.matchAll(regex)].map((m) => m[0]);
  return matches
    .map((raw) => normalizeNumber(raw))
    .filter((val): val is number => val !== null);
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
  if (!hadSeparator && val >= 100000 && val <= 5000000) val = val / 100;
  return val;
}

function pickBestPdfAmount(
  amounts: Array<{ value: number; x: number }>,
): number | null {
  if (!amounts.length) return null;
  const plausible = amounts.filter((a) => a.value >= 800 && a.value <= 20000);
  if (plausible.length) {
    return plausible.sort((a, b) => b.x - a.x || b.value - a.value)[0].value;
  }
  return amounts.sort((a, b) => b.x - a.x || b.value - a.value)[0].value;
}

function findAmountOnLabeledLine(
  lines: TextLine[],
  labels: RegExp[],
): number | null {
  for (let i = 0; i < lines.length; i++) {
    const clean = normalizeLine(lines[i].text);
    if (!labels.some((label) => label.test(clean))) continue;

    const amounts = lines[i].items.flatMap((item) => {
      const values = extractAmountsFromText(item.text);
      return values.map((value) => ({ value, x: item.x }));
    });

    const picked = pickBestPdfAmount(amounts);
    if (picked !== null) return picked;

    if (i + 1 < lines.length) {
      const nextAmounts = lines[i + 1].items.flatMap((item) => {
        const values = extractAmountsFromText(item.text);
        return values.map((value) => ({ value, x: item.x }));
      });
      const nextPicked = pickBestPdfAmount(nextAmounts);
      if (nextPicked !== null) return nextPicked;
    }
  }
  return null;
}

function extractDateFromLines(lines: TextLine[]): string | null {
  const REGEX_DATE = /(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/;
  for (const line of lines) {
    const match = line.text.match(REGEX_DATE);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  }
  return null;
}
