import { Equipment } from '@/types/game';

export const WEAPONS: Equipment[] = [
  { id: 'w1', name: 'Espada Gasta', type: 'weapon', bonus: 2, price: 0, description: 'Uma lâmina enferrujada, mas ainda corta.' },
  { id: 'w2', name: 'Espada Curta de Ferro', type: 'weapon', bonus: 4, price: 22, description: 'Ferro simples, porém confiável.' },
  { id: 'w3', name: 'Espada do Guarda Velho', type: 'weapon', bonus: 7, price: 40, description: 'Pertenceu a um guarda veterano.' },
  { id: 'w4', name: 'Lâmina Reforçada', type: 'weapon', bonus: 10, price: 65, description: 'Aço temperado com cuidado artesanal.' },
];

export const ARMORS: Equipment[] = [
  { id: 'a1', name: 'Túnica Gasta', type: 'armor', bonus: 1, price: 0, description: 'Pano velho que mal protege.' },
  { id: 'a2', name: 'Gibão de Couro', type: 'armor', bonus: 3, price: 20, description: 'Couro curtido, flexível e resistente.' },
  { id: 'a3', name: 'Cota Reforçada', type: 'armor', bonus: 5, price: 38, description: 'Malha de ferro costurada com firmeza.' },
  { id: 'a4', name: 'Armadura do Vigia', type: 'armor', bonus: 8, price: 60, description: 'Placas pesadas de um antigo vigia.' },
];

export const SHIELDS: Equipment[] = [
  { id: 's1', name: 'Escudo Rachado', type: 'shield', bonus: 1, price: 0, description: 'Madeira lascada, quase inútil.' },
  { id: 's2', name: 'Escudo de Madeira Firme', type: 'shield', bonus: 2, price: 18, description: 'Madeira densa, aguenta alguns golpes.' },
  { id: 's3', name: 'Escudo Ferrado', type: 'shield', bonus: 4, price: 34, description: 'Reforçado com tiras de ferro.' },
  { id: 's4', name: 'Escudo do Portão', type: 'shield', bonus: 6, price: 55, description: 'Feito para defender o portão da vila.' },
];

export const POTION_PRICE = 8;
export const POTION_HEAL = 15;
