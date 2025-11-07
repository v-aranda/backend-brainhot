import { randomUUID } from "crypto";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: { name: string; email: string }): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("E-mail já cadastrado");
    }
    const user = new User({ id: randomUUID(), name: input.name, email: input.email });
    await this.userRepository.create(user);
    return user;
  }
}



