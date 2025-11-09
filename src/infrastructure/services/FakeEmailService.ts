import { EmailService } from '../../application/services/EmailService';

interface MailRecord {
  to: string;
  subject: string;
  body: string;
}

export class FakeEmailService implements EmailService {
  // Array para armazenar os emails que seriam "enviados"
  public sentEmails: MailRecord[] = [];

  async sendMail(data: MailRecord): Promise<void> {
    // Simula o envio de email
    this.sentEmails.push(data);
    console.log(`[FAKE EMAIL SENT] To: ${data.to}, Subject: ${data.subject}`);
  }

  public getLastSentEmail(): MailRecord | undefined {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  public clearSentEmails() {
    this.sentEmails = [];
  }
}

// Exporta uma instância única (singleton) para ser usada em toda a aplicação e nos testes
export const fakeEmailService = new FakeEmailService();