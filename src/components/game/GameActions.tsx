"use client";

import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

interface GameActionsProps {
    onDrawCard: () => void;
    isMyTurn: boolean;
}

export function GameActions({ onDrawCard, isMyTurn }: GameActionsProps) {
    const { toast } = useToast();

    const handleUnoClick = () => {
        toast({
            title: "UNO!",
            description: "You've declared you have one card left!",
        });
    };

    return (
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
             <Button 
                variant="default"
                size="lg"
                className="font-black text-2xl bg-red-500 hover:bg-red-600 text-white"
                onClick={handleUnoClick}
            >
                UNO!
            </Button>
            <Button 
                variant="outline"
                size="lg"
                onClick={onDrawCard}
                disabled={!isMyTurn}
            >
                Draw Card
            </Button>
        </div>
    )
}
