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

  const drawCar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isPlayer = false) => {
    const baseHeight = 600;
    const horizonY = baseHeight/2;
    
    // Calcular escala baseada na distância do horizonte
    const perspectiveScale = Math.max(0.1, (y - horizonY) / (baseHeight - horizonY));
    
    // Ajustar posição X baseada na perspectiva
    const roadWidth = 400 * perspectiveScale;
    const centerX = 400;
    const relativeX = x - centerX;
    const perspectiveX = centerX + (relativeX * perspectiveScale);
    
    if (isPlayer) {
      // Carro do jogador
      const carWidth = 30;
      const carHeight = 20;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x - carWidth/2, y - carHeight/2, carWidth, carHeight);
    } else {
      // Carros adversários
      const baseCarWidth = 30;
      const baseCarHeight = 20;
      const carWidth = baseCarWidth * perspectiveScale;
      const carHeight = baseCarHeight * perspectiveScale;
      
      ctx.fillStyle = color;
      ctx.fillRect(
        perspectiveX - carWidth/2,
        y - carHeight/2,
        carWidth,
        carHeight
      );
    }
  }, []);

  const applyWeatherEffects = useCallback((ctx: CanvasRenderingContext2D) => {
    const width = 800;
    const height = 600;
    
    switch (gameState.weather) {
      case 'fog':
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
        
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
    
    // Desenhar carros da IA ordenados por distância
    const sortedCars = [...gameState.aiCars].sort((a, b) => b.y - a.y);
    sortedCars.forEach(car => {
      drawCar(ctx, car.x, car.y, '#FF0000', false);
    });
    
    drawCar(ctx, gameState.playerPosition.x, gameState.playerPosition.y, '#FFFFFF', true);
    applyWeatherEffects(ctx);

    if (!gameState.isGameOver) {
      dispatch({ type: 'UPDATE_TIME' });
      updateWeather();
    }
  }, [gameState, dispatch, drawRoad, drawCar, applyWeatherEffects, updateWeather]);

  return { updateGame };
};