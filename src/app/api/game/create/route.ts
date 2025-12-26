import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

import { Piece } from '@/types';
import { Prisma } from '@prisma/client';

// Fonction pour initialiser le plateau
function initializeBoard(): Piece[] {
    const pieces: Piece[] = [];

    // Pièces blanches (en bas, lignes 5-7)
    for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                pieces.push({
                    id: `white-${row}-${col}`,
                    type: 'pawn',
                    color: 'white',
                    position: { row, col },
                });
            }
        }
    }

    // Pièces noires (en haut, lignes 0-2)
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                pieces.push({
                    id: `black-${row}-${col}`,
                    type: 'pawn',
                    color: 'black',
                    position: { row, col },
                });
            }
        }
    }

    return pieces;
}

export async function POST(request: NextRequest) {
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

        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Générer un UUID unique pour la partie
        const gameUuid = randomUUID();

        // Initialiser le plateau
        const pieces = initializeBoard();

        // Créer la partie
        const game = await prisma.game.create({
            data: {
                uuid: gameUuid,
                status: 'waiting',
                whitePlayerId: user.id,
                currentTurn: 'white',
                pieces: pieces as unknown as Prisma.InputJsonValue,
                moves: [],
            },
        });

        return NextResponse.json({
            message: 'Partie créée avec succès',
            uuid: game.uuid,
            gameId: game.id,
        });

    } catch (error) {
        console.error('Erreur création partie:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la partie' },
            { status: 500 }
        );
    }
}

