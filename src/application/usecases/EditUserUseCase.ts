import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

/**
 * @interface EditUserDTO
 * Define quais campos podem ser alterados na edição.
 * Tornamos os campos opcionais (parciais).
 */
export interface EditUserDTO {
  name?: string;
  email?: string;
  // Nota: A alteração de senha deve ser feita em um caso de uso separado (ChangePassword)
}

/**
 * @class EditUserUseCase
 * Orquestra o processo de edição do usuário.
 */
export class EditUserUseCase {
  constructor(private userRepository: UserRepository) {}

  /**
   * @method execute
   * Executa a edição de um usuário.
   * @param id O ID do usuário a ser editado.
   * @param data Os dados a serem atualizados (name e/ou email).
   * @returns A Entidade User atualizada.
   */
  async execute(id: string, data: EditUserDTO): Promise<User> {
    // 1. Buscar a Entidade de Domínio existente
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found.');
    }

    // 2. Aplicar as alterações.
    // As entidades têm setters implícitos ao serem re-criadas ou atualizadas.
    // NOTA: Como as propriedades da sua Entidade User são 'public readonly' (exceto name e email, que você permitiu mudar),
    // precisamos criar um novo objeto de props e usar o 'User.create' para forçar a validação.
    
    // Assegurar que 'name' é atualizável (verifiquei que seu User.ts permite isso).
    user.name = data.name ?? user.name;
    
    // Lógica para Email (Mais Complexa):
    if (data.email && data.email !== user.email) {
      // Regra de Negócio de Processo: Verificar se o novo email já está em uso
      const existingUserWithNewEmail = await this.userRepository.findByEmail(data.email);
      if (existingUserWithNewEmail) {
        throw new Error('This email is already in use by another user.');
      }
      user.email = data.email;
    }

    // 3. Persistir a Entidade atualizada (o 'save' fará o upsert/update)
    await this.userRepository.save(user);

    return user;
  }
}