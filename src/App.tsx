import { useState } from 'react';
import { GameMenu } from './components/GameMenu';
import { GameScreen } from './components/GameScreen';
import { RunHistoryScreen } from './components/RunHistoryScreen';
import { UpgradeWikiScreen } from './components/UpgradeWikiScreen';
import { AchievementsScreen } from './components/AchievementsScreen';
import { getUpgradesHistory } from './upgrades/history';

type Screen = 'menu' | 'game' | 'history' | 'wiki' | 'achievements';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('casinoBoyal_highScore');
    return saved ? parseInt(saved, 10) : 1;
  });

  const handleGameStart = () => {
    setScreen('game');
  };

  const handleGameOver = (_round: number, score: number) => {
    setHighScore(score);
    setScreen('menu');
  };

  const handleOpenHistory = () => {
    setScreen('history');
  };

  const handleOpenWiki = () => {
    setScreen('wiki');
  };

  const handleOpenAchievements = () => {
    setScreen('achievements');
  };

  const handleBackToMenu = () => {
    setScreen('menu');
  };

  if (screen === 'game') {
    return <GameScreen onGameOver={handleGameOver} />;
  }

  if (screen === 'history') {
    return <RunHistoryScreen onBack={handleBackToMenu} />;
  }

  if (screen === 'wiki') {
    return <UpgradeWikiScreen onBack={handleBackToMenu} ownedUpgrades={getUpgradesHistory()} />;
  }

  if (screen === 'achievements') {
    return <AchievementsScreen onBack={handleBackToMenu} />;
  }

  return (
    <GameMenu
      highScore={highScore}
      onStart={handleGameStart}
      onOpenHistory={handleOpenHistory}
      onOpenWiki={handleOpenWiki}
      onOpenAchievements={handleOpenAchievements}
    />
  );
}

export default App;
