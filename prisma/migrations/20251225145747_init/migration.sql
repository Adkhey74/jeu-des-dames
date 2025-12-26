-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "whitePlayerId" TEXT NOT NULL,
    "blackPlayerId" TEXT,
    "currentTurn" TEXT NOT NULL DEFAULT 'white',
    "pieces" JSONB NOT NULL,
    "moves" JSONB NOT NULL DEFAULT '[]',
    "winner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_history" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "whitePlayerScore" INTEGER NOT NULL DEFAULT 0,
    "blackPlayerScore" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "gamesWon" INTEGER NOT NULL DEFAULT 0,
    "gamesLost" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "games_uuid_key" ON "games"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "game_history_gameId_key" ON "game_history"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_userId_key" ON "player_stats"("userId");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_whitePlayerId_fkey" FOREIGN KEY ("whitePlayerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_blackPlayerId_fkey" FOREIGN KEY ("blackPlayerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_history" ADD CONSTRAINT "game_history_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_history" ADD CONSTRAINT "game_history_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
