import { User } from  '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class FindUserByIdUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string): Promise<User | null> {
    
    // 2. Chamar o repositório
    const user = await this.userRepository.findById(id);

    if (!user) {
      return null;
    }
    // 3. Retornar o usuário encontrado
    return user;
  }
}
