// 1. Importe o 'createSigner' e 'createVerifier'
import { createSigner, createVerifier } from 'fast-jwt';
import { TokenGenerator } from '../../application/services/TokenGenerator';

export class FastJwtTokenGenerator implements TokenGenerator {
  // 2. Crie as instâncias do assinador e verificador
  private readonly signer;
  private readonly verifier;

  constructor(secretKey: string, expiresIn: string = '1h') {
    if (!secretKey) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    // 3. Crie o assinador com as opções
    this.signer = createSigner({
      key: secretKey,
      expiresIn: expiresIn,
    });

    // 4. Crie o verificador
    this.verifier = createVerifier({
      key: secretKey,
    });
  }

  // A API da fast-jwt é síncrona, então podemos
  // remover o 'async' da assinatura do método na interface
  // ou apenas envolvê-la em uma Promise resolvida.
  // Vamos manter a interface 'async' para consistência.
  
  generate(payload: object): string {
    const token = this.signer(payload);
    return token;
  }

  // --- CORRIGIDO ---
  // 1. Removido 'async' e 'Promise'
  verify(token: string): object | null {
    try {
      const payload = this.verifier(token);
      return payload as object;
    } catch (error) {
      return null;
    }
  }
}