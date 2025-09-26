'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  type GameState,
  type Player,
  type Card,
  type WildCard,
  type Color,
  createDeck,
  shuffle,
  getTopCard,
  isCardPlayable,
} from '@/lib/uno-game';
import { useToast } from './use-toast';
import {
  ref,
  set,
  push,
  remove,
  get,
  serverTimestamp,
  query,
} from 'firebase/database';
import {
  useDatabase,
  useObjectValue,
  useList,
  useMemoFirebase,
} from '@/firebase';

export type GameView = 'lobby' | 'game' | 'game-over';

const INITIAL_HAND_SIZE = 7;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

export function useUnoGame(userId?: string) {
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [view, setView] = useState<GameView>('lobby');
  const [wildCardToPlay, setWildCardToPlay] = useState<Card | null>(null);
  const { toast } = useToast();
  const db = useDatabase();

  const gameRef = useMemoFirebase(
    () => {
      if (!lobbyId || !db) return null;
      try {
        return ref(db, `lobbies/${lobbyId}/game`);
      } catch (error) {
        console.warn('Failed to create game ref:', error);
        return null;
      }
    },
    [lobbyId, db]
  );
  const { data: gameState } = useObjectValue<GameState>(gameRef);

  const lobbyPlayersRef = useMemoFirebase(
    () => {
      if (!lobbyId || !db) return null;
      try {
        return query(ref(db, `lobbies/${lobbyId}/players`));
      } catch (error) {
        console.warn('Failed to create lobby players ref:', error);
        return null;
      }
    },
    [lobbyId, db]
  );
  const { data: lobbyPlayers } = useList<Player>(lobbyPlayersRef);

  const currentPlayer = gameState
    ? gameState.players.find((p) => p.id === gameState.currentPlayerId)
    : null;
  const isProcessingTurn = gameState?.isProcessingTurn ?? false;

  const nextTurn = useCallback((state: GameState, steps = 1): GameState => {
    const { players, playDirection, currentPlayerId } = state;
    const numPlayers = players.length;
    const currentPlayerIndex = players.findIndex((p) => p.id === currentPlayerId);
    let nextIndex: number;

    if (playDirection === 'clockwise') {
      nextIndex = (currentPlayerIndex + steps) % numPlayers;
    } else {
      nextIndex = (currentPlayerIndex - steps + numPlayers * steps) % numPlayers;
    }

    const nextPlayer = players[nextIndex];
    return {
      ...state,
      currentPlayerId: nextPlayer.id,
      log: [...(state.log || []), `${nextPlayer.name}'s turn.`],
    };
  }, []);

  const drawCards = useCallback(
    (playerId: string, numCards: number, state: GameState): GameState => {
      let { drawPile, discardPile, players } = state;
      const playerIndex = players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return state;

      const player = players[playerIndex];
      const drawnCards: Card[] = [];

      for (let i = 0; i < numCards; i++) {
        if (drawPile.length === 0) {
          if (discardPile.length <= 1) break;
          const newDrawPile = shuffle(discardPile.slice(0, -1));
          drawPile = newDrawPile;
          discardPile = [getTopCard(discardPile)];
          toast({ title: 'Deck reshuffled' });
        }
        const card = drawPile.pop();
        if (card) drawnCards.push(card);
      }

      const newHand = [...player.hand, ...drawnCards];
      const newPlayers = [...players];
      newPlayers[playerIndex] = { ...player, hand: newHand };

      return {
        ...state,
        drawPile,
        discardPile,
        players: newPlayers,
        log: [...(state.log || []), `${player.name} drew ${numCards} card(s).`],
      };
    },
    [toast]
  );

  const applyCardEffect = useCallback(
    (card: Card, state: GameState): GameState => {
      let newState = { ...state };
      const currentPlayer = newState.players.find(
        (p) => p.id === newState.currentPlayerId
      );
      if (!currentPlayer) return newState;

      let steps = 1;

      switch (card.value) {
        case 'skip':
          steps = 2;
          toast({
            title: 'Player Skipped!',
            description: `${
              newState.players.find((p) => p.id === nextTurn(newState).currentPlayerId)
                ?.name
            } was skipped.`,
          });
          break;
        case 'reverse':
          newState.playDirection =
            newState.playDirection === 'clockwise'
              ? 'counter-clockwise'
              : 'clockwise';
          toast({
            title: 'Direction Reversed!',
            description: `Play direction is now ${newState.playDirection}.`,
          });
          break;
        case 'draw2':
          const nextPlayerIdD2 = nextTurn(newState).currentPlayerId;
          newState = {
            ...newState,
            pendingDrawChoice: {
              card: { color: card.color, value: card.value, isWild: card.isWild },
              amount: 2,
              targetPlayerId: nextPlayerIdD2
            },
            isProcessingTurn: true  // Set processing flag while choice is pending
          };
          steps = 1; // Don't skip turn yet, wait for choice
          console.log('applyCardEffect: Set pendingDrawChoice for draw2', {
            card: card,
            nextPlayerId: nextPlayerIdD2,
            pendingDrawChoice: newState.pendingDrawChoice
          });
          toast({
            title: 'Draw 2!',
            description: `${
              newState.players.find((p) => p.id === nextPlayerIdD2)?.name
            } must choose to draw 2 cards or do a dare.`,
          });
          break;
        case 'wildDraw4':
          const nextPlayerIdD4 = nextTurn(newState).currentPlayerId;
          newState = {
            ...newState,
            pendingDrawChoice: {
              card: { color: card.color, value: card.value, isWild: card.isWild },
              amount: 4,
              targetPlayerId: nextPlayerIdD4
            },
            isProcessingTurn: true  // Set processing flag while choice is pending
          };
          steps = 1; // Don't skip turn yet, wait for choice
          console.log('applyCardEffect: Set pendingDrawChoice for wildDraw4', {
            card: card,
            nextPlayerId: nextPlayerIdD4,
            pendingDrawChoice: newState.pendingDrawChoice
          });
          toast({
            title: 'Wild Draw 4!',
            description: `${
              newState.players.find((p) => p.id === nextPlayerIdD4)?.name
            } must choose to draw 4 cards or do a dare.`,
          });
          break;
      }

      newState.log = [
        ...(newState.log || []),
        `${currentPlayer.name} played a ${
          card.color !== 'wild' ? card.color : ''
        } ${card.value}.`,
      ];

      return nextTurn(newState, steps);
    },
    [drawCards, nextTurn, toast]
  );

  const handleDrawChoice = useCallback(
    async (choice: 'draw' | 'dare') => {
      if (!gameState || !gameState.pendingDrawChoice || !gameRef) return;

      const { card, amount, targetPlayerId } = gameState.pendingDrawChoice;

      let newState: GameState = {
        ...gameState,
        pendingDrawChoice: undefined  // Remove the pending choice immediately
      };

      if (choice === 'draw') {
        newState = drawCards(targetPlayerId, amount, newState);
        toast({
          title: 'Cards Drawn',
          description: `${
            newState.players.find((p) => p.id === targetPlayerId)?.name
          } drew ${amount} cards.`,
        });
      } else {
        // Dare choice - for now just skip the turn
        toast({
          title: 'Dare Chosen!',
          description: `${
            newState.players.find((p) => p.id === targetPlayerId)?.name
          } chose to do a dare! (Feature coming soon)`,
        });
      }

      newState.log = [
        ...(newState.log || []),
        `${newState.players.find((p) => p.id === targetPlayerId)?.name} chose to ${choice === 'draw' ? `draw ${amount} cards` : 'do a dare'}.`,
      ];

      // Skip the target player's turn
      newState = nextTurn(newState, 2);

      newState.isProcessingTurn = false;
      
      // Create a clean state object without pendingDrawChoice for Firebase
      const stateToSave: GameState = {
        ...newState
      };
      delete stateToSave.pendingDrawChoice;
      
      console.log('handleDrawChoice: Saving state after choice', {
        choice,
        targetPlayerId,
        newState: { ...newState, pendingDrawChoice: '[REMOVED]' }
      });
      
      await set(gameRef, stateToSave);
    },
    [gameState, drawCards, nextTurn, toast, gameRef]
  );
  
  const selectColorForWild = useCallback(
    async (color: Color) => {
      if (!wildCardToPlay || !gameState || !userId || !gameRef) return;

      const player = gameState.players.find((p) => p.id === userId);
      if (!player) return;

      const cardToPlay: Card = {
        color: 'wild',
        value: wildCardToPlay.value as 'wild' | 'wildDraw4',
        isWild: true,
        chosenColor: color
      };

      const playerIndex = gameState.players.findIndex((p) => p.id === userId);
      if (playerIndex === -1) return;

      const newPlayers = [...gameState.players];
      const newHand = newPlayers[playerIndex].hand.filter(
        (c) => !(c.value === wildCardToPlay.value && c.color === wildCardToPlay.color)
      );
      newPlayers[playerIndex] = { ...newPlayers[playerIndex], hand: newHand };

      let newState: GameState = {
        ...gameState,
        players: newPlayers,
        discardPile: [...gameState.discardPile, cardToPlay],
        isProcessingTurn: true,
      };

      setWildCardToPlay(null);
      toast({ title: 'Color Chosen', description: `${player.name} chose ${color}.` });

      if (newHand.length === 0) {
        newState = {
          ...newState,
          players: newPlayers,
          status: 'finished',
          winner: player.name,
          log: [...(newState.log || []), `${player.name} wins!`],
          isProcessingTurn: false,
        };
      } else {
        newState = applyCardEffect(cardToPlay, newState);
      }
      newState.isProcessingTurn = false;
      
      // Create a clean state object without pendingDrawChoice for Firebase
      const stateToSave: GameState = {
        ...newState
      };
      delete stateToSave.pendingDrawChoice;
      
      await set(gameRef, stateToSave);
    },
    [wildCardToPlay, gameState, userId, toast, gameRef, applyCardEffect]
  );
  
  const playCard = useCallback(
    async (card: Card) => {
      if (
        !gameState ||
        gameState.status !== 'active' ||
        gameState.currentPlayerId !== userId ||
        isProcessingTurn ||
        !gameRef
      )
        return;

      const player = gameState.players.find((p) => p.id === userId);
      if (!player) return;

      const topCard = getTopCard(gameState.discardPile);

      if (!isCardPlayable(card, topCard)) {
        toast({
          title: 'Invalid Move',
          description: "You can't play that card.",
          variant: 'destructive',
        });
        return;
      }

      await set(ref(db, `lobbies/${lobbyId}/game/isProcessingTurn`), true);

      if (card.isWild) {
        setWildCardToPlay(card);
        // The rest of the turn logic is handled in selectColorForWild
        return;
      }

      const playerIndex = gameState.players.findIndex((p) => p.id === userId);
      const newPlayers = [...gameState.players];
      
      const cardInHandIndex = newPlayers[playerIndex].hand.findIndex(c => c.color === card.color && c.value === card.value);
      const newHand = [...newPlayers[playerIndex].hand];
      if(cardInHandIndex > -1) {
        newHand.splice(cardInHandIndex, 1);
      }

      newPlayers[playerIndex] = { ...newPlayers[playerIndex], hand: newHand };

      let newState: GameState = {
        ...gameState,
        players: newPlayers,
        discardPile: [...gameState.discardPile, card],
      };

      if (newHand.length === 0) {
        newState = {
          ...newState,
          players: newPlayers,
          status: 'finished',
          winner: player.name,
          log: [...(newState.log || []), `${player.name} wins!`],
          isProcessingTurn: false,
        };
      } else {
        if (newHand.length === 1) {
          toast({
            title: 'UNO!',
            description: `${player.name} has one card left!`,
          });
        }
        newState = applyCardEffect(card, newState);
      }
      newState.isProcessingTurn = false;
      
      // Create a clean state object without pendingDrawChoice for Firebase
      const stateToSave: GameState = {
        ...newState
      };
      delete stateToSave.pendingDrawChoice;
      
      await set(gameRef, stateToSave);
    },
    [
      gameState,
      userId,
      isProcessingTurn,
      applyCardEffect,
      toast,
      gameRef,
      db,
      lobbyId,
      selectColorForWild,
    ]
  );

  const createGame = async (playerName: string) => {
    if (!userId || !db) return;

    // Generate a unique 4-digit room code
    let roomCode: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      roomCode = Math.floor(1000 + Math.random() * 9000).toString();
      attempts++;

      // Check if room code already exists
      const lobbyRef = ref(db, `lobbies/${roomCode}`);
      const snapshot = await get(lobbyRef);

      if (!snapshot.exists() || attempts >= maxAttempts) {
        break;
      }
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      toast({ title: 'Error', description: 'Unable to generate unique room code', variant: 'destructive' });
      return;
    }

    setLobbyId(roomCode);

    const hostPlayer: Player = { id: userId, name: playerName, hand: [], isAI: false };

    await set(ref(db, `lobbies/${roomCode}`), {
      id: roomCode,
      createdAt: serverTimestamp(),
      hostId: userId,
      status: 'waiting',
    });

    const playerRef = ref(db, `lobbies/${roomCode}/players/${userId}`);
    await set(playerRef, hostPlayer);
  };

  const joinGame = async (roomCode: string, playerName: string) => {
    if (!userId || !db) return;

    // Check current player count before joining
    const lobbyRef = ref(db, `lobbies/${roomCode}`);
    const lobbySnap = await get(lobbyRef);

    if (!lobbySnap.exists()) {
      toast({ title: 'Room Not Found', description: 'The room code you entered does not exist.', variant: 'destructive' });
      return;
    }

    const lobbyData = lobbySnap.val();
    const currentPlayerCount = Object.keys(lobbyData.players || {}).length;

    if (currentPlayerCount >= MAX_PLAYERS) {
      toast({ title: 'Room Full', description: 'This room is already full (maximum 4 players).', variant: 'destructive' });
      return;
    }

    const newPlayer: Player = { id: userId, name: playerName, hand: [], isAI: false };
    const playerRef = ref(db, `lobbies/${roomCode}/players/${userId}`);
    await set(playerRef, newPlayer);
    setLobbyId(roomCode);
  };
  
  const startGame = useCallback(
    async (players: Player[]) => {
      if (!lobbyId || !db) return;

      // Validate player count (2-4 players)
      if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
        toast({
          title: 'Invalid Player Count',
          description: `Games require ${MIN_PLAYERS}-${MAX_PLAYERS} players.`,
          variant: 'destructive'
        });
        return;
      }

      const shuffledDeck = shuffle(createDeck());

      players.forEach((player) => {
        player.hand = shuffledDeck.splice(0, INITIAL_HAND_SIZE);
      });

      let firstCardIndex = shuffledDeck.findIndex((c) => !c.isWild);
      if (firstCardIndex === -1) {
        firstCardIndex = 0; // Fallback if all cards are wild
      }
      const firstCard = shuffledDeck.splice(firstCardIndex, 1)[0];

      const newGameState: GameState = {
        id: lobbyId,
        players: players,
        drawPile: shuffledDeck,
        discardPile: [firstCard],
        currentPlayerId: players[0].id,
        playDirection: 'clockwise',
        status: 'active',
        winner: null,
        log: [`Game started! ${players[0].name}'s turn.`],
        isProcessingTurn: false,
      };

      const gameDocRef = ref(db, `lobbies/${lobbyId}/game`);
      await set(gameDocRef, newGameState);

      const lobbyRef = ref(db, `lobbies/${lobbyId}`);
      const lobbySnap = await get(lobbyRef);
      if (lobbySnap.exists()) {
        await set(lobbyRef, { ...lobbySnap.val(), status: 'active' });
      }

      setView('game');
    },
    [lobbyId, db, toast]
  );

  useEffect(() => {
    if (gameState?.status === 'finished' && view !== 'game-over') {
      setView('game-over');
    } else if (gameState?.status === 'active' && view !== 'game') {
      setView('game');
    } else if (!gameState && lobbyId && view !== 'lobby') {
      // Stay in lobby view if we have a lobbyId but no game state yet
      setView('lobby');
    } else if (!lobbyId && view !== 'lobby') {
      setView('lobby');
    }
  }, [gameState, view, lobbyId]);

  const drawCard = useCallback(async () => {
    if (
      !gameState ||
      gameState.status !== 'active' ||
      gameState.currentPlayerId !== userId ||
      isProcessingTurn ||
      !gameRef ||
      !db
    )
      return;

    await set(ref(db, `lobbies/${lobbyId}/game/isProcessingTurn`), true);

    let newState = drawCards(userId, 1, gameState);
    newState = nextTurn(newState);
    newState.isProcessingTurn = false;

    // Create a clean state object without pendingDrawChoice for Firebase
    const stateToSave: GameState = {
      ...newState
    };
    delete stateToSave.pendingDrawChoice;

    await set(gameRef, stateToSave);
  }, [
    gameState,
    userId,
    isProcessingTurn,
    drawCards,
    nextTurn,
    gameRef,
    db,
    lobbyId,
  ]);

  const resetGame = async () => {
    if (lobbyId && db) {
      const lobbyRef = ref(db, `lobbies/${lobbyId}`);
      await remove(lobbyRef);
    }
    setLobbyId(null);
    setView('lobby');
  };

  return {
    gameState,
    view,
    lobbyId,
    currentPlayer,
    isProcessingTurn,
    wildCardToPlay,
    playCard,
    drawCard,
    selectColorForWild,
    resetGame,
    joinGame,
    createGame,
    startGame,
    lobbyPlayers,
    handleDrawChoice,
  };
}
