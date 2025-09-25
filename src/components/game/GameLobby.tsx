'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@/lib/uno-game';

interface GameLobbyProps {
  onStartGame: (playerName: string) => void;
  onJoinGame: (roomCode: string, playerName: string) => void;
  lobbyId: string | null;
  lobbyPlayers: Player[] | null;
  userId: string | undefined;
  onStartActualGame: (players: Player[]) => void;
}

export function GameLobby({
  onStartGame,
  onJoinGame,
  lobbyId,
  lobbyPlayers,
  userId,
  onStartActualGame,
}: GameLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const { toast } = useToast();

  const handleCreate = () => {
    if (playerName.trim()) {
      onStartGame(playerName.trim());
    }
  };

  const handleJoin = () => {
    if (playerName.trim() && joinCode.trim()) {
      onJoinGame(joinCode.trim(), playerName.trim());
    }
  };

  const handleStartGame = () => {
    if (lobbyPlayers && lobbyPlayers.length >= 2) {
      onStartActualGame(lobbyPlayers);
    }
  };

  const copyLobbyId = () => {
    if (lobbyId) {
      navigator.clipboard.writeText(lobbyId);
      toast({
        title: 'Copied!',
        description: 'Lobby code copied to clipboard.',
      });
    }
  };

  const canStartGame = lobbyPlayers && lobbyPlayers.length >= 2 && lobbyPlayers.length <= 4;
  const isHost = lobbyPlayers?.find(p => p.id === userId)?.id === userId;

  if (lobbyId) {
    return (
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold text-primary">
            Waiting for Players
          </CardTitle>
          <CardDescription>
            Share this code with your friends to have them join.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
            <span className="text-2xl font-bold tracking-widest text-muted-foreground">
              {lobbyId}
            </span>
            <Button size="icon" variant="ghost" onClick={copyLobbyId}>
              <Copy className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
        <CardContent className="text-center">
          <div className="text-sm text-muted-foreground mb-4">
            Players joined: {lobbyPlayers?.length || 0}/4
          </div>
          {isHost && canStartGame && (
            <Button
              onClick={handleStartGame}
              className="w-full text-lg font-bold bg-green-600 hover:bg-green-700"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game ({lobbyPlayers?.length} players)
            </Button>
          )}
          {!canStartGame && isHost && (
            <p className="text-sm text-muted-foreground">
              Need at least 2 players to start
            </p>
          )}
          {!isHost && (
            <p className="text-sm text-muted-foreground">
              Waiting for the host to start the game...
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-extrabold text-primary">
          UnoSync
        </CardTitle>
        <CardDescription>The classic card game, reimagined.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Game</TabsTrigger>
            <TabsTrigger value="join">Join Game</TabsTrigger>
          </TabsList>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Your Name</Label>
              <Input
                id="player-name"
                placeholder="e.g., Player One"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-base"
              />
            </div>
          </div>
          <TabsContent value="create">
            <CardFooter className="px-0 pt-4">
              <Button
                onClick={handleCreate}
                disabled={!playerName.trim()}
                className="w-full text-lg font-bold"
              >
                Create Game
              </Button>
            </CardFooter>
          </TabsContent>
          <TabsContent value="join">
            <div className="space-y-2 pt-4">
              <Label htmlFor="join-code">Room Code</Label>
              <Input
                id="join-code"
                placeholder="Enter room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="text-base"
              />
            </div>
            <CardFooter className="px-0 pt-4">
              <Button
                onClick={handleJoin}
                disabled={!playerName.trim() || !joinCode.trim()}
                className="w-full text-lg font-bold"
              >
                Join Game
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
