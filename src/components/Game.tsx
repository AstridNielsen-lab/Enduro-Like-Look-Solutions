import React, { useEffect, useRef, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { useGameLoop } from '../hooks/useGameLoop';
import { useAI } from '../hooks/useAI';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, dispatch } = useContext(GameContext);
  const { updateGame } = useGameLoop(canvasRef);
  const { updateAICars } = useAI();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        dispatch({ type: 'MOVE_LEFT' });
      } else if (e.key === 'ArrowRight') {
        dispatch({ type: 'MOVE_RIGHT' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;

    const gameLoop = () => {
      updateGame();
      updateAICars();
      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
  }, [updateGame, updateAICars]);

  return (
    <div className="relative w-full h-full flex justify-center items-center bg-black p-4">
      <canvas
        ref={canvasRef}
        className="border-4 border-gray-700 rounded"
      />
      <div className="absolute top-4 left-4 text-xl">
        <div>Time: {Math.floor(gameState.timeRemaining)}</div>
        <div>Score: {gameState.score}</div>
      </div>
    </div>
  );
};

export default Game;