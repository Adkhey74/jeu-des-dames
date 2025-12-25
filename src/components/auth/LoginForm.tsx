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
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title text-2xl font-bold text-center justify-center mb-4 text-blue-800">
                    Connexion
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
                    </div>

                    <div className="form-control mt-6">
                        <button
                            type="submit"
                            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </div>
                </form>

                <div className="divider">OU</div>

                <p className="text-center text-sm">
                    Pas encore de compte ?{' '}
                    <Link href="/register" className="link link-primary">
                        S&apos;inscrire
                    </Link>
                </p>
            </div>
        </div>
    );
}

