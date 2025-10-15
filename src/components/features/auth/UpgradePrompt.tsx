"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  returnUrl?: string;
}

/**
 * UpgradePrompt Component (T028)
 *
 * Modal that prompts guest participants to create an account
 * to access protected features like:
 * - Viewing wishlists
 * - Viewing Secret Santa assignments
 * - Managing event settings (admin only)
 * - Initiating draws
 * - Sending messages
 *
 * Shows:
 * - Feature name that requires upgrade
 * - Benefits of creating account
 * - Call-to-action button to registration
 * - Link to login if account exists
 */
export function UpgradePrompt({
  isOpen,
  onClose,
  feature = "this feature",
  returnUrl,
}: UpgradePromptProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleCreateAccount = () => {
    const params = new URLSearchParams();
    if (returnUrl) {
      params.append("returnUrl", returnUrl);
    }
    router.push(`/register?${params.toString()}`);
  };

  const handleLogin = () => {
    const params = new URLSearchParams();
    if (returnUrl) {
      params.append("returnUrl", returnUrl);
    }
    router.push(`/login?${params.toString()}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("upgrade.title")}
      size="md"
    >
      <div className="space-y-6">
        {/* Icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30">
            <span className="text-3xl">🎁</span>
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("upgrade.subtitle")}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {t("upgrade.description", { feature })}
          </p>
        </div>

        {/* Benefits List */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
            ✨ {t("upgrade.benefits.title")}
          </h4>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>✓ {t("upgrade.benefits.viewWishlists")}</li>
            <li>✓ {t("upgrade.benefits.viewAssignment")}</li>
            <li>✓ {t("upgrade.benefits.sendMessages")}</li>
            <li>✓ {t("upgrade.benefits.createEvents")}</li>
            <li>✓ {t("upgrade.benefits.manageSettings")}</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleCreateAccount}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          >
            ✨ {t("upgrade.buttons.createAccount")}
          </Button>
          <Button onClick={handleLogin} variant="secondary" className="w-full">
            {t("upgrade.buttons.login")}
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          {t("upgrade.info")}
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-medium py-2 transition-colors"
        >
          {t("upgrade.skipForNow")}
        </button>
      </div>
    </Modal>
  );
}
