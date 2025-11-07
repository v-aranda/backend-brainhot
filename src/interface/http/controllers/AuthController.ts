import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../application/usecases/RegisterUserUseCase';
import { AuthenticateUserUseCase } from '../../../application/usecases/AuthenticateUserUseCase';

export class AuthController {
  register = async (req: Request, res: Response) => {
    try {
      const usecase = new RegisterUserUseCase();
      const user = await usecase.execute({ name: req.body.name, email: req.body.email, password: req.body.password });
      return res.status(201).json(user);
    } catch (err) {
      return res.status(400).json({ message: (err as Error).message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const usecase = new AuthenticateUserUseCase();
      const { token } = await usecase.execute({ email: req.body.email, password: req.body.password });
      return res.json({ token });
    } catch (err) {
      return res.status(401).json({ message: (err as Error).message });
    }
  };
}


