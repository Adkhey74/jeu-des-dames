'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import Checkerboard from '@/components/game/Checkerboard';
import { useToast } from '@/components/ui/Toast';
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

// Fonction pour convertir une position en notation algébrique (A-H, 1-8)
function positionToAlgebraic(row: number, col: number): string {
  // Colonnes : A-H (de gauche à droite, col 0 = A, col 7 = H)
  // Lignes : 1-8 (de bas en haut pour les blancs, row 0 = ligne 8, row 7 = ligne 1)
  const letter = String.fromCharCode(65 + col); // A=65, B=66, etc.
  const number = 8 - row; // Inverser : row 0 = 8, row 7 = 1
  return `${letter}${number}`;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
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
  const [gameId, setGameId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
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
          setGameId(data.game.id);
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
              showToast(`🎮 ${opponentName} a rejoint la partie ! La partie commence.`, 'success');
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
  const loadGameState = useCallback(async () => {
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
            
            // Si la partie vient de se terminer
            if (previousStatus === 'playing' && newStatus === 'finished' && data.game.winner) {
              // Afficher une notification de fin de partie
              setTimeout(() => {
                if (data.game.winner === playerColor) {
                  showToast('🎉 Félicitations ! Vous avez gagné la partie !', 'success', 5000);
                } else {
                  showToast('😢 Vous avez perdu la partie', 'error', 5000);
                }
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
                showToast(`🎮 ${opponentName} a rejoint la partie ! La partie commence.`, 'success');
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
  }, [uuid, playerColor]);

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
  }, [uuid, playerColor, loadGameState]);

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
      if (playerColor === 'black') {
        showToast('🎉 Félicitations ! Vous avez gagné la partie !', 'success', 5000);
      } else {
        showToast('😢 Vous avez perdu la partie', 'error', 5000);
      }
    } else if (blackPieces.length === 0) {
      setWinner('white');
      setGameStatus('finished');
      if (playerColor === 'white') {
        showToast('🎉 Félicitations ! Vous avez gagné la partie !', 'success', 5000);
      } else {
        showToast('😢 Vous avez perdu la partie', 'error', 5000);
      }
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
    showToast('Code copié dans le presse-papier !', 'success');
  };

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleInviteUser = async (inviteeUsername: string) => {
    if (!gameId) return;

    setInviting(inviteeUsername);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/game/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId,
          inviteeUsername,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Invitation envoyée à @${inviteeUsername}`, 'success');
        setShowInviteModal(false);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        showToast(data.error || 'Erreur lors de l\'envoi de l\'invitation', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Erreur de communication avec le serveur', 'error');
    } finally {
      setInviting(null);
    }
  };

  const handleAbandon = () => {
    setShowAbandonModal(true);
  };

  const confirmAbandon = async () => {
    setAbandoning(true);
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
        showToast(data.error || 'Erreur lors de l\'abandon', 'error');
        setShowAbandonModal(false);
        setAbandoning(false);
        return;
      }

      // Mettre à jour l'état local
      setGameStatus('finished');
      setWinner(playerColor === 'white' ? 'black' : 'white');
      
      // Afficher un toast de confirmation
      showToast('Vous avez abandonné la partie', 'info', 3000);
      
      // Fermer la modale
      setShowAbandonModal(false);
      
      // Rediriger vers le dashboard après un court délai
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Erreur abandon:', err);
      showToast('Erreur lors de l\'abandon de la partie', 'error');
      setShowAbandonModal(false);
    } finally {
      setAbandoning(false);
    }
  };

  if (!user || loading) {
    return (
      <>
        <Navbar />
        <Header />
                <div className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20 flex items-center justify-center bg-gradient-gaming">
                  <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-white"></span>
                    <p className="mt-4 text-white/70">Chargement de la partie...</p>
                  </div>
                </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Header />
        <div className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20 flex items-center justify-center bg-gradient-gaming">
          <div className="card gaming-card-header shadow-xl border-2 border-white max-w-md">
            <div className="card-body text-center">
              <div className="alert bg-gray-900 text-white border border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-white shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white">{error}</span>
              </div>
              <button 
                onClick={() => router.push('/dashboard')} 
                className="btn bg-white text-black border-0 hover:bg-gray-200 mt-4"
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
        <Header />
        <div className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20 flex items-center justify-center bg-gradient-gaming">
          <div className="card gaming-card-header shadow-xl border-2 border-white/30 max-w-md">
            <div className="card-body text-center">
              <p className="text-white mb-4">Vous n&apos;êtes pas autorisé à voir cette partie.</p>
              <button 
                onClick={() => router.push('/dashboard')} 
                className="btn bg-white text-black border-0 hover:bg-gray-200"
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
      <Header />
      <main className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20 pb-2 pr-2 lg:pb-3 lg:pr-3 bg-gradient-gaming" style={{ height: 'calc(100vh - 4rem)', maxHeight: 'calc(100vh - 4rem)' }}>
        <div className="h-full" style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 h-full" style={{ minHeight: 0, height: '100%', maxHeight: '100%' }}>

            {/* Panneau de gauche - Info joueur blanc */}
            <div className="order-3 xl:order-1 flex flex-col h-full" style={{ minHeight: 0, maxHeight: '100%', overflow: 'hidden' }}>
              <div className={`card gaming-card-header shadow-xl border-2 rounded-xl overflow-hidden transition-all duration-300 flex-shrink-0 flex flex-col ${
                currentTurn === 'white' && gameStatus === 'playing' 
                  ? 'border-white shadow-2xl ring-2 ring-white/20' 
                  : 'border-white/30 hover:border-white/50'
              }`}>
                <div className={`card-body p-3 flex-1 flex flex-col ${
                  currentTurn === 'white' && gameStatus === 'playing' 
                    ? 'bg-gradient-to-br from-white/10 to-black/20' 
                    : ''
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 flex items-center justify-center shadow-md transition-all ${
                      currentTurn === 'white' && gameStatus === 'playing' 
                        ? 'border-white ring-2 ring-white/30 animate-pulse' 
                        : 'border-white/30'
                    }`}>
                      <div className="w-5 h-5 rounded-full bg-white border border-white/50 shadow-inner"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="card-title text-sm text-white">Joueur Blanc</h3>
                      {currentTurn === 'white' && gameStatus === 'playing' && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-black shadow-lg ring-2 ring-white/50 animate-turn-glow">
                          <div className="relative flex items-center justify-center">
                            <div className="absolute w-3 h-3 rounded-full bg-black/20 animate-pulse"></div>
                            <div className="relative w-2 h-2 rounded-full bg-black"></div>
                          </div>
                          <span className="text-xs font-bold tracking-tight">À VOTRE TOUR</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="divider my-2 opacity-30"></div>
                  {playerColor === 'white' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-black text-white rounded-full w-10 h-10 shadow-md flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ display: 'block', margin: '0 auto' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white truncate">{user.prenom} {user.nom}</p>
                          <p className="text-xs text-white/70 truncate">@{user.username}</p>
                        </div>
                      </div>
                      <div className="badge bg-white text-black border-0 shadow-md w-full justify-center py-2 text-xs">
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
                          <div className="bg-gradient-to-br from-white to-gray-300 text-black rounded-full w-10 h-10 shadow-md flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ display: 'block', margin: '0 auto' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white truncate">{opponent.prenom} {opponent.nom}</p>
                          <p className="text-xs text-gray-300 truncate">@{opponent.username}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-black/40 flex items-center justify-center shadow-md animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-white/60">En attente...</p>
                    </div>
                  )}

                  <div className={`mt-3 p-3 rounded-lg border-2 transition-all ${
                    currentTurn === 'white' && gameStatus === 'playing'
                      ? 'bg-gradient-to-br from-white/20 to-black/40 border-white shadow-md'
                      : 'bg-gradient-to-br from-white/10 to-black/30 border-white/30'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-white">Pièces</p>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold text-white">
                      {pieces.filter(p => p.color === 'white').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Historique des coups */}
              <div className="card gaming-card-header shadow-xl border-2 border-white/30 hover:border-white/50 transition-all rounded-xl overflow-hidden mt-2 flex-1 flex flex-col min-h-0" style={{ minHeight: 0, maxHeight: '100%', overflow: 'hidden' }}>
                <div className="card-body p-3 flex-1 flex flex-col min-h-0" style={{ minHeight: 0, maxHeight: '100%', overflow: 'hidden' }}>
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="card-title text-xs text-white">Historique</h3>
                    </div>
                    {moveHistory.length > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-br from-white/20 to-black/40 border border-white/30 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs font-bold text-white">{moveHistory.length}</span>
                        <span className="text-xs text-white/70">coups</span>
                      </div>
                    )}
                  </div>
                  <div className="divider my-1 opacity-30 flex-shrink-0"></div>
                  <div className="overflow-y-auto flex-1 text-xs space-y-1.5 min-h-0" style={{ minHeight: 0, maxHeight: '100%' }}>
                    {moveHistory.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-white/20 to-black/40 flex items-center justify-center border border-white/30">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-white/60 text-xs font-medium">Aucun coup</p>
                      </div>
                    ) : (
                      moveHistory.map((move, index) => {
                        const isRecent = index === moveHistory.length - 1;
                        return (
                          <div 
                            key={index} 
                            className={`flex justify-between items-center p-2 rounded-md border transition-all ${
                              isRecent
                                ? 'bg-gradient-to-br from-white/20 to-black/40 border-white shadow-sm ring-1 ring-white/20'
                                : 'bg-gradient-to-br from-white/10 to-black/30 border-white/30 hover:shadow-sm hover:border-white/50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                isRecent
                                  ? 'bg-white text-black shadow-md'
                                  : 'bg-gradient-to-br from-white/30 to-black/50 text-white'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-semibold text-white text-xs">#{index + 1}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-white bg-gradient-to-br from-white/10 to-black/30 px-2 py-0.5 rounded border border-white/30">
                                {positionToAlgebraic(move.from.row, move.from.col)}→{positionToAlgebraic(move.to.row, move.to.col)}
                                {move.capturedPieces && move.capturedPieces.length > 0 && (
                                  <span className="text-red-300 ml-1">
                                    (×{move.capturedPieces.length})
                                  </span>
                                )}
                              </span>
                              {isRecent && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
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
            <div className="order-1 xl:col-span-3 xl:order-2 flex flex-col h-full min-h-0" style={{ minHeight: 0, maxHeight: '100%' }}>
              <div className="card gaming-card-header shadow-2xl border-2 border-white/30 rounded-xl overflow-hidden flex-1 flex flex-col min-h-0" style={{ minHeight: 0 }}>
                <div className="card-body items-center p-2 flex-1 flex flex-col min-h-0" style={{ minHeight: 0, overflow: 'hidden' }}>
                  <div className="mb-2 text-center w-full flex-shrink-0">
                    {/* Statut de la partie - fusionné */}
                    {gameStatus === 'waiting' && !opponent ? (
                      // En attente d'un adversaire
                      <div className="bg-gradient-to-br from-white/15 to-black/40 border border-white/30 rounded-xl p-3 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="absolute inset-0 w-10 h-10 bg-white rounded-full animate-ping opacity-20"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm mb-0.5">En attente d&apos;un adversaire...</p>
                            <p className="text-white/70 text-xs truncate">Partagez le code pour inviter un joueur</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
                              <p className="text-white/60 text-xs mb-0.5">Code</p>
                              <p className="font-mono text-sm font-bold text-white">{uuid.substring(0, 8).toUpperCase()}</p>
                            </div>
                            <button 
                              onClick={handleCopyCode} 
                              className="btn btn-sm bg-white text-black border-0 hover:bg-gray-200 shadow-md hover:shadow-lg transition-all group/btn whitespace-nowrap"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copier
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Partie en cours
                      <div className="inline-flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 group">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center ring-1 ring-gray-200 group-hover:ring-gray-300 transition-all shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-sm font-bold text-black tracking-tight whitespace-nowrap">
                            Partie en cours
                          </h2>
                          <div className="h-5 w-px bg-gray-300"></div>
                          <span className="font-mono text-xs font-semibold text-black bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm whitespace-nowrap">
                            {uuid.substring(0, 8).toUpperCase()}
                          </span>
                          <button
                            onClick={handleCopyCode}
                            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md group/btn flex-shrink-0"
                            title="Copier le code"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden" style={{ minHeight: 0, maxHeight: '100%', overflow: 'hidden' }}>
                    {playerColor && (
                      <div className="w-full h-full flex items-center justify-center" style={{ 
                        width: '100%', 
                        height: '100%',
                        minWidth: 0,
                        minHeight: 0,
                        maxWidth: '100%',
                        maxHeight: '100%'
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
            <div className="order-2 xl:order-3 flex flex-col h-full" style={{ minHeight: 0, maxHeight: '100%' }}>
              <div className={`card gaming-card-header shadow-xl border-2 rounded-xl overflow-hidden transition-all duration-300 flex-shrink-0 flex flex-col ${
                currentTurn === 'black' && gameStatus === 'playing' 
                  ? 'border-white shadow-2xl ring-2 ring-white/20' 
                  : 'border-white/30 hover:border-white/50'
              }`}>
                <div className={`card-body p-3 flex-1 flex flex-col ${
                  currentTurn === 'black' && gameStatus === 'playing' 
                    ? 'bg-gradient-to-br from-white/10 to-black/20' 
                    : ''
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 flex items-center justify-center shadow-md transition-all ${
                      currentTurn === 'black' && gameStatus === 'playing' 
                        ? 'border-white ring-2 ring-white/30 animate-pulse' 
                        : 'border-white/30'
                    }`}>
                      <div className="w-5 h-5 rounded-full bg-black border border-white/30 shadow-inner"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="card-title text-sm text-white">Joueur Noir</h3>
                      {currentTurn === 'black' && gameStatus === 'playing' && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-black shadow-lg ring-2 ring-white/50 animate-turn-glow">
                          <div className="relative flex items-center justify-center">
                            <div className="absolute w-3 h-3 rounded-full bg-black/20 animate-pulse"></div>
                            <div className="relative w-2 h-2 rounded-full bg-black"></div>
                          </div>
                          <span className="text-xs font-bold tracking-tight">À VOTRE TOUR</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="divider my-2 opacity-30"></div>
                  {playerColor === 'black' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-white text-black rounded-full w-10 h-10 shadow-md flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ display: 'block', margin: '0 auto' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white truncate">{user.prenom} {user.nom}</p>
                          <p className="text-xs text-white/70 truncate">@{user.username}</p>
                        </div>
                      </div>
                      <div className="badge bg-white text-black border-0 shadow-md w-full justify-center py-2 text-xs">
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
                          <div className="bg-gradient-to-br from-white to-gray-300 text-black rounded-full w-10 h-10 shadow-md flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ display: 'block', margin: '0 auto' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white truncate">{opponent.prenom} {opponent.nom}</p>
                          <p className="text-xs text-gray-300 truncate">@{opponent.username}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-black/40 flex items-center justify-center shadow-md animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-white/60">En attente...</p>
                    </div>
                  )}

                  <div className={`mt-3 p-3 rounded-lg border-2 transition-all ${
                    currentTurn === 'black' && gameStatus === 'playing'
                      ? 'bg-gradient-to-br from-white/20 to-black/40 border-white shadow-md'
                      : 'bg-gradient-to-br from-white/10 to-black/30 border-white/30'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-white">Pièces</p>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold text-white">
                      {pieces.filter(p => p.color === 'black').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions de jeu */}
              <div className="card gaming-card-header shadow-xl border-2 border-white/30 hover:border-white/50 transition-all rounded-xl overflow-hidden mt-2 flex-shrink-0">
                <div className="card-body p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <h3 className="card-title text-xs text-white">Actions</h3>
                  </div>
                  <div className="divider my-1.5 opacity-30"></div>
                  <div className="space-y-2">
                    {playerColor === 'white' && gameStatus === 'waiting' && !opponent && (
                      <button
                        className="btn btn-sm w-full text-xs bg-white border-2 border-white text-black hover:bg-gray-200 hover:border-white hover:shadow-md transition-all duration-200 group"
                        onClick={() => setShowInviteModal(true)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Inviter un joueur
                      </button>
                    )}
                    <button
                      className="btn btn-sm w-full text-xs bg-white border-2 border-white text-black hover:bg-gray-200 hover:border-white hover:shadow-md transition-all duration-200 group"
                      onClick={handleAbandon}
                      disabled={gameStatus === 'finished'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Abandonner
                    </button>
                    <button
                      className="btn btn-sm bg-white text-black border-0 hover:bg-gray-200 shadow-md hover:shadow-lg transition-all w-full group"
                      onClick={handleCopyCode}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Partager
                    </button>
                    <button
                      className="btn btn-sm btn-ghost w-full text-xs border border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all"
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

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Inviter un joueur
                </h3>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-white/60 hover:text-white transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="form-control mb-4">
                <input
                  type="text"
                  placeholder="Rechercher par nom d'utilisateur..."
                  className="input bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearchUsers(e.target.value);
                  }}
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {searching ? (
                  <div className="text-center py-4">
                    <span className="loading loading-spinner loading-sm text-white"></span>
                  </div>
                ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                  <div className="text-center py-4">
                    <p className="text-white/60 text-sm">Aucun utilisateur trouvé</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((userResult) => (
                    <div
                      key={userResult.id}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{userResult.prenom} {userResult.nom}</p>
                            <p className="text-white/60 text-xs">@{userResult.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleInviteUser(userResult.username)}
                          disabled={inviting === userResult.username}
                          className="btn btn-sm bg-white hover:bg-gray-200 text-black border-0"
                        >
                          {inviting === userResult.username ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            'Inviter'
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-white/60 text-sm">Tapez au moins 2 caractères pour rechercher</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'abandon */}
      {showAbandonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Abandonner la partie
                </h3>
                <button
                  onClick={() => setShowAbandonModal(false)}
                  disabled={abandoning}
                  className="text-white/60 hover:text-white transition-all disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/20 to-black/40 flex items-center justify-center border-2 border-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-white text-center text-lg font-semibold mb-2">
                  Êtes-vous sûr de vouloir abandonner ?
                </p>
                <p className="text-white/70 text-center text-sm">
                  Cette action mettra fin à la partie et votre adversaire remportera la victoire.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAbandonModal(false)}
                  disabled={abandoning}
                  className="flex-1 btn bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmAbandon}
                  disabled={abandoning}
                  className="flex-1 btn bg-white hover:bg-gray-200 text-black border-0 shadow-lg shadow-black/30 hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {abandoning ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Abandon...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Confirmer l&apos;abandon
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

