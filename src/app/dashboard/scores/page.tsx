'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
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

    const loadData = useCallback(async () => {
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
    }, [router]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
    }, [loadData]);

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
                <Header />
                <div className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20 flex items-center justify-center bg-gradient-gaming">
                    <span className="loading loading-spinner loading-lg text-red-500"></span>
                </div>
            </>
        );
    }

    if (!user || loading) {
        return (
            <>
                <Navbar />
                <Header />
                <div className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20 flex items-center justify-center bg-gradient-gaming">
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                        <p className="mt-4 text-white/70">Chargement des statistiques...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <Header />
            <main className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20 p-4 lg:p-6 xl:p-8 bg-gradient-gaming">
                <div className="w-full">
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                            Scores et Historique
                        </h1>
                        <p className="text-white/70 text-lg">Consultez vos performances et le classement</p>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 xl:mb-8">
                        <div className="gaming-card rounded-2xl overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="stat-title text-white/70 font-semibold">Parties jouées</div>
                                </div>
                                <div className="stat-value text-4xl font-bold text-red-400">
                                    {userStats?.gamesPlayed || 0}
                                </div>
                                <div className="stat-desc text-white/50">Au total</div>
                            </div>
                        </div>

                        <div className="gaming-card rounded-2xl overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="stat-title text-white/70 font-semibold">Victoires</div>
                                </div>
                                <div className="stat-value text-4xl font-bold text-orange-400">
                                    {userStats?.gamesWon || 0}
                                </div>
                                <div className="stat-desc text-white/50">{userStats?.winRate || 0}% de réussite</div>
                            </div>
                        </div>

                        <div className="gaming-card rounded-2xl overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div className="stat-title text-white/70 font-semibold">Défaites</div>
                                </div>
                                <div className="stat-value text-4xl font-bold text-red-500">
                                    {userStats?.gamesLost || 0}
                                </div>
                                <div className="stat-desc text-white/50">
                                    {userStats?.gamesPlayed ? Math.round((userStats.gamesLost / userStats.gamesPlayed) * 100) : 0}%
                                </div>
                            </div>
                        </div>

                        <div className="gaming-card rounded-2xl overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <div className="stat-title text-white/70 font-semibold">Score total</div>
                                </div>
                                <div className="stat-value text-4xl font-bold text-orange-400">
                                    {userStats?.totalScore || 0}
                                </div>
                                <div className="stat-desc text-white/50">points</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="gaming-card rounded-2xl p-2 mb-4 xl:mb-6">
                        <div className="flex gap-2">
                            <button
                                className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base transition-all ${
                                    activeTab === 'history'
                                        ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg shadow-red-500/30'
                                        : 'bg-transparent text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                                onClick={() => setActiveTab('history')}
                            >
                                <span className="mr-2">📜</span>
                                Historique
                            </button>
                            <button
                                className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base transition-all ${
                                    activeTab === 'leaderboard'
                                        ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg shadow-red-500/30'
                                        : 'bg-transparent text-white/60 hover:bg-white/5 hover:text-white'
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
                        <div className="gaming-card rounded-2xl overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-white text-2xl mb-4 font-bold">Historique des parties</h2>
                                <div className="divider opacity-20 bg-white/20"></div>

                                {gameHistory.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-lg font-semibold text-white mb-2">Aucune partie terminée</p>
                                        <p className="text-sm text-white/60">Commencez à jouer pour voir votre historique ici !</p>
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
                                                    className={`gaming-card rounded-2xl overflow-hidden ${
                                                        isUserWinner 
                                                            ? 'border-green-500/30 hover:border-green-500/50' 
                                                            : isUserLoser
                                                            ? 'border-red-500/30 hover:border-red-500/50'
                                                            : 'border-white/10 hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="p-6">
                                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                            {/* Date et Durée */}
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center gap-2 text-sm text-white/70">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span className="font-medium">{formatDate(game.finishedAt)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-white/50">
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
                                                                    isWhiteUser ? 'bg-red-500/20 border-2 border-red-500/30' : 'bg-white/5 border border-white/10'
                                                                }`}>
                                                                    <div className="relative">
                                                                        <div className="w-10 h-10 rounded-full bg-white border-2 border-white/30 flex items-center justify-center shadow-md">
                                                                            <div className="w-6 h-6 rounded-full bg-white border border-white/40"></div>
                                                                        </div>
                                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white/90 border-2 border-dark-card flex items-center justify-center">
                                                                            <span className="text-[8px]">⚪</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-sm font-semibold ${isWhiteUser ? 'text-red-300' : 'text-white/80'}`}>
                                                                                {game.whitePlayerName}
                                                                            </span>
                                                                            <span className="text-xs text-white/40 font-medium">Blanc</span>
                                                                        </div>
                                                                        {isWhiteUser && <span className="text-xs text-red-400">Vous</span>}
                                                                    </div>
                                                                </div>

                                                                {/* Score */}
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`text-3xl font-bold font-mono ${
                                                                            game.whitePlayerScore > game.blackPlayerScore 
                                                                                ? 'text-red-400' 
                                                                                : game.whitePlayerScore < game.blackPlayerScore
                                                                                ? 'text-white/40'
                                                                                : 'text-white/60'
                                                                        }`}>
                                                                            {game.whitePlayerScore}
                                                                        </span>
                                                                        <span className="text-xl text-white/40 font-bold">-</span>
                                                                        <span className={`text-3xl font-bold font-mono ${
                                                                            game.blackPlayerScore > game.whitePlayerScore 
                                                                                ? 'text-orange-400' 
                                                                                : game.blackPlayerScore < game.whitePlayerScore
                                                                                ? 'text-white/40'
                                                                                : 'text-white/60'
                                                                        }`}>
                                                                            {game.blackPlayerScore}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Joueur Noir */}
                                                                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                                                                    isBlackUser ? 'bg-orange-500/20 border-2 border-orange-500/30' : 'bg-white/5 border border-white/10'
                                                                }`}>
                                                                    <div className="relative">
                                                                        <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-white/30 flex items-center justify-center shadow-md">
                                                                            <div className="w-6 h-6 rounded-full bg-gray-800"></div>
                                                                        </div>
                                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gray-900/90 border-2 border-dark-card flex items-center justify-center">
                                                                            <span className="text-[8px]">⚫</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-sm font-semibold ${isBlackUser ? 'text-orange-300' : 'text-white/80'}`}>
                                                                                {game.blackPlayerName}
                                                                            </span>
                                                                            <span className="text-xs text-white/40 font-medium">Noir</span>
                                                                        </div>
                                                                        {isBlackUser && <span className="text-xs text-orange-400">Vous</span>}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Résultat */}
                                                            <div className="flex flex-col items-center lg:items-end gap-3">
                                                                {/* Badge de résultat */}
                                                                {isUserWinner ? (
                                                                    <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 backdrop-blur-sm shadow-lg shadow-green-500/10">
                                                                        <div className="flex items-center gap-2">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                            <span className="text-sm font-bold text-green-400">Victoire</span>
                                                                        </div>
                                                                        <div className="text-xs text-white/60 font-medium">
                                                                            {game.winner === 'white' ? '⚪' : '⚫'} Gagnant
                                                                        </div>
                                                                    </div>
                                                                ) : isUserLoser ? (
                                                                    <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-500/30 backdrop-blur-sm shadow-lg shadow-red-500/10">
                                                                        <div className="flex items-center gap-2">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                            <span className="text-sm font-bold text-red-400">Défaite</span>
                                                                        </div>
                                                                        <div className="text-xs text-white/60 font-medium">
                                                                            {game.winner === 'white' ? '⚪' : '⚫'} Gagnant
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/20 backdrop-blur-sm">
                                                                        <div className="flex items-center gap-2">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            <span className="text-sm font-bold text-white/70">Égalité</span>
                                                                        </div>
                                                                        <div className="text-xs text-white/50 font-medium">
                                                                            Match nul
                                                                        </div>
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
                        <div className="gaming-card rounded-2xl overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-white text-2xl mb-4 font-bold">Classement des joueurs</h2>
                                <div className="divider opacity-20 bg-white/20"></div>

                                {leaderboard.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <p className="text-lg font-semibold text-white mb-2">Aucun joueur dans le classement</p>
                                        <p className="text-sm text-white/60">Les joueurs apparaîtront ici après leurs premières parties</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {leaderboard.map((player, index) => {
                                            const isCurrentUser = player.userId === user?.id;
                                            const isTopThree = index < 3;
                                            
                                            return (
                                                <div 
                                                    key={player.userId} 
                                                    className={`gaming-card rounded-2xl overflow-hidden ${
                                                        isTopThree
                                                            ? index === 0
                                                                ? 'border-yellow-500/30 hover:border-yellow-500/50'
                                                                : index === 1
                                                                ? 'border-white/20 hover:border-white/30'
                                                                : 'border-orange-500/30 hover:border-orange-500/50'
                                                            : isCurrentUser
                                                            ? 'border-green-500/30 hover:border-green-500/50'
                                                            : 'border-white/10 hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="p-6">
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
                                                                                : 'bg-gradient-to-br from-red-500 to-red-700 border-red-500/50'
                                                                        }`}>
                                                                            <span className="text-2xl font-bold text-white">
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
                                                                                : 'bg-gradient-to-br from-red-500 to-red-700'
                                                                        } text-white`}>
                                                                            <span className="text-2xl font-bold">{player.username[0].toUpperCase()}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className={`text-xl font-bold ${
                                                                            isCurrentUser ? 'text-green-400' : 
                                                                            isTopThree ? 'text-white' : 'text-white'
                                                                        }`}>
                                                                            {player.username}
                                                                        </div>
                                                                        {isCurrentUser && (
                                                                            <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-green-400 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
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
                                                                    <div className="text-xs text-white/50 font-medium mb-1">Parties</div>
                                                                    <div className="text-2xl font-bold text-white">{player.gamesPlayed}</div>
                                                                </div>

                                                                {/* Victoires */}
                                                                <div className="flex flex-col items-center lg:items-start">
                                                                    <div className="text-xs text-white/50 font-medium mb-1">Victoires</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        <span className="text-2xl font-bold text-green-400">{player.gamesWon}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Défaites */}
                                                                <div className="flex flex-col items-center lg:items-start">
                                                                    <div className="text-xs text-white/50 font-medium mb-1">Défaites</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                        <span className="text-2xl font-bold text-red-400">{player.gamesLost}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Ratio */}
                                                                <div className="flex flex-col items-center lg:items-start">
                                                                    <div className="text-xs text-white/50 font-medium mb-1">Ratio</div>
                                                                    <div className={`badge badge-lg px-4 py-2 text-sm font-bold shadow-md ${
                                                                        player.winRate && player.winRate >= 70
                                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0'
                                                                            : player.winRate && player.winRate >= 50
                                                                            ? 'bg-gradient-to-r from-red-500 to-red-700 text-white border-0'
                                                                            : 'bg-white/10 text-white border border-white/20'
                                                                    }`}>
                                                                        {player.winRate || 0}%
                                                                    </div>
                                                                </div>

                                                                {/* Score total */}
                                                                <div className="flex flex-col items-center lg:items-end">
                                                                    <div className="text-xs text-white/50 font-medium mb-1">Score total</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                                        </svg>
                                                                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
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

