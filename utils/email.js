// utils/email.js (dev stub - does not actually send email)
module.exports = async function sendEmail({ to, subject, text, html }) {
  console.log("sendEmail called:", { to, subject, text, html });
  // In production, replace this with nodemailer code.
  return Promise.resolve();
};
