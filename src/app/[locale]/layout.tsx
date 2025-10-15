import type { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import "@/app/globals.css";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Gift Friend - Secret Santa Platform",
  description:
    "Organize your Secret Santa gift exchange with Gift Friend - a fun, easy way to manage anonymous gift assignments.",
  keywords: "Secret Santa, gift exchange, secret, anonymous",
  authors: [{ name: "Gift Friend Team" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://gift-friend.vercel.app",
    siteName: "Gift Friend",
    title: "Gift Friend - Secret Santa Platform",
    description: "Organize your Secret Santa gift exchange with Gift Friend",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gift Friend - Secret Santa Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gift Friend - Secret Santa Platform",
    description: "Organize your Secret Santa gift exchange with Gift Friend",
    images: ["/og-image.png"],
  },
};

// Supported locales
const SUPPORTED_LOCALES = ["en", "pt-BR"];

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  // Get messages for current locale
  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Gift Friend" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <div className="flex flex-col min-h-screen">
            {/* Header with navigation */}
            <Header />

            {/* Main content */}
            <main className="flex-1 w-full">{children}</main>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-6 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                  {/* About Section */}
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
                      About
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Gift Friend makes organizing Secret Santa exchanges fun
                      and easy.
                    </p>
                  </div>

                  {/* Links Section */}
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
                      Links
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a
                          href={`/${locale}`}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                          Home
                        </a>
                      </li>
                      <li>
                        <a
                          href={`/${locale}/join`}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                          Join Event
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* Info Section */}
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
                      Support
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Need help? Contact us at support@giftfriend.com
                    </p>
                  </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                  <p>&copy; 2025 Gift Friend. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// Generate static params for all supported locales
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
  }));
}
