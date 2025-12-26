'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
    const router = useRouter();
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la connexion');
            }

            // Stocker le token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Rediriger vers le dashboard
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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
        <div className="card w-full max-w-lg bg-white shadow-2xl border border-indigo-100 rounded-2xl">
            <div className="card-body p-8">
                {/* En-tête */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
                    <p className="text-gray-600 text-base">Connectez-vous à votre compte</p>
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
                            <span className="label-text text-gray-700 font-semibold text-sm">Adresse email</span>
                            <span className="label-text-alt text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="email@example.com"
                            className="input input-bordered w-full text-gray-900 placeholder:text-gray-400 focus:input-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all bg-white"
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
                            <span className="label-text text-gray-700 font-semibold text-sm">Mot de passe</span>
                            <span className="label-text-alt text-red-500">*</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="input input-bordered w-full text-gray-900 placeholder:text-gray-400 focus:input-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all bg-white"
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
                            className={`btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/50 w-full h-12 text-base font-semibold transition-all ${
                                loading ? 'loading' : ''
                            }`}
                            disabled={loading}
                            aria-label="Se connecter"
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Connexion en cours...
                                </>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </div>
                </form>

                <div className="divider my-6 text-gray-400">OU</div>

                <p className="text-center text-sm text-gray-600">
                    Pas encore de compte ?{' '}
                    <Link 
                        href="/register" 
                        className="link link-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                        aria-label="Aller à la page d'inscription"
                    >
                        S&apos;inscrire
                    </Link>
                </p>
            </div>
        </div>
    );
}

