import React from 'react';

const Instructions: React.FC = () => {
  return (
    <div className="w-full md:w-64 bg-gray-900 p-4 overflow-y-auto">
      <h2 className="text-xl text-yellow-400 mb-4">How to Play</h2>
      <ul className="space-y-2 text-sm">
        <li>→ Use Left/Right arrows to steer</li>
        <li>→ Up arrow to accelerate</li>
        <li>→ Down arrow to brake</li>
        <li>→ Overtake AI cars to score points</li>
        <li>→ Complete 200 cars to advance day</li>
        <li>→ Day/Night cycle changes each phase</li>
      </ul>
      
      <h3 className="text-lg text-yellow-400 mt-6 mb-2">Game Phases</h3>
      <ul className="space-y-2 text-sm">
        <li>☀️ Day - Clear visibility</li>
        <li>🌙 Night - Limited vision</li>
      </ul>
      
      <button
        onClick={() => window.location.reload()}
        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Restart Game
      </button>
    </div>
  );
};

export default Instructions;