export type ErrorCode =
  | "ENV_01"
  | "ENV_02"
  | "ENV_03"
  | "OCR_01"
  | "OCR_02"
  | "OCR_03"
  | "OCR_04"
  | "CALC_01"
  | "CALC_02"
  | "CALC_03"
  | "ADS_01"
  | "PDF_01";

export interface AppError {
  code: ErrorCode;
  message: string;
  severity: "critical" | "corrective" | "info";
  action?: string;
}

export const ERROR_CATALOG: Record<ErrorCode, AppError> = {
  // ENV
  ENV_01: {
    code: "ENV_01",
    message: "Votre navigateur n'est pas compatible.",
    severity: "critical",
    action: "Mettre à jour Chrome/Safari",
  },
  ENV_02: {
    code: "ENV_02",
    message: "Accès à la caméra refusé.",
    severity: "critical",
    action: "Vérifier réglages confidentialité",
  },
  ENV_03: {
    code: "ENV_03",
    message: "Mémoire saturée.",
    severity: "corrective",
    action: "Fermer d'autres applications",
  },

  // OCR
  OCR_01: {
    code: "OCR_01",
    message: "Document trop flou.",
    severity: "corrective",
    action: "Stabiliser et reprendre",
  },
  OCR_02: {
    code: "OCR_02",
    message: "Type de document non reconnu.",
    severity: "corrective",
    action: "Confirmer manuellement",
  },
  OCR_03: {
    code: "OCR_03",
    message: "Luminosité insuffisante.",
    severity: "corrective",
    action: "Allumer lumière ou flash",
  },
  OCR_04: {
    code: "OCR_04",
    message: "Donnée manquante : Net Social.",
    severity: "info",
    action: "Saisie manuelle requise",
  },

  // CALC
  CALC_01: {
    code: "CALC_01",
    message: "Incohérence des revenus.",
    severity: "corrective",
    action: "Vérifier fiches de paie",
  },
  CALC_02: {
    code: "CALC_02",
    message: "Calcul impossible : dates incohérentes.",
    severity: "corrective",
    action: "Corriger date mariage",
  },
  CALC_03: {
    code: "CALC_03",
    message: "Patrimoine négatif détecté.",
    severity: "info",
    action: "Consulter tooltip",
  },

  // ADS & PDF
  ADS_01: {
    code: "ADS_01",
    message: "Veuillez désactiver votre bloqueur de pub.",
    severity: "corrective",
    action: "Désactiver AdBlock",
  },
  PDF_01: {
    code: "PDF_01",
    message: "Échec de la génération du rapport.",
    severity: "corrective",
    action: "Réessayer ou simplifier",
  },
};

export const errorSystem = {
  get: (code: ErrorCode) => ERROR_CATALOG[code],

  vibrate: () => {
    if (navigator.vibrate) navigator.vibrate(200);
  },

  checkWebAssembly: (): boolean => {
    try {
      if (
        typeof WebAssembly === "object" &&
        typeof WebAssembly.instantiate === "function"
      ) {
        const module = new WebAssembly.Module(
          Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00),
        );
        if (module instanceof WebAssembly.Module)
          return (
            new WebAssembly.Instance(module) instanceof WebAssembly.Instance
          );
      }
    } catch (e) {
      return false;
    }
    return false;
  },
};
