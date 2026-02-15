import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-12 mt-auto border-t border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start space-y-3">
            <span className="text-base font-bold text-[var(--text-primary)] tracking-wide">
              DivorceDock
            </span>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              © {currentYear} Tous droits réservés.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-3">
            <Link
              to="/guide"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200 font-medium"
            >
              Guide de préparation
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200 font-medium"
            >
              Confidentialité
            </Link>
            <Link
              to="/terms"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200 font-medium"
            >
              CGU
            </Link>
            <Link
              to="/methodology"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200 font-medium"
            >
              Sources & Méthodologie
            </Link>
            <Link
              to="/glossary"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200 font-medium"
            >
              Lexique Juridique
            </Link>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border-color)] text-center">
          <p className="text-xs text-[var(--text-muted)] opacity-70">
            Conforme à l'AI Act européen - Transparence et responsabilité.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
