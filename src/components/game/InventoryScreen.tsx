import { ReactNode } from 'react';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft, Coins, FlaskConical, Package, Shield, ShieldCheck, Sword } from 'lucide-react';
import { ARMORS, SHIELDS, WEAPONS } from '@/data/items';
import { Equipment, LootItem, PlayerState } from '@/types/game';
import { toast } from '@/components/ui/sonner';

type InventoryItem = Equipment | LootItem;
type EquipmentType = Equipment['type'];

const InventoryScreen = () => {
  const { state, navigate, updatePlayer, totalAttack, totalDefense } = useGame();
  const { player } = state;

  const isEquipment = (item: InventoryItem): item is Equipment => 'type' in item && 'bonus' in item;

  const getStarterEquipment = (type: EquipmentType) => {
    if (type === 'weapon') return WEAPONS[0];
    if (type === 'armor') return ARMORS[0];
    return SHIELDS[0];
  };

  const getEquippedItem = (type: EquipmentType) => {
    if (type === 'weapon') return player.equippedWeapon;
    if (type === 'armor') return player.equippedArmor;
    return player.equippedShield;
  };

  const countOwnedByType = (type: EquipmentType) =>
    1 + player.inventory.filter(item => isEquipment(item) && item.type === type).length;

  const applyPlayerUpdate = (updates: Partial<PlayerState>) => updatePlayer(updates);

  const equipItem = (item: Equipment) => {
    const currentEquipped = getEquippedItem(item.type);
    const starter = getStarterEquipment(item.type);
    const remainingInventory = player.inventory.filter(entry => !(isEquipment(entry) && entry.id === item.id));
    const nextInventory =
      currentEquipped.id !== starter.id ? [...remainingInventory, currentEquipped] : remainingInventory;

    const updates: Partial<PlayerState> = { inventory: nextInventory };
    if (item.type === 'weapon') updates.equippedWeapon = item;
    if (item.type === 'armor') updates.equippedArmor = item;
    if (item.type === 'shield') updates.equippedShield = item;
    applyPlayerUpdate(updates);

    toast.success(`${item.name} equipado.`, {
      description: 'O item anterior foi para a mochila.',
    });
  };

  const unequipItem = (type: EquipmentType) => {
    const currentEquipped = getEquippedItem(type);
    const starter = getStarterEquipment(type);

    if (currentEquipped.id === starter.id) {
      toast.message('Nada para desequipar.', {
        description: 'O item basico ja esta ocupando este slot.',
      });
      return;
    }

    const updates: Partial<PlayerState> = {
      inventory: [...player.inventory, currentEquipped],
    };

    if (type === 'weapon') updates.equippedWeapon = starter;
    if (type === 'armor') updates.equippedArmor = starter;
    if (type === 'shield') updates.equippedShield = starter;

    applyPlayerUpdate(updates);

    toast.message(`${currentEquipped.name} foi para a mochila.`, {
      description: 'O slot voltou para o equipamento basico.',
    });
  };

  const sellInventoryItem = (item: InventoryItem) => {
    if (isEquipment(item) && countOwnedByType(item.type) <= 1) {
      const itemTypeLabel = item.type === 'weapon' ? 'arma' : item.type === 'armor' ? 'armadura' : 'escudo';
      toast.error(`Voce nao pode vender sua ultima ${itemTypeLabel}.`, {
        description: 'Mantenha pelo menos um item de cada tipo.',
      });
      return;
    }

    const sellPrice = isEquipment(item) ? Math.floor(item.price * 0.5) : item.sellPrice;
    const nextInventory = player.inventory.filter(entry => entry !== item);
    applyPlayerUpdate({
      gold: player.gold + sellPrice,
      inventory: nextInventory,
    });

    toast.success(`${item.name} vendido.`, {
      description: `Voce recebeu ${sellPrice} ouro.`,
    });
  };

  const inventoryEquipment = player.inventory.filter(isEquipment) as Equipment[];
  const lootItems = player.inventory.filter(item => !isEquipment(item)) as LootItem[];

  const equipmentGroups: { type: EquipmentType; title: string; icon: ReactNode; items: Equipment[]; helper: string }[] = [
    {
      type: 'weapon',
      title: 'ARMAS NA MOCHILA',
      icon: <Sword className="w-4 h-4 text-accent" />,
      items: inventoryEquipment.filter(item => item.type === 'weapon'),
      helper: 'Equipar substitui a arma atual e empurra a anterior para a mochila.',
    },
    {
      type: 'armor',
      title: 'ARMADURAS NA MOCHILA',
      icon: <ShieldCheck className="w-4 h-4 text-xp-blue" />,
      items: inventoryEquipment.filter(item => item.type === 'armor'),
      helper: 'Desequipar move a armadura atual para a mochila e volta ao item basico.',
    },
    {
      type: 'shield',
      title: 'ESCUDOS NA MOCHILA',
      icon: <Shield className="w-4 h-4 text-xp-blue" />,
      items: inventoryEquipment.filter(item => item.type === 'shield'),
      helper: 'Venda so fica disponivel quando ainda existir outro item do mesmo tipo.',
    },
  ];

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
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-pixel text-sm text-primary text-center">INVENTARIO</h2>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sword className="w-4 h-4 text-primary" />
                  <h3 className="font-pixel text-[10px] text-foreground tracking-widest">SLOTS EQUIPADOS</h3>
                </div>

                <div className="space-y-3">
                  <EquippedSlot
                    label="Arma"
                    statLabel={`+${player.equippedWeapon.bonus} ATK`}
                    item={player.equippedWeapon}
                    onUnequip={() => unequipItem('weapon')}
                    canUnequip={player.equippedWeapon.id !== WEAPONS[0].id}
                  />
                  <EquippedSlot
                    label="Armadura"
                    statLabel={`+${player.equippedArmor.bonus} DEF`}
                    item={player.equippedArmor}
                    onUnequip={() => unequipItem('armor')}
                    canUnequip={player.equippedArmor.id !== ARMORS[0].id}
                  />
                  <EquippedSlot
                    label="Escudo"
                    statLabel={`+${player.equippedShield.bonus} DEF`}
                    item={player.equippedShield}
                    onUnequip={() => unequipItem('shield')}
                    canUnequip={player.equippedShield.id !== SHIELDS[0].id}
                  />
                </div>
              </div>

              <div className="pixel-border bg-card/70 p-4 space-y-3">
                <p className="font-pixel text-[10px] text-primary">REGRAS RAPIDAS</p>
                <p className="font-retro text-sm text-muted-foreground">Desequipar manda o item para a mochila.</p>
                <p className="font-retro text-sm text-muted-foreground">Equipar troca o item atual e guarda o anterior.</p>
                <p className="font-retro text-sm text-muted-foreground">Venda so aparece com seguranca na mochila, nunca direto do slot equipado.</p>
                <p className="font-retro text-sm text-muted-foreground">O ultimo item de cada tipo nao pode ser vendido.</p>
                <p className="font-retro text-sm text-foreground">ATK {totalAttack} | DEF {totalDefense}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-hp-green" />
                  <h3 className="font-pixel text-[10px] text-foreground tracking-widest">CONSUMIVEIS</h3>
                </div>
                <div className="pixel-border bg-card p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-pixel text-[10px] text-foreground">Pocao de Vida</p>
                      <p className="font-retro text-sm text-muted-foreground">Uso em combate. Estoque atual: {player.potions}</p>
                    </div>
                    <span className="font-pixel text-xs text-hp-green">{player.potions}x</span>
                  </div>
                </div>
              </div>

              {equipmentGroups.map(group => (
                <div key={group.type}>
                  <div className="flex items-center gap-2 mb-2">
                    {group.icon}
                    <h3 className="font-pixel text-[10px] text-foreground tracking-widest">{group.title}</h3>
                  </div>

                  <p className="font-retro text-sm text-muted-foreground mb-2">{group.helper}</p>

                  {group.items.length > 0 ? (
                    <div className="space-y-2">
                      {group.items.map(item => (
                        <InventoryEquipmentCard
                          key={`${group.type}-${item.id}`}
                          item={item}
                          canSell={countOwnedByType(item.type) > 1}
                          onEquip={() => equipItem(item)}
                          onSell={() => sellInventoryItem(item)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyLine text="Nenhum item guardado neste slot." />
                  )}
                </div>
              ))}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-secondary" />
                  <h3 className="font-pixel text-[10px] text-foreground tracking-widest">TESOUROS VENDAVEIS</h3>
                </div>

                {lootItems.length > 0 ? (
                  <div className="space-y-2">
                    {lootItems.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 pixel-border bg-card">
                        <div className="min-w-0 pr-3">
                          <p className="font-pixel text-[10px] text-foreground">{item.name}</p>
                          <p className="font-retro text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <button
                          onClick={() => sellInventoryItem(item)}
                          className="px-2 py-1 pixel-border bg-card text-gold font-pixel text-[8px] hover:bg-muted transition-colors whitespace-nowrap"
                        >
                          {item.sellPrice} <Coins className="w-3 h-3 inline text-gold" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyLine text="Nenhum tesouro acumulado ainda." />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const EquippedSlot = ({
  label,
  item,
  statLabel,
  onUnequip,
  canUnequip,
}: {
  label: string;
  item: Equipment;
  statLabel: string;
  onUnequip: () => void;
  canUnequip: boolean;
}) => (
  <div className="p-3 pixel-border bg-card border-primary/30">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-contain pixelated" loading="lazy" />}
        <div className="min-w-0">
          <p className="font-pixel text-[8px] text-muted-foreground">{label}</p>
          <p className="font-pixel text-[10px] text-foreground">{item.name}</p>
          <p className="font-retro text-sm text-accent">{statLabel}</p>
        </div>
      </div>
      <button
        onClick={onUnequip}
        className="px-2 py-1 pixel-border bg-card text-primary font-pixel text-[8px] hover:bg-muted transition-colors"
      >
        {canUnequip ? 'DESEQUIPAR' : 'BASICO'}
      </button>
    </div>
  </div>
);

const InventoryEquipmentCard = ({
  item,
  onEquip,
  onSell,
  canSell,
}: {
  item: Equipment;
  onEquip: () => void;
  onSell: () => void;
  canSell: boolean;
}) => (
  <div className="flex items-center justify-between p-3 pixel-border bg-card">
    <div className="flex items-center gap-3 min-w-0">
      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-contain pixelated" loading="lazy" />}
      <div className="min-w-0">
        <p className="font-pixel text-[10px] text-foreground">{item.name}</p>
        <p className="font-retro text-sm text-muted-foreground">{item.description}</p>
        <p className="font-retro text-sm text-accent">+{item.bonus} {item.type === 'weapon' ? 'ATK' : 'DEF'}</p>
      </div>
    </div>

    <div className="flex gap-2">
      <button onClick={onEquip} className="px-2 py-1 pixel-border bg-card text-hp-green font-pixel text-[8px] hover:bg-muted transition-colors">
        EQUIPAR
      </button>
      <button
        onClick={onSell}
        className={`px-2 py-1 pixel-border bg-card font-pixel text-[8px] transition-colors ${
          canSell ? 'text-gold hover:bg-muted' : 'text-muted-foreground border-muted-foreground/30'
        }`}
      >
        {canSell ? `${Math.floor(item.price * 0.5)} ouro` : 'BLOQUEADO'}
      </button>
    </div>
  </div>
);

const EmptyLine = ({ text }: { text: string }) => (
  <div className="pixel-border bg-card/60 p-3">
    <p className="font-retro text-sm text-muted-foreground">{text}</p>
  </div>
);

export default InventoryScreen;
