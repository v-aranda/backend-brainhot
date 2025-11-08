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

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
}