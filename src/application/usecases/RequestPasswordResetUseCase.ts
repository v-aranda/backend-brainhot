import { UserRepository } from '../../domain/repositories/UserRepository';
import { PasswordResetTokenRepository } from '../../domain/repositories/PasswordResetTokenRepository';
import { EmailService } from '../services/EmailService';
import { TokenHasher, HashedToken } from '../services/TokenHasher';
import { PasswordResetToken } from '../../domain/entities/PasswordResetToken';

interface RequestResetDTO {
  email: string;
}



const TOKEN_EXPIRATION_MINUTES = 20;
// 🌟 Leitura da URL do Frontend a partir do ambiente
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

export class RequestPasswordResetUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: PasswordResetTokenRepository,
    private tokenHasher: TokenHasher,
    private emailService: EmailService
  ) {}

  async execute(data: RequestResetDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);

    // Regra de Segurança: Não informe se o usuário existe. Apenas prossiga.
    if (!user) {
      console.log(`[SECURITY] Attempted password reset for non-existent email: ${data.email}`);
      return;
    }

    const tokenData: HashedToken = this.tokenHasher.generateToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000);

    const resetToken = PasswordResetToken.create({
      tokenHash: tokenData.tokenHash,
      userId: user.id,
      expiresAt: expiresAt,
    });
    await this.tokenRepository.save(resetToken);

    const resetLink = `${FRONTEND_URL}/reset-password?userId=${user.id}&token=${tokenData.token}`;

    // 🌟 CORPO DO E-MAIL EM HTML (Modelo limpo e sem espaços estranhos)
    const emailBodyHtml = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #007bff; border-bottom: 2px solid #eee; padding-bottom: 10px;">Redefinição de Senha Solicitada</h2>
  <p>Olá <strong>${user.name}</strong>,</p>
  <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
  <p>Para prosseguir com a redefinição, clique no botão abaixo:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="${resetLink}" 
      style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;"
    >
      Redefinir Senha
    </a>
  </p>
  <p>Este link é válido por **${TOKEN_EXPIRATION_MINUTES} minutos**.</p>
  <p>Se você não solicitou esta redefinição, por favor, ignore este email.</p>
  <p style="font-size: 0.8em; color: #777; margin-top: 40px;">Você também pode usar o link direto: <br/> <a href="${resetLink}">${resetLink}</a></p>
</div>
`;

    await this.emailService.sendMail({
      to: user.email,
      subject: 'Redefinição de Senha',
      html: emailBodyHtml
//       body: `Olá ${user.name}, use o link: ${resetLink} para redefinir sua senha.`, // Texto simples como fallback
    });
  }
}
