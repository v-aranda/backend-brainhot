import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class FindAllUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    // 1. Chamar o repositório
    const users = await this.userRepository.findAll();

    // 2. Retornar a lista (vazia ou não)
    return users;
  }
}