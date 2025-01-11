import React, { createContext, useReducer } from 'react';

interface GameState {
  playerPosition: { x: number; y: number };
  score: number;
  timeRemaining: number;
  aiCars: Array<{ x: number; y: number; speed: number }>;
  weather: 'clear' | 'fog' | 'snow' | 'night';
  isGameOver: boolean;
}

const initialState: GameState = {
  playerPosition: { x: 400, y: 500 },
  score: 0,
  timeRemaining: 120,
  aiCars: [],
  weather: 'clear',
  isGameOver: false,
};

type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'UPDATE_TIME' }
  | { type: 'UPDATE_SCORE' }
  | { type: 'UPDATE_WEATHER'; payload: GameState['weather'] }
  | { type: 'UPDATE_AI_CARS'; payload: GameState['aiCars'] }
  | { type: 'GAME_OVER' };

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MOVE_LEFT':
      return {
        ...state,
        playerPosition: {
          ...state.playerPosition,
          x: Math.max(200, state.playerPosition.x - 10),
        },
      };
    case 'MOVE_RIGHT':
      return {
        ...state,
        playerPosition: {
          ...state.playerPosition,
          x: Math.min(600, state.playerPosition.x + 10),
        },
      };
    case 'UPDATE_TIME':
      const newTime = state.timeRemaining - 1/60;
      return {
        ...state,
        timeRemaining: newTime,
        isGameOver: newTime <= 0,
      };
    case 'UPDATE_SCORE':
      return {
        ...state,
        score: state.score + 1,
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
    default:
      return state;
  }
};

export const GameContext = createContext<{
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  gameState: initialState,
  dispatch: () => null,
});

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};