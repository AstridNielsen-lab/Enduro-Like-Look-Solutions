import { useContext, useCallback } from 'react';
import { GameContext } from '../context/GameContext';

export const useAI = () => {
  const { gameState, dispatch } = useContext(GameContext);

  const updateAICars = useCallback(() => {
    // Atualizar carros existentes
    const updatedCars = gameState.aiCars.map(car => {
      // Mover carros do horizonte em direção ao jogador
      const newY = car.y + car.speed;
      
      if (newY > 600) {
        // Quando o carro passar da tela, reposicionar no horizonte
        return {
          x: 400 + (Math.random() * 100 - 50), // Centralizar mais na pista
          y: 300, // Começar no horizonte
          speed: 2 + Math.random() * 2 // Velocidade mais consistente
        };
      }
      
      // Calcular a largura da pista baseada na posição Y
      const perspectiveScale = (600 - newY) / 300;
      const roadWidth = 400 * perspectiveScale; // Largura da pista diminui com a distância
      
      // Manter o carro dentro dos limites da pista
      const minX = 400 - (roadWidth / 2);
      const maxX = 400 + (roadWidth / 2);
      const newX = Math.max(minX, Math.min(maxX, car.x));
      
      return {
        ...car,
        x: newX,
        y: newY
      };
    });

    // Adicionar novos carros periodicamente
    if (gameState.aiCars.length < 5 && Math.random() < 0.02) {
      // Posicionar novo carro aleatoriamente dentro da pista no horizonte
      const roadWidthAtHorizon = 50; // Largura da pista no horizonte
      const startX = 400 + (Math.random() * roadWidthAtHorizon - roadWidthAtHorizon/2);
      
      updatedCars.push({
        x: startX,
        y: 300, // Horizonte
        speed: 2 + Math.random() * 2
      });
    }

    // Atualizar estado dos carros
    dispatch({ type: 'UPDATE_AI_CARS', payload: updatedCars });
  }, [gameState.aiCars, dispatch]);

  return { updateAICars };
};