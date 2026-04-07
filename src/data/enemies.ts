import { Enemy, EnemyMechanicDef } from '@/types/game';
import ratoCeleiroImg from '@/assets/enemies/rato-celeiro.png';
import loboMagroImg from '@/assets/enemies/lobo-magro.png';
import salteadorImg from '@/assets/enemies/salteador.png';
import escudeiroCaidoImg from '@/assets/enemies/escudeiro-caido.png';
import loboAlfaImg from '@/assets/enemies/lobo-alfa.png';
import capitaoSalteadoresImg from '@/assets/enemies/capitao-salteadores.png';
import trollPonteImg from '@/assets/enemies/troll-ponte.png';

export interface EnemyData extends Enemy {
  image: string;
}

export const ENEMIES: EnemyData[] = [
  {
    id: 'e1', name: 'Rato do Celeiro', type: 'common',
    hp: 12, maxHp: 12, attack: 4, defense: 1,
    xpReward: 4, goldReward: [2, 5], fleeChance: 0.9,
    description: 'Um rato enorme e faminto. Nao e grande coisa, mas morde forte.',
    image: ratoCeleiroImg,
  },
  {
    id: 'e2', name: 'Lobo Magro', type: 'common',
    hp: 18, maxHp: 18, attack: 6, defense: 2,
    xpReward: 7, goldReward: [3, 7], fleeChance: 0.78,
    description: 'Faminto e desesperado. Mais perigoso do que parece.',
    image: loboMagroImg,
  },
  {
    id: 'e3', name: 'Salteador de Estrada', type: 'common',
    hp: 22, maxHp: 22, attack: 7, defense: 3,
    xpReward: 9, goldReward: [5, 9], fleeChance: 0.72,
    description: 'Um bandido que embosca viajantes na Estrada Velha.',
    image: salteadorImg,
  },
  {
    id: 'e4', name: 'Escudeiro Caido', type: 'common',
    hp: 28, maxHp: 28, attack: 8, defense: 5,
    xpReward: 11, goldReward: [6, 11], fleeChance: 0.68,
    description: 'Um escudeiro que nunca encontrou descanso. Ainda luta.',
    image: escudeiroCaidoImg,
  },
  {
    id: 'e5', name: 'Lobo Alfa', type: 'elite',
    hp: 42, maxHp: 42, attack: 11, defense: 5,
    xpReward: 20, goldReward: [11, 16], fleeChance: 0.35,
    description: 'O lider da matilha. Cicatrizes de batalha cobrem seu corpo.',
    image: loboAlfaImg,
    mechanic: {
      type: 'howl',
      name: 'Uivo da Matilha',
      description: 'O Lobo Alfa uiva e a matilha responde. Seu ataque aumenta por 2 turnos.',
      bonusAttack: 5,
      bonusTurns: 2,
    } as EnemyMechanicDef,
  },
  {
    id: 'e6', name: 'Capitao dos Salteadores', type: 'elite',
    hp: 44, maxHp: 44, attack: 11, defense: 7,
    xpReward: 22, goldReward: [14, 20], fleeChance: 0.3,
    description: 'Comanda os bandidos da regiao. Cruel e experiente.',
    image: capitaoSalteadoresImg,
    mechanic: {
      type: 'guard_stance',
      name: 'Postura de Saque',
      description: 'O Capitao assume postura defensiva. No proximo turno, contra-ataca com forca brutal.',
      counterMultiplier: 1.8,
    } as EnemyMechanicDef,
  },
  {
    id: 'e7', name: 'Troll da Ponte', type: 'boss',
    hp: 72, maxHp: 72, attack: 13, defense: 8,
    xpReward: 55, goldReward: [32, 42], fleeChance: 0,
    description: 'O senhor da ponte velha. Ninguem passa sem pagar... com sangue.',
    image: trollPonteImg,
    mechanic: {
      type: 'telegraphed_strike',
      name: 'Golpe Telegrafado',
      description: 'O Troll anuncia o golpe brutal e, ao sangrar de verdade, endurece o casco por 1 turno.',
      heavyDamageMultiplier: 2.8,
      hardenedThreshold: 0.5,
      hardenedTurns: 1,
      hardenedDamageMultiplier: 0.55,
    } as EnemyMechanicDef,
  },
];
