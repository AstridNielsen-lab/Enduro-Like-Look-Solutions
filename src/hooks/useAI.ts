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

  const getLanePosition = (lane: number, y: number) => {
    const perspectiveScale = (600 - y) / 300;
    const roadWidth = 400 * perspectiveScale;
    const laneWidth = roadWidth / 3;
    const roadLeft = 400 - (roadWidth / 2);
    return roadLeft + (lane * laneWidth) + (laneWidth / 2);
  };

  const updateAICars = useCallback(() => {
    const baseSpeed = 0.5 + (gameState.currentDay - 1) * 0.1;
    const maxCars = 5; // Limit maximum cars on screen
    const minDistanceBetweenCars = 150; // Minimum vertical distance between cars
    
    const updatedCars = gameState.aiCars.map(car => {
      const newY = car.y + (car.speed * (gameState.playerSpeed / 6));
      
      if (newY > 600) {
        dispatch({ type: 'CAR_OVERTAKEN' });
        
        // Find a free lane and position for the new car
        const existingCarPositions = gameState.aiCars
          .filter(c => c.y < 350)
          .map(c => ({ y: c.y, lane: c.lane }));
        
        let newLane = Math.floor(Math.random() * 3);
        let attempts = 0;
        let validPosition = false;
        
        while (!validPosition && attempts < 10) {
          validPosition = true;
          for (const pos of existingCarPositions) {
            if (pos.lane === newLane && Math.abs(300 - pos.y) < minDistanceBetweenCars) {
              validPosition = false;
              break;
            }
          }
          if (!validPosition) {
            newLane = (newLane + 1) % 3;
            attempts++;
          }
        }
        
        if (!validPosition) {
          return null; // Skip spawning if no valid position found
        }
        
        return {
          x: getLanePosition(newLane, 300),
          y: 300,
          speed: baseSpeed + (Math.random() * 0.2),
          lane: newLane
        };
      }
      
      if (checkCollision(car.x, car.y, gameState.playerPosition.x, gameState.playerPosition.y)) {
        dispatch({ type: 'COLLISION' });
      }
      
      const newX = getLanePosition(car.lane, newY);
      
      return {
        ...car,
        x: newX,
        y: newY
      };
    }).filter(car => car !== null) as Array<{ x: number; y: number; speed: number; lane: number }>;

    // Only spawn new car if there's enough space
    if (updatedCars.length < maxCars && Math.random() < 0.02) {
      const existingCarPositions = updatedCars
        .filter(c => c.y < 350)
        .map(c => ({ y: c.y, lane: c.lane }));
      
      let newLane = Math.floor(Math.random() * 3);
      let validPosition = true;
      
      for (const pos of existingCarPositions) {
        if (pos.lane === newLane && Math.abs(300 - pos.y) < minDistanceBetweenCars) {
          validPosition = false;
          break;
        }
      }
      
      if (validPosition) {
        updatedCars.push({
          x: getLanePosition(newLane, 300),
          y: 300,
          speed: baseSpeed + (Math.random() * 0.2),
          lane: newLane
        });
      }
    }

    dispatch({ type: 'UPDATE_AI_CARS', payload: updatedCars });
  }, [gameState, dispatch]);

  return { updateAICars };
};