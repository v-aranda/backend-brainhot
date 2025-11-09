import { Request, Response } from 'express';
import { ResetPasswordUseCase } from '../../../application/usecases/ResetPasswordUseCase';

export class ResetPasswordController {
  constructor(private resetPasswordUseCase: ResetPasswordUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const { userId, token, newPassword } = req.body;
    
    // 1. Validação básica de entrada
    if (!userId || !token || !newPassword) {
        return res.status(400).json({ error: 'Campos userId, token e newPassword são obrigatórios.' });
    }
    
    try {
      // 2. Chama o Use Case com os dados validados
      await this.resetPasswordUseCase.execute({ userId, token, newPassword });
      
      // 3. Resposta de Sucesso
      return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
      // 4. Captura erros do Use Case (Token inválido, expirado, etc.)
      const errorMessage = (error instanceof Error) ? error.message : 'Erro desconhecido';
      
      // Retorna 400 (Bad Request) para erros de validação de token
      return res.status(400).json({ error: errorMessage });
    }
  }
}