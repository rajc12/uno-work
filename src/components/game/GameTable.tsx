"use client";

import { useEffect } from 'react';
import { type GameState, type Player, type Card, type Color } from '@/lib/uno-game';
import { PlayerHand } from './PlayerHand';
import { Opponent } from './Opponent';
import { UnoCard } from './UnoCard';
import { ColorPicker } from './ColorPicker';
import { GameInfo } from './GameInfo';
import { GameActions } from './GameActions';
import { DrawChoice } from './DrawChoice';

interface GameTableProps {
  gameState: GameState;
  onPlayCard: (card: Card) => void;
  onDrawCard: () => void;
  onSelectColor: (color: Color) => void;
  wildCardToPlay: Card | null;
  currentPlayer: Player | null;
  isProcessingTurn: boolean;
  userId: string;
  lobbyId: string | null;
  onHandleDrawChoice: (choice: 'draw' | 'dare') => void;
}

export function GameTable({
  gameState,
  onPlayCard,
  onDrawCard,
  onSelectColor,
  wildCardToPlay,
  currentPlayer,
  isProcessingTurn,
  userId,
  lobbyId,
  onHandleDrawChoice,
}: GameTableProps) {
  const humanPlayer = gameState.players.find(p => p.id === userId);
  const opponents = gameState.players.filter(p => p.id !== userId);
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  const getOpponentPosition = (index: number, total: number) => {
    if (total === 1) return 'top-4 left-1/2 -translate-x-1/2';
    if (total === 2) {
      return index === 0
        ? 'top-1/2 -translate-y-1/2 left-4'
        : 'top-1/2 -translate-y-1/2 right-4';
    }
    if (total === 3) {
      if (index === 0) return 'top-1/2 -translate-y-1/2 left-4';
      if (index === 1) return 'top-4 left-1/2 -translate-x-1/2';
      return 'top-1/2 -translate-y-1/2 right-4';
    }
    return '';
  };
  
  const isMyTurn = currentPlayer?.id === userId && !isProcessingTurn;

  if (!humanPlayer) {
    return <div>Joining game...</div>
  }

  // Check if current user needs to make a draw choice
  const needsToChoose = gameState.pendingDrawChoice?.targetPlayerId === userId;

  // Debug logging
  console.log('GameTable Debug:', {
    userId,
    currentPlayerId: currentPlayer?.id,
    isProcessingTurn,
    needsToChoose,
    pendingDrawChoice: gameState.pendingDrawChoice ? '[PRESENT]' : 'undefined',
    targetPlayerId: gameState.pendingDrawChoice?.targetPlayerId,
    isMyTurn
  });

  // Force re-render when pendingDrawChoice changes
  useEffect(() => {
    console.log('GameTable: pendingDrawChoice changed', gameState.pendingDrawChoice);
  }, [gameState.pendingDrawChoice]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background p-4 flex flex-col perspective-1000">
      <GameInfo gameState={gameState} currentPlayer={currentPlayer} lobbyId={lobbyId} />

      {opponents.map((opponent, index) => (
        <div key={opponent.id} className={`absolute ${getOpponentPosition(index, opponents.length)}`}>
          <Opponent player={opponent} isCurrentPlayer={currentPlayer?.id === opponent.id} />
        </div>
      ))}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4 transform-style-3d">
        {/* Draw Pile */}
        <div className="relative">
          <button 
            onClick={() => isMyTurn && onDrawCard()}
            disabled={!isMyTurn}
            className="rounded-lg transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed"
          >
            <UnoCard isFaceDown />
          </button>
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full">
            {gameState.drawPile.length}
          </div>
        </div>

        {/* Discard Pile */}
        <div className="relative">
          {topCard && <UnoCard card={topCard} />}
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full flex justify-center">
         <PlayerHand player={humanPlayer} onPlayCard={onPlayCard} isMyTurn={isMyTurn} topCard={topCard} />
      </div>

      <GameActions onDrawCard={onDrawCard} isMyTurn={isMyTurn} />

      {wildCardToPlay && currentPlayer?.id === userId && (
        <ColorPicker onSelectColor={onSelectColor} />
      )}

      {/* Show draw choice when it's the target player's turn to choose */}
      {needsToChoose && gameState.pendingDrawChoice && (
        <DrawChoice
          card={gameState.pendingDrawChoice.card as any}
          amount={gameState.pendingDrawChoice.amount}
          onDraw={() => onHandleDrawChoice('draw')}
          onDare={() => onHandleDrawChoice('dare')}
        />
      )}

      {/* Also show choice when processing but target player needs to choose */}
      {isProcessingTurn && needsToChoose && gameState.pendingDrawChoice && (
        <DrawChoice
          card={gameState.pendingDrawChoice.card as any}
          amount={gameState.pendingDrawChoice.amount}
          onDraw={() => onHandleDrawChoice('draw')}
          onDare={() => onHandleDrawChoice('dare')}
        />
      )}
    </div>
  );
}
