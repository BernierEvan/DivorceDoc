import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ChevronLeft,
  Shield,
  CreditCard,
  Home,
  Users,
  Calculator,
  Landmark,
  Wallet,
  ClipboardList,
} from "lucide-react";
import { SEO, howToJsonLd, breadcrumbJsonLd } from "../components/SEO";

const GuidePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-deep-space)] flex flex-col relative text-white font-sans">
      <SEO
        title="Guide de Préparation — Informations Requises"
        description="Préparez les informations nécessaires pour une simulation de divorce précise : revenus, patrimoine, charges, situation familiale. Guide par méthode de calcul."
        path="/guide"
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Guide de préparation", path: "/guide" },
          ]),
          howToJsonLd(
            "Préparer ses informations pour une simulation de divorce",
            "Guide étape par étape pour rassembler les informations nécessaires à une simulation précise de divorce (prestation compensatoire, pension alimentaire, liquidation).",
            [
              {
                name: "Rassembler les informations de base",
                text: "Date de mariage, date prévisionnelle de divorce, dates de naissance des deux conjoints.",
              },
              {
                name: "Préparer les données de revenus",
                text: "Revenus nets mensuels (pour les méthodes Tiers Pondéré, INSEE et PA Based) et/ou revenus bruts (pour la méthode Calcul PC).",
              },
              {
                name: "Situation familiale",
                text: "Nombre d'enfants, âge de chaque enfant et type de garde (classique, alternée ou réduite).",
              },
              {
                name: "Patrimoine et charges",
                text: "Valeur des biens immobiliers, Capital Restant Dû, montant des charges fixes, loyer, impôts mensuels.",
              },
              {
                name: "Lancer la simulation",
                text: "Saisissez vos informations directement dans le simulateur. Toutes les données restent sur votre appareil.",
              },
            ],
          ),
        ]}
      />
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-plasma-cyan)]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between z-10 sticky top-0 bg-[var(--color-deep-space)]/80 backdrop-blur-md border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center p-2 transition rounded-full bg-white/5 hover:bg-white/10 group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
        <h1 className="text-sm font-bold tracking-widest text-white uppercase text-glow">
          Guide de Préparation
        </h1>
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center p-2 transition rounded-full bg-white/5 hover:bg-white/10 group"
          title="Accueil"
        >
          <Home className="w-5 h-5 text-gray-300 group-hover:text-white" />
        </button>
      </div>

      <div className="flex-1 px-6 py-8 pb-32 space-y-12 overflow-y-auto">
        {/* 1. Introduction */}
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-muted)]">
            Quelles informations préparer ?
          </h2>
          <div className="p-6 border glass-panel rounded-2xl border-white/10">
            <p className="mb-4 text-sm leading-relaxed text-gray-300">
              Notre simulateur fonctionne par <strong>saisie manuelle</strong>.
              Les informations demandées dépendent des méthodes de calcul que
              vous sélectionnerez. En les rassemblant à l'avance, vous gagnerez
              du temps et obtiendrez des résultats plus fiables.
            </p>
            <div className="flex items-start space-x-3 bg-[var(--color-plasma-cyan)]/10 p-4 rounded-xl border border-[var(--color-plasma-cyan)]/20">
              <Shield className="w-5 h-5 text-[var(--color-plasma-cyan)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--color-plasma-cyan)]">
                <span className="block mb-1 font-bold tracking-wider uppercase">
                  100 % confidentiel
                </span>
                Toutes les données sont traitées localement sur votre appareil.
                Rien n'est envoyé sur nos serveurs, rien n'est stocké.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Informations par catégorie */}
        <section className="delay-100 animate-fade-in">
          <h3 className="mb-6 text-sm font-bold tracking-widest text-gray-500 uppercase">
            Informations requises par catégorie
          </h3>

          <div className="grid gap-4">
            {/* Toutes méthodes */}
            <div className="p-5 border glass-panel rounded-2xl border-white/10">
              <div className="flex items-center mb-4 space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <ClipboardList className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="text-lg font-bold">
                  Base commune{" "}
                  <span className="text-xs font-normal text-gray-500">
                    (toutes les méthodes)
                  </span>
                </h4>
              </div>
              <ul className="pl-2 space-y-3 text-sm text-gray-300 border-l-2 border-white/5">
                <li>
                  <strong className="text-white">Date de mariage</strong>
                </li>
                <li>
                  <strong className="text-white">
                    Date prévisionnelle du divorce
                  </strong>
                </li>
                <li>
                  <strong className="text-white">Dates de naissance</strong>{" "}
                  (créancier et débiteur)
                </li>
              </ul>
            </div>

            {/* Revenus nets */}
            <div className="p-5 border glass-panel rounded-2xl border-white/10">
              <div className="flex items-center mb-4 space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                </div>
                <h4 className="text-lg font-bold">
                  Revenus nets mensuels{" "}
                  <span className="text-xs font-normal text-gray-500">
                    (Tiers Pondéré, INSEE, PA Based)
                  </span>
                </h4>
              </div>
              <ul className="pl-2 space-y-3 text-sm text-gray-300 border-l-2 border-white/5">
                <li>
                  <strong className="text-white">
                    Revenu net mensuel du créancier
                  </strong>{" "}
                  (Net Social)
                </li>
                <li>
                  <strong className="text-white">
                    Revenu net mensuel du débiteur
                  </strong>
                </li>
              </ul>
            </div>

            {/* Revenus bruts & projections — Calcul PC */}
            <div className="p-5 border glass-panel rounded-2xl border-white/10">
              <div className="flex items-center mb-4 space-x-3">
                <div className="p-2 rounded-lg bg-teal-500/20">
                  <Calculator className="w-5 h-5 text-teal-400" />
                </div>
                <h4 className="text-lg font-bold">
                  Projections financières{" "}
                  <span className="text-xs font-normal text-gray-500">
                    (Méthode Calcul PC)
                  </span>
                </h4>
              </div>
              <ul className="pl-2 space-y-3 text-sm text-gray-300 border-l-2 border-white/5">
                <li>
                  <strong className="text-white">Revenus bruts</strong>{" "}
                  (mensuels ou annuels) — créancier et débiteur
                </li>
                <li>
                  <strong className="text-white">
                    Contributions enfants mensuelles
                  </strong>
                </li>
                <li>
                  Éventuelle{" "}
                  <strong className="text-white">évolution de revenus</strong>{" "}
                  (montant futur, date de changement)
                </li>
                <li>
                  <strong className="text-white">
                    Patrimoine non productif
                  </strong>{" "}
                  et rendement estimé (%)
                </li>
                <li>
                  <strong className="text-white">
                    Écart retraite du créancier
                  </strong>{" "}
                  (années sans cotisation + revenu pré-interruption)
                </li>
              </ul>
            </div>

            {/* Famille — INSEE / PA Based */}
            <div className="p-5 border glass-panel rounded-2xl border-white/10">
              <div className="flex items-center mb-4 space-x-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <h4 className="text-lg font-bold">
                  Situation familiale{" "}
                  <span className="text-xs font-normal text-gray-500">
                    (INSEE, PA Based, Pension Alimentaire)
                  </span>
                </h4>
              </div>
              <ul className="pl-2 space-y-3 text-sm text-gray-300 border-l-2 border-white/5">
                <li>
                  <strong className="text-white">Nombre d'enfants</strong>
                </li>
                <li>
                  <strong className="text-white">Âge de chaque enfant</strong>{" "}
                  (détermine les unités de consommation OCDE)
                </li>
                <li>
                  <strong className="text-white">Type de garde</strong>{" "}
                  (classique, alternée ou réduite)
                </li>
              </ul>
            </div>

            {/* Liquidation */}
            <div className="p-5 border glass-panel rounded-2xl border-white/10">
              <div className="flex items-center mb-4 space-x-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Landmark className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-lg font-bold">
                  Patrimoine immobilier{" "}
                  <span className="text-xs font-normal text-gray-500">
                    (Liquidation / Soulte)
                  </span>
                </h4>
              </div>
              <ul className="pl-2 space-y-3 text-sm text-gray-300 border-l-2 border-white/5">
                <li>
                  <strong className="text-white">Régime matrimonial</strong>{" "}
                  (communauté ou séparation de biens)
                </li>
                <li>
                  <strong className="text-white">
                    Valeur vénale du bien immobilier
                  </strong>
                </li>
                <li>
                  <strong className="text-white">Capital Restant Dû</strong>{" "}
                  (CRD — crédit immobilier)
                </li>
                <li>
                  <strong className="text-white">Récompenses</strong> (fonds
                  propres ayant financé un bien commun — régime communauté
                  uniquement)
                </li>
              </ul>
            </div>

            {/* Reste à Vivre */}
            <div className="p-5 border glass-panel rounded-2xl border-white/10">
              <div className="flex items-center mb-4 space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Wallet className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className="text-lg font-bold">
                  Budget & Charges{" "}
                  <span className="text-xs font-normal text-gray-500">
                    (Reste à Vivre)
                  </span>
                </h4>
              </div>
              <ul className="pl-2 space-y-3 text-sm text-gray-300 border-l-2 border-white/5">
                <li>
                  <strong className="text-white">Impôts mensuels</strong>
                </li>
                <li>
                  <strong className="text-white">Loyer mensuel</strong>
                </li>
                <li>
                  <strong className="text-white">
                    Charges fixes mensuelles
                  </strong>{" "}
                  (énergie, assurance, télécoms…)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Récapitulatif par preset */}
        <section className="delay-200 animate-fade-in">
          <h3 className="mb-6 text-sm font-bold tracking-widest text-gray-500 uppercase">
            Que préparer selon votre choix ?
          </h3>
          <div className="relative p-6 overflow-hidden border glass-panel rounded-2xl border-white/10">
            <ul className="relative z-10 space-y-5">
              <li className="flex space-x-3">
                <FileText className="w-5 h-5 text-[var(--color-plasma-cyan)] shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <strong className="text-white block mb-0.5">Express</strong>
                  Revenus nets + dates + âges. C'est tout.
                </div>
              </li>
              <li className="flex space-x-3">
                <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <strong className="text-white block mb-0.5">Standard</strong>
                  Revenus nets + dates + âges + enfants (nombre, âge, garde).
                </div>
              </li>
              <li className="flex space-x-3">
                <FileText className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <strong className="text-white block mb-0.5">
                    PC — Précision maximale
                  </strong>
                  Tout ci-dessus + revenus bruts, projections, patrimoine,
                  retraite.
                </div>
              </li>
              <li className="flex space-x-3">
                <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <strong className="text-white block mb-0.5">
                    Analyse complète
                  </strong>
                  Toutes les informations ci-dessus + patrimoine immobilier +
                  charges/loyer/impôts.
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Note */}
        <section className="px-4 pb-8 text-center delay-500 animate-fade-in">
          <p className="max-w-xs mx-auto text-xs leading-relaxed text-gray-500">
            Toutes les informations sont saisies manuellement et traitées
            uniquement sur votre appareil. Aucune donnée n'est envoyée ni
            stockée sur un serveur.
          </p>
        </section>
      </div>
    </div>
  );
};

export default GuidePage;
