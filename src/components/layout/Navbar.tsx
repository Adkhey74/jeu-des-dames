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
        <aside className="gaming-sidebar fixed left-0 top-0 h-screen w-20 lg:w-64 text-white shadow-2xl z-50 flex flex-col">
            {/* Logo / Brand */}
            <div className="p-4 lg:p-6 border-b border-white/10">
                <Link 
                    href="/" 
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                >
                    <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-red-500 to-red-700 p-2.5 lg:p-3 rounded-xl shadow-lg ring-2 ring-red-500/20">
                            <span className="text-xl lg:text-2xl">🎲</span>
                        </div>
                    </div>
                    <div className="flex flex-col hidden lg:block">
                        <span className="font-bold text-white text-base leading-tight">Jeu de Dames</span>
                        <span className="text-xs text-white/50 leading-tight">En ligne</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 lg:py-6">
                <ul className="menu menu-vertical px-2 lg:px-4 gap-2">
                    <li>
                        <Link 
                            href="/" 
                            className={`flex items-center gap-3 rounded-xl transition-all ${
                                isActive('/') 
                                    ? 'bg-red-600/20 text-white shadow-lg shadow-red-500/20 border border-red-500/30' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                            title="Accueil"
                        >
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${
                                isActive('/') ? 'bg-red-500/20' : 'bg-white/5'
                            }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="hidden lg:inline font-medium">Accueil</span>
                        </Link>
                    </li>
                    {user && (
                        <>
                            <li>
                                <Link 
                                    href="/dashboard" 
                                    className={`flex items-center gap-3 rounded-xl transition-all ${
                                        isActive('/dashboard') 
                                            ? 'bg-red-600/20 text-white shadow-lg shadow-red-500/20 border border-red-500/30' 
                                            : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                    title="Dashboard"
                                >
                                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${
                                        isActive('/dashboard') ? 'bg-red-500/20' : 'bg-white/5'
                                    }`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <span className="hidden lg:inline font-medium">Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/dashboard/scores" 
                                    className={`flex items-center gap-3 rounded-xl transition-all ${
                                        isActive('/dashboard/scores') 
                                            ? 'bg-red-600/20 text-white shadow-lg shadow-red-500/20 border border-red-500/30' 
                                            : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                    title="Scores"
                                >
                                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${
                                        isActive('/dashboard/scores') ? 'bg-red-500/20' : 'bg-white/5'
                                    }`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <span className="hidden lg:inline font-medium">Scores</span>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>

            {/* Actions bas */}
            <div className="p-4 lg:p-6 border-t border-white/10 space-y-3">
                {/* Sélecteur de thème */}
                <div className="hidden lg:block">
                    <ThemeSelector />
                </div>

                {/* Bouton Add */}
                <button className="w-full lg:w-auto lg:mx-auto flex items-center justify-center gap-2 p-3 lg:p-4 rounded-xl bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all group">
                    <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden lg:inline font-semibold">Nouveau</span>
                </button>

                {user ? (
                    <div className="dropdown dropdown-top lg:dropdown-top">
                        <div 
                            tabIndex={0} 
                            role="button" 
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                        >
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 ring-2 ring-red-500/30 shadow-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-xs lg:text-sm">
                                    {user.prenom[0]}{user.nom[0]}
                                </span>
                            </div>
                            <div className="hidden lg:flex flex-col items-start flex-1 min-w-0">
                                <span className="text-sm font-semibold text-white truncate">{user.prenom} {user.nom}</span>
                                <span className="text-xs text-white/50 truncate">@{user.username}</span>
                            </div>
                        </div>
                        <ul 
                            tabIndex={0} 
                            className="dropdown-content mb-2 z-[1] p-2 shadow-2xl menu menu-sm bg-dark-card/95 backdrop-blur-md text-white rounded-xl w-56 border border-white/10"
                        >
                            <li className="menu-title px-3 py-2 border-b border-white/10">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-white">{user.prenom} {user.nom}</span>
                                    <span className="text-xs text-white/50">@{user.username}</span>
                                </div>
                            </li>
                            <li>
                                <Link 
                                    href="/dashboard/profile" 
                                    className="rounded-lg hover:bg-white/5 transition-all"
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
                            className="btn btn-sm btn-ghost w-full text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all text-xs lg:text-sm"
                        >
                            <span className="hidden lg:inline">Connexion</span>
                            <span className="lg:hidden">Con.</span>
                        </Link>
                        <Link 
                            href="/register" 
                            className="btn btn-sm bg-gradient-to-r from-red-500 to-red-700 text-white border-0 hover:from-red-600 hover:to-red-800 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all w-full text-xs lg:text-sm"
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

