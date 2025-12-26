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
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const calculatePasswordStrength = (password: string): number => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return Math.min(strength, 4);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Validation en temps réel du mot de passe
        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }

        // Vérification de correspondance des mots de passe
        if (name === 'confirmPassword' || name === 'password') {
            if (name === 'confirmPassword') {
                setPasswordMatch(value === formData.password && value.length > 0);
            } else {
                setPasswordMatch(formData.confirmPassword === value && formData.confirmPassword.length > 0);
            }
        }
    };

    if (success) {
        return (
            <div className="card w-full max-w-lg bg-white shadow-2xl border border-gray-200">
                <div className="card-body p-8">
                    <div className="alert alert-success shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-bold text-lg">Inscription réussie !</h3>
                            <div className="text-sm mt-1">Vérifiez votre email pour activer votre compte. Redirection en cours...</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getPasswordStrengthLabel = () => {
        const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
        return { label: labels[passwordStrength] || '', color: colors[passwordStrength] || 'bg-gray-300' };
    };

    const strengthInfo = getPasswordStrengthLabel();

    return (
        <div className="card w-full max-w-lg bg-white shadow-2xl border border-indigo-100 rounded-2xl">
            <div className="card-body p-8">
                {/* En-tête */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
                    <p className="text-gray-600 text-base">Rejoignez-nous pour commencer à jouer</p>
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
                    {/* Prénom et Nom */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label htmlFor="prenom" className="label py-2">
                                <span className="label-text text-gray-700 font-semibold text-sm">Prénom</span>
                                <span className="label-text-alt text-red-500">*</span>
                            </label>
                            <input
                                id="prenom"
                                type="text"
                                name="prenom"
                                placeholder="Jean"
                                className="input input-bordered w-full text-gray-900 placeholder:text-gray-400 focus:input-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all bg-white"
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                                aria-required="true"
                                aria-label="Prénom"
                            />
                        </div>

                        <div className="form-control">
                            <label htmlFor="nom" className="label py-2">
                                <span className="label-text text-gray-700 font-semibold text-sm">Nom</span>
                                <span className="label-text-alt text-red-500">*</span>
                            </label>
                            <input
                                id="nom"
                                type="text"
                                name="nom"
                                placeholder="Dupont"
                                className="input input-bordered w-full text-gray-900 placeholder:text-gray-400 focus:input-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all bg-white"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                                aria-required="true"
                                aria-label="Nom"
                            />
                        </div>
                    </div>

                    {/* Email */}
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

                    {/* Nom d'utilisateur */}
                    <div className="form-control">
                        <label htmlFor="username" className="label py-2">
                            <span className="label-text text-gray-700 font-semibold text-sm">Nom d&apos;utilisateur</span>
                            <span className="label-text-alt text-red-500">*</span>
                        </label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="jean.dupont"
                            className="input input-bordered w-full text-gray-900 placeholder:text-gray-400 focus:input-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all bg-white"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            aria-required="true"
                            aria-label="Nom d'utilisateur"
                            autoComplete="username"
                        />
                        <label className="label">
                            <span className="label-text-alt text-gray-500">Ce nom sera visible par les autres joueurs</span>
                        </label>
                    </div>

                    {/* Mot de passe */}
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
                            className={`input input-bordered w-full text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all bg-white ${
                                formData.password && passwordStrength < 2 ? 'input-error' : ''
                            }`}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            aria-required="true"
                            aria-label="Mot de passe"
                            autoComplete="new-password"
                        />
                        {formData.password && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                                            style={{ width: `${((passwordStrength + 1) / 5) * 100}%` }}
                                            role="progressbar"
                                            aria-valuenow={passwordStrength + 1}
                                            aria-valuemin={0}
                                            aria-valuemax={5}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${
                                        passwordStrength < 2 ? 'text-red-600' :
                                        passwordStrength < 3 ? 'text-orange-600' :
                                        passwordStrength < 4 ? 'text-yellow-600' :
                                        'text-green-600'
                                    }`}>
                                        {strengthInfo.label}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                                        {formData.password.length >= 8 ? '✓' : '○'} Au moins 8 caractères
                                    </p>
                                    <p className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                                        {/\d/.test(formData.password) ? '✓' : '○'} Contient un chiffre
                                    </p>
                                </div>
                            </div>
                        )}
                        {!formData.password && (
                            <label className="label">
                                <span className="label-text-alt text-gray-500">Minimum 8 caractères</span>
                            </label>
                        )}
                    </div>

                    {/* Confirmation mot de passe */}
                    <div className="form-control">
                        <label htmlFor="confirmPassword" className="label py-2">
                            <span className="label-text text-gray-700 font-semibold text-sm">Confirmer le mot de passe</span>
                            <span className="label-text-alt text-red-500">*</span>
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            className={`input input-bordered w-full text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all bg-white ${
                                formData.confirmPassword && passwordMatch === false ? 'input-error' : ''
                            } ${formData.confirmPassword && passwordMatch === true ? 'input-success' : ''}`}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            aria-required="true"
                            aria-label="Confirmer le mot de passe"
                            autoComplete="new-password"
                        />
                        {formData.confirmPassword && (
                            <label className="label">
                                {passwordMatch === true ? (
                                    <span className="label-text-alt text-green-600 font-medium">
                                        ✓ Les mots de passe correspondent
                                    </span>
                                ) : passwordMatch === false ? (
                                    <span className="label-text-alt text-red-600 font-medium">
                                        ✗ Les mots de passe ne correspondent pas
                                    </span>
                                ) : null}
                            </label>
                        )}
                    </div>

                    {/* Bouton de soumission */}
                    <div className="form-control mt-8">
                        <button
                            type="submit"
                            className={`btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/50 w-full h-12 text-base font-semibold transition-all ${
                                loading ? 'loading' : ''
                            }`}
                            disabled={loading || (formData.confirmPassword.length > 0 && passwordMatch === false)}
                            aria-label="S'inscrire"
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Inscription en cours...
                                </>
                            ) : (
                                'Créer mon compte'
                            )}
                        </button>
                    </div>
                </form>

                {/* Séparateur */}
                <div className="divider my-6 text-gray-400">OU</div>

                {/* Lien vers connexion */}
                <p className="text-center text-sm text-gray-600">
                    Déjà un compte ?{' '}
                    <Link 
                        href="/login" 
                        className="link link-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                        aria-label="Aller à la page de connexion"
                    >
                        Se connecter
                    </Link>
                </p>

                {/* Mentions légales */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    En vous inscrivant, vous acceptez nos{' '}
                    <Link href="#" className="link link-hover underline">conditions d&apos;utilisation</Link>
                    {' '}et notre{' '}
                    <Link href="#" className="link link-hover underline">politique de confidentialité</Link>
                </p>
            </div>
        </div>
    );
}

