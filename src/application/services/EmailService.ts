interface SendMailDTO {
  to: string;
  subject: string;
  body?: string;
  html?: string;
}

export interface EmailService {
  sendMail(data: SendMailDTO): Promise<void>;
}