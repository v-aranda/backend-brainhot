import { Request, Response } from "express";
import { AuthenticateUserUseCase } from "../../../application/usecases/AuthenticateUserUseCase";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { AuthDTO } from "../../../domain/dto/AuthDTO";


export class AuthController {
    constructor(
        private authenticateUserUseCase: AuthenticateUserUseCase,
    ) { }

    async handleAuthenticate(req: Request, res: Response): Promise<Response> {
        try {
            const dto: AuthDTO = req.body;
            const token = await this.authenticateUserUseCase.execute(dto);
            return res.status(200).json({ token });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    // (Precisa injetar o UserRepository no construtor)
    async handleValidateSession(req: Request, res: Response) {
        try {
            // 1. Pega o usuário que o middleware já validou e anexou
            const user = req.user!;

            // 2. Formata a resposta
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
            };

            return res.status(200).json(userData);
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}