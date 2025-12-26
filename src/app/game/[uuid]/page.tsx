'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [playerColor, setPlayerColor] = useState<PlayerColor | null>(null);
  const [currentTurn, setCurrentTurn] = useState<PlayerColor>('white');
  const [pieces, setPieces] = useState<Piece[]>(initializeBoard());
  const [opponent, setOpponent] = useState<User | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const previousStatusRef = useRef<'waiting' | 'playing' | 'finished'>('waiting');

  useEffect(() => {
    const loadGame = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!storedUser || !token) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);
      setLoading(true);

      try {
        // Récupérer les données de la partie depuis l'API
        const response = await fetch(`/api/game/${uuid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erreur lors du chargement de la partie');
        }

        const data = await response.json();

        // Mettre à jour l'état de la partie
        if (data.game) {
          setGameStatus(data.game.status as 'waiting' | 'playing' | 'finished');
          setCurrentTurn(data.game.currentTurn as PlayerColor);
          
          if (data.game.pieces && Array.isArray(data.game.pieces)) {
            setPieces(data.game.pieces as Piece[]);
          }
          
          if (data.game.moves && Array.isArray(data.game.moves)) {
            setMoveHistory(data.game.moves as Move[]);
          }
          
          if (data.game.winner) {
            setWinner(data.game.winner as PlayerColor);
          }

          // Déterminer l'adversaire
          if (data.playerColor === 'white' && data.game.blackPlayer) {
            setOpponent(data.game.blackPlayer as User);
          } else if (data.playerColor === 'black' && data.game.whitePlayer) {
            setOpponent(data.game.whitePlayer as User);
          }

          // Définir la couleur du joueur
          if (data.playerColor) {
            setPlayerColor(data.playerColor as PlayerColor);
          }
          
          // Initialiser la référence de l'état
          if (data.game.status) {
            previousStatusRef.current = data.game.status as 'waiting' | 'playing' | 'finished';
          }
          
          // Si l'adversaire vient de rejoindre (passage de waiting à playing)
          if (previousStatusRef.current === 'waiting' && data.game.status === 'playing' && data.game.blackPlayer) {
            // Notification que l'adversaire a rejoint
            setTimeout(() => {
              const opponentName = data.playerColor === 'white' 
                ? `${data.game.blackPlayer?.prenom} ${data.game.blackPlayer?.nom}`
                : `${data.game.whitePlayer?.prenom} ${data.game.whitePlayer?.nom}`;
              alert(`🎮 ${opponentName} a rejoint la partie ! La partie commence.`);
            }, 500);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Erreur chargement partie:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [uuid, router]);

  // Fonction pour recharger l'état de la partie
  const loadGameState = async () => {
    const token = localStorage.getItem('token');
    if (!token || !playerColor) return;

    try {
      const response = await fetch(`/api/game/${uuid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.game) {
          const previousStatus = previousStatusRef.current;
          const newStatus = data.game.status as 'waiting' | 'playing' | 'finished';
          
          setGameStatus(newStatus);
          setCurrentTurn(data.game.currentTurn as PlayerColor);
          
          if (data.game.pieces && Array.isArray(data.game.pieces)) {
            setPieces(data.game.pieces as Piece[]);
          }
          
          if (data.game.moves && Array.isArray(data.game.moves)) {
            setMoveHistory(data.game.moves as Move[]);
          }
          
          if (data.game.winner) {
            setWinner(data.game.winner as PlayerColor);
            
            // Si la partie vient de se terminer et que l'utilisateur a gagné (abandon de l'adversaire)
            if (previousStatus === 'playing' && 
                newStatus === 'finished' && 
                data.game.winner === playerColor) {
              // Afficher une notification de victoire
              setTimeout(() => {
                alert('🎉 Félicitations ! Votre adversaire a abandonné. Vous avez gagné !');
              }, 500);
            }
          }

          // Mettre à jour l'adversaire
          if (data.playerColor === 'white' && data.game.blackPlayer) {
            setOpponent(data.game.blackPlayer as User);
          } else if (data.playerColor === 'black' && data.game.whitePlayer) {
            setOpponent(data.game.whitePlayer as User);
          }
          
          // Si l'adversaire vient de rejoindre (passage de waiting à playing)
          if (previousStatus === 'waiting' && newStatus === 'playing' && data.game.blackPlayer) {
            // Notification que l'adversaire a rejoint
            setTimeout(() => {
              const opponentName = data.playerColor === 'white' 
                ? `${data.game.blackPlayer?.prenom} ${data.game.blackPlayer?.nom}`
                : `${data.game.whitePlayer?.prenom} ${data.game.whitePlayer?.nom}`;
              if (opponentName) {
                alert(`🎮 ${opponentName} a rejoint la partie ! La partie commence.`);
              }
            }, 500);
          }
          
          // Mettre à jour la référence de l'état précédent
          previousStatusRef.current = newStatus;
        }
      }
    } catch (err) {
      console.error('Erreur chargement état:', err);
    }
  };

  // Polling pour vérifier les mises à jour de la partie
  useEffect(() => {
    if (!playerColor) return;

    const pollInterval = setInterval(() => {
      // Vérifier en continu pour détecter :
      // - Quand l'adversaire rejoint (waiting -> playing)
      // - Les coups de l'adversaire (playing)
      // - Les abandons (playing -> finished)
      loadGameState();
    }, 2000); // Vérifier toutes les 2 secondes

    return () => {
      clearInterval(pollInterval);
    };
  }, [uuid, playerColor]);

  const handleMove = async (move: Move) => {
    if (!playerColor || !user) return;

    // Mettre à jour les pièces localement (optimistic update)
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

    // Mise à jour optimiste de l'UI
    setPieces(newPieces);
    setMoveHistory([...moveHistory, move]);
    const nextTurn = currentTurn === 'white' ? 'black' : 'white';
    setCurrentTurn(nextTurn);

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

    // Envoyer le coup à l'API
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/game/${uuid}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          move,
          pieces: newPieces,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Erreur enregistrement coup:', data.error);
        // Recharger l'état depuis le serveur en cas d'erreur
        loadGameState();
      } else {
        const data = await response.json();
        // Mettre à jour avec les données du serveur
        if (data.game) {
          setPieces(data.game.pieces as Piece[]);
          setMoveHistory(data.game.moves as Move[]);
          setCurrentTurn(data.game.currentTurn as PlayerColor);
          setGameStatus(data.game.status as 'waiting' | 'playing' | 'finished');
          if (data.game.winner) {
            setWinner(data.game.winner as PlayerColor);
          }
        }
      }
    } catch (err) {
      console.error('Erreur envoi coup:', err);
      // Recharger l'état depuis le serveur en cas d'erreur
      loadGameState();
    }
  };


  const handleCopyCode = () => {
    navigator.clipboard.writeText(uuid);
    alert('Code copié dans le presse-papier !');
  };

  const handleAbandon = async () => {
    if (!confirm('Êtes-vous sûr de vouloir abandonner cette partie ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/game/${uuid}/abandon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Erreur lors de l\'abandon');
        return;
      }

      // Mettre à jour l'état local
      setGameStatus('finished');
      setWinner(playerColor === 'white' ? 'black' : 'white');
      
      // Rediriger vers le dashboard après un court délai
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Erreur abandon:', err);
      alert('Erreur lors de l\'abandon de la partie');
    }
  };

  if (!user || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
            <p className="mt-4 text-gray-600">Chargement de la partie...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
          <div className="card bg-white shadow-xl border-2 border-red-200 max-w-md">
            <div className="card-body text-center">
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
              <button 
                onClick={() => router.push('/dashboard')} 
                className="btn btn-primary mt-4"
              >
                Retour au dashboard
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!playerColor) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
          <div className="card bg-white shadow-xl border-2 border-indigo-200 max-w-md">
            <div className="card-body text-center">
              <p className="text-gray-600 mb-4">Vous n&apos;êtes pas autorisé à voir cette partie.</p>
              <button 
                onClick={() => router.push('/dashboard')} 
                className="btn btn-primary"
              >
                Retour au dashboard
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="h-screen overflow-hidden ml-20 lg:ml-64 pt-2 pb-2 pr-2 lg:pt-3 lg:pb-3 lg:pr-3 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
        <div className="h-full">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 h-full">

            {/* Panneau de gauche - Info joueur blanc */}
            <div className="order-3 xl:order-1 flex flex-col h-full">
              <div className={`card bg-white shadow-xl border-2 rounded-xl overflow-hidden transition-all duration-300 flex-1 flex flex-col ${
                currentTurn === 'white' && gameStatus === 'playing' 
                  ? 'border-indigo-400 shadow-2xl ring-2 ring-indigo-200' 
                  : 'border-indigo-100 hover:border-indigo-300'
              }`}>
                <div className={`card-body p-3 flex-1 flex flex-col ${
                  currentTurn === 'white' && gameStatus === 'playing' 
                    ? 'bg-gradient-to-br from-indigo-50/50 to-purple-50/50' 
                    : ''
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 flex items-center justify-center shadow-md transition-all ${
                      currentTurn === 'white' && gameStatus === 'playing' 
                        ? 'border-indigo-400 ring-2 ring-indigo-300 animate-pulse' 
                        : 'border-gray-300'
                    }`}>
                      <div className="w-5 h-5 rounded-full bg-white border border-gray-400 shadow-inner"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="card-title text-sm text-gray-800">Joueur Blanc</h3>
                      {currentTurn === 'white' && gameStatus === 'playing' && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                          <span className="text-xs font-semibold text-indigo-600">Au tour</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="divider my-2 opacity-30"></div>
                  {playerColor === 'white' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full w-10 h-10 shadow-md">
                            <span className="text-sm font-bold">{user.prenom[0]}{user.nom[0]}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{user.prenom} {user.nom}</p>
                          <p className="text-xs text-gray-600 truncate">@{user.username}</p>
                        </div>
                      </div>
                      <div className="badge bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md w-full justify-center py-2 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Vous
                      </div>
                    </div>
                  ) : opponent ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-full w-10 h-10 shadow-md">
                            <span className="text-sm font-bold">{opponent.prenom[0]}{opponent.nom[0]}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{opponent.prenom} {opponent.nom}</p>
                          <p className="text-xs text-gray-600 truncate">@{opponent.username}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-gray-500">En attente...</p>
                    </div>
                  )}

                  <div className={`mt-3 p-3 rounded-lg border-2 transition-all ${
                    currentTurn === 'white' && gameStatus === 'playing'
                      ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-300 shadow-md'
                      : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">Pièces</p>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {pieces.filter(p => p.color === 'white').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Historique des coups */}
              <div className="card bg-white shadow-xl border-2 border-indigo-100 hover:border-indigo-300 transition-all rounded-xl overflow-hidden mt-2 flex-1 flex flex-col min-h-0">
                <div className="card-body p-3 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="card-title text-xs text-gray-800">Historique</h3>
                    {moveHistory.length > 0 && (
                      <div className="badge badge-primary badge-xs">{moveHistory.length}</div>
                    )}
                  </div>
                  <div className="divider my-1 opacity-30"></div>
                  <div className="overflow-y-auto flex-1 text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100">
                    {moveHistory.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">Aucun coup</p>
                      </div>
                    ) : (
                      moveHistory.map((move, index) => {
                        const isRecent = index === moveHistory.length - 1;
                        return (
                          <div 
                            key={index} 
                            className={`flex justify-between items-center p-2 rounded-md border transition-all ${
                              isRecent
                                ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-300 shadow-sm ring-1 ring-indigo-200'
                                : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100 hover:shadow-sm hover:border-indigo-200'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                isRecent
                                  ? 'bg-indigo-600 text-white shadow-md'
                                  : 'bg-indigo-200 text-indigo-700'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-semibold text-gray-700 text-xs">#{index + 1}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-indigo-100">
                                ({move.from.row},{move.from.col})→({move.to.row},{move.to.col})
                              </span>
                              {isRecent && (
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Centre - Plateau de jeu */}
            <div className="order-1 xl:col-span-3 xl:order-2 flex flex-col h-full min-h-0">
              <div className="card bg-white shadow-2xl border-2 border-indigo-100 rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="card-body items-center p-2 flex-1 flex flex-col min-h-0">
                  <div className="mb-1 text-center w-full flex-shrink-0">
                    <div className="inline-flex items-center gap-1.5 mb-1 px-3 py-1.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 rounded-lg shadow-lg border border-white/20 backdrop-blur-sm">
                      <div className="w-6 h-6 bg-white/30 rounded-md flex items-center justify-center backdrop-blur-md shadow-sm">
                        <span className="text-white text-sm">🎲</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <h2 className="text-xs font-bold text-white drop-shadow-md">
                          Partie en cours
                        </h2>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-xs text-white/90 bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm">
                            {uuid.substring(0, 8).toUpperCase()}
                          </span>
                          <button
                            onClick={handleCopyCode}
                            className="p-0.5 rounded bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
                            title="Copier le code"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {gameStatus === 'waiting' && !opponent && (
                      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm shadow-md">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-white h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-indigo-700 text-sm">En attente d&apos;un adversaire...</p>
                            <button 
                              onClick={handleCopyCode} 
                              className="btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700 shadow-md mt-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copier: {uuid.substring(0, 8).toUpperCase()}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {gameStatus === 'playing' && opponent && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-2 text-xs shadow-md">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-white h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="font-bold text-green-700 text-xs">
                            {opponent.prenom} {opponent.nom} a rejoint !
                          </p>
                        </div>
                      </div>
                    )}

                    {gameStatus === 'finished' && winner && (
                      <div className={`
                        rounded-2xl p-8 text-lg shadow-2xl border-2 animate-in fade-in slide-in-from-top-4 duration-500
                        ${winner === playerColor
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
                        }
                      `}>
                        <div className="flex flex-col items-center gap-4 text-center">
                          <div className={`
                            w-20 h-20 rounded-full flex items-center justify-center shadow-xl animate-bounce
                            ${winner === playerColor ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}
                          `}>
                            {winner === playerColor ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 stroke-white" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 stroke-white" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className={`font-bold text-3xl block mb-2 ${winner === playerColor ? 'text-green-700' : 'text-red-700'}`}>
                              {winner === playerColor ? '🎉 Vous avez gagné !' : '😢 Vous avez perdu'}
                            </span>
                            {winner === playerColor && opponent && (
                              <p className="text-sm text-gray-600 mt-2">
                                {opponent.prenom} {opponent.nom} a abandonné la partie
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => router.push('/dashboard')}
                            className="btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all mt-4"
                          >
                            Retour au dashboard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden" style={{ minHeight: 0 }}>
                    {playerColor && (
                      <div className="w-full h-full max-w-full max-h-full flex items-center justify-center" style={{ 
                        width: '100%', 
                        height: '100%',
                        minWidth: 0,
                        minHeight: 0
                      }}>
                        <Checkerboard
                          pieces={pieces}
                          currentTurn={currentTurn}
                          playerColor={playerColor}
                          onMove={handleMove}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Panneau de droite - Info joueur noir */}
            <div className="order-2 xl:order-3 flex flex-col h-full">
              <div className={`card bg-white shadow-xl border-2 rounded-xl overflow-hidden transition-all duration-300 flex-1 flex flex-col ${
                currentTurn === 'black' && gameStatus === 'playing' 
                  ? 'border-indigo-400 shadow-2xl ring-2 ring-indigo-200' 
                  : 'border-indigo-100 hover:border-indigo-300'
              }`}>
                <div className={`card-body p-3 flex-1 flex flex-col ${
                  currentTurn === 'black' && gameStatus === 'playing' 
                    ? 'bg-gradient-to-br from-indigo-50/50 to-purple-50/50' 
                    : ''
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 flex items-center justify-center shadow-md transition-all ${
                      currentTurn === 'black' && gameStatus === 'playing' 
                        ? 'border-indigo-400 ring-2 ring-indigo-300 animate-pulse' 
                        : 'border-gray-700'
                    }`}>
                      <div className="w-5 h-5 rounded-full bg-gray-900 border border-gray-700 shadow-inner"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="card-title text-sm text-gray-800">Joueur Noir</h3>
                      {currentTurn === 'black' && gameStatus === 'playing' && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                          <span className="text-xs font-semibold text-indigo-600">Au tour</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="divider my-2 opacity-30"></div>
                  {playerColor === 'black' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full w-10 h-10 shadow-md">
                            <span className="text-sm font-bold">{user.prenom[0]}{user.nom[0]}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{user.prenom} {user.nom}</p>
                          <p className="text-xs text-gray-600 truncate">@{user.username}</p>
                        </div>
                      </div>
                      <div className="badge bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md w-full justify-center py-2 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Vous
                      </div>
                    </div>
                  ) : opponent ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-full w-10 h-10 shadow-md">
                            <span className="text-sm font-bold">{opponent.prenom[0]}{opponent.nom[0]}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{opponent.prenom} {opponent.nom}</p>
                          <p className="text-xs text-gray-600 truncate">@{opponent.username}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-gray-500">En attente...</p>
                    </div>
                  )}

                  <div className={`mt-3 p-3 rounded-lg border-2 transition-all ${
                    currentTurn === 'black' && gameStatus === 'playing'
                      ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-300 shadow-md'
                      : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">Pièces</p>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {pieces.filter(p => p.color === 'black').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions de jeu */}
              <div className="card bg-white shadow-xl border-2 border-indigo-100 hover:border-indigo-300 transition-all rounded-xl overflow-hidden mt-2">
                <div className="card-body p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <h3 className="card-title text-xs text-gray-800">Actions</h3>
                  </div>
                  <div className="divider my-1.5 opacity-30"></div>
                  <div className="space-y-2">
                    <button
                      className="btn btn-sm w-full text-xs border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:shadow-md transition-all duration-200 group"
                      onClick={handleAbandon}
                      disabled={gameStatus === 'finished'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Abandonner
                    </button>
                    <button
                      className="btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all w-full group"
                      onClick={handleCopyCode}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Partager
                    </button>
                    <button
                      className="btn btn-sm btn-ghost w-full text-xs border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                      onClick={() => router.push('/dashboard')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Retour
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

