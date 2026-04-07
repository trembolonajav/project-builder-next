import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  CombatState,
  Enemy,
  GameScreen,
  GameState,
  LootItem,
  MechanicState,
  PlayerState,
  RegionProgress,
} from '@/types/game';
import { ARMORS, POTION_HEAL, SHIELDS, WEAPONS } from '@/data/items';
import { ENEMIES, EnemyData } from '@/data/enemies';
import { LOOT_TABLE } from '@/data/loot';

const SAVE_KEY = 'iron-oath-save';
const ALPHA_ID = 'e5';
const TROLL_ID = 'e7';
const CAPTAIN_ID = 'e6';
const CAMPAIGN_REWARDS: Record<string, { gold?: number; potions?: number; label: string }> = {
  [ALPHA_ID]: { gold: 8, label: 'A matilha deixa a rota mais segura.' },
  [CAPTAIN_ID]: { gold: 15, potions: 1, label: 'O saque do capitao vira preparo para a ponte.' },
  [TROLL_ID]: { gold: 25, label: 'A Estrada Velha foi fechada como campanha.' },
};

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

const createNewProgress = (): RegionProgress => ({
  clearedCommons: [],
  alphaDefeated: false,
  captainDefeated: false,
  trollDefeated: false,
  repeatVictories: {},
});

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcDamage(attack: number, defense: number): number {
  const base = Math.max(1, attack - defense);
  const variance = Math.max(1, Math.floor(base * 0.2));
  return base + randInt(-variance, variance);
}

interface SaveData {
  player: PlayerState;
  regionProgress: RegionProgress;
}

interface GameContextType {
  state: GameState;
  navigate: (screen: GameScreen) => void;
  newGame: () => void;
  continueGame: () => void;
  updatePlayer: (updates: Partial<PlayerState>) => void;
  saveGame: () => void;
  totalAttack: number;
  totalDefense: number;
  startCombat: (enemy?: EnemyData) => void;
  startEncounterIntro: (enemy: EnemyData) => void;
  combatAttack: () => void;
  combatDefend: () => void;
  combatHeavyAttack: () => void;
  combatPotion: () => void;
  combatFlee: () => void;
  claimVictory: () => void;
  acceptDefeat: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
};

const initMechanic = (enemy: Enemy): MechanicState | null => {
  if (!enemy.mechanic) return null;

  switch (enemy.mechanic.type) {
    case 'howl':
      return {
        type: 'howl',
        triggered: false,
        bonusTurnsLeft: 0,
        bonusAttack: enemy.mechanic.bonusAttack || 4,
      };
    case 'guard_stance':
      return {
        type: 'guard_stance',
        triggered: false,
        guardActive: false,
      };
    case 'telegraphed_strike':
      return {
        type: 'telegraphed_strike',
        triggered: false,
        isCharging: false,
        hardenedTriggered: false,
        hardenedTurnsLeft: 0,
        hardenedDamageMultiplier: enemy.mechanic.hardenedDamageMultiplier || 0.55,
      };
    default:
      return null;
  }
};

const isTrollHardened = (combat: CombatState) =>
  combat.mechanic?.type === 'telegraphed_strike' && (combat.mechanic.hardenedTurnsLeft || 0) > 0;

const applyPlayerDamageToEnemy = (combat: CombatState, rawDamage: number) => {
  if (!isTrollHardened(combat)) {
    return { damage: rawDamage, note: '' };
  }

  return {
    damage: Math.max(1, Math.floor(rawDamage * (combat.mechanic?.hardenedDamageMultiplier || 0.55))),
    note: ' O casco absorve parte do impacto.',
  };
};

const getRepeatRewardMultiplier = (enemyType: Enemy['type'], victories: number) => {
  if (victories <= 0) return 1;
  if (enemyType === 'elite') {
    return victories === 1 ? 0.45 : 0.2;
  }

  if (enemyType === 'common') {
    return victories === 1 ? 0.7 : 0.4;
  }

  return victories === 1 ? 0.3 : 0.1;
};

