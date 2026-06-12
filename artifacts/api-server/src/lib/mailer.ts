import { logger } from "./logger";

/**
 * Transactional email delivery via Resend's REST API.
 *
 * Uses a plain API key (RESEND_API_KEY) rather than a Replit connector so the
 * same code path works in local dev AND on the Vercel serverless deployment
 * (Replit's connector proxy is not available in production on Vercel).
 *
 * Required env:
 *   RESEND_API_KEY   — Resend API key (server-side only)
 * Optional env:
 *   RESET_EMAIL_FROM — verified "From" address, e.g.
 *                      "Africa of Hope <no-reply@yourdomain.org>".
 *                      Falls back to Resend's shared onboarding sender.
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Africa of Hope <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env["RESEND_API_KEY"]);
}

export async function sendResetCodeEmail(to: string, name: string, code: string): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) throw new Error("Email is not configured (RESEND_API_KEY missing).");
  if (!to) throw new Error("No email address is on file for this account.");

  const from = process.env["RESET_EMAIL_FROM"]?.trim() || DEFAULT_FROM;
  const greeting = name ? `Hello ${name},` : "Hello,";
  const subject = "Your Africa of Hope password reset code";

  const text =
    `${greeting}\n\n` +
    `Your password reset code is: ${code}\n\n` +
    `This code expires in 10 minutes. If you did not request a password reset, ` +
    `you can safely ignore this email.\n\n` +
    `— Africa of Hope Inc, School of Professional Studies`;

  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#0f0f0f">` +
    `<div style="background:#0d3d1a;padding:20px 24px;border-radius:12px 12px 0 0">` +
    `<h1 style="color:#d4a017;margin:0;font-size:18px">Africa of Hope Inc</h1>` +
    `<p style="color:#ffffff;opacity:.8;margin:4px 0 0;font-size:12px">School of Professional Studies</p>` +
    `</div>` +
    `<div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px">` +
    `<p style="margin:0 0 12px">${greeting}</p>` +
    `<p style="margin:0 0 12px">Use the code below to reset your password:</p>` +
    `<p style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0d3d1a;margin:16px 0;text-align:center">${code}</p>` +
    `<p style="margin:0 0 12px;color:#6b7280;font-size:13px">This code expires in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>` +
    `<p style="margin:16px 0 0;color:#9ca3af;font-size:12px">— Africa of Hope Inc, School of Professional Studies</p>` +
    `</div></div>`;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error({ status: res.status, body }, "Reset code email send failed");
    throw new Error("Could not send the reset email.");
  }
}
