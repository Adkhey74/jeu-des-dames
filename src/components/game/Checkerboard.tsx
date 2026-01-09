'use client';

import { useState } from 'react';
import { Piece, Position, Move, PlayerColor } from '@/types';

interface CheckerboardProps {
    pieces: Piece[];
    currentTurn: PlayerColor;
    playerColor: PlayerColor;
    onMove: (move: Move) => void;
}

export default function Checkerboard({ pieces, currentTurn, playerColor, onMove }: CheckerboardProps) {
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
    const [validMoves, setValidMoves] = useState<Position[]>([]);

    const isMyTurn = currentTurn === playerColor;

    const getPieceAt = (row: number, col: number): Piece | undefined => {
        return pieces.find(p => p.position.row === row && p.position.col === col);
    };

    const calculateValidMoves = (piece: Piece): Position[] => {
        const moves: Position[] = [];
        const direction = piece.color === 'white' ? -1 : 1;

        if (piece.type === 'king') {
            // Pour les dames : déplacement de plusieurs cases en diagonale dans toutes les directions
            const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

            directions.forEach(([dRow, dCol]) => {
                // Parcourir toutes les cases en diagonale jusqu'à trouver une pièce ou le bord
                for (let distance = 1; distance < 8; distance++) {
                    const newRow = piece.position.row + dRow * distance;
                    const newCol = piece.position.col + dCol * distance;

                    // Vérifier les limites du plateau
                    if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) {
                        break;
                    }

                    const targetPiece = getPieceAt(newRow, newCol);
                    
                    // Si la case est vide, c'est un mouvement valide
                    if (!targetPiece) {
                        moves.push({ row: newRow, col: newCol });
                    } else {
                        // Si on rencontre une pièce, on s'arrête (pas de mouvement au-delà)
                        break;
                    }
                }
            });

            // Captures pour les dames : sauter par-dessus une pièce ennemie
            directions.forEach(([dRow, dCol]) => {
                // Chercher une pièce ennemie à capturer
                for (let distance = 1; distance < 7; distance++) {
                    const captureRow = piece.position.row + dRow * distance;
                    const captureCol = piece.position.col + dCol * distance;

                    // Vérifier les limites
                    if (captureRow < 0 || captureRow >= 8 || captureCol < 0 || captureCol >= 8) {
                        break;
                    }

                    const capturedPiece = getPieceAt(captureRow, captureCol);
                    
                    // Si on trouve une pièce ennemie
                    if (capturedPiece && capturedPiece.color !== piece.color) {
                        // Vérifier la case après la pièce capturée
                        const jumpRow = captureRow + dRow;
                        const jumpCol = captureCol + dCol;

                        if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
                            const targetPiece = getPieceAt(jumpRow, jumpCol);
                            
                            // Si la case après est vide, c'est une capture valide
                            if (!targetPiece) {
                                moves.push({ row: jumpRow, col: jumpCol });
                            }
                        }
                        // Arrêter après avoir trouvé une pièce (on ne peut capturer qu'une pièce à la fois)
                        break;
                    } else if (capturedPiece && capturedPiece.color === piece.color) {
                        // Si on rencontre une pièce alliée, on s'arrête
                        break;
                    }
                }
            });
        } else {
            // Pour les pions : déplacement d'une seule case en avant
            const possibleMoves = [[direction, -1], [direction, 1]];

            possibleMoves.forEach(([dRow, dCol]) => {
                const newRow = piece.position.row + dRow;
                const newCol = piece.position.col + dCol;

                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const targetPiece = getPieceAt(newRow, newCol);
                    if (!targetPiece) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            });

            // Captures pour les pions
            possibleMoves.forEach(([dRow, dCol]) => {
                const jumpRow = piece.position.row + dRow * 2;
                const jumpCol = piece.position.col + dCol * 2;
                const captureRow = piece.position.row + dRow;
                const captureCol = piece.position.col + dCol;

                if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
                    const capturedPiece = getPieceAt(captureRow, captureCol);
                    const targetPiece = getPieceAt(jumpRow, jumpCol);

                    if (capturedPiece && capturedPiece.color !== piece.color && !targetPiece) {
                        moves.push({ row: jumpRow, col: jumpCol });
                    }
                }
            });
        }

        return moves;
    };

    const handleSquareClick = (row: number, col: number) => {
        if (!isMyTurn) return;

        const piece = getPieceAt(row, col);

        if (selectedPiece) {
            // Vérifier si c'est un mouvement valide
            const isValidMove = validMoves.some(m => m.row === row && m.col === col);

            if (isValidMove) {
                const move: Move = {
                    from: selectedPiece.position,
                    to: { row, col },
                };

                // Vérifier si c'est une capture
                const rowDiff = row - selectedPiece.position.row;
                const colDiff = col - selectedPiece.position.col;
                const distance = Math.abs(rowDiff);

                // Pour les pions : capture si distance = 2
                // Pour les dames : capture si distance > 1 et qu'il y a une pièce entre les deux positions
                if (distance > 1) {
                    const capturedPieces: Position[] = [];
                    
                    // Déterminer la direction
                    const dRow = rowDiff > 0 ? 1 : -1;
                    const dCol = colDiff > 0 ? 1 : -1;
                    
                    // Parcourir toutes les cases entre la position de départ et d'arrivée
                    for (let i = 1; i < distance; i++) {
                        const checkRow = selectedPiece.position.row + dRow * i;
                        const checkCol = selectedPiece.position.col + dCol * i;
                        const pieceAtPosition = getPieceAt(checkRow, checkCol);
                        
                        // Si on trouve une pièce ennemie, c'est une capture
                        if (pieceAtPosition && pieceAtPosition.color !== selectedPiece.color) {
                            capturedPieces.push({ row: checkRow, col: checkCol });
                        }
                    }
                    
                    if (capturedPieces.length > 0) {
                        move.capturedPieces = capturedPieces;
                    }
                }

                onMove(move);
                setSelectedPiece(null);
                setValidMoves([]);
            } else if (piece && piece.color === playerColor) {
                // Sélectionner une autre pièce
                setSelectedPiece(piece);
                setValidMoves(calculateValidMoves(piece));
            } else {
                // Désélectionner
                setSelectedPiece(null);
                setValidMoves([]);
            }
        } else if (piece && piece.color === playerColor) {
            // Sélectionner une pièce
            setSelectedPiece(piece);
            setValidMoves(calculateValidMoves(piece));
        }
    };

    const isValidMoveSquare = (row: number, col: number): boolean => {
        return validMoves.some(m => m.row === row && m.col === col);
    };

    const isSelected = (row: number, col: number): boolean => {
        return selectedPiece?.position.row === row && selectedPiece?.position.col === col;
    };

    const isDarkSquare = (row: number, col: number): boolean => {
        return (row + col) % 2 === 1;
    };

    // Inverser le plateau pour le joueur noir (ses pièces doivent être en bas)
    // Rotation de 180° : inverser les lignes ET les colonnes
    const shouldFlip = playerColor === 'black';
    
    // Fonction pour convertir les coordonnées d'affichage en coordonnées logiques
    const getLogicalRow = (displayRow: number): number => {
        return shouldFlip ? 7 - displayRow : displayRow;
    };
    
    // Fonction pour convertir les coordonnées d'affichage en coordonnées logiques
    const getLogicalCol = (displayCol: number): number => {
        return shouldFlip ? 7 - displayCol : displayCol;
    };


    return (
        <div className="flex flex-col items-center justify-center w-full h-full" style={{ minHeight: 0, maxHeight: '100%', overflow: 'hidden' }}>
            {/* Plateau de jeu élégant */}
            <div className="relative mx-auto" style={{ 
                width: '100%',
                height: '100%',
                aspectRatio: '1 / 1',
                maxHeight: '100%',
                maxWidth: '100%',
                minWidth: 0,
                minHeight: 0
            }}>
                {/* Bordure décorative */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-xl shadow-xl transform rotate-1"></div>
                <div className="absolute inset-0.5 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-lg"></div>

                {/* Plateau principal avec labels - Structure en grille 10x10 pour former un carré */}
                <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-inner border border-gray-300" style={{ padding: '0.5rem', margin: '0' }}>
                    {/* Grille 10x10 : labels autour + plateau 8x8 au centre */}
                    <div className="grid grid-cols-10 grid-rows-10 gap-0 w-full h-full" style={{ aspectRatio: '1 / 1' }}>
                        {(() => {
                            const cells: React.ReactElement[] = [];
                            
                            // Ligne 0 : coin vide + lettres en haut + coin vide
                            cells.push(<div key="top-left" className="flex items-center justify-center" style={{ minWidth: 0, minHeight: 0, padding: 0, margin: 0 }}></div>);
                            for (let displayCol = 0; displayCol < 8; displayCol++) {
                                const logicalCol = getLogicalCol(displayCol);
                                const letter = String.fromCharCode(65 + logicalCol);
                                cells.push(
                                    <div key={`top-${displayCol}`} className="flex justify-center items-center" style={{ minWidth: 0, minHeight: 0, padding: 0, margin: 0 }}>
                                        <span className="text-xs font-semibold text-gray-700 select-none drop-shadow-sm">{letter}</span>
                                    </div>
                                );
                            }
                            cells.push(<div key="top-right" className="flex items-center justify-center" style={{ minWidth: 0, minHeight: 0, padding: 0, margin: 0 }}></div>);
                            
                            // Lignes 1-8 : label gauche + cases du plateau + label droit
                            for (let displayRow = 0; displayRow < 8; displayRow++) {
                                const logicalRow = getLogicalRow(displayRow);
                                const number = 8 - logicalRow;
                                
                                // Label de ligne à gauche
                                cells.push(
                                    <div key={`left-${displayRow}`} className="flex justify-center items-center" style={{ minWidth: 0, minHeight: 0, padding: 0, margin: 0 }}>
                                        <span className="text-xs font-semibold text-gray-700 select-none drop-shadow-sm">{number}</span>
                                    </div>
                                );
                                
                                // Cases du plateau
                                for (let displayCol = 0; displayCol < 8; displayCol++) {
                                    const logicalRow = getLogicalRow(displayRow);
                                    const logicalCol = getLogicalCol(displayCol);
                                    
                                    const piece = getPieceAt(logicalRow, logicalCol);
                                    const dark = isDarkSquare(logicalRow, logicalCol);
                                    const selected = isSelected(logicalRow, logicalCol);
                                    const validMove = isValidMoveSquare(logicalRow, logicalCol);

                                    cells.push(
                                        <div
                                            key={`${displayRow}-${displayCol}`}
                                            onClick={() => handleSquareClick(logicalRow, logicalCol)}
                                            className={`
                          w-full h-full flex items-center justify-center cursor-pointer transition-all duration-200 relative
                          ${dark
                                                ? 'bg-gradient-to-br from-gray-800 to-black shadow-inner'
                                                : 'bg-gradient-to-br from-white to-gray-50 shadow-sm'
                                            }
                          ${selected ? 'ring-4 ring-black shadow-xl scale-105 z-10' : ''}
                          ${validMove ? 'ring-2 ring-gray-600 ring-opacity-80' : ''}
                          ${!isMyTurn ? 'cursor-not-allowed opacity-60' : ''}
                          hover:brightness-110 hover:scale-105
                        `}
                                            style={{ aspectRatio: '1 / 1' }}
                                        >
                                            {piece && (
                                                <div className={`
                            rounded-full flex items-center justify-center relative
                            ${piece.color === 'white'
                                                    ? 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-400 shadow-lg'
                                                    : 'bg-gradient-to-br from-gray-800 to-black border-2 border-gray-700 shadow-lg'
                                                }
                            ${piece.type === 'king' ? 'ring-2 ring-white' : ''}
                            transform transition-all duration-200 hover:scale-110
                          `}
                          style={{ 
                            width: '55%',
                            aspectRatio: '1 / 1',
                            minWidth: 0,
                            minHeight: 0
                          }}>
                                                    {piece.type === 'king' && (
                                                        <span className={`
                                text-base lg:text-lg font-bold drop-shadow-lg
                                ${piece.color === 'white' ? 'text-black' : 'text-white'}
                              `}>
                                                            ♔
                                                        </span>
                                                    )}
                                                    {/* Effet de brillance */}
                                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white to-transparent opacity-20"></div>
                                                </div>
                                            )}
                                            {validMove && !piece && (
                                                <div className="rounded-full bg-gray-600 opacity-70 shadow-lg animate-pulse ring-2 ring-gray-400" style={{ 
                                                    width: '30%',
                                                    aspectRatio: '1 / 1'
                                                }}></div>
                                            )}
                                        </div>
                                    );
                                }
                                
                                // Label de ligne à droite
                                cells.push(
                                    <div key={`right-${displayRow}`} className="flex justify-center items-center" style={{ minWidth: 0, minHeight: 0, padding: 0, margin: 0 }}>
                                        <span className="text-xs font-semibold text-gray-700 select-none drop-shadow-sm">{number}</span>
                                    </div>
                                );
                            }
                            
                            // Ligne 9 : coin vide + lettres en bas + coin vide
                            cells.push(<div key="bottom-left" className="flex items-center justify-center" style={{ minWidth: 0, minHeight: 0, padding: 0, margin: 0 }}></div>);
                            for (let displayCol = 0; displayCol < 8; displayCol++) {
                                const logicalCol = getLogicalCol(displayCol);
                                const letter = String.fromCharCode(65 + logicalCol);
                                cells.push(
                                    <div key={`bottom-${displayCol}`} className="flex justify-center items-center" style={{ minWidth: 0, minHeight: 0, padding: 0, margin: 0 }}>
                                        <span className="text-xs font-semibold text-gray-700 select-none drop-shadow-sm">{letter}</span>
                                    </div>
                                );
                            }
                            cells.push(<div key="bottom-right" className="flex items-center justify-center" style={{ minWidth: 0, minHeight: 0, padding: 0, margin: 0 }}></div>);
                            
                            return cells;
                        })()}
                    </div>
                </div>
            </div>

            {/* Indicateur de tour élégant */}
            <div className="mt-1 text-center flex-shrink-0">
                <div className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-md shadow-sm text-xs font-bold border transition-all duration-300
          ${isMyTurn
                        ? 'bg-black text-white border-black ring-1 ring-black/50 animate-pulse'
                        : 'bg-gray-400 text-white border-gray-300'
                    }
        `}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-all ${isMyTurn ? 'bg-white animate-pulse shadow-sm' : 'bg-white'}`}></div>
                    <span className="drop-shadow-sm text-xs">
                        {isMyTurn ? "🎯 Votre tour" : "⏳ Attente"}
                    </span>
                    {isMyTurn && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}

