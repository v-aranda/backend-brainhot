import { Request, Response } from 'express';
import { RequestPasswordResetUseCase } from '../../../application/usecases/RequestPasswordResetUseCase';

interface PasswordRequestDTO {
  email: string;
}

export class PasswordController {
  constructor(
    private requestPasswordResetUseCase: RequestPasswordResetUseCase,
    // Futuramente, aqui virá o ResetPasswordUseCase
  ) {}

  /**
   * @method handlePasswordRequest
   * Recebe um email e inicia o fluxo de redefinição de senha.
   * Não revela se o email existe por segurança.
   */
  async handlePasswordRequest(req: Request, res: Response): Promise<Response> {
    const { email } = req.body as PasswordRequestDTO;

    try {
      // O Use Case lida com a lógica de buscar o usuário,
      // gerar o token e enviar o email.
      await this.requestPasswordResetUseCase.execute({ email });

      // Regra de Segurança: SEMPRE retorne 200 OK, mesmo se o email
      // não existir, para não dar dicas a invasores.
      return res.status(200).json({ 
        message: 'Se o email estiver registrado, o link de redefinição será enviado.' 
      });
    } catch (error) {
      // Qualquer erro inesperado (ex: erro no servidor de email)
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
  // Futuramente, aqui virá o handlePasswordReset (para POST /api/password/reset)
}