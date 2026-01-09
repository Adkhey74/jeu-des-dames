import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    try {
        const client = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
            errorFormat: 'pretty',
        });
        return client;
    } catch (error) {
        console.error('❌ Erreur lors de la création de PrismaClient:', error);
        console.error('💡 Vérifiez que:');
        console.error('   1. Prisma Client est généré: npx prisma generate');
        console.error('   2. La variable DATABASE_URL est correcte dans .env');
        console.error('   3. La base de données PostgreSQL est accessible');
        throw error;
    }
}

const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Fonction utilitaire pour tester la connexion
export async function testDatabaseConnection(): Promise<boolean> {
    try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.error('❌ Test de connexion à la base de données échoué:', error);
        return false;
    }
}

export { prisma };




