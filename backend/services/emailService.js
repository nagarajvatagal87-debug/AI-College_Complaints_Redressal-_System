import nodemailer from "nodemailer";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
});

export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"CampusVoice AI" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};