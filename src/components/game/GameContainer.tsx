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
    startGame,
    lobbyPlayers,
    handleDrawChoice,
  } = useUnoGame(user?.uid);

  switch (view) {
    case 'lobby':
      return <GameLobby onStartGame={createGame} onJoinGame={joinGame} lobbyId={lobbyId} lobbyPlayers={lobbyPlayers} userId={user?.uid} onStartActualGame={startGame} />;
    case 'game':
      if (gameState && user) {
        console.log('GameContainer: Rendering GameTable with pendingDrawChoice', {
          pendingDrawChoice: gameState.pendingDrawChoice ? '[PRESENT]' : 'undefined',
          targetPlayerId: gameState.pendingDrawChoice?.targetPlayerId,
          userId: user.uid,
          isProcessingTurn
        });
        return (
          <GameTable
            key={`game-${gameState?.pendingDrawChoice?.targetPlayerId || 'normal'}`}
            gameState={gameState}
            onPlayCard={playCard}
            onDrawCard={drawCard}
            onSelectColor={selectColorForWild}
            wildCardToPlay={wildCardToPlay}
            currentPlayer={currentPlayer || null}
            isProcessingTurn={isProcessingTurn}
            userId={user.uid}
            lobbyId={lobbyId}
            onHandleDrawChoice={handleDrawChoice}
          />
        );
      }
      return <GameLobby onStartGame={createGame} onJoinGame={joinGame} lobbyId={lobbyId} lobbyPlayers={lobbyPlayers} userId={user?.uid} onStartActualGame={startGame} />;
    case 'game-over':
        if(gameState && gameState.winner) {
            return <GameOverDialog winnerName={gameState.winner} onPlayAgain={resetGame} />;
        }
        return null; // or some fallback
    default:
      return <GameLobby onStartGame={createGame} onJoinGame={joinGame} lobbyId={lobbyId} lobbyPlayers={lobbyPlayers} userId={user?.uid} onStartActualGame={startGame} />;
  }
}
