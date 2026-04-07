import { useMemo, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { ENEMIES } from '@/data/enemies';
import { ROAD_NODES } from '@/data/regions';
import { ChevronLeft, Crown, Flag, Home, Lock, Skull, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

type NodeVisualState = 'blocked' | 'current' | 'cleared' | 'available';

const RegionScreen = () => {
  const { navigate, startEncounterIntro, state } = useGame();
  const { regionProgress } = state;

  const allCommonsCleared = ['e1', 'e2', 'e3', 'e4'].every(id => regionProgress.clearedCommons.includes(id));

  const isNodeUnlocked = (node: typeof ROAD_NODES[number]) => {
    switch (node.unlockCondition) {
      case 'start':
        return true;
      case 'clear_commons':
        return allCommonsCleared;
      case 'defeat_alpha':
        return regionProgress.alphaDefeated;
      case 'defeat_captain':
        return regionProgress.captainDefeated;
      default:
        return false;
    }
  };

  const isNodeCleared = (node: typeof ROAD_NODES[number]) => {
    if (node.type === 'common') return regionProgress.clearedCommons.includes(node.enemyId);
    if (node.enemyId === 'e5') return regionProgress.alphaDefeated;
    if (node.enemyId === 'e6') return regionProgress.captainDefeated;
    if (node.enemyId === 'e7') return regionProgress.trollDefeated;
    return false;
  };

  const getUnlockMessage = (node: typeof ROAD_NODES[number]) => {
    switch (node.unlockCondition) {
      case 'clear_commons':
        return 'Derrote todos os inimigos comuns';
      case 'defeat_alpha':
        return 'Derrote o Lobo Alfa';
      case 'defeat_captain':
        return 'Derrote o Capitao';
      default:
        return '';
    }
  };

  const getVisualState = (node: typeof ROAD_NODES[number], currentNodeId: string): NodeVisualState => {
    if (!isNodeUnlocked(node)) return 'blocked';
    if (isNodeCleared(node)) return 'cleared';
    if (node.id === currentNodeId) return 'current';
    return 'available';
  };

  const clearedNodeCount =
    regionProgress.clearedCommons.length +
    (regionProgress.alphaDefeated ? 1 : 0) +
    (regionProgress.captainDefeated ? 1 : 0) +
    (regionProgress.trollDefeated ? 1 : 0);

  const currentNode =
    ROAD_NODES.find(node => isNodeUnlocked(node) && !isNodeCleared(node)) ||
    ROAD_NODES[ROAD_NODES.length - 1];

  const [selectedNodeId, setSelectedNodeId] = useState(currentNode.id);

  const selectedNode = useMemo(
    () => ROAD_NODES.find(node => node.id === selectedNodeId) || currentNode,
    [selectedNodeId, currentNode],
  );

  const selectedEnemy = ENEMIES.find(enemy => enemy.id === selectedNode.enemyId)!;
  const selectedUnlocked = isNodeUnlocked(selectedNode);
  const selectedCleared = isNodeCleared(selectedNode);
  const selectedVisualState = getVisualState(selectedNode, currentNode.id);

  const actionLabel = !selectedUnlocked
    ? 'TRILHA BLOQUEADA'
    : selectedCleared
      ? 'REENFRENTAR'
      : selectedNode.id === currentNode.id
        ? 'AVANCAR'
        : 'SEGUIR TRILHA';

  const statusLabel = selectedVisualState === 'blocked'
    ? 'Bloqueado'
    : selectedVisualState === 'cleared'
      ? 'Superado'
      : selectedVisualState === 'current'
        ? 'Atual'
        : 'Disponivel';

  const handleNodeAction = () => {
    if (!selectedUnlocked) {
      toast.error('Trecho bloqueado.', {
        description: getUnlockMessage(selectedNode),
      });
      return;
    }

    startEncounterIntro(selectedEnemy);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 retro-scanline pointer-events-none z-10" />

      <header className="p-4 border-b-2 border-primary/30 bg-card/80">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('adventure_map')} className="text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-pixel text-sm text-primary">ESTRADA VELHA</h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('village')}
            className="flex items-center gap-2 px-3 py-2 pixel-border bg-card text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="font-pixel text-[10px]">VILA</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 z-20 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 gap-4">
            <p className="font-retro text-base md:text-lg text-muted-foreground max-w-2xl">
              A trilha agora tenta parecer jornada: o proximo passo pulsa, a estrada respira e elites e boss tem presenca propria.
            </p>
            <div className="min-w-[170px]">
              <div className="flex items-center justify-between font-retro text-sm text-muted-foreground">
                <span>Progresso</span>
                <span>{clearedNodeCount}/{ROAD_NODES.length} nos</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-sm mt-1 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(clearedNodeCount / ROAD_NODES.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] items-start">
            <div className="pixel-border bg-card/80 p-4 md:p-6">
              <div className="relative min-h-[560px] rounded-sm border border-primary/15 bg-[radial-gradient(circle_at_top,_rgba(255,193,7,0.08),_transparent_35%),linear-gradient(180deg,rgba(18,21,31,0.96),rgba(10,12,18,0.98))] overflow-hidden">
                <div className="absolute inset-x-4 top-6 h-16 bg-[radial-gradient(circle,_rgba(255,193,7,0.08),_transparent_60%)] blur-2xl" />

                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-90" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {ROAD_NODES.slice(0, -1).map((node, index) => {
                    const nextNode = ROAD_NODES[index + 1];
                    const nextUnlocked = isNodeUnlocked(nextNode);
                    const nextCleared = isNodeCleared(nextNode);

                    return (
                      <line
                        key={`${node.id}-${nextNode.id}`}
                        x1={node.x}
                        y1={node.y}
                        x2={nextNode.x}
                        y2={nextNode.y}
                        stroke={nextCleared ? 'hsl(var(--hp-green) / 0.8)' : nextUnlocked ? 'hsl(var(--primary) / 0.78)' : 'hsl(var(--muted-foreground) / 0.32)'}
                        strokeWidth="0.9"
                        strokeDasharray="1.2 1.6"
                      >
                        {nextUnlocked && !nextCleared && (
                          <animate
                            attributeName="stroke-dashoffset"
                            from="10"
                            to="0"
                            dur="1.4s"
                            repeatCount="indefinite"
                          />
                        )}
                      </line>
                    );
                  })}
                </svg>

                {ROAD_NODES.map((node, index) => {
                  const enemy = ENEMIES.find(entry => entry.id === node.enemyId)!;
                  const visualState = getVisualState(node, currentNode.id);
                  const selected = node.id === selectedNode.id;
                  const isElite = node.type === 'elite';
                  const isBoss = node.type === 'boss';
                  const isCurrent = visualState === 'current';
                  const isAvailable = visualState === 'available';

                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 text-left transition-transform ${selected ? 'scale-105' : 'hover:scale-105'}`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <div className="relative">
                        {(isCurrent || (isAvailable && !isElite && !isBoss)) && (
                          <div className={`absolute inset-0 rounded-full ${isCurrent ? 'animate-ping bg-primary/20' : 'animate-pulse bg-accent/10'}`} />
                        )}
                        {isElite && visualState !== 'blocked' && (
                          <div className="absolute -inset-2 rounded-full border border-accent/40 animate-pulse" />
                        )}
                        {isBoss && visualState !== 'blocked' && (
                          <>
                            <div className="absolute -inset-3 rounded-full border-2 border-gold/45 animate-pulse-gold" />
                            <div className="absolute -inset-5 rounded-full bg-gold/10 blur-xl" />
                          </>
                        )}

                        <div
                          className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 bg-background/95 backdrop-blur-sm flex items-center justify-center
                          ${visualState === 'cleared' ? 'border-hp-green shadow-[0_0_25px_rgba(34,197,94,0.18)]' : ''}
                          ${visualState === 'current' ? 'border-primary shadow-[0_0_28px_rgba(255,193,7,0.24)]' : ''}
                          ${visualState === 'available' ? 'border-accent shadow-[0_0_20px_rgba(251,146,60,0.18)]' : ''}
                          ${visualState === 'blocked' ? 'border-muted-foreground/35' : ''}
                          ${isElite ? 'ring-1 ring-accent/40' : ''}
                          ${isBoss ? 'ring-2 ring-gold/45' : ''}
                          ${selected ? 'ring-2 ring-primary/45' : ''}`}
                        >
                          {visualState === 'blocked' ? (
                            <Lock className="w-6 h-6 text-muted-foreground" />
                          ) : (
                            <img
                              src={enemy.image}
                              alt={enemy.name}
                              className={`w-10 h-10 md:w-12 md:h-12 object-contain ${visualState === 'cleared' ? 'opacity-55' : ''} ${isBoss ? 'animate-flicker' : ''}`}
                            />
                          )}

                          {isElite && visualState !== 'blocked' && (
                            <Skull className="absolute -top-2 -left-2 w-4 h-4 text-accent bg-background rounded-full p-0.5 border border-accent/40" />
                          )}

                          {isBoss && visualState !== 'blocked' && (
                            <Crown className="absolute -top-2 -left-2 w-4 h-4 text-gold bg-background rounded-full p-0.5 border border-gold/40" />
                          )}

                          {visualState === 'current' && (
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 bg-primary/90 border border-primary text-background rounded-sm animate-pulse">
                              <Flag className="w-3 h-3" />
                              <span className="font-pixel text-[8px]">VOCE</span>
                            </div>
                          )}

                          {visualState === 'available' && !isElite && !isBoss && (
                            <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-accent" />
                          )}

                          <span className="absolute -top-2 -right-1 font-pixel text-[9px] px-1.5 py-0.5 bg-card border border-primary/30">
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 min-w-[110px] -ml-6 md:-ml-4">
                        <p className={`font-pixel text-[10px] ${selected ? 'text-primary' : 'text-foreground'}`}>{node.name}</p>
                        <p className="font-retro text-xs text-muted-foreground">
                          {visualState === 'blocked' ? getUnlockMessage(node) : visualState === 'current' ? 'Ponto atual' : visualState === 'cleared' ? 'Superado' : isBoss ? 'Chefe aguardando' : isElite ? 'Elite de rota' : 'Aberto'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pixel-border bg-card/80 p-4 md:p-5 space-y-4">
              <div className="flex items-center gap-2">
                {selectedNode.type === 'boss' ? (
                  <Crown className="w-4 h-4 text-gold" />
                ) : selectedNode.type === 'elite' ? (
                  <Skull className="w-4 h-4 text-accent" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
                <p className="font-pixel text-[10px] text-primary">PONTO DA TRILHA</p>
              </div>

              <div>
                <h3 className={`font-pixel text-sm ${selectedNode.type === 'boss' ? 'text-gold' : selectedNode.type === 'elite' ? 'text-accent' : 'text-foreground'}`}>
                  {selectedNode.name}
                </h3>
                <p className="font-retro text-sm text-muted-foreground mt-2">{selectedNode.description}</p>
              </div>

              <div className={`pixel-border p-3 ${selectedNode.type === 'boss' ? 'bg-gold/5 border-gold/30' : selectedNode.type === 'elite' ? 'bg-accent/5 border-accent/30' : 'bg-background/50'}`}>
                <p className="font-pixel text-[10px] text-muted-foreground mb-2">{selectedEnemy.name}</p>
                <div className="flex items-center justify-between font-retro text-sm text-foreground">
                  <span>HP {selectedEnemy.maxHp}</span>
                  <span>ATK {selectedEnemy.attack}</span>
                  <span>DEF {selectedEnemy.defense}</span>
                </div>
                {selectedEnemy.mechanic && (
                  <p className="font-retro text-xs text-accent mt-3">{selectedEnemy.mechanic.name}: {selectedEnemy.mechanic.description}</p>
                )}
              </div>

              <div className="pixel-border bg-background/50 p-3">
                <p className="font-pixel text-[10px] text-muted-foreground mb-2">ESTADO</p>
                <p className="font-retro text-sm text-foreground">{statusLabel}</p>
              </div>

              {!selectedUnlocked && (
                <div className="pixel-border bg-accent/10 p-3">
                  <p className="font-retro text-sm text-accent">{getUnlockMessage(selectedNode)}</p>
                </div>
              )}

              {selectedCleared && (
                <div className="pixel-border bg-hp-green/10 p-3">
                  <p className="font-retro text-sm text-hp-green">Este ponto ja foi vencido. Voce pode reenfrentar se quiser farmar ou testar build.</p>
                </div>
              )}

              {selectedNode.id === currentNode.id && !selectedCleared && (
                <div className="pixel-border bg-primary/10 p-3">
                  <p className="font-retro text-sm text-primary">Este e o ponto atual da campanha.</p>
                </div>
              )}

              {selectedNode.type === 'elite' && (
                <div className="pixel-border bg-accent/10 p-3">
                  <p className="font-retro text-sm text-accent">Encontro de elite. Espere identidade mecanica e recompensa acima da rota comum.</p>
                </div>
              )}

              {selectedNode.type === 'boss' && (
                <div className="pixel-border bg-gold/10 p-3">
                  <p className="font-retro text-sm text-gold">Chefe de regiao. Esta luta fecha a Estrada Velha como campanha.</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleNodeAction}
                className={`w-full py-3 pixel-border font-pixel text-[10px] transition-colors ${
                  selectedUnlocked
                    ? selectedNode.type === 'boss'
                      ? 'bg-gold/10 text-gold hover:bg-gold/20'
                      : selectedNode.type === 'elite'
                        ? 'bg-accent/10 text-accent hover:bg-accent/20'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                {actionLabel}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegionScreen;
