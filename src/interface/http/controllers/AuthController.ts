import { Request, Response } from "express";
import { AuthenticateUserUseCase } from "../../../application/usecases/AuthenticateUserUseCase";
import { AuthDTO } from "../../../domain/dto/AuthDTO";


export class AuthController {
    constructor(private authenticateUserUseCase: AuthenticateUserUseCase) {}

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
}