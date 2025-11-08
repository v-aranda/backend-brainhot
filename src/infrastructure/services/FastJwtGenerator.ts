// 1. Remova 'Signer' e 'Verifier' da importação
import { createSigner, createVerifier } from 'fast-jwt';
import { TokenGenerator, TokenPayload } from '../../application/services/TokenGenerator';

export class FastJwtTokenGenerator implements TokenGenerator {
  // 2. Remova as anotações de tipo daqui...
  private readonly signer;
  private readonly verifier;

  constructor(secretKey: string, expiresIn: string = '1h') {
    if (!secretKey) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    // ... e o TypeScript vai inferir os tipos corretos
    // a partir do retorno destas funções.
    this.signer = createSigner({
      key: secretKey,
      expiresIn: expiresIn,
    });

    this.verifier = createVerifier({
      key: secretKey,
    });
  }

  generate(payload: object): string {
    const token = this.signer(payload);
    return token;
  }

  verify(token: string): TokenPayload | null {
    try {
      const payload = this.verifier(token) as TokenPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }
}