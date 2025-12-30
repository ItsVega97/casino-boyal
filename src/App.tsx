import { useState } from 'react';
import { GameMenu } from './components/GameMenu';
import { GameScreen } from './components/GameScreen';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('casinoBoyal_highScore');
    return saved ? parseInt(saved, 10) : 1;
  });

  const handleGameStart = () => {
    setGameStarted(true);
  };

  const handleGameOver = (_round: number, score: number) => {
    setHighScore(score);
    setGameStarted(false);
  };

  return gameStarted ? (
    <GameScreen onGameOver={handleGameOver} />
  ) : (
    <GameMenu highScore={highScore} onStart={handleGameStart} />
  );
}

export default App;
