import { useCallback, useContext, useRef } from 'react';
import { GameContext } from '../context/GameContext';

export const useGameLoop = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const { gameState, dispatch } = useContext(GameContext);
  const lastWeatherChange = useRef(Date.now());

  const updateWeather = useCallback(() => {
    const now = Date.now();
    if (now - lastWeatherChange.current > 20000) {
      const weathers: Array<'clear' | 'fog' | 'snow' | 'night'> = ['clear', 'fog', 'snow', 'night'];
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      dispatch({ type: 'UPDATE_WEATHER', payload: newWeather });
      lastWeatherChange.current = now;
    }
  }, [dispatch]);

  const getRoadBoundaries = useCallback((y: number) => {
    const baseHeight = 600;
    const horizonY = baseHeight/2;
    const perspectiveScale = Math.max(0.1, (y - horizonY) / (baseHeight - horizonY));
    const roadWidth = 400 * perspectiveScale;
    const leftBoundary = 400 - (roadWidth / 2);
    const rightBoundary = 400 + (roadWidth / 2);
    return { leftBoundary, rightBoundary };
  }, []);

  const drawRoad = useCallback((ctx: CanvasRenderingContext2D) => {
    const width = 800;
    const height = 600;
    
    // Céu
    ctx.fillStyle = gameState.weather === 'night' ? '#000033' : '#0000AA';
    ctx.fillRect(0, 0, width, height/2);
    
    // Grama
    ctx.fillStyle = '#005500';
    ctx.fillRect(0, height/2, width, height/2);

    // Montanhas
    ctx.fillStyle = '#004400';
    ctx.beginPath();
    ctx.moveTo(0, height/2);
    ctx.quadraticCurveTo(width * 0.15, height/2 - 20, width * 0.3, height/2);
    ctx.moveTo(width * 0.7, height/2);
    ctx.quadraticCurveTo(width * 0.85, height/2 - 20, width, height/2);
    ctx.fill();

    // Linhas da pista
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width/2 - 200, height);
    ctx.lineTo(width/2, height/2);
    ctx.moveTo(width/2 + 200, height);
    ctx.lineTo(width/2, height/2);
    ctx.stroke();
  }, [gameState.weather]);

  const drawDetailedCar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, isPlayer: boolean) => {
    // Corpo principal do carro
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - width/2, y - height/2, width, height, 3);
    ctx.fill();

    // Teto do carro (mais estreito que o corpo)
    const roofWidth = width * 0.6;
    const roofHeight = height * 0.5;
    const roofX = x - roofWidth/2;
    const roofY = y - height/2 + (height * 0.1);
    ctx.fillStyle = isPlayer ? '#CCCCCC' : '#880000';
    ctx.beginPath();
    ctx.roundRect(roofX, roofY, roofWidth, roofHeight, 2);
    ctx.fill();

    // Para-brisa
    ctx.fillStyle = '#000033';
    const windshieldWidth = roofWidth * 0.8;
    const windshieldHeight = roofHeight * 0.4;
    const windshieldX = x - windshieldWidth/2;
    const windshieldY = roofY + (roofHeight * 0.1);
    ctx.fillRect(windshieldX, windshieldY, windshieldWidth, windshieldHeight);

    // Faróis traseiros
    const lightSize = width * 0.1;
    ctx.fillStyle = '#FF0000';
    // Farol esquerdo
    ctx.beginPath();
    ctx.arc(x - width/3, y - height/2 + lightSize, lightSize/2, 0, Math.PI * 2);
    ctx.fill();
    // Farol direito
    ctx.beginPath();
    ctx.arc(x + width/3, y - height/2 + lightSize, lightSize/2, 0, Math.PI * 2);
    ctx.fill();

    // Rodas
    const wheelWidth = width * 0.15;
    const wheelHeight = height * 0.25;
    ctx.fillStyle = '#000000';
    // Roda traseira esquerda
    ctx.fillRect(x - width/2 - wheelWidth/4, y - height/3, wheelWidth, wheelHeight);
    // Roda traseira direita
    ctx.fillRect(x + width/2 - wheelWidth*3/4, y - height/3, wheelWidth, wheelHeight);
    // Roda dianteira esquerda
    ctx.fillRect(x - width/2 - wheelWidth/4, y + height/4, wheelWidth, wheelHeight);
    // Roda dianteira direita
    ctx.fillRect(x + width/2 - wheelWidth*3/4, y + height/4, wheelWidth, wheelHeight);
  }, []);

  const drawCar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, isPlayer = false) => {
    const { leftBoundary, rightBoundary } = getRoadBoundaries(y);
    const adjustedX = Math.max(leftBoundary + 20, Math.min(rightBoundary - 20, x));
    
    if (isPlayer) {
      const carWidth = 30;
      const carHeight = 50;
      drawDetailedCar(ctx, adjustedX, y, carWidth, carHeight, '#3366CC', true);
    } else {
      const baseHeight = 600;
      const horizonY = baseHeight/2;
      const perspectiveScale = Math.max(0.1, (y - horizonY) / (baseHeight - horizonY));
      const baseCarWidth = 30;
      const baseCarHeight = 50;
      const carWidth = baseCarWidth * perspectiveScale;
      const carHeight = baseCarHeight * perspectiveScale;
      
      drawDetailedCar(ctx, adjustedX, y, carWidth, carHeight, '#CC3333', false);
    }
  }, [getRoadBoundaries, drawDetailedCar]);

  const applyWeatherEffects = useCallback((ctx: CanvasRenderingContext2D) => {
    const width = 800;
    const height = 600;
    
    switch (gameState.weather) {
      case 'fog': {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
      }
        
      case 'snow':
        for (let i = 0; i < 150; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 2 + 1;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'night':
        ctx.fillStyle = 'rgba(0, 0, 20, 0.7)';
        ctx.fillRect(0, 0, width, height);
        break;
    }
  }, [gameState.weather]);

  const updateGame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoad(ctx);
    
    const sortedCars = [...gameState.aiCars].sort((a, b) => b.y - a.y);
    sortedCars.forEach(car => {
      drawCar(ctx, car.x, car.y, false);
    });
    
    const { leftBoundary, rightBoundary } = getRoadBoundaries(gameState.playerPosition.y);
    const adjustedX = Math.max(leftBoundary + 20, Math.min(rightBoundary - 20, gameState.playerPosition.x));
    
    if (adjustedX !== gameState.playerPosition.x) {
      dispatch({ type: 'UPDATE_PLAYER_POSITION', payload: { x: adjustedX, y: gameState.playerPosition.y } });
    }
    
    drawCar(ctx, adjustedX, gameState.playerPosition.y, true);
    applyWeatherEffects(ctx);

    if (!gameState.isGameOver) {
      dispatch({ type: 'UPDATE_TIME' });
      updateWeather();
    }
  }, [gameState, dispatch, drawRoad, drawCar, applyWeatherEffects, updateWeather, getRoadBoundaries, canvasRef]);

  return { updateGame };
};