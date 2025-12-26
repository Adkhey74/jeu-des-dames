'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { User } from '@/types';

interface GameHistoryItem {
    id: string;
    gameId: string;
    winner: 'white' | 'black';
    whitePlayerName: string;
    blackPlayerName: string;
    whitePlayerScore: number;
    blackPlayerScore: number;
    duration: number;
    finishedAt: Date;
}

interface PlayerStat {
    userId: string;
    username: string;
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    totalScore: number;
    winRate?: number;
}

interface UserStats {
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    totalScore: number;
    winRate: number;
}

export default function ScoresPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'history' | 'leaderboard'>('history');
    const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
    const [leaderboard, setLeaderboard] = useState<PlayerStat[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!storedUser || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(storedUser));
        setLoading(true);

        try {
            // Charger les statistiques
            const statsResponse = await fetch('/api/scores/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setUserStats(statsData);
            }

            // Charger l'historique
            const historyResponse = await fetch('/api/scores/history', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                setGameHistory(historyData.history || []);
            }

            // Charger le classement
            const leaderboardResponse = await fetch('/api/scores/leaderboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (leaderboardResponse.ok) {
                const leaderboardData = await leaderboardResponse.json();
                setLeaderboard(leaderboardData.leaderboard || []);
            }
        } catch (err) {
            console.error('Erreur chargement données:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [router]);

    // Recharger les données quand la page redevient visible (après une partie)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadData();
            }
        };

        const handleFocus = () => {
            loadData();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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

    if (!user || loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen ml-20 lg:ml-64 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                        <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
                    </div>
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
                            Scores et Historique
                        </h1>
                        <p className="text-slate-600 text-lg">Consultez vos performances et le classement</p>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 xl:mb-8">
                        <div className="card bg-white shadow-xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-2xl transition-all rounded-2xl overflow-hidden">
                            <div className="card-body p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="stat-title text-gray-600 font-semibold">Parties jouées</div>
                                </div>
                                <div className="stat-value text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {userStats?.gamesPlayed || 0}
                                </div>
                                <div className="stat-desc text-gray-500">Au total</div>
                            </div>
                        </div>

                        <div className="card bg-white shadow-xl border-2 border-green-200 hover:border-green-400 hover:shadow-2xl transition-all rounded-2xl overflow-hidden">
                            <div className="card-body p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="stat-title text-gray-600 font-semibold">Victoires</div>
                                </div>
                                <div className="stat-value text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {userStats?.gamesWon || 0}
                                </div>
                                <div className="stat-desc text-gray-500">{userStats?.winRate || 0}% de réussite</div>
                            </div>
                        </div>

                        <div className="card bg-white shadow-xl border-2 border-red-200 hover:border-red-400 hover:shadow-2xl transition-all rounded-2xl overflow-hidden">
                            <div className="card-body p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div className="stat-title text-gray-600 font-semibold">Défaites</div>
                                </div>
                                <div className="stat-value text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                                    {userStats?.gamesLost || 0}
                                </div>
                                <div className="stat-desc text-gray-500">
                                    {userStats?.gamesPlayed ? Math.round((userStats.gamesLost / userStats.gamesPlayed) * 100) : 0}%
                                </div>
                            </div>
                        </div>

                        <div className="card bg-white shadow-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl transition-all rounded-2xl overflow-hidden">
                            <div className="card-body p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <div className="stat-title text-gray-600 font-semibold">Score total</div>
                                </div>
                                <div className="stat-value text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    {userStats?.totalScore || 0}
                                </div>
                                <div className="stat-desc text-gray-500">points</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 p-2 mb-4 xl:mb-6">
                        <div className="flex gap-2">
                            <button
                                className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base transition-all ${
                                    activeTab === 'history'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-transparent text-gray-700 hover:bg-indigo-50'
                                }`}
                                onClick={() => setActiveTab('history')}
                            >
                                <span className="mr-2">📜</span>
                                Historique
                            </button>
                            <button
                                className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base transition-all ${
                                    activeTab === 'leaderboard'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-transparent text-gray-700 hover:bg-indigo-50'
                                }`}
                                onClick={() => setActiveTab('leaderboard')}
                            >
                                <span className="mr-2">🏆</span>
                                Classement
                            </button>
                        </div>
                    </div>

                    {/* Contenu des tabs */}
                    {activeTab === 'history' ? (
                        <div className="card bg-white shadow-xl border-2 border-indigo-100 rounded-2xl overflow-hidden">
                            <div className="card-body p-6">
                                <h2 className="card-title text-gray-800 text-2xl mb-4">Historique des parties</h2>
                                <div className="divider opacity-30"></div>

                                {gameHistory.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-700 mb-2">Aucune partie terminée</p>
                                        <p className="text-sm text-gray-500">Commencez à jouer pour voir votre historique ici !</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {gameHistory.map((game) => {
                                            const userFullName = user ? `${user.prenom} ${user.nom}` : '';
                                            const isWhiteUser = game.whitePlayerName === userFullName;
                                            const isBlackUser = game.blackPlayerName === userFullName;
                                            const isUserWinner = (game.winner === 'white' && isWhiteUser) ||
                                                                (game.winner === 'black' && isBlackUser);
                                            const isUserLoser = (game.winner === 'white' && isBlackUser) ||
                                                                (game.winner === 'black' && isWhiteUser);
                                            
                                            return (
                                                <div 
                                                    key={game.id} 
                                                    className={`card bg-gradient-to-br from-white to-indigo-50/30 shadow-lg border-2 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${
                                                        isUserWinner 
                                                            ? 'border-green-300 hover:border-green-400' 
                                                            : isUserLoser
                                                            ? 'border-red-300 hover:border-red-400'
                                                            : 'border-indigo-200 hover:border-indigo-300'
                                                    }`}
                                                >
                                                    <div className="card-body p-6">
                                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                            {/* Date et Durée */}
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span className="font-medium">{formatDate(game.finishedAt)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span>{formatDuration(game.duration)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Joueurs et Score */}
                                                            <div className="flex-1 flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
                                                                {/* Joueur Blanc */}
                                                                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                                                                    isWhiteUser ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-white/50'
                                                                }`}>
                                                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center shadow-md">
                                                                        <div className="w-6 h-6 rounded-full bg-white border border-gray-300"></div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className={`text-sm font-semibold ${isWhiteUser ? 'text-indigo-700' : 'text-gray-700'}`}>
                                                                            {game.whitePlayerName}
                                                                        </span>
                                                                        {isWhiteUser && <span className="text-xs text-indigo-600">Vous</span>}
                                                                    </div>
                                                                </div>

                                                                {/* Score */}
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`text-3xl font-bold font-mono ${
                                                                            game.whitePlayerScore > game.blackPlayerScore 
                                                                                ? 'text-indigo-600' 
                                                                                : game.whitePlayerScore < game.blackPlayerScore
                                                                                ? 'text-gray-500'
                                                                                : 'text-gray-600'
                                                                        }`}>
                                                                            {game.whitePlayerScore}
                                                                        </span>
                                                                        <span className="text-xl text-gray-400 font-bold">-</span>
                                                                        <span className={`text-3xl font-bold font-mono ${
                                                                            game.blackPlayerScore > game.whitePlayerScore 
                                                                                ? 'text-gray-800' 
                                                                                : game.blackPlayerScore < game.whitePlayerScore
                                                                                ? 'text-gray-500'
                                                                                : 'text-gray-600'
                                                                        }`}>
                                                                            {game.blackPlayerScore}
                                                                        </span>
                                                                    </div>
                                                                    {game.whitePlayerScore === game.blackPlayerScore && (
                                                                        <span className="text-xs text-gray-500 font-medium">Égalité</span>
                                                                    )}
                                                                </div>

                                                                {/* Joueur Noir */}
                                                                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                                                                    isBlackUser ? 'bg-gray-100 border-2 border-gray-400' : 'bg-white/50'
                                                                }`}>
                                                                    <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center shadow-md">
                                                                        <div className="w-6 h-6 rounded-full bg-gray-800"></div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className={`text-sm font-semibold ${isBlackUser ? 'text-gray-800' : 'text-gray-700'}`}>
                                                                            {game.blackPlayerName}
                                                                        </span>
                                                                        {isBlackUser && <span className="text-xs text-gray-600">Vous</span>}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Gagnant */}
                                                            <div className="flex flex-col items-center lg:items-end gap-2">
                                                                <div className={`badge badge-lg px-4 py-3 text-sm font-bold shadow-md ${
                                                                    game.winner === 'white' 
                                                                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0' 
                                                                        : 'bg-gradient-to-r from-gray-700 to-gray-900 text-white border-0'
                                                                }`}>
                                                                    {game.winner === 'white' ? '⚪ Blanc' : '⚫ Noir'}
                                                                </div>
                                                                {isUserWinner && (
                                                                    <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        Victoire
                                                                    </div>
                                                                )}
                                                                {isUserLoser && (
                                                                    <div className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                        Perdu
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card bg-white shadow-xl border-2 border-indigo-100 rounded-2xl overflow-hidden">
                            <div className="card-body p-6">
                                <h2 className="card-title text-gray-800 text-2xl mb-4">Classement des joueurs</h2>
                                <div className="divider opacity-30"></div>

                                {leaderboard.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-700 mb-2">Aucun joueur dans le classement</p>
                                        <p className="text-sm text-gray-500">Les joueurs apparaîtront ici après leurs premières parties</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {leaderboard.map((player, index) => {
                                            const isCurrentUser = player.userId === user?.id;
                                            const isTopThree = index < 3;
                                            
                                            return (
                                                <div 
                                                    key={player.userId} 
                                                    className={`card shadow-lg border-2 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${
                                                        isTopThree
                                                            ? index === 0
                                                                ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-yellow-300 hover:border-yellow-400'
                                                                : index === 1
                                                                ? 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border-gray-300 hover:border-gray-400'
                                                                : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-orange-300 hover:border-orange-400'
                                                            : isCurrentUser
                                                            ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-green-300 hover:border-green-400'
                                                            : 'bg-gradient-to-br from-white to-indigo-50/30 border-indigo-200 hover:border-indigo-300'
                                                    }`}
                                                >
                                                    <div className="card-body p-6">
                                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                            {/* Rang et Avatar */}
                                                            <div className="flex items-center gap-4">
                                                                {/* Rang avec médaille pour top 3 */}
                                                                <div className="flex-shrink-0">
                                                                    {index === 0 && (
                                                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-yellow-500">
                                                                            <span className="text-3xl">🥇</span>
                                                                        </div>
                                                                    )}
                                                                    {index === 1 && (
                                                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg border-2 border-gray-400">
                                                                            <span className="text-3xl">🥈</span>
                                                                        </div>
                                                                    )}
                                                                    {index === 2 && (
                                                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg border-2 border-orange-500">
                                                                            <span className="text-3xl">🥉</span>
                                                                        </div>
                                                                    )}
                                                                    {index > 2 && (
                                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md border-2 ${
                                                                            isCurrentUser
                                                                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400'
                                                                                : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400'
                                                                        }`}>
                                                                            <span className={`text-2xl font-bold ${
                                                                                isCurrentUser ? 'text-white' : 'text-white'
                                                                            }`}>
                                                                                #{index + 1}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Avatar et Nom */}
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`avatar placeholder ${
                                                                        isTopThree ? 'ring-4 ring-offset-2' : ''
                                                                    } ${
                                                                        index === 0 ? 'ring-yellow-400' :
                                                                        index === 1 ? 'ring-gray-400' :
                                                                        index === 2 ? 'ring-orange-400' : ''
                                                                    }`}>
                                                                        <div className={`rounded-full w-16 h-16 flex items-center justify-center shadow-lg ${
                                                                            isCurrentUser
                                                                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                                                                : isTopThree
                                                                                ? index === 0
                                                                                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-700'
                                                                                    : index === 1
                                                                                    ? 'bg-gradient-to-br from-gray-500 to-gray-700'
                                                                                    : 'bg-gradient-to-br from-orange-500 to-orange-700'
                                                                                : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                                                        } text-white`}>
                                                                            <span className="text-2xl font-bold">{player.username[0].toUpperCase()}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className={`text-xl font-bold ${
                                                                            isCurrentUser ? 'text-green-700' : 
                                                                            isTopThree ? 'text-gray-800' : 'text-gray-800'
                                                                        }`}>
                                                                            {player.username}
                                                                        </div>
                                                                        {isCurrentUser && (
                                                                            <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                                </svg>
                                                                                Vous
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Statistiques */}
                                                            <div className="flex-1 flex flex-wrap items-center justify-between gap-4 lg:gap-6">
                                                                {/* Parties jouées */}
                                                                <div className="flex flex-col items-center lg:items-start">
                                                                    <div className="text-xs text-gray-500 font-medium mb-1">Parties</div>
                                                                    <div className="text-2xl font-bold text-gray-800">{player.gamesPlayed}</div>
                                                                </div>

                                                                {/* Victoires */}
                                                                <div className="flex flex-col items-center lg:items-start">
                                                                    <div className="text-xs text-gray-500 font-medium mb-1">Victoires</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        <span className="text-2xl font-bold text-green-700">{player.gamesWon}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Défaites */}
                                                                <div className="flex flex-col items-center lg:items-start">
                                                                    <div className="text-xs text-gray-500 font-medium mb-1">Défaites</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                        <span className="text-2xl font-bold text-red-700">{player.gamesLost}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Ratio */}
                                                                <div className="flex flex-col items-center lg:items-start">
                                                                    <div className="text-xs text-gray-500 font-medium mb-1">Ratio</div>
                                                                    <div className={`badge badge-lg px-4 py-2 text-sm font-bold shadow-md ${
                                                                        player.winRate && player.winRate >= 70
                                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0'
                                                                            : player.winRate && player.winRate >= 50
                                                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0'
                                                                            : 'bg-gray-500 text-white border-0'
                                                                    }`}>
                                                                        {player.winRate || 0}%
                                                                    </div>
                                                                </div>

                                                                {/* Score total */}
                                                                <div className="flex flex-col items-center lg:items-end">
                                                                    <div className="text-xs text-gray-500 font-medium mb-1">Score total</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                                        </svg>
                                                                        <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                                            {player.totalScore}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

