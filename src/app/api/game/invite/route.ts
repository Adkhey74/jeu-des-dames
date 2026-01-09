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
        } catch {
            return NextResponse.json(
                { error: 'Token invalide' },
                { status: 401 }
            );
        }

        // Vérifier que l'utilisateur existe
        const inviter = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!inviter) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Récupérer les données de la requête
        const body = await request.json();
        const { gameId, inviteeUsername } = body;

        if (!gameId || !inviteeUsername) {
            return NextResponse.json(
                { error: 'gameId et inviteeUsername sont requis' },
                { status: 400 }
            );
        }

        // Vérifier que la partie existe et que l'utilisateur est le créateur
        const game = await prisma.game.findUnique({
            where: { id: gameId },
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

        // Vérifier que l'utilisateur est le créateur de la partie (whitePlayer)
        if (game.whitePlayerId !== inviter.id) {
            return NextResponse.json(
                { error: 'Vous n\'êtes pas autorisé à inviter des joueurs à cette partie' },
                { status: 403 }
            );
        }

        // Vérifier que la partie n'est pas déjà complète
        if (game.blackPlayerId) {
            return NextResponse.json(
                { error: 'Cette partie a déjà un adversaire' },
                { status: 400 }
            );
        }

        // Trouver l'utilisateur invité
        const invitee = await prisma.user.findUnique({
            where: { username: inviteeUsername },
        });

        if (!invitee) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier qu'on ne s'invite pas soi-même
        if (invitee.id === inviter.id) {
            return NextResponse.json(
                { error: 'Vous ne pouvez pas vous inviter vous-même' },
                { status: 400 }
            );
        }

        // Vérifier qu'il n'y a pas déjà une invitation en attente
        const existingInvitation = await prisma.gameInvitation.findUnique({
            where: {
                gameId_inviteeId: {
                    gameId: game.id,
                    inviteeId: invitee.id,
                },
            },
        });

        if (existingInvitation && existingInvitation.status === 'pending') {
            return NextResponse.json(
                { error: 'Une invitation est déjà en attente pour cet utilisateur' },
                { status: 400 }
            );
        }

        // Créer l'invitation
        const invitation = await prisma.gameInvitation.create({
            data: {
                gameId: game.id,
                inviterId: inviter.id,
                inviteeId: invitee.id,
                status: 'pending',
            },
            include: {
                inviter: {
                    select: {
                        id: true,
                        username: true,
                        prenom: true,
                        nom: true,
                    },
                },
                game: {
                    select: {
                        uuid: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Invitation envoyée avec succès',
            invitation: {
                id: invitation.id,
                gameId: invitation.gameId,
                gameUuid: invitation.game.uuid,
                inviter: invitation.inviter,
                status: invitation.status,
                createdAt: invitation.createdAt,
            },
        });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'invitation:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'envoi de l\'invitation' },
            { status: 500 }
        );
    }
}
