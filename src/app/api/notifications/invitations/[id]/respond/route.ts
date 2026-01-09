import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        // Récupérer la réponse (accept ou decline)
        const body = await request.json();
        const { action } = body; // 'accept' ou 'decline'

        if (!action || (action !== 'accept' && action !== 'decline')) {
            return NextResponse.json(
                { error: 'Action invalide. Utilisez "accept" ou "decline"' },
                { status: 400 }
            );
        }

        // Récupérer l'invitation
        const invitation = await prisma.gameInvitation.findUnique({
            where: { id: params.id },
            include: {
                game: {
                    include: {
                        whitePlayer: true,
                        blackPlayer: true,
                    },
                },
            },
        });

        if (!invitation) {
            return NextResponse.json(
                { error: 'Invitation non trouvée' },
                { status: 404 }
            );
        }

        // Vérifier que l'utilisateur est bien l'invité
        if (invitation.inviteeId !== payload.userId) {
            return NextResponse.json(
                { error: 'Vous n\'êtes pas autorisé à répondre à cette invitation' },
                { status: 403 }
            );
        }

        // Vérifier que l'invitation est toujours en attente
        if (invitation.status !== 'pending') {
            return NextResponse.json(
                { error: 'Cette invitation a déjà été traitée' },
                { status: 400 }
            );
        }

        if (action === 'accept') {
            // Vérifier que la partie n'a pas déjà un adversaire
            if (invitation.game.blackPlayerId) {
                // Mettre à jour l'invitation comme expirée
                await prisma.gameInvitation.update({
                    where: { id: invitation.id },
                    data: { status: 'expired' },
                });
                return NextResponse.json(
                    { error: 'Cette partie a déjà un adversaire' },
                    { status: 400 }
                );
            }

            // Mettre à jour la partie avec le joueur noir
            await prisma.game.update({
                where: { id: invitation.gameId },
                data: {
                    blackPlayerId: payload.userId,
                    status: 'playing',
                    startedAt: new Date(),
                },
            });

            // Mettre à jour l'invitation comme acceptée
            await prisma.gameInvitation.update({
                where: { id: invitation.id },
                data: { status: 'accepted' },
            });

            // Marquer toutes les autres invitations pour cette partie comme expirées
            await prisma.gameInvitation.updateMany({
                where: {
                    gameId: invitation.gameId,
                    status: 'pending',
                    id: { not: invitation.id },
                },
                data: { status: 'expired' },
            });

            return NextResponse.json({
                message: 'Invitation acceptée',
                gameUuid: invitation.game.uuid,
            });
        } else {
            // Refuser l'invitation
            await prisma.gameInvitation.update({
                where: { id: invitation.id },
                data: { status: 'declined' },
            });

            return NextResponse.json({
                message: 'Invitation refusée',
            });
        }
    } catch (error) {
        console.error('Erreur lors de la réponse à l\'invitation:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la réponse à l\'invitation' },
            { status: 500 }
        );
    }
}
