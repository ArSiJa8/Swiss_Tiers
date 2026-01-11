import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Player } from "@shared/routes";
import { motion } from "framer-motion";
import { Trophy, Swords, Zap, Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { config } from "@/lib/config";

interface PlayerModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerModal({ player, isOpen, onClose }: PlayerModalProps) {
  if (!player) return null;

  // Find the highest badge earned
  const earnedBadges = [...config.badges]
    .filter(b => player.totalPoints >= b.threshold)
    .sort((a, b) => b.threshold - a.threshold);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-full bg-card/95 backdrop-blur-xl border-white/10 text-white p-0 overflow-hidden shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto md:overflow-hidden">
        <div className="flex flex-col md:grid md:grid-cols-3 h-full">
          
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:col-span-1 bg-gradient-to-b from-primary/20 via-background to-background p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            
            {/* Rank badge decoration */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
              <div className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                <Crown className="w-3 h-3" />
                TOP PLAYER
              </div>
              
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.map((badge) => (
                    <Tooltip key={badge.id}>
                      <TooltipTrigger asChild>
                        <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 p-1 flex items-center justify-center cursor-help hover:border-primary/50 transition-colors">
                          <img 
                            src={badge.icon} 
                            alt={badge.name} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Placeholder for missing icon
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23D52B1E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-card border-white/10 text-white">
                        <p className="font-bold">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.threshold} Points Required</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 w-40 md:w-full aspect-[3/4] flex items-center justify-center"
            >
              {/* Bust Render */}
              <img 
                src={`https://mineskin.eu/armor/bust/${player.ingameName}/150.png`}
                alt={player.ingameName}
                className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-500"
              />
            </motion.div>

            <div className="mt-4 md:mt-6 text-center z-10">
              <h2 className="text-2xl md:text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                {player.ingameName}
              </h2>
              {player.discordName && (
                <p className="text-xs md:text-sm text-muted-foreground font-mono mt-1 bg-black/30 px-3 py-0.5 md:py-1 rounded-full inline-block border border-white/5">
                  @{player.discordName}
                </p>
              )}
            </div>
            
            <div className="mt-4 md:mt-8 w-full max-w-[200px] md:max-w-none grid grid-cols-2 gap-2 bg-white/5 rounded-xl p-3 md:p-4 border border-white/5 backdrop-blur-sm">
              <div className="text-center border-r border-white/10 pr-2">
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-semibold">Total Pts</p>
                <p className="text-xl md:text-2xl font-display font-black text-white mt-0.5 md:mt-1">{player.totalPoints}</p>
              </div>
              <div className="text-center pl-2">
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-semibold">Overall</p>
                <p className="text-2xl md:text-3xl font-display font-black text-primary mt-0.5 md:mt-1">#{player.overallRank || '-'}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Stats */}
          <div className="md:col-span-2 p-6 md:p-8 bg-background/50">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-display uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4 md:mb-6">
                <Swords className="w-5 h-5 text-accent" />
                Performance Statistics
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {Object.entries(player.gamemodes || {}).map(([mode, stats], index) => {
                if (!stats) return null;
                
                return (
                  <motion.div 
                    key={mode}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="group bg-card border border-white/5 hover:border-primary/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-12 h-12" />
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      {/* Fallback image logic handled by onerror usually, simplistic here */}
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden border border-white/10">
                         <img 
                          src={`/${mode}.png`} 
                          alt={mode}
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='5' ry='5'%3E%3C/rect%3E%3Cpath d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'%3E%3C/path%3E%3Cline x1='17.5' y1='6.5' x2='17.51' y2='6.5'%3E%3C/line%3E%3C/svg%3E";
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-bold text-lg">{mode}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                        <p className="text-xs text-muted-foreground uppercase">Rank</p>
                        <p className="text-xl font-mono font-bold text-accent">{stats.rank}</p>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                        <p className="text-xs text-muted-foreground uppercase">Points</p>
                        <p className="text-xl font-mono font-bold text-white">{stats.points}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
