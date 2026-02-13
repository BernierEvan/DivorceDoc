import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 mt-auto border-t bg-secondary border-color-border text-primary transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <span className="text-sm font-semibold text-primary">
              DivorceSite
            </span>
            <p className="text-xs text-muted">
              © {currentYear} Tous droits réservés.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <Link
              to="/guide"
              className="text-sm text-muted hover:text-accent transition-colors duration-200"
            >
              Guide de préparation
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-muted hover:text-accent transition-colors duration-200"
            >
              Confidentialité
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted hover:text-accent transition-colors duration-200"
            >
              CGU
            </Link>
            <Link
              to="/methodology"
              className="text-sm text-muted hover:text-accent transition-colors duration-200"
            >
              Sources & Méthodologie
            </Link>
            <Link
              to="/glossary"
              className="text-sm text-muted hover:text-accent transition-colors duration-200"
            >
              Lexique Juridique
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-color-border text-center">
          <p className="text-xs text-muted">
            Conforme à l'AI Act européen - Transparence et responsabilité.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
