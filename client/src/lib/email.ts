import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[]; 
  subject: string;
  html: string;
}


const gmailUser = process.env.GMAIL_USER; 
const gmailAppPassword = process.env.GOOGLE_APP_PASSWORD; 

if (!gmailUser || !gmailAppPassword) {
  console.error(
    "Ошибка: GMAIL_USER или GOOGLE_APP_PASSWORD не найдены в переменных окружения."
  );
  
}


let transporter: nodemailer.Transporter | null = null;

if (gmailUser && gmailAppPassword) {
  transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: gmailUser, 
      pass: gmailAppPassword, 
    },
    
  });


  transporter.verify((error) => {
    if (error) {
      console.error("Ошибка конфигурации Nodemailer для Gmail:", error);
    } else {
      console.log("Nodemailer готов к отправке писем через Gmail");
    }
  });
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  if (!transporter) {
    console.error(
      "Nodemailer транспортер не инициализирован. Проверьте учетные данные Gmail."
    );
    return {
      success: false,
      error: "Email сервис не сконфигурирован.",
    };
  }

  
  const fromAddressWithName = `Meal Mashup <${gmailUser}>`;

  try {
    const info = await transporter.sendMail({
      from: fromAddressWithName, 
      to: to, 
      subject: subject, 
      html: html,
     
    });

    console.log("Письмо успешно отправлено: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Ошибка отправки письма через Nodemailer (Gmail):", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Неизвестная ошибка при отправке письма",
    };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Сброс пароля - Meal Mashup</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 0; text-align: center;">
            <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ff6b6b, #ee5a24); border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🍽️ Meal Mashup</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #2c3e50; font-size: 24px; text-align: center;">Сброс пароля</h2>
                  
                  <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                    Привет! Вы запросили сброс пароля для вашего аккаунта на Meal Mashup.
                  </p>
                  
                  <p style="margin: 0 0 30px; color: #555; font-size: 16px; line-height: 1.6;">
                    Нажмите на кнопку ниже, чтобы создать новый пароль:
                  </p>
                  
                  <!-- Button -->
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      Сбросить пароль
                    </a>
                  </div>
                  
                  <p style="margin: 30px 0 20px; color: #777; font-size: 14px; line-height: 1.6;">
                    Или скопируйте и вставьте эту ссылку в браузер:
                  </p>
                  
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 14px; color: #555; border-left: 4px solid #ee5a24;">
                    ${resetLink}
                  </div>
                  
                  <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
                    <p style="margin: 0 0 10px; color: #777; font-size: 14px;">
                      ⏰ <strong>Эта ссылка действительна 24 часа</strong>
                    </p>
                    <p style="margin: 0; color: #777; font-size: 14px;">
                      🔒 Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 12px 12px; border-top: 1px solid #eee;">
                  <p style="margin: 0; color: #999; font-size: 12px;">
                    Это автоматическое письмо от Meal Mashup. Пожалуйста, не отвечайте на него.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "🔐 Сброс пароля - Meal Mashup",
    html,
  });
}
