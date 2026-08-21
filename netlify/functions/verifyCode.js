const nodemailer = require("nodemailer");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { inputCode } = JSON.parse(event.body);

    // Reading the exact Netlify environment keys you created
    const CODE = process.env.CODE;
    const OWNER_EMAIL = process.env.OWNER_EMAIL;
    const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

    // Step 1: Check initial code (GGYHTJ)
    if (inputCode) {
      // Fixed: Now uses CODE instead of SECRET_CODE
      if (inputCode.trim().toUpperCase() !== CODE) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: "Invalid code." })
        };
      }

      // Generate random 8-character code
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let verificationCode = "";
      for (let i = 0; i < 8; i++) {
        verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Configure email transport
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          // Fixed: Now uses OWNER_EMAIL and EMAIL_APP_PASSWORD
          user: OWNER_EMAIL,
          pass: EMAIL_APP_PASSWORD
        }
      });

      // Send 8-character verification code to your email
      await transporter.sendMail({
        // Fixed: Now uses OWNER_EMAIL
        from: OWNER_EMAIL,
        to: OWNER_EMAIL,
        subject: "ColoringPixels Premium Access Code",
        text: `A player requested the code:\n\n ${verificationCode}`
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, step: "AWAITING_2FA", codeToMatch: verificationCode })
      };
    }

    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Bad Request" }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
