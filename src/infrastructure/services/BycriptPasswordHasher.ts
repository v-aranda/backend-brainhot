import { PasswordHasher } from '../../application/services/PasswordHasher';
import * as bcrypt from 'bcrypt';

/**
 * @class BcryptPasswordHasher
 * Implementação concreta do PasswordHasher usando a biblioteca 'bcrypt'.
 */
export class BcryptPasswordHasher implements PasswordHasher {
  // Define o "custo" do hash. 10 é um bom padrão.
  private SALT_ROUNDS = 10;

  async hash(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, this.SALT_ROUNDS);
    return hash;
  }

  // Futuramente, para o login:
  // async compare(password: string, hash: string): Promise<boolean> {
  //   return bcrypt.compare(password, hash);
  // }
}