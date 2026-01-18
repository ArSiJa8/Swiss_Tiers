import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Player } from "@shared/schema";
import { motion } from "framer-motion";
import { Swords, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompareModalProps {
  players: Player[];
  isOpen: boolean;
  onClose: () => void;
}

export function CompareModal({ players, isOpen, onClose }: CompareModalProps) {
  if (players.length < 2) return null;

  const [p1, p2] = players;
  const gamemodes = Array.from(new Set([
    ...Object.keys(p1.gamemodes || {}),
    ...Object.keys(p2.gamemodes || {})
  ]));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] bg-card/95 backdrop-blur-xl border-white/10 text-white p-0 overflow-hidden shadow-2xl max-h-[90vh]">
        <DialogHeader className="p-6 border-b border-white/5">
          <DialogTitle className="text-xl font-display uppercase tracking-widest flex items-center gap-2">
            <Swords className="w-5 h-5 text-accent" />
            Player Comparison
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-80px)]">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[p1, p2].map((p, idx) => (
                <div key={p.ingameName} className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                  <img
                    src={`https://mineskin.eu/armor/bust/${p.ingameName}/100.png`}
                    alt={p.ingameName}
                    className="w-24 h-24 object-contain mb-4"
                  />
                  <h2 className="text-xl font-bold">{p.ingameName}</h2>
                  <p className="text-primary font-black text-2xl mt-2">#{(p as any).overallRank || '-'}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Overall Rank</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {gamemodes.map((mode) => {
                const s1 = (p1.gamemodes?.[mode] as any) || { rank: "N/A", points: 0 };
                const s2 = (p2.gamemodes?.[mode] as any) || { rank: "N/A", points: 0 };

                return (
                  <div key={mode} className="bg-card border border-white/5 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-center mb-4 uppercase tracking-widest text-sm text-muted-foreground">{mode}</h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col items-center">
                        <span className="text-accent font-mono font-bold text-lg">{s1.rank}</span>
                        <span className="text-white font-mono font-bold">{s1.points} pts</span>
                      </div>
                      <div className="flex flex-col items-center border-l border-white/10">
                        <span className="text-accent font-mono font-bold text-lg">{s2.rank}</span>
                        <span className="text-white font-mono font-bold">{s2.points} pts</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
