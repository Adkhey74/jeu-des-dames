import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
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

        // Normaliser l'UUID : trim et convertir en minuscules
        const uuid = uuidParam.trim().toLowerCase();

        // Trouver la partie
        const game = await prisma.game.findUnique({
            where: { uuid },
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
            },
        });

        if (!game) {
            return NextResponse.json(
                { error: 'Partie non trouvée' },
                { status: 404 }
            );
        }

        // Déterminer la couleur du joueur
        let playerColor: 'white' | 'black' | null = null;
        if (game.whitePlayerId === payload.userId) {
            playerColor = 'white';
        } else if (game.blackPlayerId === payload.userId) {
            playerColor = 'black';
        }

        // Si le joueur n'est pas dans la partie, vérifier s'il peut la rejoindre
        if (!playerColor && game.status === 'waiting') {
            return NextResponse.json({
                game: {
                    id: game.id,
                    uuid: game.uuid,
                    status: game.status,
                    currentTurn: game.currentTurn,
                    pieces: game.pieces,
                    moves: game.moves,
                    winner: game.winner,
                    whitePlayer: game.whitePlayer,
                    blackPlayer: game.blackPlayer,
                },
                playerColor: null,
                canJoin: true,
            });
        }

        if (!playerColor) {
            return NextResponse.json(
                { error: 'Vous n\'êtes pas autorisé à voir cette partie' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            game: {
                id: game.id,
                uuid: game.uuid,
                status: game.status,
                currentTurn: game.currentTurn,
                pieces: game.pieces,
                moves: game.moves,
                winner: game.winner,
                whitePlayer: game.whitePlayer,
                blackPlayer: game.blackPlayer,
            },
            playerColor,
        });

    } catch (error) {
        console.error('Erreur récupération partie:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération de la partie' },
            { status: 500 }
        );
    }
}

