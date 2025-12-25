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
}

export default function ScoresPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'history' | 'leaderboard'>('history');

    // Données de démo
    const [gameHistory] = useState<GameHistoryItem[]>([
        {
            id: '1',
            gameId: 'abc123',
            winner: 'white',
            whitePlayerName: 'Jean Dupont',
            blackPlayerName: 'Marie Martin',
            whitePlayerScore: 12,
            blackPlayerScore: 0,
            duration: 1200,
            finishedAt: new Date('2025-10-06T14:30:00'),
        },
        {
            id: '2',
            gameId: 'def456',
            winner: 'black',
            whitePlayerName: 'Pierre Durand',
            blackPlayerName: 'Jean Dupont',
            whitePlayerScore: 3,
            blackPlayerScore: 12,
            duration: 900,
            finishedAt: new Date('2025-10-05T16:45:00'),
        },
    ]);

    const [leaderboard] = useState<PlayerStat[]>([
        {
            userId: '1',
            username: 'jean.dupont',
            gamesPlayed: 15,
            gamesWon: 10,
            gamesLost: 5,
            totalScore: 120,
        },
        {
            userId: '2',
            username: 'marie.martin',
            gamesPlayed: 12,
            gamesWon: 8,
            gamesLost: 4,
            totalScore: 96,
        },
        {
            userId: '3',
            username: 'pierre.durand',
            gamesPlayed: 10,
            gamesWon: 5,
            gamesLost: 5,
            totalScore: 60,
        },
    ]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));

        // TODO: Charger l'historique et les stats depuis l'API
    }, [router]);

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
                <div className="min-h-screen flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-slate-800">Scores et Historique</h1>

                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="stat bg-white rounded-lg shadow-lg border-2 border-blue-300 hover:border-blue-500 transition-all">
                            <div className="stat-title text-slate-600 font-semibold">Parties jouées</div>
                            <div className="stat-value text-blue-900">0</div>
                            <div className="stat-desc text-slate-500">Au total</div>
                        </div>

                        <div className="stat bg-white rounded-lg shadow-lg border-2 border-emerald-300 hover:border-emerald-500 transition-all">
                            <div className="stat-title text-slate-600 font-semibold">Victoires</div>
                            <div className="stat-value text-emerald-800">0</div>
                            <div className="stat-desc text-slate-500">0%</div>
                        </div>

                        <div className="stat bg-white rounded-lg shadow-lg border-2 border-red-300 hover:border-red-500 transition-all">
                            <div className="stat-title text-slate-600 font-semibold">Défaites</div>
                            <div className="stat-value text-red-800">0</div>
                            <div className="stat-desc text-slate-500">0%</div>
                        </div>

                        <div className="stat bg-white rounded-lg shadow-lg border-2 border-cyan-300 hover:border-cyan-500 transition-all">
                            <div className="stat-title text-slate-600 font-semibold">Score total</div>
                            <div className="stat-value text-cyan-800">0</div>
                            <div className="stat-desc text-slate-500">points</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-lg border-2 border-slate-300 p-2 mb-6">
                        <div className="flex gap-2">
                            <button
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-base transition-all ${activeTab === 'history'
                                    ? 'bg-blue-800 text-white'
                                    : 'bg-transparent text-slate-800 hover:bg-slate-100'
                                    }`}
                                onClick={() => setActiveTab('history')}
                            >
                                📜 Historique
                            </button>
                            <button
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-base transition-all ${activeTab === 'leaderboard'
                                    ? 'bg-blue-800 text-white'
                                    : 'bg-transparent text-slate-800 hover:bg-slate-100'
                                    }`}
                                onClick={() => setActiveTab('leaderboard')}
                            >
                                🏆 Classement
                            </button>
                        </div>
                    </div>

                    {/* Contenu des tabs */}
                    {activeTab === 'history' ? (
                        <div className="card bg-white shadow-xl border-2 border-slate-300">
                            <div className="card-body">
                                <h2 className="card-title text-slate-800 text-xl">Historique des parties</h2>
                                <div className="divider"></div>

                                {gameHistory.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <p className="text-lg">Aucune partie terminée pour le moment</p>
                                        <p className="text-sm mt-2">Commencez à jouer pour voir votre historique ici !</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="table">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-700">
                                                    <th>Date</th>
                                                    <th>Joueurs</th>
                                                    <th>Score</th>
                                                    <th>Gagnant</th>
                                                    <th>Durée</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gameHistory.map((game) => (
                                                    <tr key={game.id}>
                                                        <td className="text-sm text-slate-700">{formatDate(game.finishedAt)}</td>
                                                        <td>
                                                            <div className="flex flex-col gap-1 text-slate-700">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-400"></div>
                                                                    <span>{game.whitePlayerName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-700"></div>
                                                                    <span>{game.blackPlayerName}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="font-mono text-slate-800 font-semibold">
                                                                {game.whitePlayerScore} - {game.blackPlayerScore}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className={`badge ${game.winner === 'white' ? 'badge-primary' : 'badge-neutral'}`}>
                                                                {game.winner === 'white' ? '⚪ Blanc' : '⚫ Noir'}
                                                            </div>
                                                        </td>
                                                        <td className="text-sm text-slate-700">{formatDuration(game.duration)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card bg-white shadow-xl border-2 border-slate-300">
                            <div className="card-body">
                                <h2 className="card-title text-slate-800 text-xl">Classement des joueurs</h2>
                                <div className="divider"></div>

                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-700">
                                                <th>Rang</th>
                                                <th>Joueur</th>
                                                <th>Parties</th>
                                                <th>Victoires</th>
                                                <th>Défaites</th>
                                                <th>Ratio</th>
                                                <th>Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.map((player, index) => (
                                                <tr key={player.userId} className={index < 3 ? 'bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-600' : 'hover:bg-slate-50'}>
                                                    <td>
                                                        <div className="font-bold text-lg">
                                                            {index === 0 && '🥇'}
                                                            {index === 1 && '🥈'}
                                                            {index === 2 && '🥉'}
                                                            {index > 2 && `#${index + 1}`}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <div className="avatar placeholder">
                                                                <div className="bg-blue-800 text-white rounded-full w-10">
                                                                    <span className="text-sm">{player.username[0].toUpperCase()}</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-800">{player.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-slate-700 font-medium">{player.gamesPlayed}</td>
                                                    <td className="text-emerald-700 font-semibold">{player.gamesWon}</td>
                                                    <td className="text-red-700 font-semibold">{player.gamesLost}</td>
                                                    <td>
                                                        <div className="badge badge-primary text-white">
                                                            {player.gamesPlayed > 0
                                                                ? `${Math.round((player.gamesWon / player.gamesPlayed) * 100)}%`
                                                                : '0%'}
                                                        </div>
                                                    </td>
                                                    <td className="font-bold text-blue-800">{player.totalScore}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

