import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';

const GameOver: React.FC = () => {
  const { gameState, dispatch } = useContext(GameContext);

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg text-white text-center max-w-md">
        <h2 className="text-3xl text-yellow-400 mb-6">Game Over!</h2>
        
        <div className="space-y-4 mb-8">
          <p className="text-xl">Pontuação Final: {gameState.score}</p>
          <p>Dia Alcançado: {gameState.currentDay}</p>
          <p>Carros Ultrapassados: {gameState.carsOvertaken}</p>
          <p>Meta: {gameState.targetCars} carros</p>
          {gameState.bonusPoints > 0 && (
            <p className="text-green-400">Pontos Bônus: +{gameState.bonusPoints}</p>
          )}
        </div>

        <button
          onClick={handlePlayAgain}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg transition-colors"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};

export default GameOver;