import { UserRepository } from '../../domain/repositories/UserRepository';
import { PasswordResetTokenRepository } from '../../domain/repositories/PasswordResetTokenRepository';
import { PasswordHasher } from '../services/PasswordHasher';
import { TokenHasher } from '../services/TokenHasher';
import { User } from '../../domain/entities/User'; // Importar a entidade User

// DTO (Data Transfer Object) para os dados que chegam no Use Case
interface ResetDTO {
    userId: string;
    token: string; // O token limpo (sem hash) que veio do link do email
    newPassword: string;
}

/**
 * @class ResetPasswordUseCase
 * Responsável por validar um token de redefinição de senha e
 * atualizar a senha do usuário.
 */
export class ResetPasswordUseCase {
    constructor(
        // Repositório para encontrar e salvar o usuário
        private userRepository: UserRepository,
        // Repositório para encontrar e invalidar o token de reset
        private tokenRepository: PasswordResetTokenRepository,
        // Hasher para a NOVA senha (ex: Bcrypt)
        private passwordHasher: PasswordHasher,
        // Hasher para o TOKEN de reset (ex: Crypto)
        private tokenHasher: TokenHasher
    ) { }

    async execute(data: ResetDTO): Promise<void> {
        const { userId, token, newPassword } = data;

        // 1. Hashear o token recebido (do link) para poder comparar com o do banco
        // O banco NUNCA armazena o token limpo.
        const tokenHashReceived = this.tokenHasher.hash(token);

        // 2. Buscar o token no repositório pelo HASH
        const resetToken = await this.tokenRepository.findByTokenHash(tokenHashReceived);

        // --- Início das Verificações de Segurança ---

        // A. Token não existe OU não pertence ao usuário correto
        // (Verificação em tempo constante é ideal, mas isso já é muito seguro)
        if (!resetToken || resetToken.userId !== userId) {
            // Regra de segurança: Lançamos um erro genérico.
            // Nunca informe ao cliente se foi o token ou o userId que falhou.
            throw new Error('Token de redefinição inválido.');
        }

        // B. Token já foi usado
        if (resetToken.used) {
            throw new Error('Token de redefinição já foi utilizado.');
        }

        // C. Token expirou
        if (resetToken.expiresAt < new Date()) {
            throw new Error('Token de redefinição expirou.');
        }

        // --- Fim das Verificações de Segurança ---
        // Se passamos por tudo, o token é válido.

        // 3. Hashear a NOVA senha antes de salvar
        const newPasswordHash = await this.passwordHasher.hash(newPassword);

        // 4. Atualizar o usuário no banco de dados
        const user = await this.userRepository.findById(userId);
        if (!user) {
            // Isso é raro se o token era válido, mas é uma boa verificação.
            throw new Error('Usuário não encontrado.');
        }

        // Atualiza o hash da senha na entidade
        (user as User).passwordhash = newPasswordHash; // Pode ser necessário um 'setter'

        // 5. Salvar o usuário com a nova senha
        await this.userRepository.save(user);

        // 6. Invalidar o token (marcar como usado) para prevenir reuso
        resetToken.markAsUsed(); // (Assumindo que a entidade Token tem esse método)

        // 7. Salvar o token (agora marcado como 'used')
        await this.tokenRepository.save(resetToken);

        console.log(`[PASSWORD RESET] Senha do usuário ${userId} redefinida com sucesso.`);
        // O Use Case retorna 'void' (nada) em caso de sucesso.
    }
}