const nodemailer = require('nodemailer');

// Create transporter using Gmail App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name for personalization
 */
async function sendPasswordResetEmail(email, resetToken, userName) {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/new-password?token=${resetToken}`;

  const mailOptions = {
    from: `"EducAR" <${process.env.GOOGLE_EMAIL}>`,
    to: email,
    subject: 'Recuperá tu contraseña - EducAR',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #f5f3ee;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #1e3a6e; border-radius: 16px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">EducAR</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 24px 32px 32px; background: #ffffff; border-radius: 0 0 16px 16px;">
                    <p style="color: #1a1a2e; font-size: 16px; margin: 0 0 16px;">Hola ${userName},</p>

                    <p style="color: #555555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                      Recebimos una solicitud para restablecer tu contraseña. Si no solicitaste este cambio, podés ignorarlo.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 8px 0;">
                          <a href="${resetLink}" style="display: inline-block; background: #1e3a6e; color: #ffffff; padding: 14px 32px; border-radius: 32px; text-decoration: none; font-weight: 600; font-size: 15px;">
                            Restablecer contraseña
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #888888; font-size: 12px; margin: 24px 0 0;">
                      Este enlace vence en 1 hora.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 11px; margin: 0;">
                      © ${new Date().getFullYear()} EducAR - Plataforma Educativa
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send password reset email:`, error.message);
    throw new Error('No se pudo enviar el email de recuperación');
  }
}

/**
 * Send test email to verify configuration
 */
async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: `"EducAR Test" <${process.env.GOOGLE_EMAIL}>`,
      to: process.env.GOOGLE_EMAIL,
      subject: 'Test - EducAR Nodemailer',
      text: 'Nodemailer configurado correctamente!',
    });
    console.log(`[EMAIL] Test email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Test failed:`, error.message);
    return false;
  }
}

/**
 * Send welcome email to new users
 * @param {string} email - Recipient email address
 * @param {string} userName - User's first name
 * @param {string} role - User role (student, teacher, parent)
 */
async function sendWelcomeEmail(email, userName, role) {
  const roleLabels = {
    student: 'estudiante',
    teacher: 'profesor',
    parent: 'padre/madre',
  };

  const roleLabel = roleLabels[role] || 'usuario';

  const mailOptions = {
    from: `"EducAR" <${process.env.GOOGLE_EMAIL}>`,
    to: email,
    subject: '¡Bienvenido a EducAR!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #f5f3ee;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #1e3a6e; border-radius: 16px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">EducAR</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 24px 32px 32px; background: #ffffff; border-radius: 0 0 16px 16px;">
                    <p style="color: #1a1a2e; font-size: 16px; margin: 0 0 16px;">Hola ${userName},</p>

                    <p style="color: #555555; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                      ¡Bienvenido a <strong>EducAR</strong>! Nos alegra mucho que te unas a nuestra plataforma educativa.
                    </p>

                    <p style="color: #555555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                      Como <strong>${roleLabel}</strong>, ahora podés acceder a todas las funcionalidades de la plataforma:
                    </p>

                    <!-- Features List -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 8px 0; color: #1e3a6e; font-size: 14px;">
                          ✓ Comunicarte con padres y profesores
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #1e3a6e; font-size: 14px;">
                          ✓ Ver tus calificaciones y exámenes
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #1e3a6e; font-size: 14px;">
                          ✓ Recibir anuncios de tus cursos
                        </td>
                      </tr>
                    </table>

                    <p style="color: #888888; font-size: 12px; margin: 24px 0 0;">
                      Si tenés alguna duda, no dudes en contactarnos.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 11px; margin: 0;">
                      © ${new Date().getFullYear()} EducAR - Plataforma Educativa
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send welcome email:`, error.message);
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendTestEmail,
};