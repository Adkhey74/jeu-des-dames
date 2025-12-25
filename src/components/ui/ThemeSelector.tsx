'use client';

import { useState, useEffect } from 'react';

const THEMES = [
    { name: 'light', label: 'Clair', icon: '☀️' },
    { name: 'dark', label: 'Sombre', icon: '🌙' },
    { name: 'cupcake', label: 'Cupcake', icon: '🧁' },
    { name: 'bumblebee', label: 'Abeille', icon: '🐝' },
    { name: 'emerald', label: 'Émeraude', icon: '💎' },
    { name: 'corporate', label: 'Corporate', icon: '💼' },
    { name: 'synthwave', label: 'Synthwave', icon: '🌆' },
    { name: 'retro', label: 'Rétro', icon: '📻' },
    { name: 'cyberpunk', label: 'Cyberpunk', icon: '🤖' },
    { name: 'valentine', label: 'Valentine', icon: '💝' },
    { name: 'halloween', label: 'Halloween', icon: '🎃' },
    { name: 'garden', label: 'Jardin', icon: '🌸' },
    { name: 'forest', label: 'Forêt', icon: '🌲' },
    { name: 'aqua', label: 'Aqua', icon: '🌊' },
    { name: 'lofi', label: 'Lo-Fi', icon: '🎧' },
    { name: 'pastel', label: 'Pastel', icon: '🎨' },
    { name: 'fantasy', label: 'Fantasy', icon: '🧚' },
    { name: 'wireframe', label: 'Wireframe', icon: '📐' },
    { name: 'black', label: 'Noir', icon: '⚫' },
    { name: 'luxury', label: 'Luxe', icon: '👑' },
    { name: 'dracula', label: 'Dracula', icon: '🧛' },
];

export default function ThemeSelector() {
    const [currentTheme, setCurrentTheme] = useState('light');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setCurrentTheme(storedTheme);
        document.documentElement.setAttribute('data-theme', storedTheme);
    }, []);

    const handleThemeChange = (themeName: string) => {
        setCurrentTheme(themeName);
        localStorage.setItem('theme', themeName);
        document.documentElement.setAttribute('data-theme', themeName);
        setIsOpen(false);
    };

    const currentThemeData = THEMES.find(t => t.name === currentTheme) || THEMES[0];

    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-xl">{currentThemeData.icon}</span>
            </div>
            {isOpen && (
                <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto"
                >
                    <li className="menu-title">
                        <span>Choisir un thème</span>
                    </li>
                    {THEMES.map((theme) => (
                        <li key={theme.name}>
                            <button
                                onClick={() => handleThemeChange(theme.name)}
                                className={`flex items-center gap-2 ${currentTheme === theme.name ? 'active bg-primary text-primary-content' : ''}`}
                            >
                                <span className="text-xl">{theme.icon}</span>
                                <span>{theme.label}</span>
                                {currentTheme === theme.name && (
                                    <span className="ml-auto">✓</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}




