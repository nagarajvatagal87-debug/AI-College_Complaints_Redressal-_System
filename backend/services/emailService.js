import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, "../assets/logo.png");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
  tls: {
    rejectUnauthorized: false
  }
});

// Optional helper — wraps simple plain-text/plain-HTML content with a branded
// header (logo) and footer. Use this ONLY for plain messages that don't already
// have their own template (e.g. the staff welcome email). Do NOT use this for
// templates that already build their own full HTML design (like complaint
// notification emails) — wrapping those again causes a double header.
export const wrapWithBranding = (bodyContent) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background:#f4f4f8;">
    <div style="background: linear-gradient(135deg,#312e81,#4338ca); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="cid:campusvoice-logo" alt="CampusVoice AI" width="72" height="72"
        style="border-radius: 16px; display: inline-block;" />
      <div style="color:#ffffff; font-size: 18px; font-weight: bold; margin-top: 10px;">
        CampusVoice AI
      </div>
      <div style="color:#c7d2fe; font-size: 12px; margin-top: 2px;">
        Smart Complaint Redressal System
      </div>
    </div>

    <div style="background:#ffffff; padding: 28px 24px; color:#1e1b3a; font-size: 14px; line-height: 1.6; white-space: pre-line;">
      ${bodyContent}
    </div>

    <div style="background:#312e81; padding: 14px; text-align:center; border-radius: 0 0 12px 12px;">
      <span style="color:#c7d2fe; font-size: 11px;">
        © ${new Date().getFullYear()} CampusVoice AI — This is an automated message, please do not reply.
      </span>
    </div>
  </div>
`;

// sendEmail no longer force-wraps content — it sends whatever HTML you pass in
// as-is, and always attaches the logo so any template (yours or wrapWithBranding's)
// can reference it via cid:campusvoice-logo.
export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"College Complaints Redressal System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: "logo.png",
        path: LOGO_PATH,
        cid: "campusvoice-logo", // reference this in any template as <img src="cid:campusvoice-logo">
      },
    ],
  });
};