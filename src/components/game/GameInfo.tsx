"use client";

import { type GameState, type Player } from "@/lib/uno-game";
import { ArrowLeftRight, Repeat, User, Users } from "lucide-react";

interface GameInfoProps {
    gameState: GameState;
    currentPlayer: Player | null;
    lobbyId: string | null;
}

export function GameInfo({ gameState, currentPlayer, lobbyId }: GameInfoProps) {
    const turnDirectionIcon = gameState.playDirection === 'clockwise'
        ? <Repeat className="w-4 h-4" />
        : <ArrowLeftRight className="w-4 h-4" />;
    
    return (
        <div className="absolute top-4 left-4 z-10">
            <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg shadow-md space-y-2 text-sm">
                <div className="flex items-center gap-2 font-semibold">
                    <User className="w-4 h-4 text-primary" />
                    <span>Turn:</span>
                    <span className="text-primary">{currentPlayer?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Players:</span>
                    <span>{gameState.players.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    {turnDirectionIcon}
                    <span>Direction:</span>
                    <span className="capitalize">{gameState.playDirection}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <span>Room:</span>
                    <span className="font-bold">{lobbyId}</span>
                </div>
            </div>
        </div>
    );
}
