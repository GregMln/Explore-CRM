// Brevo integration for sending transactional emails
import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();

export async function sendMagicLinkEmail(toEmail: string, magicLink: string): Promise<boolean> {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@sereniteo.fr';
    const fromName = process.env.BREVO_FROM_NAME || 'CRM Sereniteo';

    if (!apiKey) {
      console.error('BREVO_API_KEY not configured');
      return false;
    }

    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'Votre lien de connexion CRM Sereniteo';
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email: toEmail }];
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e;">Connexion à CRM Sereniteo</h2>
        <p>Bonjour,</p>
        <p>Cliquez sur le bouton ci-dessous pour vous connecter à votre espace CRM :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Se connecter
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Ce lien est valable pendant 15 minutes et ne peut être utilisé qu'une seule fois.</p>
        <p style="color: #666; font-size: 14px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">CRM Sereniteo - Gestion de contacts</p>
      </div>
    `;
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Magic link email sent via Brevo:', result.body);
    return true;
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    return false;
  }
}
