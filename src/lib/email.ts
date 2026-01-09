import * as brevo from '@getbrevo/brevo';

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
    console.warn('⚠️ BREVO_API_KEY n\'est pas défini dans les variables d\'environnement');
}

// Fonction pour obtenir l'instance de l'API
function getApiInstance(): brevo.TransactionalEmailsApi {
    if (!BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY n\'est pas défini');
    }
    
    const apiInstance = new brevo.TransactionalEmailsApi();
    
    // Configurer l'API key
    apiInstance.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        BREVO_API_KEY
    );
    
    return apiInstance;
}

export interface EmailOptions {
    to: string;
    subject: string;
    htmlContent: string;
}

export async function sendEmail({ to, subject, htmlContent }: EmailOptions): Promise<void> {
    if (!BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY n\'est pas défini dans les variables d\'environnement');
    }

    const apiInstance = getApiInstance();
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = {
        name: 'Jeu de Dames',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@jeu-dames.com',
    };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Email envoyé avec succès à ${to}`);
    } catch (error) {
        console.error('❌ Erreur envoi email:', error);
        throw new Error('Erreur lors de l\'envoi de l\'email');
    }
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vérification de votre email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🎲 Jeu de Dames</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #000; margin-top: 0;">Vérification de votre email</h2>
                <p>Bonjour,</p>
                <p>Merci de vous être inscrit sur Jeu de Dames !</p>
                <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Vérifier mon email
                    </a>
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 30px;">
                    Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                    <a href="${verificationUrl}" style="color: #000; word-break: break-all;">${verificationUrl}</a>
                </p>
                <p style="font-size: 12px; color: #666; margin-top: 20px;">
                    Ce lien expirera dans 24 heures.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="font-size: 12px; color: #666; margin: 0;">
                    Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
                </p>
            </div>
        </body>
        </html>
    `;

    await sendEmail({
        to: email,
        subject: 'Vérifiez votre email - Jeu de Dames',
        htmlContent,
    });
}

