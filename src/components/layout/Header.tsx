'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

export default function Header() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

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
                <button className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group">
                    <svg className="h-5 w-5 text-white/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-dark-bg"></span>
                </button>

                {/* User Avatar */}
                {user ? (
                    <button
                        onClick={() => router.push('/dashboard/profile')}
                        className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 ring-2 ring-red-500/30 hover:ring-red-500/50 transition-all overflow-hidden group"
                    >
                        <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                            {user.prenom[0]}{user.nom[0]}
                        </div>
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

