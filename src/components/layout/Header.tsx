'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { useToast } from '@/components/ui/Toast';

interface GameInvitation {
    id: string;
    gameId: string;
    gameUuid: string;
    gameStatus: string;
    inviter: {
        id: string;
        username: string;
        prenom: string;
        nom: string;
    };
    status: string;
    createdAt: string;
}

export default function Header() {
    const router = useRouter();
    const { showToast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [invitations, setInvitations] = useState<GameInvitation[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchInvitations = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch('/api/notifications/invitations', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setInvitations(data.invitations || []);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des invitations:', error);
            }
        };

        fetchInvitations();
        // Rafraîchir toutes les 5 secondes
        const interval = setInterval(fetchInvitations, 5000);

        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const handleRespondToInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`/api/notifications/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ action }),
            });

            const data = await response.json();

            if (response.ok) {
                if (action === 'accept') {
                    showToast('Invitation acceptée ! Redirection vers la partie...', 'success');
                    setTimeout(() => {
                        router.push(`/game/${data.gameUuid}`);
                    }, 1000);
                } else {
                    showToast('Invitation refusée', 'info');
                }
                // Retirer l'invitation de la liste
                setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            } else {
                showToast(data.error || 'Erreur lors de la réponse à l\'invitation', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur de communication avec le serveur', 'error');
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    return (
        <header className="gaming-header fixed top-0 left-20 lg:left-64 right-0 h-16 lg:h-20 z-40 flex items-center justify-between px-4 lg:px-8">
            {/* Greeting */}
            <div className="flex items-center gap-3">
                <span className="text-white/80 text-sm lg:text-base font-medium">
                    {getGreeting()}, <span className="text-white font-semibold">{user?.prenom?.toUpperCase() || 'JOUEUR'}</span>
                </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 lg:gap-4">
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                    >
                        <svg className="h-5 w-5 text-white/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {invitations.length > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full border-2 border-dark-bg animate-pulse"></span>
                        )}
                    </button>

                    {/* Dropdown des notifications */}
                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 lg:w-96 bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-4 border-b border-white/10">
                                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    Invitations ({invitations.length})
                                </h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {invitations.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <p className="text-white/60 text-sm">Aucune invitation</p>
                                    </div>
                                ) : (
                                    invitations.map((invitation) => (
                                        <div key={invitation.id} className="p-4 border-b border-white/10 hover:bg-white/5 transition-all">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-semibold">
                                                        {invitation.inviter.prenom} {invitation.inviter.nom}
                                                    </p>
                                                    <p className="text-white/60 text-xs">@{invitation.inviter.username}</p>
                                                    <p className="text-white/70 text-xs mt-1">vous invite à jouer</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRespondToInvitation(invitation.id, 'accept')}
                                                    className="flex-1 px-3 py-2 bg-white hover:bg-gray-200 text-black text-xs font-semibold rounded-lg transition-all"
                                                >
                                                    Accepter
                                                </button>
                                                <button
                                                    onClick={() => handleRespondToInvitation(invitation.id, 'decline')}
                                                    className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all"
                                                >
                                                    Refuser
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                {user ? (
                    <button
                        onClick={() => router.push('/dashboard/profile')}
                        className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white ring-2 ring-white/30 hover:ring-white/50 transition-all overflow-hidden group flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:h-7 lg:w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                ) : (
                    <button
                        onClick={() => router.push('/login')}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center"
                    >
                        <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </button>
                )}
            </div>
        </header>
    );
}

