"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Check, Loader2 } from 'lucide-react';

interface SketchpadProps {
  width?: number;
  height?: number;
  onSubmit: (dataUrl: string) => void;
  isSubmitting: boolean;
}

export function Sketchpad({ width = 500, height = 400, onSubmit, isSubmitting }: SketchpadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // For high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.strokeStyle = 'white';
    context.lineWidth = 3;
    contextRef.current = context;

    clearCanvas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (event.nativeEvent instanceof MouseEvent) {
      return { x: event.nativeEvent.clientX - rect.left, y: event.nativeEvent.clientY - rect.top };
    }
    const touch = (event.nativeEvent as TouchEvent).touches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const context = contextRef.current;
    if (!context) return;
    const { x, y } = getCoords(event);
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const finishDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const context = contextRef.current;
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;
    const context = contextRef.current;
    if (!context) return;
    const { x, y } = getCoords(event);
    context.lineTo(x, y);
    context.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.fillStyle = '#2D3748'; // A dark, chalkboard-like color
      context.fillRect(0, 0, width, height);
    }
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSubmit(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={finishDrawing}
        onTouchMove={draw}
        className="border-2 border-primary rounded-lg shadow-lg cursor-crosshair bg-[#2D3748]"
      />
      <div className="flex space-x-4">
        <Button variant="outline" onClick={clearCanvas} disabled={isSubmitting}>
          <Eraser className="mr-2" />
          Clear
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <Check className="mr-2" />
          )}
          {isSubmitting ? 'Grading...' : 'Submit Answer'}
        </Button>
      </div>
    </div>
  );
}
