import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { CreateUserDTO } from '../../domain/dto/UserDTO';
import { PasswordHasher } from '../services/PasswordHasher';

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(data: CreateUserDTO): Promise<User> {
    
    // 1. Verificar se o usuário já existe
    const userAlreadyExists = await this.userRepository.findByEmail(data.email);

    if (userAlreadyExists) {
      throw new Error('User with this email already exists.');
    }

    // 2. Hash da Senha
    const passwordhash = await this.passwordHasher.hash(data.password);

    // 3. Criar a Entidade de Domínio
    const user = User.create({
      name: data.name,
      email: data.email,
      passwordhash: passwordhash,
    });

    // 4. Salvar no repositório
    // O Use Case manda o repositório salvar a entidade no banco de dados.
    await this.userRepository.save(user);

    // 5. Retornar a entidade criada
    return user;
  }
}