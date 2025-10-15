import nodemailer from "nodemailer";

/**
 * Email service configuration using Nodemailer
 * Supports both production SMTP and development testing
 */

// Type definitions for email options
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string;
    path?: string;
    contentType?: string;
  }>;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Get email configuration from environment variables
 */
export function getEmailConfig(): EmailConfig {
  const env = process.env.NODE_ENV || "development";

  if (env === "production") {
    // Production: Use SMTP configuration
    return {
      host: process.env.SMTP_HOST || "",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true" || false,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    };
  }

  // Development: Use test account (Ethereal)
  // In development, you can use the email testing service
  return {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER || "test@example.com",
      pass: process.env.ETHEREAL_PASSWORD || "testpass",
    },
  };
}

/**
 * Create and return a Nodemailer transporter
 */
let transporter: nodemailer.Transporter | null = null;

export function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  const config = getEmailConfig();

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass,
    },
  });

  return transporter;
}

/**
 * Send an email
 * @param options Email options (to, subject, html, etc.)
 * @returns Promise with message ID if successful
 */
export async function sendEmail(options: EmailOptions): Promise<string> {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || "noreply@giftfriend.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("[Email Sent]", {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
      timestamp: new Date().toISOString(),
    });

    return info.messageId;
  } catch (error) {
    console.error("[Email Error]", {
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

/**
 * Verify transporter connection (useful for debugging)
 * @returns Promise<boolean> - true if connection successful
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log("[Email Config] Connection verified successfully");
    return true;
  } catch (error) {
    console.error("[Email Config] Connection failed:", error);
    return false;
  }
}

/**
 * Get default email sender
 */
export function getDefaultSender(): string {
  return process.env.SMTP_FROM || "noreply@giftfriend.com";
}

/**
 * Format recipient name and email
 */
export function formatRecipient(name: string, email: string): string {
  return `"${name}" <${email}>`;
}

export default {
  getEmailConfig,
  getTransporter,
  sendEmail,
  verifyEmailConnection,
  getDefaultSender,
  formatRecipient,
};
