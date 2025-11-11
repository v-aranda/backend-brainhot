// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

// Instancia o cliente
const prisma = new PrismaClient();

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

    // [PADRÃO] Usamos 'upsert' para evitar duplicatas.
    // Ele tenta criar. Se já existir (pelo 'name' único), ele apenas atualiza.
    const subject = await prisma.subject.upsert({
      where: { name: subjectData.name }, // Chave única para checar
      update: {}, // Não faz nada se já existir
      create: {
        name: subjectData.name,
        // [PRISMA] Cria os Tópicos "aninhados"
        topics: {
          create: subjectData.topics.map((topicName) => ({
            name: topicName,
          })),
        },
      },
      include: {
        topics: true, // Inclui os tópicos na resposta
      },
    });

    console.log(`[SEED] > ${subject.name} com ${subject.topics.length} tópicos.`);
  }

  console.log('[SEED] Processo de seed finalizado com sucesso.');
}

// Executa o script e lida com erros
main()
  .catch((e) => {
    console.error('[SEED] Erro durante o processo de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Garante que o cliente do Prisma seja desconectado
    await prisma.$disconnect();
  });