const getRepeatLootChance = (enemyType: Enemy['type'], victories: number) => {
  if (victories <= 0) return enemyType === 'common' ? 0.4 : enemyType === 'elite' ? 0.22 : 0.1;
  if (enemyType === 'elite') return victories === 1 ? 0.06 : 0.02;
  if (enemyType === 'common') return victories === 1 ? 0.22 : 0.12;
  return 0;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    let hasSave = false;

    if (saved) {
      try {
        JSON.parse(saved);
        hasSave = true;
      } catch {
        hasSave = false;
      }
    }

    return {
      screen: 'title',
      player: createNewPlayer(),
      hasSave,
      combat: null,
      regionProgress: createNewProgress(),
      pendingEnemy: null,
    };
  });

  const navigate = useCallback((screen: GameScreen) => {
    setState(prev => ({ ...prev, screen }));
  }, []);

  const newGame = useCallback(() => {
    const player = createNewPlayer();
    const regionProgress = createNewProgress();
    const freshState: GameState = {
      screen: 'village',
      player,
      hasSave: false,
      combat: null,
      regionProgress,
      pendingEnemy: null,
    };

    setState(freshState);
    localStorage.setItem(SAVE_KEY, JSON.stringify({ player, regionProgress }));
  }, []);

  const continueGame = useCallback(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return;

    try {
      const data = JSON.parse(saved) as SaveData;
      setState({
        screen: 'village',
        player: data.player,
        hasSave: true,
        combat: null,
        regionProgress: {
          ...createNewProgress(),
          ...(data.regionProgress || {}),
          repeatVictories: data.regionProgress?.repeatVictories || {},
        },
        pendingEnemy: null,
      });
    } catch {
      // ignore invalid save
    }
  }, []);

  const updatePlayer = useCallback((updates: Partial<PlayerState>) => {
    setState(prev => ({ ...prev, player: { ...prev.player, ...updates } }));
  }, []);

  const saveGame = useCallback(() => {
    const data: SaveData = { player: state.player, regionProgress: state.regionProgress };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    setState(prev => ({ ...prev, hasSave: true }));
  }, [state.player, state.regionProgress]);

  useEffect(() => {
    if (state.screen === 'title') return;
    const data: SaveData = { player: state.player, regionProgress: state.regionProgress };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }, [state.player, state.regionProgress, state.screen]);

  const totalAttack = state.player.baseAttack + state.player.equippedWeapon.bonus;
  const totalDefense = state.player.baseDefense + state.player.equippedArmor.bonus + state.player.equippedShield.bonus;

  const startEncounterIntro = useCallback((enemy: EnemyData) => {
    setState(prev => ({ ...prev, screen: 'encounter_intro', pendingEnemy: enemy }));
  }, []);

  const startCombat = useCallback((enemy?: EnemyData) => {
    const chosen = enemy || ENEMIES[0];
    const combat: CombatState = {
      enemy: { ...chosen },
      enemyHp: chosen.maxHp,
      isDefending: false,
      heavyAttackUses: 2,
      log: [`${chosen.name} aparece!`],
      goldEarned: 0,
      xpEarned: 0,
      lootEarned: null,
      bonusGoldEarned: 0,
      bonusPotionsEarned: 0,
      mechanic: initMechanic(chosen),
      turnCount: 0,
    };

    setState(prev => ({ ...prev, screen: 'combat', combat, pendingEnemy: null }));
  }, []);

  const processMechanicPreTurn = (combat: CombatState): CombatState => {
    if (!combat.mechanic) return combat;

    const mechanic = { ...combat.mechanic };
    const log = [...combat.log];
    const def = combat.enemy.mechanic;

    if (mechanic.type === 'howl' && !mechanic.triggered && combat.turnCount === 2) {
      mechanic.triggered = true;
      mechanic.bonusTurnsLeft = def?.bonusTurns || 2;
      log.push(`O ${combat.enemy.name} uiva. A matilha fecha o cerco, seu ataque sobe e fugir fica bem mais dificil!`);
    }

    if (mechanic.type === 'guard_stance' && !mechanic.triggered && combat.turnCount === 1) {
      mechanic.triggered = true;
      mechanic.guardActive = true;
      log.push(`${combat.enemy.name} entra em postura de saque. O proximo golpe vira punicao.`);
    }

    if (mechanic.type === 'telegraphed_strike' && combat.turnCount >= 2 && combat.turnCount % 3 === 2) {
      mechanic.isCharging = true;
      log.push(`${combat.enemy.name} ergue o tronco acima da cabeca. DEFENDA-SE!`);
    }

    if (
      mechanic.type === 'telegraphed_strike' &&
      !mechanic.hardenedTriggered &&
      combat.enemyHp <= Math.floor(combat.enemy.maxHp * (def?.hardenedThreshold || 0.5))
    ) {
      mechanic.hardenedTriggered = true;
      mechanic.hardenedTurnsLeft = def?.hardenedTurns || 2;
      log.push(`${combat.enemy.name} endurece o casco. Por alguns turnos, seus golpes rendem menos.`);
    }

    return { ...combat, mechanic, log };
  };

  const getEffectiveEnemyAttack = (combat: CombatState) => {
    let attack = combat.enemy.attack;
    const mechanic = combat.mechanic;

    if (!mechanic) return attack;

    if (mechanic.type === 'howl' && (mechanic.bonusTurnsLeft || 0) > 0) {
      attack += mechanic.bonusAttack || 4;
    }

    if (mechanic.type === 'guard_stance' && mechanic.guardActive) {
      attack = Math.floor(attack * (combat.enemy.mechanic?.counterMultiplier || 1.8));
    }

    if (mechanic.type === 'telegraphed_strike' && mechanic.isCharging) {
      attack = Math.floor(attack * (combat.enemy.mechanic?.heavyDamageMultiplier || 2.5));
    }

    return attack;
  };

  const processMechanicPostTurn = (mechanic: MechanicState): MechanicState => {
    const next = { ...mechanic };

    if (next.type === 'howl' && (next.bonusTurnsLeft || 0) > 0) {
      next.bonusTurnsLeft = (next.bonusTurnsLeft || 0) - 1;
    }

    if (next.type === 'guard_stance' && next.guardActive) {
      next.guardActive = false;
    }

    if (next.type === 'telegraphed_strike' && next.isCharging) {
      next.isCharging = false;
    }

    if (next.type === 'telegraphed_strike' && (next.hardenedTurnsLeft || 0) > 0) {
      next.hardenedTurnsLeft = (next.hardenedTurnsLeft || 0) - 1;
    }

    return next;
  };

  const doEnemyTurn = (prev: GameState, playerAttack: number, playerDefense: number): GameState => {
    if (!prev.combat || prev.combat.enemyHp <= 0) return prev;

    const combat = processMechanicPreTurn(prev.combat);
    const effectiveAttack = getEffectiveEnemyAttack(combat);
    const damage = calcDamage(effectiveAttack, playerDefense);
    const heavyHit = combat.mechanic?.type === 'telegraphed_strike' && combat.mechanic.isCharging;
    const defendMultiplier = heavyHit ? 0.2 : 0.45;
    const reducedDamage = combat.isDefending ? Math.max(1, Math.floor(damage * defendMultiplier)) : damage;
    const nextHp = Math.max(0, prev.player.hp - reducedDamage);
    const hitSuffix = heavyHit ? ' O golpe explode com violencia brutal.' : '';
    const blockSuffix = combat.isDefending ? ' Voce amortece parte do impacto.' : '';
    const log = [...combat.log, `${combat.enemy.name} ataca e causa ${reducedDamage} de dano.${blockSuffix}${hitSuffix}`];
    const mechanic = combat.mechanic ? processMechanicPostTurn(combat.mechanic) : null;

    if (nextHp <= 0) {
      const goldLost = Math.floor(prev.player.gold * 0.15);
      return {
        ...prev,
        screen: 'defeat',
        player: { ...prev.player, hp: 0 },
        combat: {
          ...combat,
          log: [...log, 'Voce foi derrotado...'],
          isDefending: false,
          goldEarned: goldLost,
          mechanic,
          turnCount: combat.turnCount + 1,
        },
      };
    }

    return {
      ...prev,
      player: { ...prev.player, hp: nextHp },
      combat: {
        ...combat,
        log,
        isDefending: false,
        mechanic,
        turnCount: combat.turnCount + 1,
      },
    };
  };

  const doCheckVictory = (prev: GameState): GameState => {
    if (!prev.combat || prev.combat.enemyHp > 0) return prev;

    const combat = prev.combat;
    const repeatVictories = prev.regionProgress.repeatVictories[combat.enemy.id] || 0;
    const repeatMultiplier = getRepeatRewardMultiplier(combat.enemy.type, repeatVictories);
    const rolledGold = randInt(combat.enemy.goldReward[0], combat.enemy.goldReward[1]);
    const goldEarned = Math.max(1, Math.floor(rolledGold * repeatMultiplier));
    const xpEarned = Math.max(1, Math.floor(combat.enemy.xpReward * repeatMultiplier));
    const isFirstAlphaKill = combat.enemy.id === ALPHA_ID && !prev.regionProgress.alphaDefeated;
    const isFirstCaptainKill = combat.enemy.id === CAPTAIN_ID && !prev.regionProgress.captainDefeated;
    const isFirstTrollKill = combat.enemy.id === TROLL_ID && !prev.regionProgress.trollDefeated;
    const campaignReward =
      (isFirstAlphaKill || isFirstCaptainKill || isFirstTrollKill) ? CAMPAIGN_REWARDS[combat.enemy.id] : undefined;
    const lootChance = getRepeatLootChance(combat.enemy.type, repeatVictories);
    const lootEarned: LootItem | null =
      Math.random() < lootChance ? LOOT_TABLE[randInt(0, LOOT_TABLE.length - 1)] : null;
    const victoryMessage = repeatVictories > 0
      ? combat.enemy.type === 'elite'
        ? `${combat.enemy.name} foi derrotado, mas elites repetidas rendem bem menos.`
        : `${combat.enemy.name} foi derrotado, mas a recompensa caiu por repeticao.`
      : `${combat.enemy.name} foi derrotado!`;
    const bonusMessage = campaignReward
      ? `${campaignReward.label}${campaignReward.gold ? ` +${campaignReward.gold} ouro.` : ''}${campaignReward.potions ? ` +${campaignReward.potions} pocao.` : ''}`
      : null;

    return {
      ...prev,
      screen: 'victory',
      combat: {
        ...combat,
        goldEarned,
        xpEarned,
        lootEarned,
        bonusGoldEarned: campaignReward?.gold || 0,
        bonusPotionsEarned: campaignReward?.potions || 0,
        log: [
          ...combat.log,
          victoryMessage,
          ...(bonusMessage ? [bonusMessage] : []),
        ],
      },
    };
  };

  const combatAttack = useCallback(() => {
    setState(prev => {
      if (!prev.combat) return prev;

      const playerAttack = prev.player.baseAttack + prev.player.equippedWeapon.bonus;
      const playerDefense = prev.player.baseDefense + prev.player.equippedArmor.bonus + prev.player.equippedShield.bonus;
      const rawDamage = calcDamage(playerAttack, prev.combat.enemy.defense);
      const result = applyPlayerDamageToEnemy(prev.combat, rawDamage);
      const enemyHp = Math.max(0, prev.combat.enemyHp - result.damage);
      const log = [...prev.combat.log, `Voce ataca e causa ${result.damage} de dano.${result.note}`];

      let next: GameState = {
        ...prev,
        combat: { ...prev.combat, enemyHp, log, isDefending: false },
      };

      next = doCheckVictory(next);
      if (next.screen !== 'victory') next = doEnemyTurn(next, playerAttack, playerDefense);
      return next;
    });
  }, []);

  const combatDefend = useCallback(() => {
    setState(prev => {
      if (!prev.combat) return prev;

      const playerAttack = prev.player.baseAttack + prev.player.equippedWeapon.bonus;
      const playerDefense = prev.player.baseDefense + prev.player.equippedArmor.bonus + prev.player.equippedShield.bonus;
      const log = [...prev.combat.log, 'Voce se defende e espera o proximo movimento.'];

      return doEnemyTurn(
        {
          ...prev,
          combat: { ...prev.combat, log, isDefending: true },
        },
        playerAttack,
        playerDefense,
      );
    });
  }, []);

  const combatHeavyAttack = useCallback(() => {
    setState(prev => {
      if (!prev.combat || prev.combat.heavyAttackUses <= 0) return prev;

      const playerAttack = prev.player.baseAttack + prev.player.equippedWeapon.bonus;
      const playerDefense = prev.player.baseDefense + prev.player.equippedArmor.bonus + prev.player.equippedShield.bonus;
      const rawDamage = calcDamage(Math.floor(playerAttack * 1.6), prev.combat.enemy.defense);
      const result = applyPlayerDamageToEnemy(prev.combat, rawDamage);
      const enemyHp = Math.max(0, prev.combat.enemyHp - result.damage);
      const log = [...prev.combat.log, `Golpe Pesado! Voce causa ${result.damage} de dano!${result.note}`];

      let next: GameState = {
        ...prev,
        combat: {
          ...prev.combat,
          enemyHp,
          log,
          isDefending: false,
          heavyAttackUses: prev.combat.heavyAttackUses - 1,
        },
      };

      next = doCheckVictory(next);
      if (next.screen !== 'victory') next = doEnemyTurn(next, playerAttack, playerDefense);
      return next;
    });
  }, []);

  const combatPotion = useCallback(() => {
    setState(prev => {
      if (!prev.combat || prev.player.potions <= 0) return prev;

      const playerAttack = prev.player.baseAttack + prev.player.equippedWeapon.bonus;
      const playerDefense = prev.player.baseDefense + prev.player.equippedArmor.bonus + prev.player.equippedShield.bonus;
      const healed = Math.min(POTION_HEAL, prev.player.maxHp - prev.player.hp);
      const nextHp = prev.player.hp + healed;
      const log = [...prev.combat.log, `Voce usa uma Pocao de Vida e recupera ${healed} HP.`];

      return doEnemyTurn(
        {
          ...prev,
          player: { ...prev.player, hp: nextHp, potions: prev.player.potions - 1 },
          combat: { ...prev.combat, log, isDefending: false },
        },
        playerAttack,
        playerDefense,
      );
    });
  }, []);

  const combatFlee = useCallback(() => {
    setState(prev => {
      if (!prev.combat) return prev;
      if (prev.combat.enemy.type === 'boss') return prev;

      let fleeChance = prev.combat.enemy.fleeChance;
      if (prev.combat.mechanic?.type === 'howl' && (prev.combat.mechanic.bonusTurnsLeft || 0) > 0) {
        fleeChance *= 0.25;
      }

      if (Math.random() < fleeChance) {
        return { ...prev, screen: 'region', combat: null };
      }

      const playerAttack = prev.player.baseAttack + prev.player.equippedWeapon.bonus;
      const playerDefense = prev.player.baseDefense + prev.player.equippedArmor.bonus + prev.player.equippedShield.bonus;
      const log = [...prev.combat.log, 'Voce tenta fugir, mas falha!'];

      return doEnemyTurn(
        {
          ...prev,
          combat: { ...prev.combat, log, isDefending: false },
        },
        playerAttack,
        playerDefense,
      );
    });
  }, []);

  const levelUp = (player: PlayerState): PlayerState => {
    let nextPlayer = { ...player };

    while (nextPlayer.xp >= nextPlayer.xpToNext) {
      nextPlayer.xp -= nextPlayer.xpToNext;
      nextPlayer.level += 1;
      nextPlayer.maxHp += 4;
      nextPlayer.hp = nextPlayer.maxHp;
      nextPlayer.baseAttack += 1;
      nextPlayer.baseDefense += 1;
      nextPlayer.xpToNext = Math.floor(nextPlayer.xpToNext * 1.4);
    }

    return nextPlayer;
  };

  const claimVictory = useCallback(() => {
    setState(prev => {
      if (!prev.combat) return prev;

      const enemyId = prev.combat.enemy.id;
      let player: PlayerState = {
        ...prev.player,
        gold: prev.player.gold + prev.combat.goldEarned + prev.combat.bonusGoldEarned,
        xp: prev.player.xp + prev.combat.xpEarned,
        potions: prev.player.potions + prev.combat.bonusPotionsEarned,
        inventory: prev.combat.lootEarned
          ? [...prev.player.inventory, prev.combat.lootEarned]
          : prev.player.inventory,
      };

      player = levelUp(player);

      const regionProgress: RegionProgress = { ...prev.regionProgress };
      regionProgress.repeatVictories = {
        ...regionProgress.repeatVictories,
        [enemyId]: (regionProgress.repeatVictories[enemyId] || 0) + 1,
      };

      if (prev.combat.enemy.type === 'common' && !regionProgress.clearedCommons.includes(enemyId)) {
        regionProgress.clearedCommons = [...regionProgress.clearedCommons, enemyId];
      }
      if (enemyId === ALPHA_ID) regionProgress.alphaDefeated = true;
      if (enemyId === CAPTAIN_ID) regionProgress.captainDefeated = true;
      if (enemyId === TROLL_ID) regionProgress.trollDefeated = true;

      return {
        ...prev,
        screen: 'region',
        player,
        combat: null,
        regionProgress,
      };
    });
  }, []);

  const acceptDefeat = useCallback(() => {
    setState(prev => {
      if (!prev.combat) return prev;

      return {
        ...prev,
        screen: 'village',
        player: {
          ...prev.player,
          hp: prev.player.maxHp,
          gold: Math.max(0, prev.player.gold - prev.combat.goldEarned),
        },
        combat: null,
      };
    });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        navigate,
        newGame,
        continueGame,
        updatePlayer,
        saveGame,
        totalAttack,
        totalDefense,
        startCombat,
        startEncounterIntro,
        combatAttack,
        combatDefend,
        combatHeavyAttack,
        combatPotion,
        combatFlee,
        claimVictory,
        acceptDefeat,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
