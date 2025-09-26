'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Card as CardType } from '@/lib/uno-game';
import { UnoCard } from './UnoCard';

interface DrawChoiceProps {
  card: CardType;
  amount: number;
  onDraw: () => void;
  onDare: () => void;
}

export function DrawChoice({ card, amount, onDraw, onDare }: DrawChoiceProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            Choose Your Fate!
          </CardTitle>
          <CardDescription>
            A {card.color} {card.value} was played against you
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center mb-4">
          <UnoCard card={card} />
        </CardContent>
        <CardContent className="text-center">
          <p className="text-lg mb-6">
            You must either:
          </p>
          <div className="space-y-3">
            <Button
              onClick={onDraw}
              className="w-full text-lg font-bold bg-blue-600 hover:bg-blue-700"
            >
              Draw {amount} Cards
            </Button>
            <Button
              onClick={onDare}
              className="w-full text-lg font-bold bg-red-600 hover:bg-red-700"
            >
              Do a Dare! (Coming Soon)
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Your turn will be skipped either way
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
