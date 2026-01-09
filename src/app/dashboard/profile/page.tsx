'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { useToast } from '@/components/ui/Toast';
import { User } from '@/types';

export default function ProfilePage() {
    const router = useRouter();
    const { showToast } = useToast();
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
        showToast('Fonctionnalité à venir : mise à jour du profil', 'info');
        setIsEditing(false);
    };

    if (!user) {
        return (
            <>
                <Navbar />
                <Header />
                <div className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20 flex items-center justify-center bg-gradient-gaming">
                    <span className="loading loading-spinner loading-lg text-white"></span>
                </div>
            </>
        );
    }

    return (
        <>
      <Navbar />
      <Header />
      <main className="min-h-screen ml-20 lg:ml-64 bg-gradient-gaming">
        <div className="w-full p-4 lg:p-6 xl:p-8" style={{ paddingTop: '6rem' }}>
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
                            Mon Profil
                        </h1>
                        <p className="text-white/70 text-lg">Gérez vos informations personnelles</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Carte Avatar */}
                        <div className="lg:col-span-1">
                            <div className="gaming-card rounded-2xl overflow-hidden">
                                <div className="p-8 items-center text-center">
                                    <div className="avatar placeholder mb-4 flex items-center justify-center">
                                        <div className="bg-white text-black rounded-full w-32 h-32 flex items-center justify-center shadow-lg ring-4 ring-white/20" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ display: 'block', margin: '0 auto' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h2 className="text-white text-xl font-bold mb-1">{user.prenom} {user.nom}</h2>
                                    <p className="text-sm text-white/60">@{user.username}</p>
                                    <div className={`badge mt-2 border-0 ${
                                        user.isVerified 
                                            ? 'bg-white/20 text-white border border-white/30' 
                                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
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
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-white text-xl font-bold">Informations personnelles</h2>
                                        </div>
                                        {!isEditing && (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="btn bg-white hover:bg-gray-200 text-black border-0 shadow-lg shadow-black/30 hover:shadow-xl transition-all group"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Modifier
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                                    <p className="text-xs text-white/60 mb-2 flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Prénom
                                                    </p>
                                                    <input
                                                        type="text"
                                                        name="prenom"
                                                        value={formData.prenom}
                                                        onChange={handleChange}
                                                        className="w-full bg-transparent border-0 p-0 text-white font-semibold text-lg focus:outline-none focus:ring-0"
                                                        required
                                                    />
                                                </div>

                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                                    <p className="text-xs text-white/60 mb-2 flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Nom
                                                    </p>
                                                    <input
                                                        type="text"
                                                        name="nom"
                                                        value={formData.nom}
                                                        onChange={handleChange}
                                                        className="w-full bg-transparent border-0 p-0 text-white font-semibold text-lg focus:outline-none focus:ring-0"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                                <p className="text-xs text-white/60 mb-2 flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Email
                                                </p>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full bg-transparent border-0 p-0 text-white font-semibold text-lg focus:outline-none focus:ring-0"
                                                    required
                                                />
                                            </div>

                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                                <p className="text-xs text-white/60 mb-2 flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Nom d&apos;utilisateur
                                                </p>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    className="w-full bg-transparent border-0 p-0 text-white font-semibold text-lg focus:outline-none focus:ring-0"
                                                    required
                                                />
                                            </div>

                                            <div className="flex gap-3 justify-end pt-2">
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
                                                    className="btn btn-ghost text-white/70 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Annuler
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    className="btn bg-white hover:bg-gray-200 text-black border-0 shadow-lg shadow-black/30 hover:shadow-xl transition-all group"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Enregistrer
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                                    <p className="text-xs text-white/60 mb-2 flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Prénom
                                                    </p>
                                                    <p className="font-semibold text-white text-lg">{user.prenom}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                                    <p className="text-xs text-white/60 mb-2 flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Nom
                                                    </p>
                                                    <p className="font-semibold text-white text-lg">{user.nom}</p>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                                <p className="text-xs text-white/60 mb-2 flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Email
                                                </p>
                                                <p className="font-semibold text-white text-lg">{user.email}</p>
                                            </div>

                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                                <p className="text-xs text-white/60 mb-2 flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Nom d&apos;utilisateur
                                                </p>
                                                <p className="font-semibold text-white text-lg">@{user.username}</p>
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
                                            <button className="btn w-full justify-between bg-white/20 hover:bg-white/30 border border-white/30 text-white hover:border-white/50">
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
                            <div className="gaming-card mt-4 rounded-2xl overflow-hidden border-white/30 hover:border-white/50">
                                <div className="p-6 bg-gradient-to-br from-black/20 to-black/40">
                                    <h2 className="text-white text-xl font-bold mb-4">Zone de danger</h2>
                                    <div className="divider opacity-20 bg-white/20 my-4"></div>
                                    <p className="text-sm text-white/70 mb-4">Une fois votre compte supprimé, toutes vos données seront définitivement effacées.</p>
                                    <button className="btn bg-white/20 hover:bg-white/30 border border-white/30 text-white hover:border-white/50 hover:text-white">
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

