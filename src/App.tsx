import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import Game from './components/Game';
import Instructions from './components/Instructions';
import { GameProvider } from './context/GameContext';

function App() {
  const [gameStarted, setGameStarted] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const toggleSound = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
      } else {
        audioRef.current.muted = true;
      }
      setIsMuted(!isMuted);
    }
  };

  React.useEffect(() => {
    // Create and configure audio element
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      // Only try to play if game has started
      if (gameStarted) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Audio playback prevented:", error);
          });
        }
      }
    }
  }, [gameStarted]);

  return (
    <GameProvider>
      <div className="min-h-screen bg-black text-white font-pixel">
        <audio
          ref={audioRef}
          src="https://assets.codepen.io/217233/pc9.mp3"
          loop
          preload="auto"
        />
        
        {!gameStarted ? (
          <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <h1 className="text-4xl md:text-6xl mb-8 text-center text-yellow-400 animate-pulse">
              RETRO ENDURO AI
            </h1>
            <div className="max-w-2xl text-center mb-8 text-green-400">
              <p>Race against AI-powered opponents in this classic remake!</p>
            </div>
            <button
              onClick={() => setGameStarted(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-xl transition-colors"
            >
              PLAY NOW
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-screen">
            <div className="flex-1 relative">
              <Game />
              <button
                onClick={toggleSound}
                className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>
            </div>
            <Instructions />
          </div>
        )}
      </div>
    </GameProvider>
  );
}

export default App;