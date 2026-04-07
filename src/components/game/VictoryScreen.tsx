import { useGame } from '@/contexts/GameContext';
import { Crown, Coins, Star, Package, Shield, Trophy, MapPin, FlaskConical } from 'lucide-react';

const TROLL_ID = 'e7';

const VictoryScreen = () => {
  const { state, claimVictory } = useGame();
  const { combat, regionProgress } = state;

  if (!combat) return null;

  const isTroll = combat.enemy.id === TROLL_ID;
  const isFirstTrollKill = isTroll && !regionProgress.trollDefeated;

  if (isTroll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden px-4">
        <div className="absolute inset-0 retro-scanline pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.14),_transparent_40%)]" />

        <div className="absolute inset-3 border-2 border-gold/40 pointer-events-none" />
        <div className="absolute inset-5 border border-gold/20 pointer-events-none" />

        <div className="relative z-20 text-center max-w-2xl">
          <Crown className="w-16 h-16 text-gold mx-auto mb-3 animate-pulse-gold" />

          <h1 className="font-pixel text-2xl text-gold mb-2 tracking-wider">
            {isFirstTrollKill ? 'CAPITULO ENCERRADO' : 'O TROLL CAI NOVAMENTE'}
          </h1>

          {isFirstTrollKill && (
            <p className="font-pixel text-sm text-primary mb-3 tracking-widest animate-pulse">
              ESTRADA VELHA CONQUISTADA
            </p>
          )}

          <p className="font-retro text-lg text-muted-foreground mb-3">
            {isFirstTrollKill
              ? 'A ponte velha treme, o Troll tomba e a Estrada Velha finalmente se abre como rota segura.'
              : 'O Troll da Ponte cai outra vez. A estrada permanece sob seu controle.'}
          </p>

          {isFirstTrollKill && (
            <p className="font-retro text-sm text-muted-foreground/80 italic mb-6">
              "A primeira campanha esta fechada. O mundo alem da vila agora parece um passo real, nao promessa vazia."
            </p>
          )}

          <div className="pixel-border bg-card/85 px-8 py-5 mb-5 space-y-3">
            <p className="font-pixel text-xs text-muted-foreground tracking-widest">RECOMPENSAS</p>

            <div className="flex items-center justify-center gap-2">
              <Coins className="w-5 h-5 text-gold" />
              <span className="font-retro text-xl text-gold">+{combat.goldEarned} ouro</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-xp-blue" />
              <span className="font-retro text-xl text-xp-blue">+{combat.xpEarned} XP</span>
            </div>
            {combat.lootEarned && (
              <div className="flex items-center justify-center gap-2">
                <Package className="w-5 h-5 text-secondary" />
                <span className="font-retro text-xl text-secondary">{combat.lootEarned.name}</span>
              </div>
            )}

            {(combat.bonusGoldEarned > 0 || combat.bonusPotionsEarned > 0) && (
              <>
                <div className="w-full h-px bg-gold/30 my-1" />
                <p className="font-pixel text-xs text-gold/80 tracking-widest">BONUS DE CAMPANHA</p>
                {combat.bonusGoldEarned > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5 text-gold" />
                    <span className="font-retro text-xl text-gold">+{combat.bonusGoldEarned} ouro</span>
                  </div>
                )}
                {combat.bonusPotionsEarned > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <FlaskConical className="w-5 h-5 text-primary" />
                    <span className="font-retro text-xl text-primary">+{combat.bonusPotionsEarned} pocao</span>
                  </div>
                )}
              </>
            )}
          </div>

          {isFirstTrollKill && (
            <div className="pixel-border bg-primary/10 px-6 py-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="font-pixel text-[10px] text-primary">DESBLOQUEIO FUTURO</p>
              </div>
              <p className="font-retro text-sm text-muted-foreground">
                O mapa do mundo passa a tratar a Estrada Velha como campanha concluida. As proximas regioes seguem no mapa como promessa do proximo capitulo.
              </p>
            </div>
          )}

          <button
            onClick={claimVictory}
            className="font-pixel text-sm text-gold hover:text-primary transition-colors tracking-widest px-10 py-3 pixel-border bg-card hover:bg-muted border-gold/40"
          >
            {isFirstTrollKill ? 'FECHAR CAPITULO' : 'CONTINUAR'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 retro-scanline pointer-events-none z-10" />
      <div className="absolute inset-4 border-2 border-primary/20 pointer-events-none" />

      <Trophy className="w-12 h-12 text-gold mb-4 animate-pulse-gold" />
      <h1 className="font-pixel text-xl text-primary mb-2">VITORIA!</h1>
      <p className="font-retro text-lg text-muted-foreground mb-8">
        {combat.enemy.name} foi derrotado.
      </p>

      <div className="flex flex-col items-center gap-3 mb-10 z-20">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-gold" />
          <span className="font-retro text-xl text-gold">+{combat.goldEarned} ouro</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-xp-blue" />
          <span className="font-retro text-xl text-xp-blue">+{combat.xpEarned} XP</span>
        </div>
        {combat.bonusGoldEarned > 0 && (
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            <span className="font-retro text-xl text-gold">+{combat.bonusGoldEarned} ouro de campanha</span>
          </div>
        )}
        {combat.bonusPotionsEarned > 0 && (
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            <span className="font-retro text-xl text-primary">+{combat.bonusPotionsEarned} pocao de preparo</span>
          </div>
        )}
        {combat.lootEarned && (
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-secondary" />
            <span className="font-retro text-xl text-secondary">{combat.lootEarned.name}</span>
          </div>
        )}
      </div>

      <button
        onClick={claimVictory}
        className="font-pixel text-sm text-foreground hover:text-primary transition-colors tracking-widest px-8 py-3 pixel-border bg-card hover:bg-muted z-20"
      >
        CONTINUAR
      </button>
    </div>
  );
};

export default VictoryScreen;
