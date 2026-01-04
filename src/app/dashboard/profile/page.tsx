'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { User } from '@/types';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        username: '',
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData({
            nom: userData.nom,
            prenom: userData.prenom,
            email: userData.email,
            username: userData.username,
        });
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Mettre à jour le profil via API
        alert('Fonctionnalité à venir : mise à jour du profil');
        setIsEditing(false);
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

    return (
        <>
      <Navbar />
      <Header />
      <main className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20 p-4 lg:p-6 xl:p-8 bg-gradient-gaming">
        <div className="w-full">
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                            Mon Profil
                        </h1>
                        <p className="text-white/70 text-lg">Gérez vos informations personnelles</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Carte Avatar */}
                        <div className="lg:col-span-1">
                            <div className="gaming-card rounded-2xl overflow-hidden">
                                <div className="p-8 items-center text-center">
                                    <div className="avatar placeholder mb-4">
                                        <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-full w-32 h-32 flex items-center justify-center shadow-lg ring-4 ring-red-500/20">
                                            <span className="text-5xl font-bold">{user.prenom[0]}{user.nom[0]}</span>
                                        </div>
                                    </div>
                                    <h2 className="text-white text-xl font-bold mb-1">{user.prenom} {user.nom}</h2>
                                    <p className="text-sm text-white/60">@{user.username}</p>
                                    <div className={`badge mt-2 border-0 ${
                                        user.isVerified 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    }`}>
                                        {user.isVerified ? '✓ Vérifié' : '⚠ Non vérifié'}
                                    </div>

                                    <div className="divider opacity-20 bg-white/20 my-4"></div>

                                    <div className="w-full">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="text-xs text-white/50 mb-1">Membre depuis</div>
                                            <div className="text-sm font-semibold text-white">
                                                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informations du profil */}
                        <div className="lg:col-span-2">
                            <div className="gaming-card rounded-2xl overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-white text-xl font-bold">Informations personnelles</h2>
                                        {!isEditing && (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="btn bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border-0 btn-sm shadow-lg shadow-red-500/30"
                                            >
                                                Modifier
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text text-white/70">Prénom</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="prenom"
                                                        value={formData.prenom}
                                                        onChange={handleChange}
                                                        className="input bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                        required
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text text-white/70">Nom</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="nom"
                                                        value={formData.nom}
                                                        onChange={handleChange}
                                                        className="input bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-white/70">Email</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="input bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                    required
                                                />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-white/70">Nom d&apos;utilisateur</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    className="input bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                    required
                                                />
                                            </div>

                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setFormData({
                                                            nom: user.nom,
                                                            prenom: user.prenom,
                                                            email: user.email,
                                                            username: user.username,
                                                        });
                                                    }}
                                                    className="btn btn-ghost text-white/70 hover:text-white hover:bg-white/5 border border-white/10"
                                                >
                                                    Annuler
                                                </button>
                                                <button type="submit" className="btn bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/30">
                                                    Enregistrer
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-white/50 mb-1">Prénom</p>
                                                    <p className="font-semibold text-white">{user.prenom}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white/50 mb-1">Nom</p>
                                                    <p className="font-semibold text-white">{user.nom}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm text-white/50 mb-1">Email</p>
                                                <p className="font-semibold text-white">{user.email}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-white/50 mb-1">Nom d&apos;utilisateur</p>
                                                <p className="font-semibold text-white">@{user.username}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sécurité */}
                            <div className="gaming-card mt-4 rounded-2xl overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-white text-xl font-bold mb-4">Sécurité</h2>
                                    <div className="divider opacity-20 bg-white/20 my-4"></div>

                                    <div className="space-y-4">
                                        <button className="btn w-full justify-between bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:border-white/20">
                                            <span>Changer le mot de passe</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>

                                        {!user.isVerified && (
                                            <button className="btn w-full justify-between bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 hover:border-orange-500/50">
                                                <span>Vérifier mon email</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Zone Danger */}
                            <div className="gaming-card mt-4 rounded-2xl overflow-hidden border-red-500/30 hover:border-red-500/50">
                                <div className="p-6 bg-gradient-to-br from-red-500/10 to-red-700/10">
                                    <h2 className="text-red-400 text-xl font-bold mb-4">Zone de danger</h2>
                                    <div className="divider opacity-20 bg-white/20 my-4"></div>
                                    <p className="text-sm text-white/70 mb-4">Une fois votre compte supprimé, toutes vos données seront définitivement effacées.</p>
                                    <button className="btn bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:border-red-500/50 hover:text-red-300">
                                        Supprimer mon compte
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

