"use client";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DrawOrDareDialogProps {
    drawCount: number;
    onChoice: (choseDraw: boolean) => void;
}

export function DrawOrDareDialog({ drawCount, onChoice }: DrawOrDareDialogProps) {
    return (
        <AlertDialog open={true}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl text-center">Your Move!</AlertDialogTitle>
                    <AlertDialogDescription className="text-lg text-center">
                        A Draw {drawCount} card was played!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row gap-4 justify-center">
                    <Button onClick={() => onChoice(true)} size="lg" className="flex-1">
                        Draw {drawCount} Cards
                    </Button>
                    <Button onClick={() => onChoice(false)} size="lg" variant="secondary" className="flex-1">
                        Dare
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
