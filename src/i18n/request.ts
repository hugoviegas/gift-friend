import { getRequestConfig } from "next-intl/server";

/**
 * next-intl request configuration
 * This file is required by the next-intl plugin
 * It returns the locale and messages for each request
 */

// Supported locales
type Locale = "en" | "pt-BR";
const supportedLocales: Locale[] = ["en", "pt-BR"];
const defaultLocale: Locale = "pt-BR";

// Message loader that dynamically imports JSON files
async function loadMessages(locale: Locale) {
  try {
    // Import from public/locales directory
    const messages = await import(`../../public/locales/${locale}.json`);
    return messages.default;
  } catch (e) {
    console.warn(`Failed to load messages for locale ${locale}:`, e);
    // Fallback to default locale
    if (locale !== defaultLocale) {
      return loadMessages(defaultLocale);
    }
    return {};
  }
}

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  const validLocale = supportedLocales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  // Load messages for the locale
  const messages = await loadMessages(validLocale);

  return {
    locale: validLocale,
    messages,
  };
});
