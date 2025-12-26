import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Token d\'authentification manquant' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        let payload;
        try {
            payload = verifyToken(token);
        } catch {
            return NextResponse.json(
                { error: 'Token invalide' },
                { status: 401 }
            );
        }

        // Récupérer ou créer les stats du joueur
        let stats = await prisma.playerStats.findUnique({
            where: { userId: payload.userId },
        });

        if (!stats) {
            // Créer les stats si elles n'existent pas
            stats = await prisma.playerStats.create({
                data: {
                    userId: payload.userId,
                    gamesPlayed: 0,
                    gamesWon: 0,
                    gamesLost: 0,
                    totalScore: 0,
                },
            });
        }

        return NextResponse.json({
            gamesPlayed: stats.gamesPlayed,
            gamesWon: stats.gamesWon,
            gamesLost: stats.gamesLost,
            totalScore: stats.totalScore,
            winRate: stats.gamesPlayed > 0 
                ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
                : 0,
        });

    } catch (error) {
        console.error('Erreur récupération stats:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des statistiques' },
            { status: 500 }
        );
    }
}



