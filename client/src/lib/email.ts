import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter;
let testAccount: nodemailer.TestAccount | null = null;

export function initEmailTransporter() {
  if (transporter) {
    return Promise.resolve(transporter);
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Creating test email account...");
    return nodemailer.createTestAccount().then((account) => {
      testAccount = account;
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });

      console.log("Test email account created:", account.user);
      return transporter;
    });
  }

  const emailHost = process.env.EMAIL_SERVER_HOST;
  const emailPort = process.env.EMAIL_SERVER_PORT;
  const emailUser = process.env.EMAIL_SERVER_USER;
  const emailPass = process.env.EMAIL_SERVER_PASSWORD;

  if (emailHost && emailPort && emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(emailPort),
      secure: emailPort === "465",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  } else {
    console.warn(
      "Email configuration not found in environment variables. Using test account."
    );
    return nodemailer.createTestAccount().then((account) => {
      testAccount = account;
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });

      console.log("Test email account created:", account.user);
      return transporter;
    });
  }

  return Promise.resolve(transporter);
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<{
  success: boolean;
  messageUrl?: string;
  error?: string;
}> {
  try {
    const transport = await initEmailTransporter();

    const from = `Meal Mashup <${
      process.env.EMAIL_FROM || "noreply@meal-mashup.com"
    }>`;

    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);

    if (testAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Preview URL: %s", previewUrl);
      return {
        success: true,
        messageUrl: previewUrl as string,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error sending email",
    };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<{ success: boolean; messageUrl?: string; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e85d04; margin-bottom: 20px;">Сброс пароля на Meal Mashup</h2>
      <p>Вы запросили сброс пароля для вашего аккаунта на Meal Mashup.</p>
      <p>Пожалуйста, нажмите на кнопку ниже, чтобы сбросить пароль:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #e85d04; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Сбросить пароль</a>
      </div>
      <p>Или скопируйте и вставьте следующую ссылку в ваш браузер:</p>
      <p style="word-break: break-all; color: #666;">${resetLink}</p>
      <p>Эта ссылка действительна в течение 24 часов.</p>
      <p>Если вы не запрашивали сброс пароля, пожалуйста, проигнорируйте это письмо.</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>Это автоматическое письмо. Пожалуйста, не отвечайте на него.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Сброс пароля на Meal Mashup",
    html,
  });
}
