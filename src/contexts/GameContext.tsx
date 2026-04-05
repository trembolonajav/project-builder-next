import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameState, GameScreen, PlayerState } from '@/types/game';
import { WEAPONS, ARMORS, SHIELDS } from '@/data/items';

const SAVE_KEY = 'iron-oath-save';

const createNewPlayer = (): PlayerState => ({
  name: 'Guerreiro',
  level: 1,
  xp: 0,
  xpToNext: 20,
  hp: 30,
  maxHp: 30,
  baseAttack: 6,
  baseDefense: 3,
  gold: 12,
  potions: 1,
  equippedWeapon: WEAPONS[0],
  equippedArmor: ARMORS[0],
  equippedShield: SHIELDS[0],
  inventory: [],
});

interface GameContextType {
  state: GameState;
  navigate: (screen: GameScreen) => void;
  newGame: () => void;
  continueGame: () => void;
  updatePlayer: (updates: Partial<PlayerState>) => void;
  saveGame: () => void;
  totalAttack: number;
  totalDefense: number;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => ({
    screen: 'title',
    player: createNewPlayer(),
    hasSave: !!localStorage.getItem(SAVE_KEY),
  }));

  const navigate = useCallback((screen: GameScreen) => {
    setState(prev => ({ ...prev, screen }));
  }, []);

  const newGame = useCallback(() => {
    const player = createNewPlayer();
    setState({ screen: 'village', player, hasSave: false });
    localStorage.setItem(SAVE_KEY, JSON.stringify(player));
  }, []);

  const continueGame = useCallback(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const player = JSON.parse(saved) as PlayerState;
      setState({ screen: 'village', player, hasSave: true });
    }
  }, []);

  const updatePlayer = useCallback((updates: Partial<PlayerState>) => {
    setState(prev => {
      const newPlayer = { ...prev.player, ...updates };
      return { ...prev, player: newPlayer };
    });
  }, []);

  const saveGame = useCallback(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.player));
    setState(prev => ({ ...prev, hasSave: true }));
  }, [state.player]);

  // Auto-save on player changes
  useEffect(() => {
    if (state.screen !== 'title') {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state.player));
    }
  }, [state.player, state.screen]);

  const totalAttack = state.player.baseAttack + state.player.equippedWeapon.bonus;
  const totalDefense = state.player.baseDefense + state.player.equippedArmor.bonus + state.player.equippedShield.bonus;

  return (
    <GameContext.Provider value={{ state, navigate, newGame, continueGame, updatePlayer, saveGame, totalAttack, totalDefense }}>
      {children}
    </GameContext.Provider>
  );
};
