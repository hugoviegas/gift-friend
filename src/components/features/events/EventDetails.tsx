"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UpgradePrompt } from "@/components/features/auth/UpgradePrompt";

interface EventDetailsProps {
  eventId: string;
  guestToken?: string;
  isGuest?: boolean;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  participantCount: number;
  adminName?: string;
  status: string;
}

/**
 * EventDetails Component (T027)
 *
 * Displays public event information
 * Shows:
 * - Event name, date, time, location
 * - Budget range and currency
 * - Participant count
 * - Admin name
 *
 * Features:
 * - View participants list
 * - View wishlists (requires account)
 * - View assignment (requires account)
 */
export function EventDetails({
  eventId,
  guestToken,
  isGuest = true,
}: EventDetailsProps) {
  const t = useTranslations();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(guestToken ? { Authorization: `Bearer ${guestToken}` } : {}),
        },
      });

      if (!eventResponse.ok) {
        throw new Error(t("eventDetails.errors.eventNotFound"));
      }

      const eventResult = await eventResponse.json();
      setEvent(eventResult.data);

      // Fetch participants
      const participantsResponse = await fetch(
        `/api/events/${eventId}/participants`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(guestToken ? { Authorization: `Bearer ${guestToken}` } : {}),
          },
        }
      );

      if (participantsResponse.ok) {
        const participantsResult = await participantsResponse.json();
        setParticipants(participantsResult.data?.participants || []);
      }
    } catch (err: any) {
      setError(err.message || t("eventDetails.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            {t("eventDetails.loading")}
          </p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardBody className="text-center py-8">
          <p className="text-red-700 dark:text-red-400 font-semibold">
            ⚠️ {error}
          </p>
          <Button
            onClick={fetchEventDetails}
            variant="secondary"
            className="mt-4"
          >
            {t("eventDetails.retry")}
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (!event) {
    return null;
  }

  // Format date
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <Card className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
        <CardBody className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-2">
              🎁 {event.name}
            </h2>
            {event.description && (
              <p className="text-slate-700 dark:text-slate-300">
                {event.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-red-200 dark:border-red-800">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {t("eventDetails.event.date")}
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                📅 {formattedDate}
              </p>
              {event.time && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  ⏰ {event.time}
                </p>
              )}
            </div>

            {event.location && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {t("eventDetails.event.location")}
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  📍 {event.location}
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget */}
        <Card>
          <CardBody className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              💰 {t("eventDetails.event.budget")}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {event.budgetMin} - {event.budgetMax} {event.currency}
            </p>
          </CardBody>
        </Card>

        {/* Participants */}
        <Card>
          <CardBody className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              👥 {t("eventDetails.event.participants")}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {event.participantCount}
            </p>
          </CardBody>
        </Card>

        {/* Admin */}
        <Card>
          <CardBody className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              👑 {t("eventDetails.event.admin")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {event.adminName || "Secret"}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Participants List */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              👥 {t("eventDetails.participants.title")}
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {participants.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {p.name}
                      </p>
                      {p.status === "DRAWN" && (
                        <span className="inline-block mt-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                          ✅ {t("eventDetails.participants.drawn")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUpgradePrompt(true)}
                  >
                    🎁 {t("eventDetails.participants.viewWishlist")}
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1" onClick={() => window.location.reload()}>
          🔄 {t("eventDetails.refresh")}
        </Button>
        {isGuest && (
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowUpgradePrompt(true)}
          >
            ⭐ {t("eventDetails.upgrade")}
          </Button>
        )}
      </div>

      {/* Upgrade Prompt Modal */}
      {isGuest && (
        <UpgradePrompt
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          feature={t("eventDetails.upgrade.wishlist")}
        />
      )}
    </div>
  );
}
