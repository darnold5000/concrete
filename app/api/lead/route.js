import { NextResponse } from "next/server";
import { sendCustomerConfirmationSms, sendOwnerSms } from "../../../src/lib/sms";

export const runtime = "nodejs";

const recentRequests = new Map();

const notificationVariables = [
  "RESEND_API_KEY",
  "LEAD_FROM_EMAIL",
  "OWNER_EMAIL",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_FROM_NUMBER",
  "OWNER_PHONE_NUMBER",
  "TWILIO_TRIAL_MODE",
];

function logNotificationConfiguration() {
  for (const name of notificationVariables) {
    console.info(`${name}: ${process.env[name] ? "present" : "missing"}`);
  }
}

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function normalizeUsPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

async function sendEmail(subject, text, replyTo, attachment) {
  console.info("Attempting owner email");
  const { RESEND_API_KEY, OWNER_EMAIL, LEAD_FROM_EMAIL } = process.env;
  const missing = [
    !RESEND_API_KEY && "RESEND_API_KEY",
    !OWNER_EMAIL && "OWNER_EMAIL",
    !LEAD_FROM_EMAIL && "LEAD_FROM_EMAIL",
  ].filter(Boolean);

  if (missing.length) {
    console.error(`Owner email failed: missing configuration (${missing.join(", ")})`);
    throw new Error("Lead email configuration is incomplete");
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: LEAD_FROM_EMAIL,
        to: [OWNER_EMAIL],
        subject,
        text,
        reply_to: replyTo,
        ...(attachment ? { attachments: [attachment] } : {}),
      }),
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`Resend returned ${response.status}: ${detail}`);
    }

    console.info("Owner email sent");
    return "owner-email";
  } catch (error) {
    console.error("Owner email failed:", error instanceof Error ? error.message : error);
    throw error;
  }
}

export async function POST(request) {
  try {
    logNotificationConfiguration();
    const ip = getClientIp(request);
    const now = Date.now();
    if (now - (recentRequests.get(ip) || 0) < 30_000) {
      return NextResponse.json({ error: "Please wait a moment before sending another request." }, { status: 429 });
    }

    const data = await request.formData();
    if (data.get("formCheck")) {
      console.info("Lead submission skipped: honeypot field was populated");
      return NextResponse.json({ ok: true });
    }

    const lead = {
      firstName: clean(data.get("firstName"), 60),
      lastName: clean(data.get("lastName"), 60),
      phone: clean(data.get("phone"), 30),
      email: clean(data.get("email"), 120),
      zip: clean(data.get("zip"), 10),
      service: clean(data.get("service"), 100),
      details: clean(data.get("details"), 1500),
      source: clean(data.get("source"), 40),
      smsConsent: data.get("smsConsent") === "yes",
    };

    if (!lead.firstName || !lead.lastName || !lead.phone || !lead.email || !lead.zip || !lead.service) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const customerPhone = normalizeUsPhone(lead.phone);
    if (!customerPhone || !/^\S+@\S+\.\S+$/.test(lead.email) || !/^\d{5}$/.test(lead.zip)) {
      return NextResponse.json({ error: "Please enter a valid phone number, email, and five-digit ZIP code." }, { status: 400 });
    }

    const photo = data.get("photo");
    const hasPhoto = Boolean(photo && typeof photo.arrayBuffer === "function" && photo.size > 0);
    if (hasPhoto && photo.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Please upload a photo smaller than 4 MB." }, { status: 413 });
    }
    if (hasPhoto && !["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(photo.type)) {
      return NextResponse.json({ error: "Please upload a JPG, PNG, WEBP, or HEIC image." }, { status: 415 });
    }

    const attachment = hasPhoto ? {
      filename: clean(photo.name, 120).replace(/[^a-zA-Z0-9._-]/g, "_") || "project-photo",
      content: Buffer.from(await photo.arrayBuffer()).toString("base64"),
    } : null;

    const ownerMessage = [
      "🔔 New website lead — Stone & Set Concrete",
      `Name: ${lead.firstName} ${lead.lastName}`,
      `Phone: ${lead.phone}`,
      `Email: ${lead.email}`,
      `ZIP: ${lead.zip}`,
      `Project: ${lead.service}`,
      lead.details ? `Details: “${lead.details}”` : null,
      hasPhoto ? "Photo submitted — see email attachment." : null,
      `Customer SMS opt-in: ${lead.smsConsent ? "Yes" : "No"}`,
      `Source: ${lead.source || "website"}`,
    ].filter(Boolean).join("\n");

    const [emailResult, smsResult, customerSmsResult] = await Promise.allSettled([
      sendEmail(`New concrete lead: ${lead.firstName} ${lead.lastName}`, ownerMessage, lead.email, attachment),
      sendOwnerSms({
        businessName: "Stone & Set Concrete",
        customerName: `${lead.firstName} ${lead.lastName}`,
        phone: lead.phone,
        service: lead.service,
        message: lead.details,
      }),
      lead.smsConsent
        ? sendCustomerConfirmationSms({
            businessName: "Stone & Set Concrete",
            firstName: lead.firstName,
            phone: customerPhone,
          })
        : Promise.resolve(false),
    ]);

    if (emailResult.status === "rejected") throw emailResult.reason;

    const delivered = [
      emailResult.status === "fulfilled" && emailResult.value ? emailResult.value : null,
      smsResult.status === "fulfilled" && smsResult.value ? "owner-sms" : null,
      customerSmsResult.status === "fulfilled" && customerSmsResult.value ? "customer-sms" : null,
    ].filter(Boolean);

    recentRequests.set(ip, now);
    return NextResponse.json({ ok: true, delivered: delivered.length ? delivered : ["development"] });
  } catch (error) {
    console.error("Lead submission error:", error.message);
    return NextResponse.json({ error: "We couldn’t send that request. Please try again shortly." }, { status: 500 });
  }
}
