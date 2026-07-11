import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, // ← force IPv4, fixes ENETUNREACH on Render
});

export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"CampusVoice AI" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};