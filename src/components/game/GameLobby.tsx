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
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameLobbyProps {
  onStartGame: (playerName: string) => void;
  onJoinGame: (roomCode: string, playerName: string) => void;
  lobbyId: string | null;
}

export function GameLobby({
  onStartGame,
  onJoinGame,
  lobbyId,
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

  const copyLobbyId = () => {
    if (lobbyId) {
      navigator.clipboard.writeText(lobbyId);
      toast({
        title: 'Copied!',
        description: 'Lobby code copied to clipboard.',
      });
    }
  };

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
        <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">The game will start once enough players have joined.</p>
        </CardFooter>
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
