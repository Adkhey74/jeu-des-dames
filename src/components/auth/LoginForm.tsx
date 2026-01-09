'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

export default function LoginForm() {
    const router = useRouter();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            // Vérifier si la réponse est OK avant de parser le JSON
            let data;
            try {
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Le serveur a retourné une réponse invalide');
                }
                data = await response.json();
            } catch (parseError) {
                console.error('Erreur parsing JSON:', parseError);
                throw new Error('Erreur de communication avec le serveur. Veuillez vérifier que le serveur est démarré.');
            }

            if (!response.ok) {
                // Si l'email n'est pas vérifié, rediriger vers la page de vérification
                if (response.status === 403 && data?.requiresVerification) {
                    showToast('Votre email n\'est pas vérifié. Veuillez vérifier votre boîte mail.', 'error');
                    router.push(`/verify-email?email=${encodeURIComponent(data.email || formData.email)}`);
                    return;
                }
                
                const errorMessage = data?.error || `Erreur ${response.status}: ${response.statusText}`;
                setError(errorMessage);
                showToast(errorMessage, 'error');
                return;
            }

            // Vérifier que le token et l'utilisateur sont présents
            if (!data.token || !data.user) {
                throw new Error('Réponse invalide du serveur');
            }

            // Stocker le token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Afficher un toast de succès
            showToast('Connexion réussie ! Redirection en cours...', 'success');

            // Rediriger vers le dashboard
            setTimeout(() => {
                router.push('/dashboard');
            }, 500);
        } catch (err) {
            console.error('Erreur connexion:', err);
            let errorMessage = 'Une erreur est survenue lors de la connexion';
            
            if (err instanceof TypeError && err.message.includes('fetch')) {
                errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré (npm run dev)';
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="card w-full max-w-lg bg-white shadow-2xl border border-gray-200 rounded-2xl">
            <div className="card-body p-8">
                {/* En-tête */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black mb-4 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-black mb-2">Connexion</h1>
                    <p className="text-gray-700 text-base">Connectez-vous à votre compte</p>
                </div>

                {error && (
                    <div className="alert alert-error shadow-lg mb-6" role="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="form-control">
                        <label htmlFor="email" className="label py-2">
                            <span className="label-text text-black font-semibold text-sm">Adresse email</span>
                            <span className="label-text-alt text-black">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="email@example.com"
                            className="input input-bordered w-full text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all bg-white border-gray-300"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            aria-required="true"
                            aria-label="Adresse email"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-control">
                        <label htmlFor="password" className="label py-2">
                            <span className="label-text text-black font-semibold text-sm">Mot de passe</span>
                            <span className="label-text-alt text-black">*</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="input input-bordered w-full text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all bg-white border-gray-300"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            aria-required="true"
                            aria-label="Mot de passe"
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="form-control mt-8">
                        <button
                            type="submit"
                            className={`btn bg-black text-white border-0 hover:bg-gray-800 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 w-full h-12 text-base font-semibold transition-all relative overflow-hidden ${
                                loading ? 'cursor-wait' : ''
                            }`}
                            disabled={loading}
                            aria-label="Se connecter"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="animate-pulse">Connexion en cours...</span>
                                </span>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </div>
                </form>

                <div className="divider my-6 text-gray-400">OU</div>

                <p className="text-center text-sm text-black">
                    Pas encore de compte ?{' '}
                    <Link 
                        href="/register" 
                        className="link text-black font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded underline"
                        aria-label="Aller à la page d'inscription"
                    >
                        S&apos;inscrire
                    </Link>
                </p>
            </div>
        </div>
    );
}

