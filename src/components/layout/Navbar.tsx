'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import ThemeSelector from '@/components/ui/ThemeSelector';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Vérifier si l'utilisateur est connecté
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Récupérer le thème
        const storedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', storedTheme);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-r border-slate-700/50 backdrop-blur-sm z-50 flex flex-col">
            {/* Logo / Brand */}
            <div className="p-4 border-b border-slate-700/50">
                <Link 
                    href="/" 
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                >
                    <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg">
                            <span className="text-xl lg:text-2xl">🎲</span>
                        </div>
                    </div>
                    <div className="flex flex-col hidden lg:block">
                        <span className="font-bold text-white text-base leading-tight">Jeu de Dames</span>
                        <span className="text-xs text-slate-400 leading-tight">En ligne</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="menu menu-vertical px-2 gap-2">
                    <li>
                        <Link 
                            href="/" 
                            className={`flex items-center gap-3 rounded-lg transition-all ${
                                isActive('/') 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' 
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }`}
                            title="Accueil"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="hidden lg:inline">Accueil</span>
                        </Link>
                    </li>
                    {user && (
                        <>
                            <li>
                                <Link 
                                    href="/dashboard" 
                                    className={`flex items-center gap-3 rounded-lg transition-all ${
                                        isActive('/dashboard') 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' 
                                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                    }`}
                                    title="Dashboard"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="hidden lg:inline">Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/dashboard/scores" 
                                    className={`flex items-center gap-3 rounded-lg transition-all ${
                                        isActive('/dashboard/scores') 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' 
                                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                    }`}
                                    title="Scores"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span className="hidden lg:inline">Scores</span>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>

            {/* Actions bas */}
            <div className="p-4 border-t border-slate-700/50 space-y-3">
                {/* Sélecteur de thème */}
                <div className="hidden lg:block">
                    <ThemeSelector />
                </div>

                {user ? (
                    <div className="dropdown dropdown-top lg:dropdown-top">
                        <div 
                            tabIndex={0} 
                            role="button" 
                            className="btn btn-ghost w-full justify-start hover:ring-2 hover:ring-indigo-500/50 transition-all"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-indigo-500/30 shadow-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-xs">
                                    {user.prenom[0]}{user.nom[0]}
                                </span>
                            </div>
                            <div className="hidden lg:flex flex-col items-start ml-2">
                                <span className="text-xs font-semibold text-white truncate max-w-[140px]">{user.prenom} {user.nom}</span>
                                <span className="text-xs text-slate-400 truncate max-w-[140px]">@{user.username}</span>
                            </div>
                        </div>
                        <ul 
                            tabIndex={0} 
                            className="dropdown-content mb-2 z-[1] p-2 shadow-2xl menu menu-sm bg-slate-800/95 backdrop-blur-md text-white rounded-xl w-56 border border-slate-700/50"
                        >
                            <li className="menu-title px-3 py-2 border-b border-slate-700/50">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-white">{user.prenom} {user.nom}</span>
                                    <span className="text-xs text-slate-400">@{user.username}</span>
                                </div>
                            </li>
                            <li>
                                <Link 
                                    href="/dashboard/profile" 
                                    className="rounded-lg hover:bg-slate-700/50 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profil
                                </Link>
                            </li>
                            <li>
                                <a 
                                    onClick={handleLogout} 
                                    className="rounded-lg hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Déconnexion
                                </a>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Link 
                            href="/login" 
                            className="btn btn-sm btn-ghost w-full text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 transition-all text-xs lg:text-sm"
                        >
                            <span className="hidden lg:inline">Connexion</span>
                            <span className="lg:hidden">Con.</span>
                        </Link>
                        <Link 
                            href="/register" 
                            className="btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/50 transition-all w-full text-xs lg:text-sm"
                        >
                            <span className="hidden lg:inline">Inscription</span>
                            <span className="lg:hidden">Insc.</span>
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}

