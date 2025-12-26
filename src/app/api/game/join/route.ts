import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
        } catch (error) {
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

        // Récupérer le code de la partie
        const body = await request.json();
        let { uuid } = body;

        if (!uuid) {
            return NextResponse.json(
                { error: 'Code de partie requis' },
                { status: 400 }
            );
        }

        // Normaliser l'UUID : trim et convertir en minuscules
        uuid = uuid.trim().toLowerCase();

        // Trouver la partie
        const game = await prisma.game.findUnique({
            where: { uuid },
            include: {
                whitePlayer: true,
                blackPlayer: true,
            },
        });

        if (!game) {
            return NextResponse.json(
                { error: 'Partie non trouvée' },
                { status: 404 }
            );
        }

        // Vérifier si la partie est déjà pleine
        if (game.status !== 'waiting') {
            return NextResponse.json(
                { error: 'Cette partie n\'est plus disponible' },
                { status: 400 }
            );
        }

        // Vérifier si l'utilisateur n'est pas déjà dans la partie
        if (game.whitePlayerId === user.id) {
            return NextResponse.json(
                { error: 'Vous êtes déjà le créateur de cette partie' },
                { status: 400 }
            );
        }

        // Rejoindre la partie en tant que joueur noir
        const updatedGame = await prisma.game.update({
            where: { id: game.id },
            data: {
                blackPlayerId: user.id,
                status: 'playing',
                startedAt: new Date(),
            },
        });

        return NextResponse.json({
            message: 'Partie rejointe avec succès',
            uuid: updatedGame.uuid,
            gameId: updatedGame.id,
        });

    } catch (error) {
        console.error('Erreur rejoindre partie:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la connexion à la partie' },
            { status: 500 }
        );
    }
}

