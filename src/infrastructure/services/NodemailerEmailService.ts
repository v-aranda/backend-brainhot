import { EmailService } from '../../application/services/EmailService';
import nodemailer, { Transporter } from 'nodemailer';

interface MailRecord {
  to: string;
  subject: string;
  body: string;
  html?: string;
}



// ⚠️ IMPORTANTE: Crie estas variáveis de ambiente no seu arquivo .env de produção
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com"; 
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;

export class NodemailerEmailService implements EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // Use true para porta 465, false para outras
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  async sendMail(data: MailRecord): Promise<void> {
    try {
      // 1. Defina as opções do email
      const mailOptions = {
        from: EMAIL_FROM,
        to: data.to,
        subject: data.subject,
        text: data.body, // Se você precisar de HTML, use 'html: "<h1>..." '
        html: data.html
      };

      // 2. Envie o email
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EMAIL ENVIADO] Mensagem ID: ${info.messageId} para ${data.to}`);
      
    } catch (error) {
      console.error(`[ERRO DE EMAIL] Falha ao enviar email para ${data.to}:`, error);
      // Aqui você pode decidir se lança o erro (500) ou apenas registra (200, por segurança)
      // Em um ambiente de produção real, você deve lidar com isso com robustez.
    }
  }
}