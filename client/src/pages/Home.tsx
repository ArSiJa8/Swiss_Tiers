import { useState, useMemo } from "react";
import { useLeaderboard, getAvailableGamemodes } from "@/hooks/use-leaderboard";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PlayerModal } from "@/components/PlayerModal";
import { type Player } from "@shared/routes";
import { Search, Loader2, Gamepad2, Globe } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { motion } from "framer-motion";
import { config } from "@/lib/config";
import clsx from "clsx";

export default function Home() {
  const { data: players, isLoading, error } = useLeaderboard();
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Derive available gamemodes from data
  const gamemodes = useMemo(() => getAvailableGamemodes(players), [players]);

  // Filter and Sort Data
  const filteredData = useMemo(() => {
    if (!players) return [];

    let result = [...players];

    // Filter by search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.ingameName.toLowerCase().includes(lowerSearch) ||
          (p.discordName && p.discordName.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort by active mode points or total points
    result.sort((a, b) => {
      if (activeMode) {
        const pointsA = a.gamemodes?.[activeMode]?.points ?? -1;
        const pointsB = b.gamemodes?.[activeMode]?.points ?? -1;
        return pointsB - pointsA;
      }
      return b.totalPoints - a.totalPoints;
    });

    return result;
  }, [players, search, activeMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="font-display text-xl animate-pulse">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        <div className="bg-destructive/10 p-8 rounded-2xl border border-destructive/20 text-center">
          <h2 className="text-2xl font-bold mb-2">Failed to load data</h2>
          <p>Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 overflow-x-hidden">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logos/main-logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-black text-xl tracking-tighter text-white">SWISS TIERS</span>
        </div>
        <a 
          href={config.socials.discord} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#5865F2]/20"
        >
          <SiDiscord className="w-5 h-5" />
          <span className="hidden sm:inline">JOIN DISCORD</span>
        </a>
      </nav>
      
      {/* Hero Header Section */}
      <header className="relative pt-24 pb-12 px-4 md:px-8 text-center overflow-hidden min-h-[400px] flex items-center justify-center">
        {/* Hero Background Image with Dark Wash */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url("/hero-bg.webp")',
            filter: 'brightness(0.3) contrast(1.1)'
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/20 via-background/60 to-background"></div>
        
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-20"
          >
            <div className="flex justify-center mb-6">
              <img 
                src="/logos/main-logo.png" 
                alt="Swiss Tiers Logo" 
                className="w-24 h-24 rounded-2xl shadow-2xl border-2 border-primary/20 object-cover"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-primary mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Rankings
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-4 text-gradient drop-shadow-sm">
            RANKINGS
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light">
            Competing for glory across the network. Check the top players and statistics.
          </p>
        </motion.div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 sticky top-4 z-40 bg-background/80 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-2xl">
          
          {/* Gamemode Slider */}
          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveMode(null)}
                className={clsx(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap",
                  activeMode === null 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105" 
                    : "bg-card hover:bg-white/10 text-muted-foreground hover:text-white border border-transparent hover:border-white/10"
                )}
              >
                <Globe className="w-4 h-4" />
                OVERALL
              </button>
              
              <div className="w-px h-8 bg-white/10 mx-2"></div>

              {gamemodes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={clsx(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap border",
                    activeMode === mode 
                      ? "bg-white text-black border-white shadow-lg scale-105" 
                      : "bg-card text-muted-foreground border-white/5 hover:border-white/20 hover:text-white"
                  )}
                >
                   <img 
                    src={`/${mode}.png`} 
                    alt="" 
                    className="w-4 h-4 object-contain"
                    onError={(e) => e.currentTarget.style.display = 'none'} 
                  />
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72 shrink-0 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-card/30 rounded-3xl border border-white/5 p-2 md:p-6 backdrop-blur-sm min-h-[500px]">
          <LeaderboardTable 
            data={filteredData} 
            activeMode={activeMode} 
            onPlayerClick={setSelectedPlayer}
          />
        </div>

      </main>

      {/* Player Modal */}
      <PlayerModal 
        player={selectedPlayer} 
        isOpen={!!selectedPlayer} 
        onClose={() => setSelectedPlayer(null)} 
      />
    </div>
  );
}
