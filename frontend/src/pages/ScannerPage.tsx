import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  RefreshCw,
  X,
  Check,
  Layers,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Focus,
  ChevronLeft,
  Home,
} from "lucide-react";
import {
  imageProcessor,
  extractPdfText,
  extractPdfKeyValues,
} from "../services/imageProcessor";
import { ocrWorker } from "../services/ocrWorker";
import { errorSystem, type ErrorCode } from "../services/errorSystem";
import { SEO } from "../components/SEO";

interface ScanSessionItem {
  id: string;
  text: string;
  keywords: {
    income?: number;
    netSocial?: number;
    charges?: number;
    date?: string;
  };
  category?: "bulletin" | "charges" | "revenus-conjoint";
  personKey?: string;
  fileName?: string;
  confidence: number;
  previewUrl?: string | null;
  timestamp: number;
}

const ScannerPage: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isWarping, setIsWarping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Session State
  const [pageCount, setPageCount] = useState(0);
  const [sessionItems, setSessionItems] = useState<ScanSessionItem[]>([]);
  const [category, setCategory] = useState<
    "bulletin" | "charges" | "revenus-conjoint"
  >("bulletin");

  // Error State
  const [errorMsg, setErrorMsg] = useState<{
    message: string;
    action?: string;
  } | null>(null);

  // Camera Controls State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [supportsZoom, setSupportsZoom] = useState(false);
  const [supportsFocus, setSupportsFocus] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [supportsTorch, setSupportsTorch] = useState(false);
  const pinchStartDist = useRef(0);
  const pinchStartZoom = useRef(1);
  const viewfinderRef = useRef<HTMLDivElement>(null);

  // ─── Camera capability detection ───
  const getVideoTrack = useCallback((): MediaStreamTrack | null => {
    const video = webcamRef.current?.video;
    if (!video?.srcObject) return null;
    const stream = video.srcObject as MediaStream;
    return stream.getVideoTracks()[0] || null;
  }, []);

  const detectCapabilities = useCallback(() => {
    const track = getVideoTrack();
    if (!track) return;
    const caps = track.getCapabilities?.() as any;
    if (!caps) return;

    // Zoom
    if (caps.zoom) {
      setMinZoom(caps.zoom.min ?? 1);
      setMaxZoom(caps.zoom.max ?? 1);
      setSupportsZoom((caps.zoom.max ?? 1) > 1);
      setZoomLevel(caps.zoom.min ?? 1);
    }

    // Focus
    if (caps.focusMode && (caps.focusMode as string[]).includes("manual")) {
      setSupportsFocus(true);
    }

    // Torch
    if (caps.torch) {
      setSupportsTorch(true);
    }
  }, [getVideoTrack]);

  // ─── Apply zoom ───
  const applyZoom = useCallback(
    (level: number) => {
      const track = getVideoTrack();
      if (!track) return;
      const clamped = Math.min(Math.max(level, minZoom), maxZoom);
      setZoomLevel(clamped);
      track.applyConstraints({ advanced: [{ zoom: clamped } as any] });
    },
    [getVideoTrack, minZoom, maxZoom],
  );

  const handleZoomIn = () => applyZoom(zoomLevel + 0.5);
  const handleZoomOut = () => applyZoom(zoomLevel - 0.5);

  // ─── Tap to focus ───
  const handleTapToFocus = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const track = getVideoTrack();
      if (!track || !supportsFocus) return;

      const rect = viewfinderRef.current?.getBoundingClientRect();
      if (!rect) return;

      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Normalize to 0–1
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      setFocusPoint({ x: clientX - rect.left, y: clientY - rect.top });
      setTimeout(() => setFocusPoint(null), 1200);

      try {
        track.applyConstraints({
          advanced: [
            {
              focusMode: "manual",
              pointsOfInterest: [{ x, y }],
            } as any,
          ],
        });
        // Re-enable continuous autofocus after a delay
        setTimeout(() => {
          try {
            track.applyConstraints({
              advanced: [{ focusMode: "continuous" } as any],
            });
          } catch {
            /* ignore */
          }
        }, 2500);
      } catch {
        /* Browser doesn't support pointsOfInterest */
      }
    },
    [getVideoTrack, supportsFocus],
  );

  // ─── Pinch to zoom (touch gestures) ───
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist.current = Math.hypot(dx, dy);
        pinchStartZoom.current = zoomLevel;
      }
    },
    [zoomLevel],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && supportsZoom) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scale = dist / (pinchStartDist.current || 1);
        applyZoom(pinchStartZoom.current * scale);
      }
    },
    [supportsZoom, applyZoom],
  );

  // ─── Toggle torch ───
  const toggleTorch = useCallback(() => {
    const track = getVideoTrack();
    if (!track) return;
    const newVal = !torchOn;
    setTorchOn(newVal);
    track.applyConstraints({ advanced: [{ torch: newVal } as any] });
  }, [getVideoTrack, torchOn]);

  useEffect(() => {
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Reset Session on mount (New Scan)
    localStorage.removeItem("scanSession");
    localStorage.setItem("scanSession", "[]");
    setSessionItems([]);
  }, []);

  // Detect camera capabilities once video starts playing
  useEffect(() => {
    const video = webcamRef.current?.video;
    if (!video) return;
    const onPlaying = () => detectCapabilities();
    video.addEventListener("playing", onPlaying);
    // Also try immediately in case it's already playing
    if (!video.paused) detectCapabilities();
    return () => video.removeEventListener("playing", onPlaying);
  }, [detectCapabilities, isMobile, imageSrc]);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);
    }
  }, [webcamRef]);

  const retake = () => {
    setImageSrc(null);
  };

  const handleError = (code: ErrorCode) => {
    const err = errorSystem.get(code);
    errorSystem.vibrate();
    setErrorMsg({ message: err.message, action: err.action });
    setIsProcessing(false);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  const extractPersonKey = (rawText: string) => {
    const lines = rawText.split("\n");
    const blocked = [
      "BULLETIN",
      "PAIE",
      "NET",
      "SOCIAL",
      "IBAN",
      "BIC",
      "SIRET",
      "URSSAF",
      "EMPLOYEUR",
      "SALARIE",
      "MONTANT",
      "TOTAL",
      "COTIS",
      "CONTRIB",
      "BULLETIN DE PAIE",
    ];
    const candidateRegex = /([A-ZÀ-ÖØ-Ý]{2,}(?:\s+[A-ZÀ-ÖØ-Ý]{2,}){1,3})/;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const upper = trimmed.toUpperCase();
      if (blocked.some((b) => upper.includes(b))) continue;
      const match = upper.match(candidateRegex);
      if (match) return match[1].replace(/\s+/g, " ").trim();
    }
    return undefined;
  };

  const averageIfDuplicate = (
    session: ScanSessionItem[],
    incoming: ScanSessionItem,
  ): ScanSessionItem => {
    if (!incoming.personKey || !incoming.category) return incoming;

    // Feature Request: Do not average charges, sum them instead (handled in Validation)
    if (incoming.category === "charges") return incoming;

    const matches = session.filter(
      (item) =>
        item.personKey === incoming.personKey &&
        item.category === incoming.category,
    );
    if (!matches.length) return incoming;

    const collect = (key: keyof ScanSessionItem["keywords"]) => {
      const values = [
        ...matches
          .map((m) => m.keywords[key])
          .filter((v): v is number => typeof v === "number"),
        ...(typeof incoming.keywords[key] === "number"
          ? [incoming.keywords[key] as number]
          : []),
      ].filter((v) => (key === "netSocial" ? v >= 100 : true));

      if (values.length < 2) return undefined;
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      return Math.round(avg * 100) / 100;
    };

    return {
      ...incoming,
      keywords: {
        ...incoming.keywords,
        ...(collect("netSocial") !== undefined
          ? { netSocial: collect("netSocial") }
          : {}),
        ...(collect("income") !== undefined
          ? { income: collect("income") }
          : {}),
        ...(collect("charges") !== undefined
          ? { charges: collect("charges") }
          : {}),
      },
    };
  };

  const addToSession = (
    text: string,
    keywords: ScanSessionItem["keywords"],
    confidence: number,
    fileName?: string,
    previewUrl?: string | null,
  ) => {
    const currentSession: ScanSessionItem[] = JSON.parse(
      localStorage.getItem("scanSession") || "[]",
    );
    const personKey = extractPersonKey(text);
    const item: ScanSessionItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      keywords,
      category,
      personKey,
      fileName,
      confidence,
      previewUrl,
      timestamp: Date.now(),
    };
    const finalItem = averageIfDuplicate(currentSession, item);
    currentSession.push(finalItem);
    localStorage.setItem("scanSession", JSON.stringify(currentSession));
    localStorage.setItem("scannedData", JSON.stringify(finalItem));
    setSessionItems(currentSession);
    setPageCount((prev) => prev + 1);

    // Reset for next scan
    setImageSrc(null);
    setIsProcessing(false);

    // Feedback
    errorSystem.vibrate();
  };

  const finishSession = () => {
    setIsWarping(true);
    setTimeout(() => navigate("/validation"), 1500);
  };

  const removeDocument = (id: string) => {
    const currentSession: ScanSessionItem[] = JSON.parse(
      localStorage.getItem("scanSession") || "[]",
    );
    const updated = currentSession.filter((item) => item.id !== id);
    localStorage.setItem("scanSession", JSON.stringify(updated));
    setSessionItems(updated);
  };

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);

      const processedImage = await imageProcessor.processImage(file, {
        pdfScale: 4.0,
        ocrMode: "auto",
      });

      const pdfText =
        file.type === "application/pdf" ? await extractPdfText(file) : "";
      const pdfKeyValues =
        file.type === "application/pdf"
          ? await extractPdfKeyValues(file)
          : null;
      const extractResult = await ocrWorker.recognize(
        processedImage,
        pdfKeyValues?.text || pdfText,
      );
      const mergedKeywords = {
        ...extractResult.rawKeywords,
        ...(pdfKeyValues?.netSocial
          ? { netSocial: pdfKeyValues.netSocial }
          : {}),
        ...(pdfKeyValues?.income ? { income: pdfKeyValues.income } : {}),
        ...(pdfKeyValues?.charges ? { charges: pdfKeyValues.charges } : {}),
        ...(pdfKeyValues?.date ? { date: pdfKeyValues.date } : {}),
      };
      const text = extractResult.text || "";
      const hasKeywords = Boolean(
        mergedKeywords?.netSocial ||
          mergedKeywords?.income ||
          mergedKeywords?.charges ||
          mergedKeywords?.date,
      );

      if ((!text || text.length < 10) && !hasKeywords) {
        throw "OCR_01";
      }

      addToSession(
        text,
        mergedKeywords,
        extractResult.confidence,
        file.name,
        processedImage,
      );
    } catch (err: any) {
      console.error(err);
      if (typeof err === "string" && err.startsWith("OCR_")) {
        handleError(err as ErrorCode);
      } else {
        handleError("OCR_03");
      }
    }
  };

  const processCapturedImage = async () => {
    if (!imageSrc) return;
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      await processFile(file);
    } catch (err) {
      handleError("OCR_01");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => processFile(file));
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file) => processFile(file));
    }
  };

  // Video constraints — environment camera with ideal high resolution
  // Setting width/height as ideal (not exact) so the browser picks the best
  // native orientation and resolution without mirroring or rotating.
  const videoConstraints: MediaTrackConstraints = {
    facingMode: "environment",
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };

  // Desktop Import Interface
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-(--bg-primary) p-8">
        <SEO
          title="Scanner de Documents"
          description="Scannez vos documents pour la simulation de divorce."
          path="/scanner"
          noindex={true}
        />
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,.pdf"
          multiple
          className="hidden"
        />

        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="btn-ghost px-4 py-2 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn-ghost px-4 py-2 flex items-center gap-2"
              title="Accueil"
            >
              <Home className="w-4 h-4" />
              Accueil
            </button>
            {pageCount > 0 && (
              <button
                onClick={finishSession}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Terminer ({pageCount} document{pageCount > 1 ? "s" : ""})
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
              Importation de Documents
            </h1>
            <p className="text-(--text-secondary)">
              Importez vos documents (images ou PDF) pour analyse OCR
            </p>
          </div>

          {/* Document Category */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-(--text-muted) mb-3">
              Catégorie du document
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCategory("bulletin")}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  category === "bulletin"
                    ? "border-(--accent-primary) bg-(--accent-light) text-(--text-primary)"
                    : "border-(--border-color) bg-(--bg-secondary) text-(--text-secondary)"
                }`}
              >
                Bulletin de salaire
              </button>
              <button
                type="button"
                onClick={() => setCategory("charges")}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  category === "charges"
                    ? "border-(--accent-primary) bg-(--accent-light) text-(--text-primary)"
                    : "border-(--border-color) bg-(--bg-secondary) text-(--text-secondary)"
                }`}
              >
                Charges
              </button>
              <button
                type="button"
                onClick={() => setCategory("revenus-conjoint")}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  category === "revenus-conjoint"
                    ? "border-(--accent-primary) bg-(--accent-light) text-(--text-primary)"
                    : "border-(--border-color) bg-(--bg-secondary) text-(--text-secondary)"
                }`}
              >
                Revenus du conjoint
              </button>
            </div>
          </div>

          {/* Documents for selected category */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-(--text-muted) mb-3">
              Documents importés
            </p>
            <div className="space-y-2">
              {sessionItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-(--bg-secondary) border border-(--border-color) rounded-xl px-4 py-3"
                  >
                    <div className="text-sm text-(--text-primary)">
                      {item.fileName || "Document scanné"}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(item.id)}
                      className="text-(--text-muted) hover:text-(--text-primary)"
                      aria-label="Supprimer le document"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              {sessionItems.filter((item) => item.category === category)
                .length === 0 && (
                <div className="text-sm text-(--text-muted)">
                  Aucun document importé pour cette catégorie.
                </div>
              )}
            </div>
          </div>

          {/* Error Toast */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-(--alert-bg) border border-(--alert-border) text-center">
              <p className="text-(--alert-text) font-semibold">
                {errorMsg.message}
              </p>
              {errorMsg.action && (
                <p className="text-(--alert-text) text-sm opacity-80">
                  {errorMsg.action}
                </p>
              )}
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileUpload}
            className="border-2 border-dashed border-(--border-color) hover:border-(--accent-primary) rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:bg-(--bg-secondary) mb-8"
          >
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <RefreshCw className="w-12 h-12 text-(--accent-primary) animate-spin mb-4" />
                <p className="text-(--text-primary) font-semibold text-lg">
                  Analyse en cours...
                </p>
                <p className="text-(--text-muted) text-sm">
                  Extraction OCR du document {pageCount + 1}
                </p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-(--accent-light) flex items-center justify-center">
                  <Layers className="w-8 h-8 text-(--accent-primary)" />
                </div>
                <p className="text-(--text-primary) font-semibold text-lg mb-2">
                  Glissez-deposez vos fichiers ici
                </p>
                <p className="text-(--text-muted) text-sm mb-4">
                  ou cliquez pour selectionner
                </p>
                <p className="text-(--text-muted) text-xs">
                  Formats acceptes : Images (JPG, PNG) et PDF
                </p>
              </>
            )}
          </div>

          {/* Documents scanned count */}
          {pageCount > 0 && (
            <div className="bg-(--bg-secondary) rounded-xl p-6 border border-(--border-color)">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-(--text-primary) font-semibold">
                      {pageCount} document{pageCount > 1 ? "s" : ""} analyse
                      {pageCount > 1 ? "s" : ""}
                    </p>
                    <p className="text-(--text-muted) text-sm">
                      Pret pour validation
                    </p>
                  </div>
                </div>
                <button
                  onClick={triggerFileUpload}
                  className="btn-ghost px-4 py-2 text-sm"
                >
                  + Ajouter
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate("/validation")}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-4 transition-colors"
            >
              Je préfère saisir mes données manuellement
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Warp Interstitial Overlay
  if (isWarping) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute inset-0 animate-warp-speed">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-32 bg-cyan-400/80 rounded-full blur-[2px]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 30 - 15}deg) scaleY(${Math.random() * 2 + 1})`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center animate-pulse-glow">
          <h2 className="text-3xl font-bold text-white tracking-[0.5em] uppercase">
            Traitement
          </h2>
          <p className="text-(--accent-primary) mt-2 text-sm tracking-widest">
            Chiffrement de {pageCount} document(s)...
          </p>
        </div>
      </div>
    );
  }

  // Mobile View
  return (
    <div className="h-screen bg-black flex flex-col relative overflow-hidden">
      <SEO
        title="Scanner de Documents"
        description="Scannez vos documents pour la simulation de divorce."
        path="/scanner"
        noindex={true}
      />
      {/* Error Toast */}
      {errorMsg && (
        <div className="absolute top-24 left-0 right-0 z-50 flex justify-center animate-bounce-in">
          <div className="bg-red-500/90 backdrop-blur-md px-6 py-3 rounded-full border border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center space-x-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <div>
              <span className="text-white font-bold text-xs uppercase tracking-widest block">
                {errorMsg.message}
              </span>
              {errorMsg.action && (
                <span className="text-white/80 text-[10px] block">
                  {errorMsg.action}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {/* Header */}
      <div
        className="absolute top-0 w-full z-20 p-4 flex justify-between items-center bg-linear-to-b from-black/80 to-transparent"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-white/70 hover:text-white p-2 backdrop-blur-sm bg-white/5 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-(--accent-primary) font-medium tracking-widest text-xs uppercase text-glow">
          {pageCount > 0 ? `${pageCount} page(s) scannee(s)` : "Scanner actif"}
        </span>
        <button
          onClick={() => navigate("/")}
          className="text-white/70 hover:text-white p-2 backdrop-blur-sm bg-white/5 rounded-full flex items-center justify-center"
          title="Accueil"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Main View */}
      <div
        className="flex-1 flex items-center justify-center relative bg-black"
        ref={viewfinderRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onClick={(e) => {
          // Single tap to focus (only when camera is live)
          if (!imageSrc) handleTapToFocus(e);
        }}
      >
        {!imageSrc ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.92}
              videoConstraints={videoConstraints}
              forceScreenshotSourceSize={false}
              mirrored={false}
              className="w-full h-full object-cover"
              style={{
                /* Ensure the video fills its container naturally without
                   browser-induced rotation. object-fit:cover + no explicit
                   width/height on the <video> lets the native orientation
                   from the camera driver be preserved. */
                transform: "none",
              }}
            />

            {/* Focus Indicator */}
            {focusPoint && (
              <div
                className="absolute pointer-events-none z-30"
                style={{
                  left: focusPoint.x - 30,
                  top: focusPoint.y - 30,
                }}
              >
                <div className="w-15 h-15 border-2 border-yellow-400 rounded-lg animate-ping opacity-75" />
                <div className="absolute inset-0 w-15 h-15 border-2 border-yellow-400 rounded-lg" />
              </div>
            )}

            {/* Scanning Grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Magnetic Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] h-[60%] border border-(--accent-primary)/30 relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-(--accent-primary)" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-(--accent-primary)" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-(--accent-primary)" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-(--accent-primary)" />
              </div>
            </div>

            {/* ─── Camera Controls (right side, like native camera) ─── */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3">
              {/* Zoom In */}
              {supportsZoom && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomIn();
                    }}
                    className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 active:scale-90 transition"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>

                  {/* Zoom Level Indicator */}
                  <div className="text-[10px] text-white/70 font-mono bg-black/40 px-2 py-0.5 rounded-full">
                    {zoomLevel.toFixed(1)}×
                  </div>

                  {/* Zoom Out */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomOut();
                    }}
                    className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 active:scale-90 transition"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Torch toggle */}
              {supportsTorch && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTorch();
                  }}
                  className={`w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center active:scale-90 transition ${
                    torchOn
                      ? "bg-yellow-400/30 border-yellow-400/60 text-yellow-400"
                      : "bg-black/50 border-white/20 text-white/80"
                  }`}
                >
                  {/* Simple flash icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </button>
              )}

              {/* Focus indicator */}
              {supportsFocus && (
                <div className="flex flex-col items-center gap-1 mt-1">
                  <Focus className="w-4 h-4 text-white/40" />
                  <span className="text-[8px] text-white/40 uppercase tracking-wider">
                    Tap focus
                  </span>
                </div>
              )}
            </div>

            {/* Zoom slider (bottom, horizontal) */}
            {supportsZoom && maxZoom > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="text-[9px] text-white/50 font-mono">1×</span>
                <input
                  type="range"
                  min={minZoom}
                  max={maxZoom}
                  step={0.1}
                  value={zoomLevel}
                  onChange={(e) => applyZoom(parseFloat(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-32 h-1 accent-cyan-400 appearance-none bg-white/20 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                />
                <span className="text-[9px] text-white/50 font-mono">
                  {maxZoom.toFixed(0)}×
                </span>
              </div>
            )}
          </>
        ) : (
          // Review Capture
          <div className="relative w-full h-full flex items-center justify-center bg-(--bg-primary)">
            <img
              src={imageSrc}
              alt="Capture"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Controls Container */}
      <div
        className="bg-(--bg-secondary)/90 backdrop-blur-xl border-t border-(--border-color) rounded-t-3xl p-6 bottom-sheet z-30 relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2.5rem)",
        }}
      >
        {/* Page Count Indicator */}
        {pageCount > 0 && !imageSrc && (
          <div className="flex justify-center mb-4">
            <button
              onClick={finishSession}
              className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-6 py-2 rounded-full flex items-center space-x-2 animate-pulse"
            >
              <Check className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">
                Terminer le scan ({pageCount})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-center h-full">
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-(--accent-primary) animate-spin mb-2" />
              <p className="text-(--accent-primary) font-bold text-[10px] tracking-widest text-center">
                ANALYSE DE LA PAGE {pageCount + 1}...
              </p>
            </div>
          ) : !imageSrc ? (
            <>
              <div className="flex items-center justify-between w-full px-8">
                <button
                  onClick={triggerFileUpload}
                  className="flex flex-col items-center justify-center text-(--text-muted) hover:text-(--text-primary) transition"
                >
                  <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) border border-(--border-color) flex items-center justify-center mb-1">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider">
                    Importer
                  </span>
                </button>

                <button
                  onClick={capture}
                  className="w-20 h-20 rounded-full border-4 border-(--accent-primary)/30 flex items-center justify-center shadow-[0_0_30px_rgba(13,148,136,0.2)] active:scale-95 transition relative group"
                >
                  <div className="w-12 h-12 rounded-full bg-(--accent-primary) shadow-[0_0_15px_var(--accent-primary)] flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </button>

                <div className="w-10" />
              </div>

              <button
                onClick={() => navigate("/validation")}
                className="absolute bottom-2 text-[10px] text-[var(--text-muted)] underline opacity-70 hover:opacity-100 uppercase tracking-widest"
              >
                Passer la validation manuelle
              </button>
            </>
          ) : (
            <div className="flex space-x-6 w-full justify-center">
              <button
                onClick={retake}
                className="flex-1 btn-ghost py-4 text-xs uppercase tracking-wider"
              >
                Reprendre
              </button>
              <button
                onClick={processCapturedImage}
                className="flex-1 btn-primary py-4 text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
