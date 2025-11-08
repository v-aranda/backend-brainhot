// 1. Defina o que é o "Payload"
// (O 'fast-jwt' retorna 'iat' e 'exp' como números em segundos)
export interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

// 2. Defina a interface
export interface TokenGenerator {
  generate(payload: object): string;
  verify(token: string): TokenPayload | null;
}