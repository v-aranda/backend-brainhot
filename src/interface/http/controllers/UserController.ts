import { Request, Response } from "express";
import { CreateUserUseCase } from "../../../application/usecases/CreateUserUseCase";
import { UserRepository } from "../../../domain/repositories/UserRepository";

export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  create = async (req: Request, res: Response) => {
    try {
      const usecase = new CreateUserUseCase(this.userRepository);
      const user = await usecase.execute({ name: req.body.name, email: req.body.email });
      return res.status(201).json(user);
    } catch (err) {
      return res.status(400).json({ message: (err as Error).message });
    }
  };

  list = async (_req: Request, res: Response) => {
    const users = await this.userRepository.list();
    return res.json(users);
  };
}


