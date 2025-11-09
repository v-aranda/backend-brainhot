import { randomUUID } from 'crypto';

interface TokenProps {
  id?: string;
  tokenHash: string; // O hash do token (o que está no DB)
  userId: string;
  expiresAt: Date;
  used?: boolean;
  createdAt?: Date;
}

export class PasswordResetToken {
  public readonly id: string;
  public readonly tokenHash: string;
  public readonly userId: string;
  public readonly expiresAt: Date;
  public used: boolean; // Permitido mudar, pois será usado uma vez
  public readonly createdAt: Date;

  private constructor(props: TokenProps) {
    this.id = props.id ?? randomUUID();
    this.tokenHash = props.tokenHash;
    this.userId = props.userId;
    this.expiresAt = props.expiresAt;
    this.used = props.used ?? false;
    this.createdAt = props.createdAt ?? new Date();
  }

  public static create(props: TokenProps): PasswordResetToken {
    // Regra: O hash é obrigatório
    if (!props.tokenHash) {
      throw new Error('Token hash is required.');
    }
    // Regra: A expiração deve ser no futuro
    if (props.expiresAt <= new Date()) {
      throw new Error('Token expiration date must be in the future.');
    }
    return new PasswordResetToken(props);
  }

  public markAsUsed() {
    this.used = true;
  }
}