import { useContext, useCallback } from 'react';
import { GameContext } from '../context/GameContext';

export const useAI = () => {
  const { gameState, dispatch } = useContext(GameContext);

  const checkCollision = (carX: number, carY: number, playerX: number, playerY: number) => {
    const carWidth = 40;
    const carHeight = 30;
    
    const overlapX = Math.min(carX + carWidth/2, playerX + carWidth/2) - 
                    Math.max(carX - carWidth/2, playerX - carWidth/2);
    const overlapY = Math.min(carY + carHeight/2, playerY + carHeight/2) - 
                    Math.max(carY - carHeight/2, playerY - carHeight/2);
    
    if (overlapX > 0 && overlapY > 0) {
      const overlapArea = overlapX * overlapY;
      const playerArea = carWidth * carHeight;
      const overlapPercentage = overlapArea / playerArea;
      
      return overlapPercentage > 0.5;
    }
    
    return false;
  };

  const updateAICars = useCallback(() => {
    const baseSpeed = 0.5 + (gameState.currentDay - 1) * 0.1; // Velocidade base mais suave
    const maxCars = 4 + Math.floor(gameState.currentDay / 4); // Progressão mais gradual
    
    const updatedCars = gameState.aiCars.map(car => {
      const newY = car.y + (car.speed * (gameState.playerSpeed / 6)); // Ajuste na velocidade relativa
      
      if (newY > 600) {
        dispatch({ type: 'CAR_OVERTAKEN' });
        
        const perspectiveScale = 0.3;
        const roadWidth = 400 * perspectiveScale;
        const minX = 400 - (roadWidth / 2);
        const maxX = 400 + (roadWidth / 2);
        const newX = minX + (Math.random() * (maxX - minX));
        
        return {
          x: newX,
          y: 300,
          speed: baseSpeed + (Math.random() * 0.4) // Menos variação na velocidade
        };
      }
      
      if (checkCollision(car.x, car.y, gameState.playerPosition.x, gameState.playerPosition.y)) {
        dispatch({ type: 'COLLISION' });
      }
      
      const perspectiveScale = (600 - newY) / 300;
      const roadWidth = 400 * perspectiveScale;
      const minX = 400 - (roadWidth / 2);
      const maxX = 400 + (roadWidth / 2);
      const newX = Math.max(minX, Math.min(maxX, car.x));
      
      return {
        ...car,
        x: newX,
        y: newY
      };
    });

    if (updatedCars.length < maxCars && Math.random() < 0.02 + (gameState.currentDay * 0.002)) { // Spawn mais equilibrado
      const perspectiveScale = 0.3;
      const roadWidth = 400 * perspectiveScale;
      const minX = 400 - (roadWidth / 2);
      const maxX = 400 + (roadWidth / 2);
      const startX = minX + (Math.random() * (maxX - minX));
      
      updatedCars.push({
        x: startX,
        y: 300,
        speed: baseSpeed + (Math.random() * 0.4)
      });
    }

    dispatch({ type: 'UPDATE_AI_CARS', payload: updatedCars });
  }, [gameState, dispatch]);

  return { updateAICars };
};