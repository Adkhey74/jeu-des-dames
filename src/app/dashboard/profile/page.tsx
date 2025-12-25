'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
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
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-slate-800">Mon Profil</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Carte Avatar */}
                        <div className="lg:col-span-1">
                            <div className="card bg-white shadow-xl border-2 border-blue-300 hover:border-blue-500 transition-all">
                                <div className="card-body items-center text-center">
                                    <div className="avatar placeholder mb-4">
                                        <div className="bg-blue-800 text-white rounded-full w-32">
                                            <span className="text-5xl">{user.prenom[0]}{user.nom[0]}</span>
                                        </div>
                                    </div>
                                    <h2 className="card-title text-slate-800">{user.prenom} {user.nom}</h2>
                                    <p className="text-sm text-slate-600">@{user.username}</p>
                                    <div className="badge badge-primary mt-2">
                                        {user.isVerified ? '✓ Vérifié' : '⚠ Non vérifié'}
                                    </div>

                                    <div className="divider"></div>

                                    <div className="stats stats-vertical shadow w-full">
                                        <div className="stat">
                                            <div className="stat-title text-xs">Membre depuis</div>
                                            <div className="stat-value text-sm">
                                                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informations du profil */}
                        <div className="lg:col-span-2">
                            <div className="card bg-white shadow-xl border-2 border-slate-300 hover:border-slate-500 transition-all">
                                <div className="card-body">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="card-title text-slate-800">Informations personnelles</h2>
                                        {!isEditing && (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="btn btn-primary btn-sm"
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
                                                        <span className="label-text">Prénom</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="prenom"
                                                        value={formData.prenom}
                                                        onChange={handleChange}
                                                        className="input input-bordered"
                                                        required
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Nom</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="nom"
                                                        value={formData.nom}
                                                        onChange={handleChange}
                                                        className="input input-bordered"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Email</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="input input-bordered"
                                                    required
                                                />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Nom d&apos;utilisateur</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    className="input input-bordered"
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
                                                    className="btn btn-ghost"
                                                >
                                                    Annuler
                                                </button>
                                                <button type="submit" className="btn btn-primary">
                                                    Enregistrer
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm opacity-70">Prénom</p>
                                                    <p className="font-semibold">{user.prenom}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm opacity-70">Nom</p>
                                                    <p className="font-semibold">{user.nom}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm opacity-70">Email</p>
                                                <p className="font-semibold">{user.email}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm opacity-70">Nom d&apos;utilisateur</p>
                                                <p className="font-semibold">@{user.username}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sécurité */}
                            <div className="card bg-white shadow-xl mt-4 border-2 border-slate-300 hover:border-slate-500 transition-all">
                                <div className="card-body">
                                    <h2 className="card-title text-slate-800">Sécurité</h2>
                                    <div className="divider my-1"></div>

                                    <div className="space-y-4">
                                        <button className="btn btn-outline w-full justify-between">
                                            <span>Changer le mot de passe</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>

                                        {!user.isVerified && (
                                            <button className="btn btn-warning w-full justify-between">
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
                            <div className="card bg-red-50 border-2 border-red-400 shadow-xl mt-4 hover:border-red-600 transition-all">
                                <div className="card-body">
                                    <h2 className="card-title text-red-800">Zone de danger</h2>
                                    <div className="divider my-1"></div>
                                    <p className="text-sm text-red-700">Une fois votre compte supprimé, toutes vos données seront définitivement effacées.</p>
                                    <button className="btn btn-outline btn-error mt-2">
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

