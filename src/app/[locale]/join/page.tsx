"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { JoinForm } from "@/components/features/events/JoinForm";
import { EventDetails } from "@/components/features/events/EventDetails";

/**
 * Join Event Page (Public, No Authentication Required)
 *
 * Path: /{locale}/join
 *
 * User Story 1: Quick Event Join Without Account
 * - Participants can enter event code
 * - Enter name and email
 * - View event details
 * - Join event as guest
 * - Get guest access token
 */
export default function JoinPage() {
  const t = useTranslations();
  const [eventId, setEventId] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);

  const handleEventFound = (id: string) => {
    setEventId(id);
  };

  const handleJoinSuccess = (pId: string, token: string) => {
    setParticipantId(pId);
    setGuestToken(token);
  };

  const handleResetForm = () => {
    setEventId(null);
    setParticipantId(null);
    setGuestToken(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            🎁 {t("join.title")}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t("join.subtitle")}
          </p>
        </div>

        {/* Success State - Joined Event */}
        {participantId && guestToken ? (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardHeader className="border-b-green-200 dark:border-b-green-800">
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                ✅ {t("join.success.title")}
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300">
                {t("join.success.message")}
              </p>

              {/* Show Event Details */}
              <div className="mt-6">
                <EventDetails eventId={eventId!} guestToken={guestToken} />
              </div>

              <button
                onClick={handleResetForm}
                className="mt-6 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
              >
                {t("join.success.joinAnother")}
              </button>
            </CardBody>
          </Card>
        ) : (
          /* Join Form */
          <Card>
            <CardBody>
              <JoinForm
                onEventFound={handleEventFound}
                onJoinSuccess={handleJoinSuccess}
                selectedEventId={eventId}
              />
            </CardBody>
          </Card>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
            ℹ️ {t("join.info.title")}
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>• {t("join.info.noAccount")}</li>
            <li>• {t("join.info.viewDetails")}</li>
            <li>• {t("join.info.upgrade")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
