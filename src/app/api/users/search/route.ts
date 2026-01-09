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

        // Récupérer le paramètre de recherche
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json(
                { error: 'La recherche doit contenir au moins 2 caractères' },
                { status: 400 }
            );
        }

        // Rechercher les utilisateurs par username (sans inclure l'utilisateur actuel)
        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: query.toLowerCase(),
                    mode: 'insensitive',
                },
                id: {
                    not: payload.userId,
                },
            },
            select: {
                id: true,
                username: true,
                prenom: true,
                nom: true,
            },
            take: 10,
        });

        return NextResponse.json({
            users: users.map(user => ({
                id: user.id,
                username: user.username,
                prenom: user.prenom,
                nom: user.nom,
            })),
        });
    } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la recherche d\'utilisateurs' },
            { status: 500 }
        );
    }
}

