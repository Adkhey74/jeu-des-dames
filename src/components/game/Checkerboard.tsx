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

    return (
        <div className="flex flex-col items-center w-full">
            {/* Plateau de jeu élégant */}
            <div className="relative w-full max-w-2xl aspect-square">
                {/* Bordure décorative */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-amber-900 rounded-2xl shadow-2xl transform rotate-1"></div>
                <div className="absolute inset-1 bg-gradient-to-br from-amber-700 to-amber-800 rounded-xl shadow-xl"></div>

                {/* Plateau principal */}
                <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-inner p-4 border-2 border-amber-300/30">
                    <div className="grid grid-cols-8 grid-rows-8 gap-0 w-full h-full rounded-lg overflow-hidden shadow-lg">
                        {Array.from({ length: 8 }, (_, row) =>
                            Array.from({ length: 8 }, (_, col) => {
                                const piece = getPieceAt(row, col);
                                const dark = isDarkSquare(row, col);
                                const selected = isSelected(row, col);
                                const validMove = isValidMoveSquare(row, col);

                                return (
                                    <div
                                        key={`${row}-${col}`}
                                        onClick={() => handleSquareClick(row, col)}
                                        className={`
                      w-full h-full flex items-center justify-center cursor-pointer transition-all duration-200 relative
                      ${dark
                                                ? 'bg-gradient-to-br from-amber-700 to-amber-800 shadow-inner'
                                                : 'bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm'
                                            }
                      ${selected ? 'ring-4 ring-primary shadow-lg scale-105' : ''}
                      ${validMove ? 'ring-2 ring-secondary ring-opacity-80' : ''}
                      ${!isMyTurn ? 'cursor-not-allowed opacity-60' : ''}
                      hover:brightness-110 hover:scale-105
                    `}
                                    >
                                        {piece && (
                                            <div className={`
                        w-4/5 h-4/5 rounded-full flex items-center justify-center relative
                        ${piece.color === 'white'
                                                    ? 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-400 shadow-lg'
                                                    : 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 shadow-lg'
                                                }
                        ${piece.type === 'king' ? 'ring-2 ring-yellow-400' : ''}
                        transform transition-all duration-200 hover:scale-110
                      `}>
                                                {piece.type === 'king' && (
                                                    <span className={`
                            text-2xl font-bold drop-shadow-lg
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
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-secondary-focus opacity-70 shadow-lg animate-pulse"></div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Indicateur de tour élégant */}
            <div className="mt-8 text-center">
                <div className={`
          inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-lg text-lg font-semibold
          ${isMyTurn
                        ? 'bg-gradient-to-r from-secondary to-secondary-focus text-white'
                        : 'bg-gradient-to-r from-primary to-primary-focus text-white'
                    }
        `}>
                    <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-white animate-pulse' : 'bg-white'}`}></div>
                    {isMyTurn ? "C'est votre tour" : "En attente de l'adversaire"}
                </div>
            </div>
        </div>
    );
}

