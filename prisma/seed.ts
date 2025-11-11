// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

// 🚨 CORREÇÃO: Função para limpar a DATABASE_URL.
// A URL de Accelerate é injetada (ex: prisma+postgres://), mas o seed só entende postgresql://
const getCleanDatabaseUrl = (url: string | undefined): string => {
  if (!url) {
    throw new Error('DATABASE_URL não está definida no ambiente.');
  }

  // Remove o prefixo 'prisma+' ou 'prisma://' para obter a URL padrão do Postgres.
  if (url.startsWith('prisma+postgres://')) {
    return url.replace('prisma+', ''); // Transforma 'prisma+postgres://' em 'postgresql://'
  }
  if (url.startsWith('prisma://')) {
    // Se for só 'prisma://', a URL base precisa ser extraída ou a URL normal fallback deve ser usada.
    // Vamos assumir que a URL fallback (process.env.DATABASE_URL) é a quebra, então usamos a URL padrão,
    // mas se a sua plataforma insiste em 'prisma://', a lógica de extração é mais complexa.
    // Para simplificar, forçamos o formato 'postgres://' se for um prefixo de acelerate.
    return url.replace('prisma://', 'postgresql://');
  }
  
  // Se for uma URL normal de Postgres, retorna ela mesma.
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