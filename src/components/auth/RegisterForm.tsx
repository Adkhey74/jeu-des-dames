'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

export default function RegisterForm() {
    const router = useRouter();
    const { showToast } = useToast();
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
            const errorMessage = 'Les mots de passe ne correspondent pas';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            const errorMessage = 'Le mot de passe doit contenir au moins 8 caractères';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            setLoading(false);
            return;
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            const errorMessage = 'Veuillez entrer une adresse email valide';
            setError(errorMessage);
            showToast(errorMessage, 'error');
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
                const errorMessage = data?.error || `Erreur ${response.status}: ${response.statusText}`;
                setError(errorMessage);
                showToast(errorMessage, 'error');
                return;
            }

            // Vérifier que l'utilisateur est créé
            if (!data.user) {
                throw new Error('Réponse invalide du serveur');
            }

            setSuccess(true);
            showToast('Inscription réussie ! Redirection vers la page de connexion...', 'success');
            
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            console.error('Erreur inscription:', err);
            let errorMessage = 'Une erreur est survenue lors de l\'inscription';
            
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
            <div className="card w-full max-w-lg bg-white shadow-2xl border-2 border-black rounded-2xl overflow-hidden">
                <div className="card-body p-12">
                    <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Icône de succès animée */}
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center shadow-2xl animate-in zoom-in duration-500">
                                <svg 
                                    className="w-12 h-12 text-white stroke-current" 
                                    fill="none" 
                                    viewBox="0 0 24 24"
                                    strokeWidth="3"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        d="M5 13l4 4L19 7"
                                        style={{
                                            strokeDasharray: 24,
                                            strokeDashoffset: 24,
                                            animation: 'drawCheck 0.6s ease-out 0.5s forwards'
                                        }}
                                    />
                                </svg>
                            </div>
                            {/* Cercles animés autour */}
                            <div className="absolute inset-0 rounded-full border-4 border-black opacity-20 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-black opacity-30 animate-pulse"></div>
                        </div>

                        {/* Titre */}
                        <h2 className="text-3xl font-bold text-black mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                            Inscription réussie !
                        </h2>

                        {/* Message */}
                        <div className="space-y-3 mb-8 animate-in fade-in duration-500 delay-500">
                            <p className="text-gray-700 text-base leading-relaxed">
                                Un email de vérification a été envoyé à votre adresse email.
                            </p>
                            <p className="text-gray-600 text-sm">
                                Veuillez cliquer sur le lien dans l&apos;email pour activer votre compte.
                            </p>
                        </div>

                        {/* Animation de chargement pour la redirection */}
                        <div className="flex items-center gap-2 text-gray-600 text-sm animate-pulse">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Redirection vers la page de connexion...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getPasswordStrengthLabel = () => {
        const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
        const colors = ['bg-gray-900', 'bg-gray-700', 'bg-gray-600', 'bg-gray-800', 'bg-black'];
        return { label: labels[passwordStrength] || '', color: colors[passwordStrength] || 'bg-gray-300' };
    };

    const strengthInfo = getPasswordStrengthLabel();

    return (
        <div className="card w-full max-w-lg bg-white shadow-2xl border border-indigo-100 rounded-2xl">
            <div className="card-body p-8">
                {/* En-tête */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black mb-4 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-black mb-2">Créer un compte</h1>
                    <p className="text-gray-700 text-base">Rejoignez-nous pour commencer à jouer</p>
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
                                <span className="label-text text-black font-semibold text-sm">Prénom</span>
                                <span className="label-text-alt text-black">*</span>
                            </label>
                            <input
                                id="prenom"
                                type="text"
                                name="prenom"
                                placeholder="Jean"
                                className="input input-bordered w-full text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all bg-white border-gray-300"
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                                aria-required="true"
                                aria-label="Prénom"
                            />
                        </div>

                        <div className="form-control">
                            <label htmlFor="nom" className="label py-2">
                                <span className="label-text text-black font-semibold text-sm">Nom</span>
                                <span className="label-text-alt text-black">*</span>
                            </label>
                            <input
                                id="nom"
                                type="text"
                                name="nom"
                                placeholder="Dupont"
                                className="input input-bordered w-full text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all bg-white border-gray-300"
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

                    {/* Nom d'utilisateur */}
                    <div className="form-control">
                        <label htmlFor="username" className="label py-2">
                            <span className="label-text text-black font-semibold text-sm">Nom d&apos;utilisateur</span>
                            <span className="label-text-alt text-black">*</span>
                        </label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="jean.dupont"
                            className="input input-bordered w-full text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all bg-white border-gray-300"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            aria-required="true"
                            aria-label="Nom d'utilisateur"
                            autoComplete="username"
                        />
                        <label className="label">
                            <span className="label-text-alt text-gray-600">Ce nom sera visible par les autres joueurs</span>
                        </label>
                    </div>

                    {/* Mot de passe */}
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
                            className={`input input-bordered w-full text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all bg-white border-gray-300 ${
                                formData.password && passwordStrength < 2 ? 'border-black' : ''
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
                                        passwordStrength < 2 ? 'text-black' :
                                        passwordStrength < 3 ? 'text-gray-800' :
                                        passwordStrength < 4 ? 'text-gray-700' :
                                        'text-black'
                                    }`}>
                                        {strengthInfo.label}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-700 space-y-1">
                                    <p className={formData.password.length >= 8 ? 'text-black font-semibold' : 'text-gray-600'}>
                                        {formData.password.length >= 8 ? '✓' : '○'} Au moins 8 caractères
                                    </p>
                                    <p className={/\d/.test(formData.password) ? 'text-black font-semibold' : 'text-gray-600'}>
                                        {/\d/.test(formData.password) ? '✓' : '○'} Contient un chiffre
                                    </p>
                                </div>
                            </div>
                        )}
                        {!formData.password && (
                            <label className="label">
                                <span className="label-text-alt text-gray-600">Minimum 8 caractères</span>
                            </label>
                        )}
                    </div>

                    {/* Confirmation mot de passe */}
                    <div className="form-control">
                        <label htmlFor="confirmPassword" className="label py-2">
                            <span className="label-text text-black font-semibold text-sm">Confirmer le mot de passe</span>
                            <span className="label-text-alt text-black">*</span>
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            className={`input input-bordered w-full text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all bg-white border-gray-300 ${
                                formData.confirmPassword && passwordMatch === false ? 'border-black' : ''
                            } ${formData.confirmPassword && passwordMatch === true ? 'border-black' : ''}`}
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
                                    <span className="label-text-alt text-black font-semibold">
                                        ✓ Les mots de passe correspondent
                                    </span>
                                ) : passwordMatch === false ? (
                                    <span className="label-text-alt text-black font-semibold">
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
                            className={`btn bg-black text-white border-0 hover:bg-gray-800 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 w-full h-12 text-base font-semibold transition-all relative overflow-hidden ${
                                loading ? 'cursor-wait' : ''
                            }`}
                            disabled={loading || (formData.confirmPassword.length > 0 && passwordMatch === false)}
                            aria-label="S'inscrire"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="animate-pulse">Inscription en cours...</span>
                                </span>
                            ) : (
                                'Créer mon compte'
                            )}
                        </button>
                    </div>
                </form>

                {/* Séparateur */}
                <div className="divider my-6 text-gray-400">OU</div>

                {/* Lien vers connexion */}
                <p className="text-center text-sm text-black">
                    Déjà un compte ?{' '}
                    <Link 
                        href="/login" 
                        className="link text-black font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded underline"
                        aria-label="Aller à la page de connexion"
                    >
                        Se connecter
                    </Link>
                </p>

                {/* Mentions légales */}
                <p className="text-center text-xs text-gray-600 mt-6">
                    En vous inscrivant, vous acceptez nos{' '}
                    <Link href="#" className="link link-hover underline text-black">conditions d&apos;utilisation</Link>
                    {' '}et notre{' '}
                    <Link href="#" className="link link-hover underline text-black">politique de confidentialité</Link>
                </p>
            </div>
        </div>
    );
}

