"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { z } from "zod";

interface JoinFormProps {
  onEventFound: (eventId: string) => void;
  onJoinSuccess: (participantId: string, guestToken: string) => void;
  selectedEventId?: string | null;
}

/**
 * JoinForm Component (T026)
 *
 * Form for joining an event as a guest participant
 * Flow:
 * 1. User enters event code
 * 2. System fetches event details to validate and display
 * 3. User enters name, email, locale
 * 4. Form submits to /api/events/[eventId]/participants
 * 5. On success, guest token is returned
 * 6. Parent component displays success and event details
 */
export function JoinForm({
  onEventFound,
  onJoinSuccess,
  selectedEventId,
}: JoinFormProps) {
  const t = useTranslations();
  const [step, setStep] = useState<"code" | "details">("code");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);

  // Form state
  const [eventCode, setEventCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [locale, setLocale] = useState<"pt-BR" | "en">("pt-BR");

  // Validation schemas
  const eventCodeSchema = z
    .string()
    .min(6, "Event code must be 6 characters")
    .max(6, "Event code must be 6 characters")
    .toUpperCase();

  const joinFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    locale: z.enum(["pt-BR", "en"]),
  });

  /**
   * Step 1: Find event by code
   */
  const handleFindEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate code format
      const validatedCode = eventCodeSchema.parse(eventCode);

      // Fetch all events to find by code (since we don't have a /events/code endpoint)
      // In production, you'd have a dedicated /api/events/code/[code] route
      const response = await fetch("/api/events", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(t("join.form.errors.eventNotFound"));
      }

      const { data: events } = await response.json();
      const event = events?.find(
        (e: any) => e.code?.toUpperCase() === validatedCode
      );

      if (!event) {
        throw new Error(t("join.form.errors.eventNotFound"));
      }

      // Store event data and move to next step
      setEventData(event);
      onEventFound(event.id || event._id);
      setStep("details");
    } catch (err: any) {
      setError(err.message || t("join.form.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Submit join form
   */
  const handleSubmitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form data
      const validatedData = joinFormSchema.parse({
        name,
        email,
        locale,
      });

      // Submit to join event endpoint
      const eventId = selectedEventId || eventData?.id || eventData?._id;
      if (!eventId) {
        throw new Error("Event ID not found");
      }

      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.errors?.email ||
            error.errors?.server ||
            t("join.form.errors.joinFailed")
        );
      }

      const result = await response.json();
      const { participantId, guestToken } = result.data;

      // Call success callback
      onJoinSuccess(participantId, guestToken);

      // Store guest token in session storage for later use
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`guestToken_${eventId}`, guestToken);
      }
    } catch (err: any) {
      setError(err.message || t("join.form.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle going back to code step
   */
  const handleBackToCode = () => {
    setStep("code");
    setEventData(null);
    setError(null);
  };

  // Step 1: Event Code
  if (step === "code") {
    return (
      <form onSubmit={handleFindEvent} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t("join.form.step1.title")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {t("join.form.step1.subtitle")}
          </p>
        </div>

        <Input
          label={t("join.form.eventCode.label")}
          placeholder="ABC123"
          value={eventCode}
          onChange={(e) => setEventCode(e.target.value.toUpperCase())}
          maxLength={6}
          disabled={loading}
          error={error ? t("join.form.errors.generic") : undefined}
          helperText={t("join.form.eventCode.helper")}
        />

        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          isLoading={loading}
          disabled={!eventCode || eventCode.length !== 6}
          className="w-full"
        >
          {t("join.form.step1.button")}
        </Button>

        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          {t("join.form.step1.info")}
        </p>
      </form>
    );
  }

  // Step 2: Join Details
  return (
    <form onSubmit={handleSubmitJoin} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t("join.form.step2.title")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {t("join.form.step2.subtitle")}
        </p>
        {eventData && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Event: <span className="font-semibold">{eventData.name}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("join.form.name.label")}
          placeholder={t("join.form.name.placeholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label={t("join.form.email.label")}
          type="email"
          placeholder={t("join.form.email.placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
          {t("join.form.locale.label")}
        </label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as "pt-BR" | "en")}
          disabled={loading}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en">English</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleBackToCode}
          disabled={loading}
          className="flex-1"
        >
          {t("join.form.step2.back")}
        </Button>
        <Button
          type="submit"
          isLoading={loading}
          disabled={!name || !email || loading}
          className="flex-1"
        >
          {t("join.form.step2.button")}
        </Button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        {t("join.form.privacy")}
      </p>
    </form>
  );
}
