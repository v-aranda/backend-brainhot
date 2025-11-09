import { PasswordResetToken } from '../entities/PasswordResetToken';

export interface PasswordResetTokenRepository {
  /**
   * Salva um novo token de redefinição.
   */
  save(token: PasswordResetToken): Promise<void>;

  /**
   * Encontra um token pelo seu hash (o que está no banco).
   */
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;

  /**
   * Encontra um token pelo seu tokenID (id da coluna).
   */
  findById(id: string): Promise<PasswordResetToken | null>;
}