"use client";

import { type Player } from '@/lib/uno-game';
import { UnoCard } from './UnoCard';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface OpponentProps {
  player: Player;
  isCurrentPlayer: boolean;
}

export function Opponent({ player, isCurrentPlayer }: OpponentProps) {
  const hand = player.hand || [];
  return (
    <div className={cn(
      "flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-300",
      isCurrentPlayer ? "bg-accent/50 scale-110 shadow-lg" : "bg-card/50"
    )}>
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-card-foreground">{player.name}</span>
      </div>
      <div className="flex -space-x-12">
        {hand.slice(0, 5).map((_, index) => (
          <UnoCard key={index} isFaceDown className="shadow-md" />
        ))}
        {hand.length > 5 && (
            <div className="w-24 h-36 rounded-lg bg-gray-800 flex items-center justify-center text-white font-bold text-lg">
                +{hand.length - 5}
            </div>
        )}
      </div>
    </div>
  );
}
