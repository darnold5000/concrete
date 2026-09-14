# Stone & Set Concrete

An original, conversion-focused residential concrete website built with Next.js and ready for Vercel. It serves as a generic Central Indiana contractor demo with no real business contact information.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The page can be reviewed without provider credentials, but successful form delivery requires the email variables below.

## Lead notifications

The form posts multipart data to `/api/lead`. The owner is notified immediately by email, and an owner SMS is attempted as a best-effort secondary notification. When the customer checks the SMS consent box, the customer also receives a confirmation text. Twilio errors are logged but never cause an otherwise successful form submission to fail. Optional project images are attached to the owner email and limited to 4 MB.

### Twilio

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` — an SMS-capable Twilio number in E.164 format
- `OWNER_PHONE_NUMBER` — the owner destination number in E.164 format
- `TWILIO_TRIAL_MODE` — `true` sends Twilio's `sms_feedback_surveys` owner template and `sms_customer_support` customer template; `false` sends the production messages

### Resend

- `RESEND_API_KEY`
- `OWNER_EMAIL`
- `LEAD_FROM_EMAIL` — must use a domain verified in Resend

Resend remains the primary submission workflow. When Twilio is configured, each successful submission also attempts an owner SMS through `src/lib/sms.ts`. No `NEXT_PUBLIC_*` variables are needed because provider credentials stay server-side.

## Deploy

Push to GitHub, import the repository into Vercel, add the eight environment variables above, and deploy. No database is required.
