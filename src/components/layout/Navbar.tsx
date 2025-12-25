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

    return (
        <div className="navbar bg-slate-900 text-white shadow-lg">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-slate-800 text-white rounded-box w-52">
                        <li><Link href="/" className="hover:bg-slate-700">Accueil</Link></li>
                        {user && (
                            <>
                                <li><Link href="/dashboard" className="hover:bg-slate-700">Dashboard</Link></li>
                                <li><Link href="/dashboard/scores" className="hover:bg-slate-700">Scores</Link></li>
                            </>
                        )}
                    </ul>
                </div>
                <Link href="/" className="btn btn-ghost text-xl hover:bg-slate-800">
                    <span className="text-2xl">🎲</span>
                    <span className="font-bold text-white">Jeu de Dames</span>
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 text-white">
                    <li><Link href="/" className="hover:bg-slate-800">Accueil</Link></li>
                    {user && (
                        <>
                            <li><Link href="/dashboard" className="hover:bg-slate-800">Dashboard</Link></li>
                            <li><Link href="/dashboard/scores" className="hover:bg-slate-800">Scores</Link></li>
                        </>
                    )}
                </ul>
            </div>

            <div className="navbar-end gap-2">
                {/* Sélecteur de thème */}
                <ThemeSelector />

                {user ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-10">
                                <span className="text-xl">{user.prenom[0]}{user.nom[0]}</span>
                            </div>
                        </div>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-slate-800 text-white rounded-box w-52">
                            <li className="menu-title">
                                <span>{user.prenom} {user.nom}</span>
                            </li>
                            <li><Link href="/dashboard">Dashboard</Link></li>
                            <li><Link href="/dashboard/profile">Profil</Link></li>
                            <li><a onClick={handleLogout}>Déconnexion</a></li>
                        </ul>
                    </div>
                ) : (
                    <>
                        <Link href="/login" className="btn btn-ghost text-white hover:bg-slate-800">
                            Connexion
                        </Link>
                        <Link href="/register" className="btn btn-primary">
                            Inscription
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

