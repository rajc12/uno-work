"use client";

import { type Card } from '@/lib/uno-game';
import { cn } from '@/lib/utils';
import { DrawTwoSymbol, ReverseSymbol, SkipSymbol, WildSymbol, DrawFourSymbol } from '@/components/icons/uno-symbols';

interface UnoCardProps {
  card?: Card;
  isFaceDown?: boolean;
  className?: string;
  isPlayable?: boolean;
}

const colorClasses: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  wild: 'bg-gray-800',
};

export function UnoCard({ card, isFaceDown = false, className, isPlayable = false }: UnoCardProps) {
  if (isFaceDown) {
    return (
      <div className={cn(
        "w-20 h-28 md:w-24 md:h-36 rounded-lg bg-gray-800 border-2 border-gray-900 flex items-center justify-center transform-style-3d shadow-lg",
        className
      )}>
        <h1 className="text-4xl font-black text-white -rotate-12 select-none">UNO</h1>
      </div>
    );
  }

  if (!card) return null;

  const cardColor = card.isWild ? (card.chosenColor || 'wild') : card.color;
  const bgColor = colorClasses[cardColor] || 'bg-gray-200';

  const renderValue = () => {
    const commonClasses = "w-10 h-10 md:w-12 md:h-12 text-white";
    switch (card.value) {
      case 'skip': return <SkipSymbol className={commonClasses} />;
      case 'reverse': return <ReverseSymbol className={commonClasses} />;
      case 'draw2': return <DrawTwoSymbol className={commonClasses} />;
      case 'wild': return <WildSymbol className="w-16 h-16" />;
      case 'wildDraw4': return <DrawFourSymbol className="w-16 h-16" />;
      default: return (
        <span className="text-5xl md:text-6xl font-extrabold text-white select-none">
          {card.value}
        </span>
      );
    }
  };

  return (
    <div className={cn(
      "w-20 h-28 md:w-24 md:h-36 rounded-lg border-2 border-white/50 flex items-center justify-center relative p-1 shadow-lg transform-style-3d transition-all duration-300",
      "hover:shadow-2xl hover:scale-105",
      isPlayable && "ring-4 ring-accent ring-offset-2 ring-offset-background",
      bgColor,
      className
    )}>
      <div className="absolute top-1 left-2 text-2xl font-bold text-white select-none">{!card.isWild && card.value.length === 1 ? card.value : ''}</div>
      <div className="absolute bottom-1 right-2 text-2xl font-bold text-white select-none transform rotate-180">{!card.isWild && card.value.length === 1 ? card.value : ''}</div>

      <div className="absolute inset-0 flex items-center justify-center">
        {renderValue()}
      </div>
    </div>
  );
}
