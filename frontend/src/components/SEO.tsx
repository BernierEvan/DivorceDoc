import { useEffect } from "react";

const SITE_NAME = "DivorceDoc";
const SITE_URL = "https://bernierevan.github.io/DivorceDoc";
const DEFAULT_DESCRIPTION =
  "Simulez gratuitement votre prestation compensatoire, pension alimentaire et liquidation du régime matrimonial. 100% confidentiel, aucune donnée conservée.";
const DEFAULT_IMAGE = `${SITE_URL}/icon-512.svg`;
const LOCALE = "fr_FR";

export interface SEOProps {
  /** Page title — will be appended with " | DivorceDoc" */
  title: string;
  /** Meta description (max ~155 chars) */
  description?: string;
  /** Canonical path, e.g. "/guide" */
  path?: string;
  /** og:type — default "website" */
  type?: "website" | "article";
  /** Prevent indexing (e.g. dashboard, export pages) */
  noindex?: boolean;
  /** JSON-LD structured data object(s) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Set or create a <meta> tag in <head>
 */
function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(
    `meta[${attr}="${key}"]`,
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Set or create a <link> tag in <head>
 */
function setLink(rel: string, href: string) {
  let el = document.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null;
  if (rel === "canonical") {
    // Only one canonical
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  }
}

const JSON_LD_ID = "seo-jsonld";

/**
 * Lightweight SEO component — sets document title, meta tags,
 * Open Graph, Twitter Cards, canonical URL, and JSON-LD in <head>.
 * Works with React 19. No external dependency.
 */
export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  type = "website",
  noindex = false,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const canonicalUrl = `${SITE_URL}${path}`;

    // Title
    document.title = fullTitle;

    // Basic Meta
    setMeta("name", "description", description);
    setMeta(
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    );

    // Canonical
    setLink("canonical", canonicalUrl);

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", DEFAULT_IMAGE);
    setMeta("property", "og:image:width", "512");
    setMeta("property", "og:image:height", "512");
    setMeta(
      "property",
      "og:image:alt",
      `${SITE_NAME} — Simulateur de divorce en ligne`,
    );
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", LOCALE);

    // Twitter Card
    setMeta("name", "twitter:card", "summary");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", DEFAULT_IMAGE);

    // JSON-LD Structured Data
    let scriptEl = document.getElementById(
      JSON_LD_ID,
    ) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = JSON_LD_ID;
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }
      const payload = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      scriptEl.textContent = JSON.stringify(
        payload.length === 1 ? payload[0] : payload,
      );
    } else if (scriptEl) {
      scriptEl.remove();
    }

    // Cleanup JSON-LD on unmount
    return () => {
      const el = document.getElementById(JSON_LD_ID);
      if (el) el.remove();
    };
  }, [title, description, path, type, noindex, jsonLd]);

  return null;
}

// ==========================================
//  PRE-BUILT JSON-LD SCHEMAS
// ==========================================

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.svg`,
  description: DEFAULT_DESCRIPTION,
  sameAs: [],
};

export const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  description: DEFAULT_DESCRIPTION,
  inLanguage: "fr",
  browserRequirements: "Requires JavaScript. Requires WebAssembly.",
  featureList: [
    "Calcul prestation compensatoire",
    "Calcul pension alimentaire",
    "Liquidation régime matrimonial",
    "Calcul soulte",
    "Simulation reste à vivre",
    "OCR documents (Tesseract.js)",
    "Génération rapport PDF",
    "Traitement 100% local",
  ],
};

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqJsonLd(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function howToJsonLd(
  name: string,
  description: string,
  steps: { name: string; text: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
