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

        // Déplacements simples
        const possibleMoves = piece.type === 'king'
            ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
            : [[direction, -1], [direction, 1]];

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

        // Captures
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
                const rowDiff = Math.abs(row - selectedPiece.position.row);
                if (rowDiff === 2) {
                    const captureRow = (row + selectedPiece.position.row) / 2;
                    const captureCol = (col + selectedPiece.position.col) / 2;
                    move.capturedPieces = [{ row: captureRow, col: captureCol }];
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
        <div className="flex flex-col items-center justify-center w-full h-full" style={{ minHeight: 0 }}>
            {/* Plateau de jeu élégant */}
            <div className="relative" style={{ 
                width: '100%',
                aspectRatio: '1 / 1',
                minWidth: 0,
                minHeight: 0,
                maxWidth: '100%',
                maxHeight: '100%'
            }}>
                {/* Bordure décorative */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-amber-900 rounded-xl shadow-xl transform rotate-1"></div>
                <div className="absolute inset-0.5 bg-gradient-to-br from-amber-700 to-amber-800 rounded-lg shadow-lg"></div>

                {/* Plateau principal */}
                <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-inner p-2 border border-amber-300/30">
                    <div className="grid grid-cols-8 grid-rows-8 gap-0 w-full h-full rounded-lg overflow-hidden shadow-lg">
                        {Array.from({ length: 8 }, (_, displayRow) =>
                            Array.from({ length: 8 }, (_, displayCol) => {
                                // Convertir les coordonnées d'affichage en coordonnées logiques
                                const logicalRow = getLogicalRow(displayRow);
                                const logicalCol = getLogicalCol(displayCol);
                                
                                const piece = getPieceAt(logicalRow, logicalCol);
                                const dark = isDarkSquare(logicalRow, logicalCol);
                                const selected = isSelected(logicalRow, logicalCol);
                                const validMove = isValidMoveSquare(logicalRow, logicalCol);

                                return (
                                    <div
                                        key={`${displayRow}-${displayCol}`}
                                        onClick={() => handleSquareClick(logicalRow, logicalCol)}
                                        className={`
                      w-full h-full flex items-center justify-center cursor-pointer transition-all duration-200 relative
                      ${dark
                                                ? 'bg-gradient-to-br from-amber-700 to-amber-800 shadow-inner'
                                                : 'bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm'
                                            }
                      ${selected ? 'ring-4 ring-indigo-500 shadow-xl scale-105 z-10' : ''}
                      ${validMove ? 'ring-2 ring-purple-500 ring-opacity-80' : ''}
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
                                                    : 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 shadow-lg'
                                                }
                        ${piece.type === 'king' ? 'ring-2 ring-yellow-400' : ''}
                        transform transition-all duration-200 hover:scale-110
                      `}
                      style={{ 
                        width: '65%',
                        aspectRatio: '1 / 1',
                        minWidth: 0,
                        minHeight: 0
                      }}>
                                                {piece.type === 'king' && (
                                                    <span className={`
                            text-base lg:text-lg font-bold drop-shadow-lg
                            ${piece.color === 'white' ? 'text-yellow-600' : 'text-yellow-300'}
                          `}>
                                                        ♔
                                                    </span>
                                                )}
                                                {/* Effet de brillance */}
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white to-transparent opacity-20"></div>
                                            </div>
                                        )}
                                        {validMove && !piece && (
                                            <div className="rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-70 shadow-lg animate-pulse ring-2 ring-purple-300" style={{ 
                                                width: '30%',
                                                aspectRatio: '1 / 1'
                                            }}></div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Indicateur de tour élégant */}
            <div className="mt-1 text-center flex-shrink-0">
                <div className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-md shadow-sm text-xs font-bold border transition-all duration-300
          ${isMyTurn
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white border-indigo-400 ring-1 ring-indigo-200/50 animate-pulse'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300'
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

