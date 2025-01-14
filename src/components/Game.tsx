import React, { useEffect, useRef, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { useGameLoop } from '../hooks/useGameLoop';
import { useAI } from '../hooks/useAI';
import GameOver from './GameOver';

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
    if (gameState.speedPenalty) {
      const timer = setTimeout(() => {
        dispatch({ type: 'RESET_SPEED_PENALTY' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.speedPenalty, dispatch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;

    const gameLoop = () => {
      if (!gameState.isGameOver) {
        updateGame();
        updateAICars();
      }
      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
  }, [updateGame, updateAICars, gameState.isGameOver]);

  if (gameState.isGameOver) {
    return <GameOver />;
  }

  return (
    <div className="relative w-full h-full flex justify-center items-center bg-black p-4">
      <canvas
        ref={canvasRef}
        className="border-4 border-gray-700 rounded"
      />
      <div className="absolute top-4 left-4 text-xl space-y-2">
        <div>Day: {gameState.currentDay}</div>
        <div>Time: {Math.floor(gameState.elapsedTime)}s</div>
        <div>Score: {gameState.score}</div>
        <div>Cars: {gameState.carsOvertaken}/{gameState.targetCars}</div>
        <div>Speed: {Math.floor(gameState.playerSpeed * 10)}km/h</div>
      </div>
    </div>
  );
};

export default Game;