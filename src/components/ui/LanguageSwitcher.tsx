"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface LanguageSwitcherProps {
  className?: string;
}

type Locale = "en" | "pt-BR";

interface LanguageOption {
  locale: Locale;
  label: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { locale: "pt-BR", label: "Português", flag: "🇧🇷" },
  { locale: "en", label: "English", flag: "🇺🇸" },
];

/**
 * Language switcher component for switching between PT-BR and EN
 * Preserves current page path while changing locale
 */
export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Extract path without locale prefix
  // Current pathname: /pt-BR/page/path or /en/page/path
  // Need to extract: /page/path
  const pathWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(locale.length + 1)
    : pathname;

  const currentLanguage = LANGUAGE_OPTIONS.find((opt) => opt.locale === locale);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center gap-2 px-3 py-2
          rounded-md border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-800
          hover:bg-slate-50 dark:hover:bg-slate-700
          text-sm font-medium text-slate-900 dark:text-white
          transition-colors duration-200
        "
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-base" role="img" aria-hidden>
          {currentLanguage?.flag}
        </span>
        <span className="hidden sm:inline">{currentLanguage?.label}</span>
        <span className="ml-1">
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="
          absolute right-0 mt-2 w-48
          rounded-md shadow-lg
          bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700
          z-50
        "
        >
          <div className="py-1">
            {LANGUAGE_OPTIONS.map((option) => (
              <Link
                key={option.locale}
                href={`/${option.locale}${pathWithoutLocale}`}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3
                  text-sm transition-colors
                  ${
                    locale === option.locale
                      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }
                `}
                role="menuitem"
              >
                <span className="text-lg" role="img" aria-hidden>
                  {option.flag}
                </span>
                <span>{option.label}</span>
                {locale === option.locale && (
                  <span className="ml-auto">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          role="presentation"
        />
      )}
    </div>
  );
}

export default LanguageSwitcher;
