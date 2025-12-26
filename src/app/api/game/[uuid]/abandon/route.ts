import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Piece } from '@/types';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
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

        const { uuid: uuidParam } = await params;
        let uuid = uuidParam.trim().toLowerCase();

        // Trouver la partie
        const game = await prisma.game.findUnique({
            where: { uuid },
        });

        if (!game) {
            return NextResponse.json(
                { error: 'Partie non trouvée' },
                { status: 404 }
            );
        }

        // Vérifier que le joueur est dans la partie
        const isWhitePlayer = game.whitePlayerId === payload.userId;
        const isBlackPlayer = game.blackPlayerId === payload.userId;

        if (!isWhitePlayer && !isBlackPlayer) {
            return NextResponse.json(
                { error: 'Vous n\'êtes pas dans cette partie' },
                { status: 403 }
            );
        }

        // Vérifier que la partie est en cours
        if (game.status !== 'playing') {
            return NextResponse.json(
                { error: 'La partie n\'est pas en cours' },
                { status: 400 }
            );
        }

        // Déterminer le gagnant (l'autre joueur)
        const winner = isWhitePlayer ? 'black' : 'white';
        const winnerId = isWhitePlayer ? game.blackPlayerId : game.whitePlayerId;
        const loserId = payload.userId;

        // Mettre à jour la partie
        const updatedGame = await prisma.game.update({
            where: { id: game.id },
            data: {
                status: 'finished',
                winner,
                finishedAt: new Date(),
            },
        });

        // Mettre à jour les statistiques
        if (winnerId) {
            // Mettre à jour les stats du gagnant
            const winnerStats = await prisma.playerStats.findUnique({
                where: { userId: winnerId },
            });

            if (winnerStats) {
                await prisma.playerStats.update({
                    where: { userId: winnerId },
                    data: {
                        gamesPlayed: winnerStats.gamesPlayed + 1,
                        gamesWon: winnerStats.gamesWon + 1,
                        totalScore: winnerStats.totalScore + 12, // Score par défaut pour abandon
                    },
                });
            } else {
                await prisma.playerStats.create({
                    data: {
                        userId: winnerId,
                        gamesPlayed: 1,
                        gamesWon: 1,
                        gamesLost: 0,
                        totalScore: 12,
                    },
                });
            }

            // Mettre à jour les stats du perdant (celui qui abandonne)
            const loserStats = await prisma.playerStats.findUnique({
                where: { userId: loserId },
            });

            if (loserStats) {
                await prisma.playerStats.update({
                    where: { userId: loserId },
                    data: {
                        gamesPlayed: loserStats.gamesPlayed + 1,
                        gamesLost: loserStats.gamesLost + 1,
                    },
                });
            } else {
                await prisma.playerStats.create({
                    data: {
                        userId: loserId,
                        gamesPlayed: 1,
                        gamesWon: 0,
                        gamesLost: 1,
                        totalScore: 0,
                    },
                });
            }

            // Créer l'historique de la partie
            const startedAt = game.startedAt || game.createdAt;
            const finishedAt = new Date();
            const duration = Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000);

            // Calculer les scores finaux
            const pieces = game.pieces as Piece[];
            const whitePieces = pieces?.filter((p: Piece) => p.color === 'white').length || 0;
            const blackPieces = pieces?.filter((p: Piece) => p.color === 'black').length || 0;

            await prisma.gameHistory.create({
                data: {
                    gameId: game.id,
                    winnerId,
                    whitePlayerScore: whitePieces,
                    blackPlayerScore: blackPieces,
                    duration,
                    finishedAt,
                },
            });
        }

        return NextResponse.json({
            message: 'Abandon enregistré',
            game: {
                status: updatedGame.status,
                winner: updatedGame.winner,
            },
        });

    } catch (error) {
        console.error('Erreur abandon partie:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'abandon de la partie' },
            { status: 500 }
        );
    }
}



