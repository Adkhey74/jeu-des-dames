'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
        if (token) {
            verifyEmail(token);
        }
    }, [searchParams]);

    const verifyEmail = async (token: string) => {
        setStatus('loading');
        try {
            const response = await fetch(`/api/auth/verify-email?token=${token}`);
            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Email vérifié avec succès !');
                showToast('Email vérifié avec succès !', 'success');
                // Rediriger vers la page de connexion après 2 secondes
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Erreur lors de la vérification');
                showToast(data.error || 'Erreur lors de la vérification', 'error');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Erreur de communication avec le serveur');
            showToast('Erreur de communication avec le serveur', 'error');
        }
    };

    const resendVerificationEmail = async () => {
        if (!email) {
            showToast('Veuillez entrer votre email', 'error');
            return;
        }

        setResending(true);
        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Email de vérification envoyé !', 'success');
                setMessage('Un nouvel email de vérification a été envoyé à votre adresse.');
            } else {
                showToast(data.error || 'Erreur lors de l\'envoi', 'error');
            }
        } catch (error) {
            showToast('Erreur de communication avec le serveur', 'error');
        } finally {
            setResending(false);
        }
    };

    return (
        <>
            <Navbar />
            <Header />
            <main className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20 p-4 lg:p-6 xl:p-8 bg-gradient-gaming">
                <div className="max-w-md mx-auto mt-20">
                    <div className="card bg-white shadow-xl border-2 border-black">
                        <div className="card-body text-center">
                            {status === 'loading' && (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <span className="loading loading-spinner loading-lg text-black"></span>
                                    </div>
                                    <h2 className="card-title justify-center text-2xl text-black mb-4">
                                        Vérification en cours...
                                    </h2>
                                    <p className="text-gray-600">Veuillez patienter</p>
                                </>
                            )}

                            {status === 'success' && (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="card-title justify-center text-2xl text-black mb-4">
                                        Email vérifié !
                                    </h2>
                                    <p className="text-gray-600 mb-6">{message}</p>
                                    <p className="text-sm text-gray-500 mb-4">Redirection vers la page de connexion...</p>
                                    <Link href="/login" className="btn bg-black text-white border-0 hover:bg-gray-800">
                                        Aller à la connexion
                                    </Link>
                                </>
                            )}

                            {status === 'error' && (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="card-title justify-center text-2xl text-black mb-4">
                                        Erreur de vérification
                                    </h2>
                                    <p className="text-gray-600 mb-6">{message}</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="label">
                                                <span className="label-text text-black">Votre email</span>
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="votre@email.com"
                                                className="input input-bordered w-full bg-white text-black border-black"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={resendVerificationEmail}
                                            disabled={resending}
                                            className="btn bg-black text-white border-0 hover:bg-gray-800 w-full"
                                        >
                                            {resending ? (
                                                <>
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                'Renvoyer l\'email de vérification'
                                            )}
                                        </button>
                                        <Link href="/login" className="btn btn-ghost w-full border border-gray-300 text-black hover:bg-gray-100">
                                            Retour à la connexion
                                        </Link>
                                    </div>
                                </>
                            )}

                            {status === 'idle' && (
                                <>
                                    <h2 className="card-title justify-center text-2xl text-black mb-4">
                                        Vérification d'email
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Si vous avez reçu un email de vérification, cliquez sur le lien dans l'email.
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="label">
                                                <span className="label-text text-black">Votre email</span>
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="votre@email.com"
                                                className="input input-bordered w-full bg-white text-black border-black"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={resendVerificationEmail}
                                            disabled={resending}
                                            className="btn bg-black text-white border-0 hover:bg-gray-800 w-full"
                                        >
                                            {resending ? (
                                                <>
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                'Renvoyer l\'email de vérification'
                                            )}
                                        </button>
                                        <Link href="/login" className="btn btn-ghost w-full border border-gray-300 text-black hover:bg-gray-100">
                                            Retour à la connexion
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

