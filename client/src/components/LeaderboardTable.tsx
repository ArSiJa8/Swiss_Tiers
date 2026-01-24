import { type Player } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, ArrowUp, ArrowDown, Minus, Scale } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

interface LeaderboardTableProps {
  data: Player[];
  activeMode: string | null;
  onPlayerClick: (player: Player) => void;
  compareMode?: boolean;
  selectedPlayers?: string[];
  onSelectForCompare?: (player: Player) => void;
}

export function LeaderboardTable({ 
  data, 
  activeMode, 
  onPlayerClick, 
  compareMode = false,
  selectedPlayers = [],
  onSelectForCompare
}: LeaderboardTableProps) {
  
  const getRankIcon = (index: number, player: Player) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />;
      case 1: return <Medal className="w-6 h-6 text-slate-300 fill-slate-300/20" />;
      case 2: return <Medal className="w-6 h-6 text-amber-700 fill-amber-700/20" />;
      default: return <span className="text-lg font-mono text-muted-foreground font-bold">#{index + 1}</span>;
    }
  };

  const getTrendIcon = (change: number | undefined) => {
    if (change === undefined || change === 0) return <Minus className="w-4 h-4 text-muted-foreground/40" />;
    if (change > 0) return (
      <motion.div 
        initial={{ y: 2, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="flex items-center gap-0.5"
      >
        <ArrowUp className="w-4 h-4 text-green-500" />
        <span className="text-[10px] font-bold text-green-500">+{change}</span>
      </motion.div>
    );
    return (
      <motion.div 
        initial={{ y: -2, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="flex items-center gap-0.5"
      >
        <ArrowDown className="w-4 h-4 text-red-500" />
        <span className="text-[10px] font-bold text-red-500">{change}</span>
      </motion.div>
    );
  };

  const getRowStyle = (index: number) => {
    if (index === 0) return "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500/50";
    if (index === 1) return "bg-slate-300/5 border-slate-300/20 hover:bg-slate-300/10 hover:border-slate-300/40";
    if (index === 2) return "bg-amber-700/5 border-amber-700/20 hover:bg-amber-700/10 hover:border-amber-700/40";
    return "bg-card border-border hover:border-primary/50 hover:bg-white/5";
  };

  if (activeMode) {
    // Tier-based Grid Layout for specific gamemodes
    const tiers = ["Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"];
    
    // Group players by tier
    const tieredPlayers = tiers.map((tierName, tierIdx) => {
      const tierNum = tierIdx + 1;
      
      return {
        name: tierName,
        players: data.filter(p => {
          const rank = p.gamemodes?.[activeMode]?.rank?.toUpperCase() || "";
          return rank.includes(`${tierNum}`);
        })
      };
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {tieredPlayers.map((tier, tierIdx) => (
          <div key={tier.name} className="flex flex-col gap-3">
            <div className={clsx(
              "flex items-center justify-center py-3 rounded-xl border font-black uppercase tracking-widest text-sm shadow-lg",
              tierIdx === 0 ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400 shadow-yellow-500/10" :
              tierIdx === 1 ? "bg-slate-400/20 border-slate-400/40 text-slate-300 shadow-slate-400/10" :
              tierIdx === 2 ? "bg-amber-700/20 border-amber-700/40 text-amber-600 shadow-amber-700/10" :
              "bg-card border-white/5 text-muted-foreground"
            )}>
              {tierIdx < 3 && <Trophy className="w-4 h-4 mr-2" />}
              {tier.name}
            </div>
            
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {tier.players.map((player, pIdx) => (
                  <motion.div
                    key={player.ingameName}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: pIdx * 0.05 }}
                    onClick={() => onPlayerClick(player)}
                    className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-white/5 hover:border-primary/40 hover:bg-white/5 cursor-pointer transition-all group"
                  >
                    <img
                      src={`https://mineskin.eu/helm/${player.ingameName}/32.png`}
                      alt={player.ingameName}
                      className="w-6 h-6 rounded-md object-contain border border-white/10"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate text-white group-hover:text-primary transition-colors leading-tight">
                        {player.ingameName}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-accent leading-none">
                        {player.gamemodes?.[activeMode]?.rank}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {tier.players.length === 0 && (
                  <div className="text-center py-4 text-xs text-muted-foreground italic bg-white/5 rounded-lg border border-dashed border-white/5">
                    No players
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
        <div className="col-span-1 text-center">Rank</div>
        <div className="col-span-7 md:col-span-4">Player</div>
        <div className="col-span-4 md:col-span-2 text-center">Points</div>
        <div className="hidden md:block md:col-span-5 text-right">Other Ranks</div>
      </div>

      <AnimatePresence mode="popLayout">
        {data.map((player, index) => (
          <motion.div
            key={player.ingameName}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            onClick={() => onPlayerClick(player)}
            className={clsx(
              "group relative grid grid-cols-12 gap-2 md:gap-4 items-center px-3 md:px-6 py-4 rounded-xl border cursor-pointer transition-all duration-300 shadow-lg shadow-black/20",
              getRowStyle(index),
              selectedPlayers.includes(player.ingameName) && "ring-2 ring-primary border-primary bg-primary/10"
            )}
          >
            {/* Rank Column */}
            <div className="col-span-1 flex flex-col justify-center items-center gap-1">
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                {getRankIcon(index, player)}
              </div>
              <div className="flex items-center gap-0.5 opacity-60">
                {getTrendIcon(player.rankChange)}
              </div>
            </div>

            {/* Player Info Column */}
            <div className="col-span-7 md:col-span-4 flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2 mr-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className={clsx(
                    "w-8 h-8 rounded-lg transition-all",
                    selectedPlayers.includes(player.ingameName) 
                      ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                      : "bg-white/5 text-muted-foreground hover:text-white"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectForCompare?.(player);
                  }}
                >
                  <Scale className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative w-10 h-10 md:w-14 md:h-14 shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img
                  src={`https://mineskin.eu/helm/${player.ingameName}/100.png`}
                  alt={player.ingameName}
                  className="w-full h-full rounded-xl object-contain relative z-10 border border-white/10 shadow-sm bg-black/40"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className={clsx(
                  "font-display font-bold text-base md:text-lg truncate",
                  index < 3 ? "text-white" : "text-foreground"
                )}>
                  {player.ingameName}
                </span>
                {player.discordName && (
                  <span className="text-[10px] md:text-xs text-muted-foreground font-mono truncate group-hover:text-primary transition-colors">
                    @{player.discordName}
                  </span>
                )}
              </div>
            </div>

            {/* Points Column */}
            <div className="col-span-4 md:col-span-2 flex justify-center">
              <div className="flex flex-col items-center">
                <span className={clsx(
                  "font-mono font-black text-xl md:text-2xl tracking-tight",
                  index === 0 ? "text-yellow-400" : "text-white"
                )}>
                  {activeMode ? (player.gamemodes?.[activeMode]?.points ?? 0) : player.totalPoints}
                </span>
                <span className="text-[9px] md:text-[10px] uppercase text-muted-foreground font-bold tracking-wider">PTS</span>
              </div>
            </div>

            {/* Tiers / Badges Column */}
            <div className="hidden md:flex col-span-5 justify-end gap-2 items-center flex-wrap">
              {Object.entries(player.gamemodes || {}).map(([mode, stats]) => {
                if (!stats || !stats.rank) return null;
                // Don't show the active mode badge in the "Other Ranks" column if filtered
                if (activeMode === mode) return null;
                
                return (
                  <div 
                    key={mode} 
                    className="flex items-center gap-1.5 bg-black/30 border border-white/5 rounded-lg pl-1.5 pr-2.5 py-1 backdrop-blur-sm hover:bg-white/5 transition-colors"
                  >
                    <img src={`/${mode}.png`} alt={mode} className="w-4 h-4 object-contain opacity-70" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] uppercase text-muted-foreground font-bold">{mode}</span>
                      <span className="text-xs font-mono font-bold text-accent">{stats.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 blur transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </AnimatePresence>

      {data.length === 0 && (
        <div className="text-center py-20 bg-card/30 rounded-2xl border border-dashed border-white/10">
          <p className="text-muted-foreground font-display text-lg">No players found matching your search.</p>
        </div>
      )}
    </div>
  );
}
