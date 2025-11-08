import { PasswordHasher } from '../services/PasswordHasher';
import { TokenGenerator } from '../services/TokenGenerator';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { LoginDTO } from '../../domain/dto/AuthDTO';

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
    private tokenGenerator: TokenGenerator
  ) {}

    async execute(loginDTO: LoginDTO): Promise<string> {
    const user = await this.userRepository.findByEmail(loginDTO.email);
    if (!user) throw new Error("Usuário ou senha inválidos");

    const isPasswordValid = await this.passwordHasher.compare(
      loginDTO.password,
      user.passwordhash
    );
    if (!isPasswordValid) throw new Error("Usuário ou senha inválidos");

    const token = this.tokenGenerator.generate({ userId: user.id });
    return token;
  }
}