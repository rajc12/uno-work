'use client';

import { GameContainer } from '@/components/game/GameContainer';
import { useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect } from 'react';


export default function Home() {
  const auth = useAuth();
  useEffect(() => {
    if (!auth.currentUser) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth]);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <GameContainer />
    </main>
  );
}
