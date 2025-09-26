"use client";

import { Button } from '@/components/ui/button';

interface DrawOrDareDialogProps {
    drawCount: number;
    onChoice: (choseDraw: boolean) => void;
}

export function DrawOrDareDialog({ drawCount, onChoice }: DrawOrDareDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-center mb-4">Your Move!</h2>
                <p className="text-lg text-center mb-6">
                    A Draw {drawCount} card was played!
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={() => onChoice(true)} size="lg" className="flex-1">
                        Draw {drawCount} Cards
                    </Button>
                    <Button onClick={() => onChoice(false)} size="lg" variant="secondary" className="flex-1">
                        Dare
                    </Button>
                </div>
            </div>
        </div>
    );
}
