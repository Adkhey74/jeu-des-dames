// Types pour l'authentification
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  username: string;
  createdAt: Date;
  isVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Types pour le jeu de dames
export type PieceType = 'pawn' | 'king';
export type PlayerColor = 'white' | 'black';
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface Piece {
  id: string;
  type: PieceType;
  color: PlayerColor;
  position: Position;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  capturedPieces?: Position[];
}

export interface Game {
  id: string;
  uuid: string;
  status: GameStatus;
  whitePlayerId: string;
  blackPlayerId: string | null;
  currentTurn: PlayerColor;
  pieces: Piece[];
  moves: Move[];
  winner?: PlayerColor;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface GameHistory {
  id: string;
  gameId: string;
  winner: PlayerColor;
  whitePlayerName: string;
  blackPlayerName: string;
  whitePlayerScore: number;
  blackPlayerScore: number;
  duration: number;
  finishedAt: Date;
}

// Types pour les scores
export interface PlayerStats {
  userId: string;
  username: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalScore: number;
}

// Types pour les WebSockets
export interface SocketMessage {
  type: 'move' | 'join' | 'leave' | 'chat' | 'game_over';
  payload: unknown;
}

export interface GameState {
  game: Game;
  players: {
    white: User;
    black?: User;
  };
}


