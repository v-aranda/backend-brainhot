import { Request, Response } from "express";

import { CreateUserUseCase } from "../../../application/usecases/CreateUserUseCase";
import { FindUserByIdUseCase } from "../../../application/usecases/FindUserByIdUseCase";
import { FindAllUsersUseCase } from "../../../application/usecases/FindAllUsersUseCase";
import { EditUserUseCase } from "../../../application/usecases/EditUserUseCase";
import { EditUserDTO } from "../../../application/usecases/EditUserUseCase";
import { CreateUserDTO } from "../../../domain/dto/UserDTO";

export class UserController {
  // Recebe o Caso de Uso por Injeção de Dependência
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private findUserByIdUseCase: FindUserByIdUseCase,
    private findAllUsersUseCase: FindAllUsersUseCase,
    private editUserUseCase: EditUserUseCase

  ) { }

  async handleCreateUser(req: Request, res: Response): Promise<Response> {
    try {
      const dto: CreateUserDTO = req.body;
      const createdUser = await this.createUserUseCase.execute(dto);

      // 3. Responder ao cliente
      // Removemos o hash da senha antes de enviar como resposta.
      const userResponse = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
      };

      return res.status(201).send(userResponse);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      // Erro inesperado
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async handleGetUserByID(req: Request, res: Response): Promise<Response> {
    const userId = req.params.id;

    const user = await this.findUserByIdUseCase.execute(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 4. Responder ao cliente
    return res.status(200).json(user);
  }
  async handleGetAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.findAllUsersUseCase.execute();

      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async handleEdit(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    // Pega apenas os dados que podem ser editados
    const data: EditUserDTO = req.body;

    // --- AUTORIZAÇÃO: Verifica se o ID no token corresponde ao ID na rota ---
    // NOTA: 'req.user' foi injetado pelo authMiddleware.
    if (!req.user || req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own profile.' });
    }
    // --- FIM DA AUTORIZAÇÃO ---

    try {
      const updatedUser = await this.editUserUseCase.execute(id, data);

      // Remover o hash antes de responder
      const response = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
      };

      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        // Trata erros específicos do caso de uso (Ex: "Email já em uso", "User not found")
        const statusCode = error.message.includes('not found') ? 404 : 400;
        return res.status(statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
