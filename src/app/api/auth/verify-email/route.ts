import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Token de vérification manquant' },
                { status: 400 }
            );
        }

        // Trouver l'utilisateur avec ce token
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Token de vérification invalide ou expiré' },
                { status: 400 }
            );
        }

        // Vérifier si l'email est déjà vérifié
        if (user.isVerified) {
            return NextResponse.json(
                { message: 'Votre email est déjà vérifié' },
                { status: 200 }
            );
        }

        // Mettre à jour l'utilisateur
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null, // Supprimer le token après vérification
            },
        });

        return NextResponse.json({
            message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Erreur vérification email:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la vérification de l\'email' },
            { status: 500 }
        );
    }
}

// Route POST pour renvoyer l'email de vérification
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
                { status: 400 }
            );
        }

        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            // Ne pas révéler si l'email existe ou non pour la sécurité
            return NextResponse.json({
                message: 'Si cet email existe et n\'est pas vérifié, un email de vérification a été envoyé.',
            }, { status: 200 });
        }

        // Si déjà vérifié, ne rien faire
        if (user.isVerified) {
            return NextResponse.json({
                message: 'Cet email est déjà vérifié.',
            }, { status: 200 });
        }

        // Générer un nouveau token
        const { generateVerificationToken } = await import('@/lib/auth');
        const newToken = generateVerificationToken();

        // Mettre à jour le token
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: newToken },
        });

        // Envoyer l'email
        const { sendVerificationEmail } = await import('@/lib/email');
        await sendVerificationEmail(user.email, newToken);

        return NextResponse.json({
            message: 'Email de vérification envoyé avec succès.',
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Erreur renvoi email:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'envoi de l\'email de vérification' },
            { status: 500 }
        );
    }
}
