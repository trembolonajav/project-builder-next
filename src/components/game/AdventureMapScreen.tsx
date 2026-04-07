import { useMemo, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { WORLD_REGIONS } from '@/data/regions';
import { CheckCircle, ChevronLeft, Lock, MapPin } from 'lucide-react';

const REGION_PATHS = [
  ['estrada_velha', 'montanhas_cinzentas'],
  ['estrada_velha', 'pantano_sinos'],
  ['montanhas_cinzentas', 'ruinas_ferro'],
  ['ruinas_ferro', 'costa_partida'],
];

type RegionState = 'available' | 'in_progress' | 'completed' | 'coming_soon';

const AdventureMapScreen = () => {
  const { navigate, state } = useGame();
  const { regionProgress } = state;
  const [selectedRegionId, setSelectedRegionId] = useState('estrada_velha');

  const selectedRegion = useMemo(
    () => WORLD_REGIONS.find(region => region.id === selectedRegionId) || WORLD_REGIONS[0],
    [selectedRegionId],
  );

  const getRegionState = (regionId: string): RegionState => {
    if (regionId !== 'estrada_velha') return 'coming_soon';

    const clearedNodes =
      regionProgress.clearedCommons.length +
      (regionProgress.alphaDefeated ? 1 : 0) +
      (regionProgress.captainDefeated ? 1 : 0) +
      (regionProgress.trollDefeated ? 1 : 0);

    if (regionProgress.trollDefeated) return 'completed';
    if (clearedNodes > 0) return 'in_progress';
    return 'available';
  };

  const getRegionBadge = (regionId: string) => {
    switch (getRegionState(regionId)) {
      case 'available':
        return 'Disponivel';
      case 'in_progress':
        return 'Em progresso';
      case 'completed':
        return 'Concluida';
      case 'coming_soon':
        return 'Em breve';
    }
  };

  const getRegionStatusText = (regionId: string) => {
    if (regionId !== 'estrada_velha') {
      return 'Esta regiao aparece no mapa para vender o mundo, mas ainda nao esta jogavel nesta build.';
    }

    switch (getRegionState(regionId)) {
      case 'available':
        return 'A Estrada Velha esta pronta para a primeira incursao.';
      case 'in_progress':
        return 'A campanha ja comecou. Voce pode continuar da trilha onde parou.';
      case 'completed':
        return 'A campanha foi fechada. A estrada segue aberta para revisitas e reenvios.';
      case 'coming_soon':
        return '';
    }
  };

  const selectedState = getRegionState(selectedRegion.id);

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 retro-scanline pointer-events-none z-10" />

      <header className="p-4 border-b-2 border-primary/30 bg-card/80">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('village')} className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="font-pixel text-sm text-primary">MAPA DE AVENTURAS</h2>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 z-20 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <p className="font-retro text-lg text-muted-foreground text-center max-w-xl mx-auto mb-6">
            O mapa agora usa estados reais de campanha: disponivel, em progresso, concluida e em breve.
          </p>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] items-start">
            <div className="pixel-border bg-card/80 p-4 md:p-6">
              <div className="relative min-h-[520px] rounded-sm border border-primary/15 bg-[radial-gradient(circle_at_top,_rgba(255,193,7,0.08),_transparent_35%),linear-gradient(180deg,rgba(16,19,28,0.95),rgba(12,14,20,0.98))] overflow-hidden">
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {REGION_PATHS.map(([fromId, toId]) => {
                    const from = WORLD_REGIONS.find(region => region.id === fromId);
                    const to = WORLD_REGIONS.find(region => region.id === toId);
                    if (!from || !to) return null;

                    return (
                      <line
                        key={`${fromId}-${toId}`}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="hsl(var(--primary) / 0.55)"
                        strokeWidth="0.5"
                        strokeDasharray="1.5 1.5"
                      >
                        {fromId === 'estrada_velha' && (
                          <animate
                            attributeName="stroke-dashoffset"
                            from="12"
                            to="0"
                            dur="2.4s"
                            repeatCount="indefinite"
                          />
                        )}
                      </line>
                    );
                  })}
                </svg>

                {WORLD_REGIONS.map(region => {
                  const regionState = getRegionState(region.id);
                  const isSelected = selectedRegion.id === region.id;

                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => setSelectedRegionId(region.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 text-left transition-transform ${isSelected ? 'scale-105' : 'hover:scale-105'}`}
                      style={{ left: `${region.x}%`, top: `${region.y}%` }}
                    >
                      <div
                        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-background/90 backdrop-blur-sm
                        ${regionState === 'completed' ? 'border-hp-green shadow-[0_0_30px_rgba(34,197,94,0.18)]' : ''}
                        ${regionState === 'in_progress' ? 'border-primary shadow-[0_0_30px_rgba(255,193,7,0.2)] animate-pulse' : ''}
                        ${regionState === 'available' ? 'border-accent shadow-[0_0_25px_rgba(251,146,60,0.15)] animate-pulse' : ''}
                        ${regionState === 'coming_soon' ? 'border-muted-foreground/40' : ''}
                        ${isSelected ? 'ring-2 ring-primary/40' : ''}`}
                      >
                        {regionState === 'coming_soon' ? (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        ) : regionState === 'completed' ? (
                          <CheckCircle className="w-7 h-7 text-hp-green" />
                        ) : (
                          <MapPin className={`w-7 h-7 ${regionState === 'in_progress' ? 'text-primary' : 'text-accent'}`} />
                        )}
                      </div>
                      <div className="mt-2 min-w-[120px] -ml-7">
                        <p className={`font-pixel text-[10px] ${isSelected ? 'text-primary' : 'text-foreground'}`}>{region.name}</p>
                        <p className="font-retro text-xs text-muted-foreground">{getRegionBadge(region.id)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pixel-border bg-card/80 p-4 md:p-5 space-y-4">
              <div>
                <p className="font-pixel text-[10px] text-primary mb-2">DESTINO</p>
                <h3 className="font-pixel text-sm text-foreground">{selectedRegion.name}</h3>
                <p className="font-retro text-sm text-muted-foreground mt-2">{selectedRegion.description}</p>
              </div>

              <div className="pixel-border bg-background/50 p-3">
                <p className="font-pixel text-[10px] text-muted-foreground mb-2">SITUACAO</p>
                <p className="font-retro text-sm text-foreground">{getRegionStatusText(selectedRegion.id)}</p>
              </div>

              <div className="pixel-border bg-background/50 p-3">
                <p className="font-pixel text-[10px] text-muted-foreground mb-2">ESTADO</p>
                <p className="font-retro text-sm text-foreground">{getRegionBadge(selectedRegion.id)}</p>
              </div>

              <button
                type="button"
                onClick={() => selectedRegion.id === 'estrada_velha' && navigate('region')}
                disabled={selectedState === 'coming_soon'}
                className="w-full py-3 pixel-border bg-primary/10 text-primary font-pixel text-[10px] hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {selectedState === 'available' && 'ENTRAR NA ESTRADA'}
                {selectedState === 'in_progress' && 'CONTINUAR CAMPANHA'}
                {selectedState === 'completed' && 'REVISITAR A ESTRADA'}
                {selectedState === 'coming_soon' && 'EM BREVE'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdventureMapScreen;
