export const COLORS = ['red', 'yellow', 'green', 'blue'] as const;
export const SPECIAL_VALUES = ['skip', 'reverse', 'draw2'] as const;
export const WILD_VALUES = ['wild', 'wildDraw4'] as const;

export type Color = (typeof COLORS)[number];
export type SpecialValue = (typeof SPECIAL_VALUES)[number];
export type WildValue = (typeof WILD_VALUES)[number];
export type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | SpecialValue;

export type NormalCard = {
  color: Color;
  value: CardValue;
  isWild: false;
};

export type WildCard = {
  color: 'wild';
  value: WildValue;
  isWild: true;
  chosenColor?: Color;
};

export type Card = NormalCard | WildCard;

export type Player = {
  id: string;
  name: string;
  hand: Card[];
  isAI: boolean;
};

export type GameState = {
  id: string;
  players: Player[];
  drawPile: Card[];
  discardPile: Card[];
  currentPlayerId: string;
  playDirection: 'clockwise' | 'counter-clockwise';
  status: 'waiting' | 'active' | 'finished';
  winner: string | null;
  log: string[];
  isProcessingTurn?: boolean;
};

export function createDeck(): Card[] {
  const deck: Card[] = [];

  COLORS.forEach(color => {
    // One '0' card
    deck.push({ color, value: '0', isWild: false });
    // Two of each number 1-9
    for (let i = 1; i <= 9; i++) {
      deck.push({ color, value: i.toString() as CardValue, isWild: false });
      deck.push({ color, value: i.toString() as CardValue, isWild: false });
    }
    // Two of each special card
    SPECIAL_VALUES.forEach(value => {
      deck.push({ color, value, isWild: false });
      deck.push({ color, value, isWild: false });
    });
  });

  // Four of each wild card
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'wild', value: 'wild', isWild: true });
    deck.push({ color: 'wild', value: 'wildDraw4', isWild: true });
  }

  return deck;
}

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex: number;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export function getTopCard(discardPile: Card[]): Card {
  return discardPile[discardPile.length - 1];
}

export function isCardPlayable(card: Card, topCard: Card): boolean {
  if (card.isWild) return true;
  if (topCard.isWild) {
    return card.color === topCard.chosenColor;
  }
  return card.color === topCard.color || card.value === topCard.value;
}
