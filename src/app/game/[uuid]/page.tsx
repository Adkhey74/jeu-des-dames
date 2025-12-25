'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Checkerboard from '@/components/game/Checkerboard';
import { Piece, Move, PlayerColor, User } from '@/types';

// Fonction pour initialiser le plateau
function initializeBoard(): Piece[] {
  const pieces: Piece[] = [];

  // Pièces blanches (en bas)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        pieces.push({
          id: `white-${row}-${col}`,
          type: 'pawn',
          color: 'white',
          position: { row, col },
        });
      }
    }
  }

  // Pièces noires (en haut)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        pieces.push({
          id: `black-${row}-${col}`,
          type: 'pawn',
          color: 'black',
          position: { row, col },
        });
      }
    }
  }

  return pieces;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [user, setUser] = useState<User | null>(null);
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white');
  const [currentTurn, setCurrentTurn] = useState<PlayerColor>('white');
  const [pieces, setPieces] = useState<Piece[]>(initializeBoard());
  const [opponent, setOpponent] = useState<User | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));

    // TODO: Se connecter au WebSocket et récupérer l'état de la partie
    // Simuler un adversaire pour le moment
    setGameStatus('playing');
  }, [router]);

  const handleMove = (move: Move) => {
    // Mettre à jour les pièces
    const newPieces = pieces.map(piece => {
      if (piece.position.row === move.from.row && piece.position.col === move.from.col) {
        const newPiece = { ...piece, position: move.to };

        // Promouvoir en dame si la pièce atteint le bout du plateau
        if ((piece.color === 'white' && move.to.row === 0) ||
          (piece.color === 'black' && move.to.row === 7)) {
          newPiece.type = 'king';
        }

        return newPiece;
      }
      return piece;
    }).filter(piece => {
      // Retirer les pièces capturées
      if (move.capturedPieces) {
        return !move.capturedPieces.some(
          cap => cap.row === piece.position.row && cap.col === piece.position.col
        );
      }
      return true;
    });

    setPieces(newPieces);
    setMoveHistory([...moveHistory, move]);

    // Changer de tour
    setCurrentTurn(currentTurn === 'white' ? 'black' : 'white');

    // Vérifier les conditions de victoire
    const whitePieces = newPieces.filter(p => p.color === 'white');
    const blackPieces = newPieces.filter(p => p.color === 'black');

    if (whitePieces.length === 0) {
      setWinner('black');
      setGameStatus('finished');
    } else if (blackPieces.length === 0) {
      setWinner('white');
      setGameStatus('finished');
    }

    // TODO: Envoyer le coup via WebSocket
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(uuid);
    alert('Code copié dans le presse-papier !');
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
      <main className="min-h-screen p-4 lg:p-8 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

            {/* Panneau de gauche - Info joueur blanc */}
            <div className="order-3 xl:order-1">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-400"></div>
                    Joueur Blanc
                  </h3>
                  <div className="divider my-2"></div>
                  {playerColor === 'white' ? (
                    <div>
                      <p className="font-bold text-lg">{user.prenom} {user.nom}</p>
                      <p className="text-base opacity-70">@{user.username}</p>
                      <div className="badge badge-primary mt-3 text-sm">Vous</div>
                    </div>
                  ) : opponent ? (
                    <div>
                      <p className="font-bold text-lg">{opponent.prenom} {opponent.nom}</p>
                      <p className="text-base opacity-70">@{opponent.username}</p>
                    </div>
                  ) : (
                    <p className="text-base opacity-70">En attente...</p>
                  )}

                  <div className="mt-6">
                    <p className="text-base font-semibold">Pièces restantes</p>
                    <p className="text-4xl font-bold text-primary">
                      {pieces.filter(p => p.color === 'white').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Historique des coups */}
              <div className="card bg-base-100 shadow-xl mt-4">
                <div className="card-body">
                  <h3 className="card-title text-base">Historique</h3>
                  <div className="divider my-2"></div>
                  <div className="overflow-y-auto max-h-48 text-sm space-y-2">
                    {moveHistory.length === 0 ? (
                      <p className="opacity-50 text-center py-4">Aucun coup joué</p>
                    ) : (
                      moveHistory.map((move, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-100">
                          <span className="font-semibold">Coup {index + 1}:</span>
                          <span className="font-mono text-xs">
                            ({move.from.row},{move.from.col}) → ({move.to.row},{move.to.col})
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Centre - Plateau de jeu */}
            <div className="order-1 xl:col-span-3 xl:order-2">
              <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-2xl border border-base-300">
                <div className="card-body items-center p-6">
                  <div className="mb-8 text-center w-full">
                    <div className="inline-flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-focus rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">🎲</span>
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">
                        Partie: {uuid.substring(0, 8)}
                      </h2>
                    </div>

                    {gameStatus === 'waiting' && (
                      <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-6 text-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-primary h-6 w-6" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-primary text-xl">En attente d'un adversaire...</p>
                            <button onClick={handleCopyCode} className="btn btn-primary btn-sm mt-2 shadow-lg">
                              Copier le code: {uuid.substring(0, 8)}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {gameStatus === 'finished' && winner && (
                      <div className={`
                        rounded-2xl p-6 text-lg shadow-lg
                        ${winner === playerColor
                          ? 'bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30'
                          : 'bg-gradient-to-r from-error/20 to-error/10 border border-error/30'
                        }
                      `}>
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            ${winner === playerColor ? 'bg-secondary/20' : 'bg-error/20'}
                          `}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${winner === playerColor ? 'stroke-secondary' : 'stroke-error'}`} fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className={`font-bold text-xl ${winner === playerColor ? 'text-secondary' : 'text-error'}`}>
                            {winner === playerColor ? '🎉 Vous avez gagné !' : '😢 Vous avez perdu'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Checkerboard
                    pieces={pieces}
                    currentTurn={currentTurn}
                    playerColor={playerColor}
                    onMove={handleMove}
                  />
                </div>
              </div>
            </div>

            {/* Panneau de droite - Info joueur noir */}
            <div className="order-2 xl:order-3">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">
                    <div className="w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-600"></div>
                    Joueur Noir
                  </h3>
                  <div className="divider my-2"></div>
                  {playerColor === 'black' ? (
                    <div>
                      <p className="font-bold text-lg">{user.prenom} {user.nom}</p>
                      <p className="text-base opacity-70">@{user.username}</p>
                      <div className="badge badge-primary mt-3 text-sm">Vous</div>
                    </div>
                  ) : opponent ? (
                    <div>
                      <p className="font-bold text-lg">{opponent.prenom} {opponent.nom}</p>
                      <p className="text-base opacity-70">@{opponent.username}</p>
                    </div>
                  ) : (
                    <p className="text-base opacity-70">En attente...</p>
                  )}

                  <div className="mt-6">
                    <p className="text-base font-semibold">Pièces restantes</p>
                    <p className="text-4xl font-bold text-primary">
                      {pieces.filter(p => p.color === 'black').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions de jeu */}
              <div className="card bg-base-100 shadow-xl mt-4">
                <div className="card-body">
                  <h3 className="card-title text-base">Actions</h3>
                  <div className="divider my-2"></div>
                  <div className="space-y-3">
                    <button
                      className="btn btn-outline w-full text-base"
                      onClick={() => {
                        if (confirm('Abandonner la partie ?')) {
                          router.push('/dashboard');
                        }
                      }}
                    >
                      Abandonner
                    </button>
                    <button
                      className="btn btn-outline w-full text-base"
                      onClick={handleCopyCode}
                    >
                      Partager le code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

