import { RoadNode } from '@/types/game';

export interface WorldRegion {
  id: string;
  name: string;
  description: string;
  locked: boolean;
  lockMessage: string;
  nodes: RoadNode[];
  x: number;
  y: number;
}

export const ROAD_NODES: RoadNode[] = [
  {
    id: 'n1',
    name: 'Saida da Vila',
    description: 'Algo se move entre restos de carga apodrecida.',
    enemyId: 'e1',
    type: 'common',
    unlockCondition: 'start',
    x: 12,
    y: 76,
  },
  {
    id: 'n2',
    name: 'Trilha Gasta',
    description: 'Olhos famintos surgem na trilha estreita.',
    enemyId: 'e2',
    type: 'common',
    unlockCondition: 'start',
    x: 28,
    y: 58,
  },
  {
    id: 'n3',
    name: 'Posto Abandonado',
    description: 'Uma voz rouca corta o caminho: "Deixe as moedas e siga vivo."',
    enemyId: 'e3',
    type: 'common',
    unlockCondition: 'start',
    x: 47,
    y: 70,
  },
  {
    id: 'n4',
    name: 'Ruinas da Guarda',
    description: 'Armadura enferrujada. Passos lentos. A guarda jamais terminou.',
    enemyId: 'e4',
    type: 'common',
    unlockCondition: 'start',
    x: 60,
    y: 48,
  },
  {
    id: 'n5',
    name: 'Clareira da Matilha',
    description: 'A mata silencia. A matilha espera o comando do maior.',
    enemyId: 'e5',
    type: 'elite',
    unlockCondition: 'clear_commons',
    x: 74,
    y: 30,
  },
  {
    id: 'n6',
    name: 'Acampamento dos Salteadores',
    description: 'Ele nao ameaca. So saca a lamina e avanca.',
    enemyId: 'e6',
    type: 'elite',
    unlockCondition: 'defeat_alpha',
    x: 82,
    y: 56,
  },
  {
    id: 'n7',
    name: 'Ponte Velha',
    description: 'A ponte velha estremece. Algo enorme se ergue do outro lado.',
    enemyId: 'e7',
    type: 'boss',
    unlockCondition: 'defeat_captain',
    x: 92,
    y: 18,
  },
];

export const WORLD_REGIONS: WorldRegion[] = [
  {
    id: 'estrada_velha',
    name: 'Estrada Velha',
    description: 'Uma rota antiga infestada por criaturas e bandidos.',
    locked: false,
    lockMessage: '',
    nodes: ROAD_NODES,
    x: 20,
    y: 72,
  },
  {
    id: 'montanhas_cinzentas',
    name: 'Montanhas Cinzentas',
    description: 'Picos gelados onde ecoam rugidos distantes.',
    locked: true,
    lockMessage: 'Conclua a Estrada Velha',
    nodes: [],
    x: 48,
    y: 22,
  },
  {
    id: 'pantano_sinos',
    name: 'Pantano dos Sinos',
    description: 'Nevoa perpetua e sons que nao deveriam existir.',
    locked: true,
    lockMessage: 'Conclua a Estrada Velha',
    nodes: [],
    x: 42,
    y: 78,
  },
  {
    id: 'ruinas_ferro',
    name: 'Ruinas de Ferro',
    description: 'Fortalezas esquecidas guardam segredos terriveis.',
    locked: true,
    lockMessage: 'Conclua a Estrada Velha',
    nodes: [],
    x: 74,
    y: 38,
  },
  {
    id: 'costa_partida',
    name: 'Costa Partida',
    description: 'Falesias partidas e naufragios assombrados.',
    locked: true,
    lockMessage: 'Conclua a Estrada Velha',
    nodes: [],
    x: 82,
    y: 76,
  },
];
