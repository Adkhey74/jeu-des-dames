import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            );
        }

        // Validation format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format d\'email invalide' },
                { status: 400 }
            );
        }

        // Trouver l'utilisateur
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { email: email.toLowerCase().trim() },
            });
        } catch (dbError: unknown) {
            console.error('❌ Erreur base de données:', dbError);
            
            // Messages d'erreur plus spécifiques
            let errorMessage = 'Erreur de connexion à la base de données';
            if (dbError && typeof dbError === 'object' && 'message' in dbError) {
                const message = String(dbError.message);
                if (message.includes('Can\'t reach database server') || message.includes('Connection')) {
                    errorMessage = 'Impossible de se connecter à la base de données. Vérifiez la configuration DATABASE_URL dans .env';
                } else if (message.includes('P1001') || message.includes('does not exist')) {
                    errorMessage = 'La base de données n\'existe pas. Exécutez: npx prisma migrate dev';
                } else if (message.includes('P1002') || message.includes('timeout')) {
                    errorMessage = 'Timeout de connexion à la base de données. Vérifiez l\'accessibilité du serveur.';
                }
            }
            
            return NextResponse.json(
                { error: errorMessage },
                { status: 500 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            );
        }

        // Vérifier le mot de passe
        let isValidPassword = false;
        try {
            isValidPassword = await comparePassword(password, user.password);
        } catch (hashError) {
            console.error('Erreur vérification mot de passe:', hashError);
            return NextResponse.json(
                { error: 'Erreur lors de la vérification du mot de passe' },
                { status: 500 }
            );
        }

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            );
        }

        // Vérifier si l'email est vérifié
        if (!user.isVerified) {
            return NextResponse.json(
                { 
                    error: 'Votre email n\'est pas vérifié. Veuillez vérifier votre boîte mail ou demander un nouvel email de vérification.',
                    requiresVerification: true,
                    email: user.email
                },
                { status: 403 }
            );
        }

        // Générer le token JWT
        let token;
        try {
            token = generateToken({
                userId: user.id,
                email: user.email,
            });
        } catch (tokenError) {
            console.error('Erreur génération token:', tokenError);
            return NextResponse.json(
                { error: 'Erreur lors de la génération du token' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                username: user.username,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        
        // Vérifier si c'est une erreur de parsing JSON
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Format de données invalide' },
                { status: 400 }
            );
        }

        // Vérifier si c'est une erreur Prisma/Base de données
        if (error && typeof error === 'object' && 'message' in error) {
            const message = String(error.message);
            if (message.includes('P1001') || message.includes('Can\'t reach database')) {
                return NextResponse.json(
                    { error: 'Impossible de se connecter à la base de données. Vérifiez la configuration DATABASE_URL dans .env et que la base de données est accessible.' },
                    { status: 500 }
                );
            }
            if (message.includes('P2002') || message.includes('Unique constraint')) {
                return NextResponse.json(
                    { error: 'Cet email est déjà utilisé' },
                    { status: 409 }
                );
            }
            if (message.includes('PrismaClient') || message.includes('generated')) {
                return NextResponse.json(
                    { error: 'Erreur Prisma Client. Exécutez: npx prisma generate' },
                    { status: 500 }
                );
            }
        }

        // Erreur générique
        return NextResponse.json(
            { error: 'Erreur lors de la connexion. Veuillez réessayer.' },
            { status: 500 }
        );
    }
}




