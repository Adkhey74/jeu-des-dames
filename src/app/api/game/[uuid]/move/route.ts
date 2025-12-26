import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Piece, Move } from '@/types';

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

        // Récupérer le coup depuis le body
        const body = await request.json();
        const { move, pieces } = body;

        if (!move || !pieces) {
            return NextResponse.json(
                { error: 'Coup et pièces requis' },
                { status: 400 }
            );
        }

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

        // Vérifier que c'est le tour du joueur
        const playerColor = isWhitePlayer ? 'white' : 'black';
        if (game.currentTurn !== playerColor) {
            return NextResponse.json(
                { error: 'Ce n\'est pas votre tour' },
                { status: 400 }
            );
        }

        // Vérifier que la partie est en cours
        if (game.status !== 'playing') {
            return NextResponse.json(
                { error: 'La partie n\'est pas en cours' },
                { status: 400 }
            );
        }

        // Ajouter le coup à l'historique
        const moves = (game.moves as Move[]) || [];
        moves.push(move as Move);

        // Déterminer le prochain tour
        const nextTurn = game.currentTurn === 'white' ? 'black' : 'white';

        // Vérifier les conditions de victoire
        const whitePieces = (pieces as Piece[]).filter((p: Piece) => p.color === 'white');
        const blackPieces = (pieces as Piece[]).filter((p: Piece) => p.color === 'black');

        let newStatus = game.status;
        let winner: string | null = null;

        if (whitePieces.length === 0) {
            newStatus = 'finished';
            winner = 'black';
        } else if (blackPieces.length === 0) {
            newStatus = 'finished';
            winner = 'white';
        }

        // Mettre à jour la partie
        const updatedGame = await prisma.game.update({
            where: { id: game.id },
            data: {
                pieces: pieces as Piece[],
                moves: moves as Move[],
                currentTurn: nextTurn,
                status: newStatus,
                winner,
                finishedAt: newStatus === 'finished' ? new Date() : null,
            },
        });

        // Si la partie est terminée, mettre à jour les statistiques
        if (newStatus === 'finished' && winner) {
            const winnerId = winner === 'white' ? game.whitePlayerId : game.blackPlayerId;
            const loserId = winner === 'white' ? game.blackPlayerId : game.whitePlayerId;

            // Calculer les scores
            const winnerPieces = whitePieces.length > 0 ? whitePieces.length : blackPieces.length;
            const loserPieces = winner === 'white' ? blackPieces.length : whitePieces.length;

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
                        totalScore: winnerStats.totalScore + winnerPieces,
                    },
                });
            } else {
                await prisma.playerStats.create({
                    data: {
                        userId: winnerId,
                        gamesPlayed: 1,
                        gamesWon: 1,
                        gamesLost: 0,
                        totalScore: winnerPieces,
                    },
                });
            }

            // Mettre à jour les stats du perdant
            if (loserId) {
                const loserStats = await prisma.playerStats.findUnique({
                    where: { userId: loserId },
                });

                if (loserStats) {
                    await prisma.playerStats.update({
                        where: { userId: loserId },
                        data: {
                            gamesPlayed: loserStats.gamesPlayed + 1,
                            gamesLost: loserStats.gamesLost + 1,
                            totalScore: loserStats.totalScore + loserPieces,
                        },
                    });
                } else {
                    await prisma.playerStats.create({
                        data: {
                            userId: loserId,
                            gamesPlayed: 1,
                            gamesWon: 0,
                            gamesLost: 1,
                            totalScore: loserPieces,
                        },
                    });
                }
            }

            // Créer l'historique de la partie
            const startedAt = game.startedAt || game.createdAt;
            const finishedAt = new Date();
            const duration = Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000);

            await prisma.gameHistory.create({
                data: {
                    gameId: game.id,
                    winnerId,
                    whitePlayerScore: whitePieces.length,
                    blackPlayerScore: blackPieces.length,
                    duration,
                    finishedAt,
                },
            });
        }

        return NextResponse.json({
            message: 'Coup enregistré',
            game: {
                pieces: updatedGame.pieces,
                moves: updatedGame.moves,
                currentTurn: updatedGame.currentTurn,
                status: updatedGame.status,
                winner: updatedGame.winner,
            },
        });

    } catch (error) {
        console.error('Erreur enregistrement coup:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'enregistrement du coup' },
            { status: 500 }
        );
    }
}

