declare const process: { env: Record<string, string | undefined> };

export type OwnerLeadSms = {
  businessName: string;
  customerName: string;
  phone: string;
  service: string;
  message: string;
};

export type CustomerConfirmationSms = {
  businessName: string;
  firstName: string;
  phone: string;
};

const TRIAL_FEEDBACK_SURVEY_BODY = "sms_feedback_surveys";
const TRIAL_CUSTOMER_SUPPORT_BODY = "sms_customer_support";

function isTrialMode(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function formatLeadMessage(lead: OwnerLeadSms) {
  const message = lead.message.replace(/\s+/g, " ").trim().slice(0, 240) || "Not provided";

  return [
    `New lead — ${lead.businessName}`,
    `Name: ${lead.customerName}`,
    `Phone: ${lead.phone}`,
    `Service: ${lead.service}`,
    `Message: ${message}`,
    "Check email for full details.",
  ].join("\n");
}

export async function sendOwnerSms(lead: OwnerLeadSms): Promise<boolean> {
  try {
    console.info("Attempting owner SMS");
    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_FROM_NUMBER,
      OWNER_PHONE_NUMBER,
      TWILIO_TRIAL_MODE,
    } = process.env;

    const missing = [
      !TWILIO_ACCOUNT_SID && "TWILIO_ACCOUNT_SID",
      !TWILIO_AUTH_TOKEN && "TWILIO_AUTH_TOKEN",
      !TWILIO_FROM_NUMBER && "TWILIO_FROM_NUMBER",
      !OWNER_PHONE_NUMBER && "OWNER_PHONE_NUMBER",
      !TWILIO_TRIAL_MODE && "TWILIO_TRIAL_MODE",
    ].filter(Boolean);

    if (missing.length) {
      console.error(`Owner SMS not sent: missing configuration (${missing.join(", ")})`);
      return false;
    }

    const body = isTrialMode(TWILIO_TRIAL_MODE) ? TRIAL_FEEDBACK_SURVEY_BODY : formatLeadMessage(lead);
    const authorization = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: OWNER_PHONE_NUMBER,
        From: TWILIO_FROM_NUMBER,
        Body: body,
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`Twilio returned ${response.status}: ${detail}`);
    }

    console.info("Owner SMS sent");
    return true;
  } catch (error) {
    console.error("Owner SMS failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

export async function sendCustomerConfirmationSms(lead: CustomerConfirmationSms): Promise<boolean> {
  try {
    console.info("Attempting customer SMS");
    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_FROM_NUMBER,
      TWILIO_TRIAL_MODE,
    } = process.env;

    const missing = [
      !TWILIO_ACCOUNT_SID && "TWILIO_ACCOUNT_SID",
      !TWILIO_AUTH_TOKEN && "TWILIO_AUTH_TOKEN",
      !TWILIO_FROM_NUMBER && "TWILIO_FROM_NUMBER",
      !TWILIO_TRIAL_MODE && "TWILIO_TRIAL_MODE",
    ].filter(Boolean);

    if (missing.length) {
      console.error(`Customer SMS not sent: missing configuration (${missing.join(", ")})`);
      return false;
    }

    const body = isTrialMode(TWILIO_TRIAL_MODE)
      ? TRIAL_CUSTOMER_SUPPORT_BODY
      : `${lead.businessName}: Thanks, ${lead.firstName}! We received your request. Someone from our team will be in touch shortly. Reply STOP to opt out.`;
    const authorization = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: lead.phone,
        From: TWILIO_FROM_NUMBER,
        Body: body,
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`Twilio returned ${response.status}: ${detail}`);
    }

    console.info("Customer SMS sent");
    return true;
  } catch (error) {
    console.error("Customer SMS failed:", error instanceof Error ? error.message : error);
    return false;
  }
}
