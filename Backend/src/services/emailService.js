import nodemailer from "nodemailer";

export const sendEmail = async (to, report) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "🚨 Fraud Detection Alert",
    text: `
Suspicious Transactions Detected

Risk Score: ${report.riskScore}

Reasons:
${report.reasons.join("\n")}

⚠ Please respond within 7 days.

- Fraud Detection System
    `,
  });
};