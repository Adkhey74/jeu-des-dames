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

        // Récupérer les invitations en attente pour cet utilisateur
        const invitations = await prisma.gameInvitation.findMany({
            where: {
                inviteeId: payload.userId,
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
                        id: true,
                        uuid: true,
                        status: true,
                        whitePlayer: {
                            select: {
                                id: true,
                                username: true,
                                prenom: true,
                                nom: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            invitations: invitations.map(inv => ({
                id: inv.id,
                gameId: inv.gameId,
                gameUuid: inv.game.uuid,
                gameStatus: inv.game.status,
                inviter: inv.inviter,
                status: inv.status,
                createdAt: inv.createdAt,
            })),
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des invitations:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des invitations' },
            { status: 500 }
        );
    }
}

