import { useGame } from '@/contexts/GameContext';
import { ArrowLeft, Coins, Heart, Shield, ShieldCheck, Sword } from 'lucide-react';
import { ARMORS, POTION_HEAL, POTION_IMAGE, POTION_PRICE, SHIELDS, WEAPONS } from '@/data/items';
import { Equipment, LootItem } from '@/types/game';

const ShopScreen = () => {
  const { state, navigate, updatePlayer, totalAttack, totalDefense } = useGame();
  const { player } = state;

  const isOwned = (item: Equipment) => {
    const equipped =
      item.type === 'weapon'
        ? player.equippedWeapon.id === item.id
        : item.type === 'armor'
          ? player.equippedArmor.id === item.id
          : player.equippedShield.id === item.id;

    const inInventory = player.inventory.some(entry => 'type' in entry && entry.id === item.id);
    return equipped || inInventory;
  };

  const buyEquipment = (item: Equipment) => {
    if (player.gold < item.price || isOwned(item)) return;

    updatePlayer({
      gold: player.gold - item.price,
      inventory: [...player.inventory, item],
    });
  };

  const buyPotion = () => {
    if (player.gold < POTION_PRICE) return;
    updatePlayer({ gold: player.gold - POTION_PRICE, potions: player.potions + 1 });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden animate-slide-up">
      <div className="absolute inset-0 retro-scanline pointer-events-none z-10" />

      <header className="p-4 border-b-2 border-primary/30 bg-card/80 flex items-center justify-between">
        <button onClick={() => navigate('village')} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-pixel text-[10px]">VOLTAR</span>
        </button>
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-gold" />
          <span className="font-retro text-lg text-gold">{player.gold}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 z-20">
        <div className="max-w-lg mx-auto space-y-6">
          <h2 className="font-pixel text-sm text-primary text-center mb-4">MERCADOR</h2>

          <ShopSection title="ARMAS" icon={<Sword className="w-4 h-4 text-accent" />}>
            {WEAPONS.filter(item => item.price > 0).map(item => (
              <ShopItem
                key={item.id}
                item={item}
                owned={isOwned(item)}
                canAfford={player.gold >= item.price}
                onBuy={() => buyEquipment(item)}
                statLabel={`+${item.bonus} ATK`}
              />
            ))}
          </ShopSection>

          <ShopSection title="ARMADURAS" icon={<ShieldCheck className="w-4 h-4 text-xp-blue" />}>
            {ARMORS.filter(item => item.price > 0).map(item => (
              <ShopItem
                key={item.id}
                item={item}
                owned={isOwned(item)}
                canAfford={player.gold >= item.price}
                onBuy={() => buyEquipment(item)}
                statLabel={`+${item.bonus} DEF`}
              />
            ))}
          </ShopSection>

          <ShopSection title="ESCUDOS" icon={<Shield className="w-4 h-4 text-xp-blue" />}>
            {SHIELDS.filter(item => item.price > 0).map(item => (
              <ShopItem
                key={item.id}
                item={item}
                owned={isOwned(item)}
                canAfford={player.gold >= item.price}
                onBuy={() => buyEquipment(item)}
                statLabel={`+${item.bonus} DEF`}
              />
            ))}
          </ShopSection>

          <ShopSection title="CONSUMIVEIS" icon={<Heart className="w-4 h-4 text-hp-green" />}>
            <div className="flex items-center justify-between p-3 pixel-border bg-card">
              <div className="flex items-center gap-3 flex-1">
                <img src={POTION_IMAGE} alt="Pocao de Vida" className="w-10 h-10 object-contain pixelated" loading="lazy" />
                <div>
                  <span className="font-pixel text-[10px] text-foreground block">Pocao de Vida</span>
                  <span className="font-retro text-sm text-muted-foreground">Recupera {POTION_HEAL} HP</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-retro text-sm text-muted-foreground">Tem: {player.potions}</span>
                <button
                  onClick={buyPotion}
                  disabled={player.gold < POTION_PRICE}
                  className="px-3 py-1 pixel-border bg-card text-hp-green font-pixel text-[8px] hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {POTION_PRICE} <Coins className="w-3 h-3 inline text-gold" />
                </button>
              </div>
            </div>
          </ShopSection>

          <div className="pixel-border bg-card/70 p-3 text-center">
            <p className="font-retro text-sm text-muted-foreground">
              Equipamentos comprados vao para o inventario. Voce decide depois o que equipar ou vender.
            </p>
            <p className="font-retro text-sm text-muted-foreground mt-2">
              ATK {totalAttack} | DEF {totalDefense}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

const ShopSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h3 className="font-pixel text-[10px] text-foreground tracking-widest">{title}</h3>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const ShopItem = ({
  item,
  owned,
  canAfford,
  onBuy,
  statLabel,
}: {
  item: Equipment;
  owned: boolean;
  canAfford: boolean;
  onBuy: () => void;
  statLabel: string;
}) => (
  <div className={`flex items-center justify-between p-3 pixel-border bg-card ${owned ? 'border-hp-green/40' : ''}`}>
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-contain pixelated" loading="lazy" />}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[10px] text-foreground">{item.name}</span>
          {owned && <span className="font-pixel text-[8px] text-hp-green">JA TEM</span>}
        </div>
        <span className="font-retro text-sm text-muted-foreground block truncate">{item.description}</span>
        <span className="font-retro text-sm text-accent">{statLabel}</span>
      </div>
    </div>

    <button
      onClick={onBuy}
      disabled={owned || !canAfford}
      className="ml-3 px-3 py-1 pixel-border bg-card text-primary font-pixel text-[8px] hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {owned ? 'COMPRADO' : <>{item.price} <Coins className="w-3 h-3 inline text-gold" /></>}
    </button>
  </div>
);

export default ShopScreen;
