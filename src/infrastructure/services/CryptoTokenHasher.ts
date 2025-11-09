import { TokenHasher, HashedToken } from '../../application/services/TokenHasher';
import { randomBytes, createHash, timingSafeEqual } from 'crypto'; // Import crypto

export class CryptoTokenHasher implements TokenHasher {

    // ALGORITMO DE HASH (usado internamente)
    private internalHash(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    /**
     * Gera um novo token (limpo) e seu HASH.
     */
    generateToken(): HashedToken {
        const token = randomBytes(32).toString('hex');
        const tokenHash = this.internalHash(token); // Usa o método interno
        return { token, tokenHash };
    }

    /**
     * Hasheia uma string arbitrária.
     * 🌟 Implementa o método 'hash' da sua interface.
     */
    hash(token: string): string {
        return this.internalHash(token); // Usa o método interno
    }

    /**
     * Compara o token com o hash (de forma segura contra Timing Attacks).
     * 🌟 Implementa o método 'compare' da sua interface.
     */
    compare(token: string, tokenHash: string): boolean {
        try {
            const receivedHash = this.internalHash(token);
            
            // Converte os hashes para buffers para a comparação segura
            const hashA = Buffer.from(receivedHash, 'hex');
            const hashB = Buffer.from(tokenHash, 'hex');

            // Validação de segurança: garante que os buffers tenham o mesmo tamanho
            if (hashA.length !== hashB.length) {
                return false;
            }

            // timingSafeEqual previne "Timing Attacks"
            return timingSafeEqual(hashA, hashB);
        } catch (error) {
            console.error("Erro na comparação de hash:", error);
            return false;
        }
    }
}