import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateVerificationToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nom, prenom, email, username, password } = body;

        // Validation des champs obligatoires
        if (!nom || !prenom || !email || !username || !password) {
            return NextResponse.json(
                { error: 'Tous les champs sont requis' },
                { status: 400 }
            );
        }

        // Normaliser les données
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();

        // Validation format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return NextResponse.json(
                { error: 'Format d\'email invalide' },
                { status: 400 }
            );
        }

        // Validation du nom d'utilisateur (alphanumerique et underscore)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(normalizedUsername)) {
            return NextResponse.json(
                { error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores' },
                { status: 400 }
            );
        }

        // Validation longueur nom d'utilisateur
        if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
            return NextResponse.json(
                { error: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères' },
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
        let existingUser;
        try {
            existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: normalizedEmail },
                        { username: normalizedUsername }
                    ]
                }
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

        if (existingUser) {
            if (existingUser.email === normalizedEmail) {
                return NextResponse.json(
                    { error: 'Cet email est déjà utilisé' },
                    { status: 409 }
                );
            }
            if (existingUser.username === normalizedUsername) {
                return NextResponse.json(
                    { error: 'Ce nom d\'utilisateur est déjà pris' },
                    { status: 409 }
                );
            }
        }

        // Hasher le mot de passe
        let hashedPassword;
        try {
            hashedPassword = await hashPassword(password);
        } catch (hashError) {
            console.error('Erreur hachage mot de passe:', hashError);
            return NextResponse.json(
                { error: 'Erreur lors du traitement du mot de passe' },
                { status: 500 }
            );
        }

        const verificationToken = generateVerificationToken();

        // Créer l'utilisateur
        let user;
        try {
            user = await prisma.user.create({
                data: {
                    nom: nom.trim(),
                    prenom: prenom.trim(),
                    email: normalizedEmail,
                    username: normalizedUsername,
                    password: hashedPassword,
                    verificationToken,
                },
            });
        } catch (createError: unknown) {
            console.error('Erreur création utilisateur:', createError);
            // Vérifier si c'est une erreur de contrainte unique Prisma
            if (createError && typeof createError === 'object' && 'code' in createError && createError.code === 'P2002') {
                return NextResponse.json(
                    { error: 'Cet email ou nom d\'utilisateur est déjà utilisé' },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                { error: 'Erreur lors de la création du compte' },
                { status: 500 }
            );
        }

        // Créer les statistiques du joueur
        try {
            await prisma.playerStats.create({
                data: {
                    userId: user.id,
                },
            });
        } catch (statsError) {
            console.error('Erreur création stats:', statsError);
            // On continue même si les stats ne sont pas créées
        }

        // Envoyer l'email de vérification
        try {
            const { sendVerificationEmail } = await import('@/lib/email');
            await sendVerificationEmail(user.email, verificationToken);
        } catch (emailError) {
            console.error('Erreur envoi email:', emailError);
            // On continue même si l'email n'a pas pu être envoyé
            // L'utilisateur pourra demander un renvoi plus tard
        }

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
        console.error('❌ Erreur inscription:', error);
        
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
                    { error: 'Cet email ou nom d\'utilisateur est déjà utilisé' },
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
            { error: 'Erreur lors de l\'inscription. Veuillez réessayer.' },
            { status: 500 }
        );
    }
}




