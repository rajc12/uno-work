"use client";

import { type Color, COLORS } from '@/lib/uno-game';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ColorPickerProps {
  onSelectColor: (color: Color) => void;
}

const colorClasses = {
  red: 'bg-red-500 hover:bg-red-600',
  yellow: 'bg-yellow-400 hover:bg-yellow-500',
  green: 'bg-green-500 hover:bg-green-600',
  blue: 'bg-blue-500 hover:bg-blue-600',
};

export function ColorPicker({ onSelectColor }: ColorPickerProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Choose a Color</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {COLORS.map(color => (
            <Button
              key={color}
              className={`h-24 text-lg font-bold text-white capitalize ${colorClasses[color]}`}
              onClick={() => onSelectColor(color)}
            >
              {color}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
