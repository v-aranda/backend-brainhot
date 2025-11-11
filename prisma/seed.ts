// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

// 🚨 CORREÇÃO: Função para limpar a DATABASE_URL.
const getCleanDatabaseUrl = (url: string | undefined): string => {
  if (!url) {
    throw new Error('DATABASE_URL não está definida no ambiente.');
  }

  // Remove prefixos do Prisma Accelerate
  if (url.startsWith('prisma+postgres://')) {
    return url.replace('prisma+', ''); // Transforma 'prisma+postgres://' em 'postgresql://'
  }
  if (url.startsWith('prisma://')) {
    // Isso é mais perigoso, mas tenta forçar o formato postgres
    return url.replace('prisma://', 'postgresql://');
  }
  
  // Retorna a URL original se for o formato padrão (postgresql://)
  return url;
};

const cleanUrl = getCleanDatabaseUrl(process.env.DATABASE_URL);

// Instancia o cliente, forçando a URL correta para o seed
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: cleanUrl,
    },
  },
});

// [SEU PADRÃO] Lista de dados do ENEM
const enemSubjects = [
    {
        name: 'Ciências Humanas e suas Tecnologias',
        topics: ['História', 'Geografia', 'Filosofia', 'Sociologia'],
    },
    {
        name: 'Ciências da Natureza e suas Tecnologias',
        topics: ['Biologia', 'Física', 'Química'],
    },
    {
        name: 'Linguagens, Códigos e suas Tecnologias',
        topics: ['Interpretação de Texto', 'Gramática', 'Literatura', 'Artes'],
    },
    {
        name: 'Matemática e suas Tecnologias',
        topics: ['Álgebra', 'Geometria', 'Estatística e Probabilidade', 'Aritmética'],
    },
    {
        name: 'Redação',
        topics: ['Estrutura Dissertativa', 'Coesão e Coerência', 'Proposta de Intervenção', 'Argumentação'],
    },
    {
        name: 'Língua Inglesa',
        topics: ['Reading Comprehension', 'Vocabulary', 'Grammar'],
    },
    {
        name: 'Língua Espanhola',
        topics: ['Lectura y Comprensión', 'Vocabulario', 'Gramática'],
    },
];

async function main() {
    // 🚀 NOVO BLOCO DE LOGGING
    console.log('--- DIAGNÓSTICO DE URL DE PRODUÇÃO ---');
    console.log(`[SEED] ENV.DATABASE_URL (Original): ${process.env.DATABASE_URL}`);
    console.log(`[SEED] URL Limpa (Tentativa de Conexão): ${cleanUrl}`);
    console.log('------------------------------------');

    console.log('[SEED] Iniciando o processo de seed...');
    for (const subjectData of enemSubjects) {
        console.log(`[SEED] Processando: ${subjectData.name}`);
        
        // [PADRÃO] Lógica de upsert idempotente
        const subject = await prisma.subject.upsert({
            where: { name: subjectData.name },
            update: {},
            create: {
                name: subjectData.name,
                topics: {
                    create: subjectData.topics.map((topicName) => ({
                        name: topicName,
                    })),
                },
            },
            include: {
                topics: true,
            },
        });
        console.log(`[SEED] > ${subject.name} com ${subject.topics.length} tópicos.`);
    }
    console.log('[SEED] Processo de seed finalizado com sucesso.');
}

// Executa o script e lida com erros
main()
    .catch((e) => {
    // O erro P6001 é capturado aqui
    console.error('[SEED] Erro durante o processo de seed:', e);
    process.exit(1);
})
    .finally(async () => {
    // Garante que o cliente do Prisma seja desconectado
    await prisma.$disconnect();
});
