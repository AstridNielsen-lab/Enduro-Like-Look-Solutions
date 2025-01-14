import React, { createContext, useReducer } from 'react';

export interface GameState {
  playerPosition: { x: number; y: number };
  playerSpeed: number;
  score: number;
  elapsedTime: number;
  aiCars: Array<{ x: number; y: number; speed: number }>;
  weather: 'clear' | 'fog' | 'snow' | 'night';
  isGameOver: boolean;
  currentDay: number;
  carsOvertaken: number;
  targetCars: number;
  consecutiveCollisions: number;
  lastCollisionTime: number;
  bonusPoints: number;
  speedPenalty: boolean;
}

type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'UPDATE_TIME' }
  | { type: 'UPDATE_SCORE' }
  | { type: 'UPDATE_WEATHER'; payload: GameState['weather'] }
  | { type: 'UPDATE_AI_CARS'; payload: GameState['aiCars'] }
  | { type: 'COLLISION' }
  | { type: 'RESET_SPEED_PENALTY' }
  | { type: 'CAR_OVERTAKEN' }
  | { type: 'GAME_OVER' }
  | { type: 'RESET_GAME' };

const calculateTargetCars = (day: number) => {
  return 30 + ((day - 1) * 15);
};

const initialState: GameState = {
  playerPosition: { x: 400, y: 500 },
  playerSpeed: 4,
  score: 0,
  elapsedTime: 0,
  aiCars: [],
  weather: 'clear',
  isGameOver: false,
  currentDay: 1,
  carsOvertaken: 0,
  targetCars: 30,
  consecutiveCollisions: 0,
  lastCollisionTime: 0,
  bonusPoints: 0,
  speedPenalty: false,
};

export const GameContext = createContext<{
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({ gameState: initialState, dispatch: () => {} });

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MOVE_LEFT':
      return {
        ...state,
        playerPosition: {
          ...state.playerPosition,
          x: Math.max(200, state.playerPosition.x - (state.weather === 'snow' ? 6 : 10)),
        },
      };
      
    case 'MOVE_RIGHT':
      return {
        ...state,
        playerPosition: {
          ...state.playerPosition,
          x: Math.min(600, state.playerPosition.x + (state.weather === 'snow' ? 6 : 10)),
        },
      };
      
    case 'UPDATE_TIME':
      const newTime = state.elapsedTime + 1/60;
      
      if (Math.floor(newTime) % 20 === 0 && state.playerSpeed < 8) {
        state.playerSpeed += 0.3;
      }
      
      if (state.carsOvertaken >= state.targetCars) {
        return {
          ...state,
          elapsedTime: newTime,
          currentDay: state.currentDay + 1,
          targetCars: calculateTargetCars(state.currentDay + 1),
          carsOvertaken: 0,
          weather: 'clear',
          bonusPoints: Math.floor((state.carsOvertaken - state.targetCars) / 15) * 50,
          playerSpeed: Math.min(8, state.playerSpeed + 0.5),
        };
      }
      
      return {
        ...state,
        elapsedTime: newTime,
      };
      
    case 'COLLISION':
      const now = Date.now();
      const isConsecutive = now - state.lastCollisionTime < 2000;
      const newConsecutiveCollisions = isConsecutive ? state.consecutiveCollisions + 1 : 1;
      const penaltyPoints = -1 * newConsecutiveCollisions;
      
      return {
        ...state,
        score: Math.max(0, state.score + penaltyPoints),
        consecutiveCollisions: newConsecutiveCollisions,
        lastCollisionTime: now,
        speedPenalty: true,
        playerSpeed: Math.max(3, state.playerSpeed * 0.95),
      };
    
    case 'RESET_SPEED_PENALTY':
      return {
        ...state,
        speedPenalty: false,
        playerSpeed: Math.min(8, state.playerSpeed + 0.4),
      };
      
    case 'CAR_OVERTAKEN':
      const newScore = state.score + 3;
      return {
        ...state,
        carsOvertaken: state.carsOvertaken + 1,
        score: newScore,
      };
      
    case 'UPDATE_WEATHER':
      return {
        ...state,
        weather: action.payload,
      };
      
    case 'UPDATE_AI_CARS':
      return {
        ...state,
        aiCars: action.payload,
      };
      
    case 'GAME_OVER':
      return {
        ...state,
        isGameOver: true,
      };

    case 'RESET_GAME':
      return {
        ...initialState,
      };
      
    default:
      return state;
  }
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};