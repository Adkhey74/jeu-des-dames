import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Piece } from '@/types';

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

        // Récupérer l'historique des parties du joueur
        const games = await prisma.game.findMany({
            where: {
                status: 'finished',
                OR: [
                    { whitePlayerId: payload.userId },
                    { blackPlayerId: payload.userId },
                ],
            },
            include: {
                whitePlayer: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        username: true,
                    },
                },
                blackPlayer: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        username: true,
                    },
                },
                history: true,
            },
            orderBy: {
                finishedAt: 'desc',
            },
            take: 50, // Limiter à 50 dernières parties
        });

        const history = games.map(game => {
            const whitePlayerName = `${game.whitePlayer.prenom} ${game.whitePlayer.nom}`;
            const blackPlayerName = game.blackPlayer 
                ? `${game.blackPlayer.prenom} ${game.blackPlayer.nom}`
                : 'Joueur inconnu';

            const whitePlayerScore = game.history?.whitePlayerScore || 0;
            const blackPlayerScore = game.history?.blackPlayerScore || 0;
            const duration = game.history?.duration || 0;

            // Calculer le score basé sur les pièces restantes si pas d'historique
            let calculatedWhiteScore = whitePlayerScore;
            let calculatedBlackScore = blackPlayerScore;

            if (!game.history && game.pieces) {
                const pieces = (game.pieces as unknown) as Piece[];
                calculatedWhiteScore = pieces.filter((p: Piece) => p.color === 'white').length;
                calculatedBlackScore = pieces.filter((p: Piece) => p.color === 'black').length;
            }

            return {
                id: game.id,
                gameId: game.uuid,
                winner: game.winner as 'white' | 'black',
                whitePlayerName,
                blackPlayerName,
                whitePlayerScore: calculatedWhiteScore,
                blackPlayerScore: calculatedBlackScore,
                duration: duration || (game.startedAt && game.finishedAt 
                    ? Math.floor((game.finishedAt.getTime() - game.startedAt.getTime()) / 1000)
                    : 0),
                finishedAt: game.finishedAt || game.createdAt,
            };
        });

        return NextResponse.json({ history });

    } catch (error) {
        console.error('Erreur récupération historique:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération de l\'historique' },
            { status: 500 }
        );
    }
}



