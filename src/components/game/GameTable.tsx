"use client";

import { type GameState, type Player, type Card, type Color } from '@/lib/uno-game';
import { PlayerHand } from './PlayerHand';
import { Opponent } from './Opponent';
import { UnoCard } from './UnoCard';
import { ColorPicker } from './ColorPicker';
import { GameInfo } from './GameInfo';
import { GameActions } from './GameActions';
import { GameChat } from './GameChat';

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background p-4 flex flex-col perspective-1000">
      <GameInfo gameState={gameState} currentPlayer={currentPlayer} lobbyId={lobbyId} />
      {lobbyId && <GameChat lobbyId={lobbyId} userId={userId} />}

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
    </div>
  );
}
