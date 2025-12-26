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
        try {
            verifyToken(token);
        } catch (error) {
            return NextResponse.json(
                { error: 'Token invalide' },
                { status: 401 }
            );
        }

        // Récupérer le classement
        const stats = await prisma.playerStats.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
            orderBy: [
                { totalScore: 'desc' },
                { gamesWon: 'desc' },
            ],
            take: 100, // Top 100
        });

        const leaderboard = stats.map(stat => ({
            userId: stat.userId,
            username: stat.user.username,
            gamesPlayed: stat.gamesPlayed,
            gamesWon: stat.gamesWon,
            gamesLost: stat.gamesLost,
            totalScore: stat.totalScore,
            winRate: stat.gamesPlayed > 0 
                ? Math.round((stat.gamesWon / stat.gamesPlayed) * 100) 
                : 0,
        }));

        return NextResponse.json({ leaderboard });

    } catch (error) {
        console.error('Erreur récupération classement:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération du classement' },
            { status: 500 }
        );
    }
}



