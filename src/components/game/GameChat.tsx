'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Send } from 'lucide-react';
import {
  useDatabase,
  useList,
  useObjectValue,
  useMemoFirebase,
} from '@/firebase';
import { ref, push, serverTimestamp, query, orderByChild } from 'firebase/database';
import type { Player } from '@/lib/uno-game';

interface ChatMessage {
  id?: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: any;
}

interface GameChatProps {
  lobbyId: string;
  userId: string;
}

export function GameChat({ lobbyId, userId }: GameChatProps) {
  const [input, setInput] = useState('');
  const db = useDatabase();

  const messagesRef = useMemoFirebase(
    () => (db ? query(ref(db, `lobbies/${lobbyId}/chat_messages`), orderByChild('timestamp')) : null),
    [db, lobbyId]
  );
  const { data: messages } = useList<ChatMessage>(messagesRef);

  const playerRef = useMemoFirebase(
    () => (db ? ref(db, `lobbies/${lobbyId}/players/${userId}`) : null),
    [db, lobbyId, userId]
  );
  const { data: userPlayer } = useObjectValue<Player>(playerRef);

  const handleSend = () => {
    if (input.trim() && userPlayer && db) {
      const newMessage: Omit<ChatMessage, 'id'> = {
        userId,
        userName: userPlayer.name,
        text: input.trim(),
        timestamp: serverTimestamp(),
      };
      const messagesPushRef = ref(db, `lobbies/${lobbyId}/chat_messages`);
      push(messagesPushRef, newMessage);
      setInput('');
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 w-80">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Game Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-40 w-full pr-4">
            <div className="space-y-2 text-sm">
              {messages?.map((msg) => (
                <div key={msg.id}>
                  <span className="font-bold text-primary">{msg.userName}: </span>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <div className="flex w-full gap-2">
            <Input
              placeholder="Say something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button size="icon" onClick={handleSend}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
