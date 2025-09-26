"use client";

import { useUnoGame } from '@/hooks/use-uno-game';
import { GameLobby } from './GameLobby';
import { GameTable } from './GameTable';
import { GameOverDialog } from './GameOverDialog';
import { useUser } from '@/firebase';

export function GameContainer() {
  const { user } = useUser();
  const { 
    view, 
    gameState, 
    playCard, 
    drawCard, 
    selectColorForWild, 
    wildCardToPlay, 
    currentPlayer, 
    isProcessingTurn, 
    resetGame,
    joinGame,
    lobbyId,
    createGame,
    handleDrawChoice,
  } = useUnoGame(user?.uid);

  switch (view) {
    case 'lobby':
      return <GameLobby onStartGame={createGame} onJoinGame={joinGame} lobbyId={lobbyId} />;
    case 'game':
      if (gameState && user) {
        return (
          <GameTable
            gameState={gameState}
            onPlayCard={playCard}
            onDrawCard={drawCard}
            onSelectColor={selectColorForWild}
            wildCardToPlay={wildCardToPlay}
            currentPlayer={currentPlayer}
            isProcessingTurn={isProcessingTurn}
            userId={user.uid}
            lobbyId={lobbyId}
            onDrawChoice={handleDrawChoice}
          />
        );
      }
      return <GameLobby onStartGame={createGame} onJoinGame={joinGame} lobbyId={lobbyId} />;
    case 'game-over':
        if(gameState && gameState.winner) {
            return <GameOverDialog winnerName={gameState.winner} onPlayAgain={resetGame} />;
        }
        return null; // or some fallback
    default:
      return <GameLobby onStartGame={createGame} onJoinGame={joinGame} lobbyId={lobbyId} />;
  }
}
