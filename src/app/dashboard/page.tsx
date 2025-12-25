'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { User } from '@/types';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [gameCode, setGameCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(storedUser));
    }, [router]);

    const createGame = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/game/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création de la partie');
            }

            setGameCode(data.uuid);
            // Rediriger vers la partie
            router.push(`/game/${data.uuid}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const joinGame = async () => {
        if (!joinCode.trim()) {
            setError('Veuillez entrer un code de partie');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/game/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ uuid: joinCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la connexion à la partie');
            }

            // Rediriger vers la partie
            router.push(`/game/${joinCode}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen p-8 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-slate-800">
                        Bienvenue, <span className="text-blue-800">{user.prenom} {user.nom}</span> !
                    </h1>

                    {error && (
                        <div className="alert alert-error mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Créer une partie */}
                        <div className="card bg-white shadow-xl border-2 border-blue-300 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
                            <div className="card-body">
                                <h2 className="card-title text-2xl mb-4 text-blue-900">🎮 Créer une nouvelle partie</h2>
                                <p className="mb-6 text-slate-700">
                                    Créez une nouvelle partie et partagez le code avec un ami pour jouer ensemble.
                                </p>
                                {gameCode && (
                                    <div className="alert alert-success mb-4">
                                        <div>
                                            <span className="font-bold">Code de la partie :</span>
                                            <div className="font-mono text-xl mt-2">{gameCode}</div>
                                        </div>
                                    </div>
                                )}
                                <div className="card-actions">
                                    <button
                                        onClick={createGame}
                                        className={`btn btn-primary btn-lg w-full ${loading ? 'loading' : ''}`}
                                        disabled={loading}
                                    >
                                        {loading ? 'Création...' : 'Créer une partie'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Rejoindre une partie */}
                        <div className="card bg-white shadow-xl border-2 border-indigo-300 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300">
                            <div className="card-body">
                                <h2 className="card-title text-2xl mb-4 text-indigo-900">🔗 Rejoindre une partie</h2>
                                <p className="mb-6 text-slate-700">
                                    Entrez le code de la partie pour rejoindre un ami.
                                </p>
                                <div className="form-control mb-4">
                                    <input
                                        type="text"
                                        placeholder="Entrez le code de la partie"
                                        className="input input-bordered input-lg w-full font-mono"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="card-actions">
                                    <button
                                        onClick={joinGame}
                                        className={`btn btn-secondary btn-lg w-full ${loading ? 'loading' : ''}`}
                                        disabled={loading || !joinCode.trim()}
                                    >
                                        {loading ? 'Connexion...' : 'Rejoindre'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="stats bg-white shadow-xl border-2 border-slate-300 w-full">
                        <div className="stat border-r-2 border-blue-200">
                            <div className="stat-figure text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <div className="stat-title text-slate-600 font-semibold">Parties jouées</div>
                            <div className="stat-value text-blue-800">0</div>
                            <div className="stat-desc text-slate-500">Commencez à jouer !</div>
                        </div>

                        <div className="stat border-r-2 border-emerald-200">
                            <div className="stat-figure text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                </svg>
                            </div>
                            <div className="stat-title text-slate-600 font-semibold">Victoires</div>
                            <div className="stat-value text-emerald-800">0</div>
                            <div className="stat-desc text-slate-500">0%</div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-cyan-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                                </svg>
                            </div>
                            <div className="stat-title text-slate-600 font-semibold">Score total</div>
                            <div className="stat-value text-cyan-800">0</div>
                            <div className="stat-desc text-slate-500">pts</div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

