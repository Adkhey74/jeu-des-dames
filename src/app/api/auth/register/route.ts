import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateVerificationToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nom, prenom, email, username, password } = body;

        // Validation
        if (!nom || !prenom || !email || !username || !password) {
            return NextResponse.json(
                { error: 'Tous les champs sont requis' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 8 caractères' },
                { status: 400 }
            );
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return NextResponse.json(
                    { error: 'Cet email est déjà utilisé' },
                    { status: 409 }
                );
            }
            if (existingUser.username === username) {
                return NextResponse.json(
                    { error: 'Ce nom d\'utilisateur est déjà pris' },
                    { status: 409 }
                );
            }
        }

        // Hasher le mot de passe
        const hashedPassword = await hashPassword(password);
        const verificationToken = generateVerificationToken();

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                nom,
                prenom,
                email,
                username,
                password: hashedPassword,
                verificationToken,
            },
        });

        // Créer les statistiques du joueur
        await prisma.playerStats.create({
            data: {
                userId: user.id,
            },
        });

        // TODO: Envoyer l'email de vérification
        // await sendVerificationEmail(user.email, verificationToken);

        return NextResponse.json({
            message: 'Inscription réussie ! Vérifiez votre email.',
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                username: user.username,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Erreur inscription:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'inscription' },
            { status: 500 }
        );
    }
}




