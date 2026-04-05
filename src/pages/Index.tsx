import { GameProvider, useGame } from '@/contexts/GameContext';
import TitleScreen from '@/components/game/TitleScreen';
import VillageScreen from '@/components/game/VillageScreen';

const GameRouter = () => {
  const { state } = useGame();

  switch (state.screen) {
    case 'title':
      return <TitleScreen />;
    case 'village':
      return <VillageScreen />;
    case 'shop':
    case 'inventory':
    case 'region':
    case 'combat':
    case 'victory':
    case 'defeat':
      // Placeholder — voltam para a vila por enquanto
      return <VillageScreen />;
    default:
      return <TitleScreen />;
  }
};

const Index = () => (
  <GameProvider>
    <GameRouter />
  </GameProvider>
);

export default Index;
