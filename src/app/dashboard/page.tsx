'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { User } from '@/types';

interface UserStats {
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    totalScore: number;
    winRate: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [gameCode, setGameCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [creatingGame, setCreatingGame] = useState(false);
    const [joiningGame, setJoiningGame] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState<UserStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const loadStats = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setStatsLoading(true);
        try {
            // Charger les statistiques
            const statsResponse = await fetch('/api/scores/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }
        } catch (err) {
            console.error('Erreur chargement stats:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(storedUser));
        loadStats();
    }, [router]);

    // Recharger les stats quand la page redevient visible (après une partie)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadStats();
            }
        };

        const handleFocus = () => {
            loadStats();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const createGame = async () => {
        setCreatingGame(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/game/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Vérifier si la réponse est du JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Réponse non-JSON:', text.substring(0, 200));
                throw new Error('Erreur serveur : réponse invalide');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création de la partie');
            }

            setGameCode(data.uuid);
            // Petit délai pour montrer le succès avant la redirection
            await new Promise(resolve => setTimeout(resolve, 500));
            // Rediriger vers la partie
            router.push(`/game/${data.uuid}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            setCreatingGame(false);
        }
    };

    const joinGame = async () => {
        if (!joinCode.trim()) {
            setError('Veuillez entrer un code de partie');
            return;
        }

        setJoiningGame(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Normaliser le code avant l'envoi
            const normalizedCode = joinCode.trim().toLowerCase();

            const response = await fetch('/api/game/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ uuid: normalizedCode }),
            });

            // Vérifier si la réponse est du JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Réponse non-JSON:', text.substring(0, 200));
                throw new Error('Erreur serveur : réponse invalide');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la connexion à la partie');
            }

            // Petit délai pour montrer le succès avant la redirection
            await new Promise(resolve => setTimeout(resolve, 500));
            // Rediriger vers la partie avec le code normalisé
            router.push(`/game/${normalizedCode}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            setJoiningGame(false);
        }
    };

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen ml-20 lg:ml-64 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen ml-20 lg:ml-64 p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
                <div className="w-full">
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Bienvenue, {user.prenom} {user.nom} !
                        </h1>
                        <p className="text-slate-600 text-lg">Gérez vos parties et suivez vos performances</p>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 mb-6 xl:mb-8">
                        {/* Créer une partie */}
                        <div className="card bg-white shadow-xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative">
                            {creatingGame && (
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-3xl">🎮</span>
                                        </div>
                                    </div>
                                    <p className="mt-6 text-lg font-semibold text-indigo-700 animate-pulse">
                                        Création de la partie...
                                    </p>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Veuillez patienter
                                    </p>
                                </div>
                            )}
                            <div className="card-body p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg transition-transform ${creatingGame ? 'animate-bounce' : ''}`}>
                                        <span className="text-3xl">🎮</span>
                                    </div>
                                    <h2 className="card-title text-2xl text-indigo-700">Créer une nouvelle partie</h2>
                                </div>
                                <p className="mb-6 text-slate-700">
                                    Créez une nouvelle partie et partagez le code avec un ami pour jouer ensemble.
                                </p>
                                {gameCode && !creatingGame && (
                                    <div className="alert alert-success mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <span className="font-bold">Code de la partie :</span>
                                            <div className="font-mono text-xl mt-2">{gameCode}</div>
                                        </div>
                                    </div>
                                )}
                                <div className="card-actions">
                                    <button
                                        onClick={createGame}
                                        className="btn btn-primary btn-lg w-full relative overflow-hidden group"
                                        disabled={creatingGame}
                                    >
                                        <span className={`flex items-center gap-2 transition-all ${creatingGame ? 'opacity-0' : 'opacity-100'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Créer une partie
                                        </span>
                                        {creatingGame && (
                                            <span className="absolute inset-0 flex items-center justify-center gap-2">
                                                <span className="loading loading-spinner loading-sm"></span>
                                                <span>Création...</span>
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Rejoindre une partie */}
                        <div className="card bg-white shadow-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative">
                            {joiningGame && (
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-3xl">🔗</span>
                                        </div>
                                    </div>
                                    <p className="mt-6 text-lg font-semibold text-purple-700 animate-pulse">
                                        Connexion à la partie...
                                    </p>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Recherche en cours
                                    </p>
                                </div>
                            )}
                            <div className="card-body p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg transition-transform ${joiningGame ? 'animate-bounce' : ''}`}>
                                        <span className="text-3xl">🔗</span>
                                    </div>
                                    <h2 className="card-title text-2xl text-purple-700">Rejoindre une partie</h2>
                                </div>
                                <p className="mb-6 text-slate-700">
                                    Entrez le code de la partie pour rejoindre un ami.
                                </p>
                                <div className="form-control mb-4">
                                    <input
                                        type="text"
                                        placeholder="Entrez le code de la partie"
                                        className="input input-bordered input-lg w-full font-mono text-gray-900 placeholder:text-gray-400 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={joinCode}
                                        onChange={(e) => {
                                            // Permettre les tirets et normaliser
                                            const value = e.target.value.replace(/\s/g, '').toLowerCase();
                                            setJoinCode(value);
                                        }}
                                        onPaste={(e) => {
                                            // Normaliser lors du collage
                                            e.preventDefault();
                                            const pasted = e.clipboardData.getData('text').replace(/\s/g, '').toLowerCase();
                                            setJoinCode(pasted);
                                        }}
                                        disabled={joiningGame}
                                    />
                                    <label className="label">
                                        <span className="label-text-alt text-gray-500">Collez le code complet de la partie</span>
                                    </label>
                                </div>
                                <div className="card-actions">
                                    <button
                                        onClick={joinGame}
                                        className="btn btn-secondary btn-lg w-full relative overflow-hidden group"
                                        disabled={joiningGame || !joinCode.trim()}
                                    >
                                        <span className={`flex items-center gap-2 transition-all ${joiningGame ? 'opacity-0' : 'opacity-100'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            Rejoindre
                                        </span>
                                        {joiningGame && (
                                            <span className="absolute inset-0 flex items-center justify-center gap-2">
                                                <span className="loading loading-spinner loading-sm"></span>
                                                <span>Connexion...</span>
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="stats bg-white shadow-xl border-2 border-indigo-100 w-full rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-0">
                        <div className="stat border-r-2 border-indigo-100 p-4 lg:p-6">
                            <div className="stat-figure text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <div className="stat-title text-slate-600 font-semibold">Parties jouées</div>
                            {statsLoading ? (
                                <div className="stat-value text-indigo-700">
                                    <span className="loading loading-spinner loading-sm"></span>
                                </div>
                            ) : (
                                <>
                                    <div className="stat-value text-indigo-700">{stats?.gamesPlayed || 0}</div>
                                    <div className="stat-desc text-slate-500">
                                        {stats && stats.gamesPlayed > 0 ? 'Au total' : 'Commencez à jouer !'}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="stat border-r-2 border-purple-100 p-4 lg:p-6">
                            <div className="stat-figure text-purple-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                </svg>
                            </div>
                            <div className="stat-title text-slate-600 font-semibold">Victoires</div>
                            {statsLoading ? (
                                <div className="stat-value text-purple-700">
                                    <span className="loading loading-spinner loading-sm"></span>
                                </div>
                            ) : (
                                <>
                                    <div className="stat-value text-purple-700">{stats?.gamesWon || 0}</div>
                                    <div className="stat-desc text-slate-500">{stats?.winRate || 0}%</div>
                                </>
                            )}
                        </div>

                        <div className="stat p-4 lg:p-6">
                            <div className="stat-figure text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                                </svg>
                            </div>
                            <div className="stat-title text-slate-600 font-semibold">Score total</div>
                            {statsLoading ? (
                                <div className="stat-value text-indigo-700">
                                    <span className="loading loading-spinner loading-sm"></span>
                                </div>
                            ) : (
                                <>
                                    <div className="stat-value text-indigo-700">{stats?.totalScore || 0}</div>
                                    <div className="stat-desc text-slate-500">pts</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

