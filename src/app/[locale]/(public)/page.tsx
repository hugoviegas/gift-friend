"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface HomePageParams {
  locale: string;
}

export default function HomePage() {
  const t = useTranslations("home");
  const params = useParams() as unknown as HomePageParams;
  const locale = params?.locale || "en";
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-red-50 via-white to-green-50 dark:from-red-950 dark:via-slate-900 dark:to-green-950 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 dark:bg-yellow-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 -left-40 w-80 h-80 bg-red-300 dark:bg-red-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-32 w-96 h-96 bg-green-300 dark:bg-green-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Festive Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900 rounded-full text-sm font-medium text-red-700 dark:text-red-200">
              <span className="text-2xl">🎅</span>
              <span>{t("badge")}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-green-600 dark:from-red-400 dark:via-red-300 dark:to-green-400 bg-clip-text text-transparent leading-tight">
                {t("headline")}
              </h1>
              <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed">
                {t("subheadline")}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {t("description")}
              </p>

              {/* Feature list */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <span className="text-2xl">🎁</span>
                  <span>{t("feature1")}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <span className="text-2xl">🎲</span>
                  <span>{t("feature2")}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <span className="text-2xl">💬</span>
                  <span>{t("feature3")}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <span className="text-2xl">🔐</span>
                  <span>{t("feature4")}</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={`/${locale}/join`} className="flex-1">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {t("ctaJoin")}
                    <span className="text-xl group-hover:scale-125 transition-transform">
                      🎉
                    </span>
                  </span>
                  <div className="absolute inset-0 bg-red-700 dark:bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Button>
              </Link>

              <Link href={`/${locale}/register`} className="flex-1">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {t("ctaRegister")}
                    <span className="text-xl group-hover:scale-125 transition-transform">
                      ✨
                    </span>
                  </span>
                </Button>
              </Link>
            </div>

            {/* Login Link */}
            <p className="text-slate-600 dark:text-slate-400">
              {t("hasAccount")}{" "}
              <Link
                href={`/${locale}/login`}
                className="text-red-600 dark:text-red-400 font-semibold hover:underline transition-all"
              >
                {t("loginLink")}
              </Link>
            </p>
          </div>

          {/* Right side - Illustration/Visual */}
          <div className="hidden lg:flex items-center justify-center animate-float">
            <div className="relative w-full h-96">
              {/* Main gift box - animated */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-9xl animate-bounce"
                  style={{ animationDelay: "0s" }}
                >
                  🎁
                </div>
              </div>

              {/* Floating elements */}
              <div
                className="absolute top-12 left-12 text-6xl animate-spin"
                style={{ animationDuration: "20s" }}
              >
                ❄️
              </div>
              <div
                className="absolute top-32 right-16 text-5xl animate-bounce"
                style={{ animationDelay: "0.5s" }}
              >
                ⛄
              </div>
              <div className="absolute bottom-20 left-20 text-6xl animate-pulse">
                🔴
              </div>
              <div
                className="absolute bottom-32 right-12 text-6xl animate-pulse"
                style={{ animationDelay: "1s" }}
              >
                🟢
              </div>
              <div
                className="absolute top-1/2 right-1/4 text-5xl animate-bounce"
                style={{ animationDelay: "1s" }}
              >
                ✨
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t("whyChooseUs")}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t("whyChooseUsDescription")}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Easy to Use */}
          <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-transparent hover:border-red-500 dark:hover:border-red-400 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {t("featureCard1Title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t("featureCard1Desc")}
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
          </div>

          {/* Card 2: Fair Draw */}
          <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-transparent hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2">
            <div className="text-5xl mb-4">🎲</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {t("featureCard2Title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t("featureCard2Desc")}
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
          </div>

          {/* Card 3: Anonymous */}
          <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-transparent hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2">
            <div className="text-5xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {t("featureCard3Title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t("featureCard3Desc")}
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
          </div>

          {/* Card 4: Global */}
          <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {t("featureCard4Title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t("featureCard4Desc")}
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative z-10 bg-gradient-to-r from-red-600 to-green-600 dark:from-red-800 dark:to-green-800 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            {t("howItWorks")}
          </h2>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center transform transition-transform hover:scale-105">
              <div className="bg-white dark:bg-slate-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-red-600 dark:text-red-400 shadow-lg">
                1️⃣
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("step1Title")}
              </h3>
              <p className="text-red-100">{t("step1Desc")}</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-4xl">→</span>
            </div>

            {/* Step 2 */}
            <div className="text-center transform transition-transform hover:scale-105">
              <div className="bg-white dark:bg-slate-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-green-600 dark:text-green-400 shadow-lg">
                2️⃣
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("step2Title")}
              </h3>
              <p className="text-red-100">{t("step2Desc")}</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-4xl">→</span>
            </div>

            {/* Step 3 */}
            <div className="text-center transform transition-transform hover:scale-105">
              <div className="bg-white dark:bg-slate-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-yellow-500 dark:text-yellow-400 shadow-lg">
                3️⃣
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("step3Title")}
              </h3>
              <p className="text-red-100">{t("step3Desc")}</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-4xl">→</span>
            </div>

            {/* Step 4 */}
            <div className="text-center transform transition-transform hover:scale-105">
              <div className="bg-white dark:bg-slate-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-red-600 dark:text-red-400 shadow-lg">
                🎉
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("step4Title")}
              </h3>
              <p className="text-red-100">{t("step4Desc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
        <div className="space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            {t("readyToStart")}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t("readyToStartDesc")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href={`/${locale}/join`}>
              <Button variant="primary" size="lg" className="px-8">
                {t("ctaJoinNow")} 🎁
              </Button>
            </Link>
            <Link href={`/${locale}/register`}>
              <Button variant="secondary" size="lg" className="px-8">
                {t("ctaCreateEvent")} ✨
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
