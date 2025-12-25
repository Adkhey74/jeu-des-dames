'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation du mot de passe
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...registerData } = formData;

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'inscription');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
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

    if (success) {
        return (
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="alert alert-success">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-bold">Inscription réussie !</h3>
                            <div className="text-xs">Vérifiez votre email pour activer votre compte. Redirection...</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title text-2xl font-bold text-center justify-center mb-4 text-indigo-700">
                    Inscription
                </h2>

                {error && (
                    <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-slate-700 font-semibold">Prénom</span>
                            </label>
                            <input
                                type="text"
                                name="prenom"
                                placeholder="Jean"
                                className="input input-bordered w-full"
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-slate-700 font-semibold">Nom</span>
                            </label>
                            <input
                                type="text"
                                name="nom"
                                placeholder="Dupont"
                                className="input input-bordered w-full"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-slate-700 font-semibold">Email</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="email@example.com"
                            className="input input-bordered w-full"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-slate-700 font-semibold">Nom d'utilisateur</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="jean.dupont"
                            className="input input-bordered w-full"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-slate-700 font-semibold">Mot de passe</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="input input-bordered w-full"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <label className="label">
                            <span className="label-text-alt">Au moins 8 caractères</span>
                        </label>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-slate-700 font-semibold">Confirmer le mot de passe</span>
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            className="input input-bordered w-full"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-control mt-6">
                        <button
                            type="submit"
                            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Inscription...' : 'S\'inscrire'}
                        </button>
                    </div>
                </form>

                <div className="divider">OU</div>

                <p className="text-center text-sm">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="link link-primary">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}

