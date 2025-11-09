export interface HashedToken {
  token: string;
  tokenHash: string;
}

export interface TokenHasher {
  /**
   * Gera o token aleatório (não hasheado) e o hash para salvar no DB.
   */
  generateToken(): HashedToken;

  /**
   * Hasheia uma string arbitrária (usado para comparar o token que chega com o hash do DB).
   */
  hash(token: string): string;

  /**
   * Compara o token que chega com o hash salvo no DB.
   */
  compare(token: string, tokenHash: string): boolean;
}