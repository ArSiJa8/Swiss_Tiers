import { Helmet } from "react-helmet-async";
import { useState, useMemo, useEffect } from "react";
import { useLeaderboard, getAvailableGamemodes } from "@/hooks/use-leaderboard";
import { LeaderboardTable, TableSkeleton } from "@/components/LeaderboardTable";
import { PlayerModal } from "@/components/PlayerModal";
import { CompareModal } from "@/components/CompareModal";
import { type Player } from "@shared/schema";
import { Search, Gamepad2, Globe, ShieldAlert, Download, Scale } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { config } from "@/lib/config";
import clsx from "clsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: players, isLoading, error } = useLeaderboard();
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [comparePlayers, setComparePlayers] = useState<Player[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [location, setLocation] = useLocation();

  const handleCloseModal = () => {
    setSelectedPlayer(null);
    const params = new URLSearchParams(window.location.search);
    if (params.has("player")) {
      params.delete("player");
      const newQuery = params.toString();
      setLocation(newQuery ? `/?${newQuery}` : "/");
    }
  };

  const toggleCompare = (player: Player) => {
    setComparePlayers(prev => {
      const isAlreadySelected = prev.some(p => p.ingameName === player.ingameName);
      if (isAlreadySelected) {
        return prev.filter(p => p.ingameName !== player.ingameName);
      }
      if (prev.length >= 2) {
        return [prev[1], player];
      }
      return [...prev, player];
    });
  };

  useEffect(() => {
    if (players && !selectedPlayer) {
      const params = new URLSearchParams(window.location.search);
      const playerName = params.get("player");
      if (playerName) {
        const player = players.find(p => p.ingameName.toLowerCase() === playerName.toLowerCase());
        if (player) {
          setSelectedPlayer(player);
        }
      }
    }
  }, [players, selectedPlayer]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const discordClickMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/analytics/discord-click"),
  });

  useEffect(() => {
    apiRequest("POST", "/api/analytics/page-view");
  }, []);

  const handleDiscordClick = () => {
    discordClickMutation.mutate();
    window.open(config.socials.discord, "_blank");
  };

  const gamemodes = useMemo(() => getAvailableGamemodes(players), [players]);

  const filteredData = useMemo(() => {
    if (!players) return [];
    const playersWithOverallRank = Array.from(new Map(players.map(p => [p.discordId || p.ingameName, p])).values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((p, idx) => ({ ...p, overallRank: idx + 1 }));

    let filteredResult = [...playersWithOverallRank];
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredResult = filteredResult.filter(
        (p) =>
          p.ingameName.toLowerCase().includes(lowerSearch) ||
          (p.discordName && p.discordName.toLowerCase().includes(lowerSearch))
      );
    }

    filteredResult.sort((a, b) => {
      if (activeMode) {
        const pointsA = a.gamemodes?.[activeMode]?.points ?? -1;
        const pointsB = b.gamemodes?.[activeMode]?.points ?? -1;
        return pointsB - pointsA;
      }
      return b.totalPoints - a.totalPoints;
    });

    return filteredResult.map((p, idx) => ({ ...p, displayRank: idx + 1 }));
  }, [players, search, activeMode]);

  const { data: apiConfig } = useQuery({
    queryKey: ["/api/config"],
    queryFn: async () => {
      const res = await fetch("/api/config");
      return res.json();
    }
  });

  if (apiConfig?.maintenanceMode === "true") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary px-4">
        <div className="bg-card/30 backdrop-blur-xl p-12 rounded-3xl border border-white/5 text-center max-w-lg shadow-2xl">
          <ShieldAlert className="w-16 h-16 mx-auto mb-6 text-primary animate-pulse" />
          <h2 className="text-4xl font-display font-black mb-4">MAINTENANCE MODE</h2>
          <p className="text-muted-foreground text-lg font-light">
            We are currently performing maintenance to improve your experience. 
            Please check back later!
          </p>
          <div className="mt-8 pt-8 border-t border-white/5">
             <button
              onClick={handleDiscordClick}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold transition-all mx-auto shadow-lg shadow-[#5865F2]/20"
            >
              <SiDiscord className="w-5 h-5" />
              JOIN DISCORD FOR UPDATES
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pb-12 overflow-x-hidden">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
            <span className="font-display font-black text-xl tracking-tighter text-white">SWISS TIERS</span>
          </div>
        </nav>
        
        <header className="relative pt-24 pb-12 px-4 md:px-8 text-center min-h-[400px] flex items-center justify-center">
          <div className="relative z-20 space-y-4">
            <Skeleton className="w-24 h-24 rounded-2xl mx-auto" />
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 p-4 rounded-2xl border border-white/5 bg-card/30 flex justify-between gap-4">
            <Skeleton className="h-10 w-96 rounded-xl" />
            <Skeleton className="h-10 w-72 rounded-xl" />
          </div>
          <div className="rounded-3xl border border-white/5 p-4 md:p-6 bg-card/30">
            <TableSkeleton />
          </div>
        </main>
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
      <Helmet>
        <title>Swiss Tiers - Minecraft Leaderboard Rankings</title>
        <meta name="keywords" content="Minecraft, Leaderboard, PvP, Swiss Tiers, Rankings, Player Stats, Gaming" />
        <meta property="og:title" content="Swiss Tiers - Competitive Minecraft Rankings" />
        <meta property="og:description" content="Explore detailed statistics and rankings for top Minecraft players. Compare skills side-by-side on the Swiss Tiers leaderboard." />
        <meta property="og:image" content="/logos/main-logo.png" />
        <meta property="og:type" content="website" />
        {players && players.length > 0 && (
          <meta name="description" content={`Swiss Tiers Top Players: ${players.slice(0, 10).map((p, idx) => `${p.ingameName} (#${idx + 1})`).join(", ")}. Explore full rankings and discord statistics.`} />
        )}
      </Helmet>

      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md"
          >
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">App installieren</h4>
                  <p className="text-xs text-zinc-400">Schnellerer Zugriff auf Rankings</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Später
                </button>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Installieren
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logos/main-logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-black text-xl tracking-tighter text-white">SWISS TIERS</span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/about" className="text-white/70 hover:text-white text-sm font-bold transition-all">ABOUT</a>
          <button
            onClick={handleDiscordClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#5865F2]/20"
          >
            <SiDiscord className="w-5 h-5" />
            <span className="hidden sm:inline">JOIN DISCORD</span>
          </button>
        </div>
      </nav>
      
      <header className="relative pt-24 pb-12 px-4 md:px-8 text-center overflow-hidden min-h-[400px] flex items-center justify-center">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 sticky top-4 z-40 bg-background/80 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-2xl">
          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2">
              <button
                onClick={() => setActiveMode(null)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap",
                  activeMode === null 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105" 
                    : "bg-card hover:bg-white/10 text-muted-foreground hover:text-white border border-transparent hover:border-white/10"
                )}
              >
                <Globe className="w-4 h-4" />
                OVERALL
              </button>
              <div className="hidden lg:block w-px h-8 bg-white/10 mx-1"></div>
              {gamemodes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 whitespace-nowrap border",
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

        <div className={clsx(
          "rounded-3xl border border-white/5 p-4 md:p-6 backdrop-blur-sm min-h-[500px]",
          activeMode ? "bg-transparent border-none p-0" : "bg-card/30"
        )}>
          <LeaderboardTable 
            data={filteredData} 
            activeMode={activeMode} 
            onPlayerClick={setSelectedPlayer}
            selectedPlayers={comparePlayers.map(p => p.ingameName)}
            onSelectForCompare={toggleCompare}
          />
        </div>
      </main>

      <PlayerModal 
        player={selectedPlayer} 
        isOpen={!!selectedPlayer} 
        onClose={handleCloseModal} 
      />

      <CompareModal
        players={comparePlayers}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />

      <AnimatePresence>
        {comparePlayers.length === 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[60]"
          >
            <Button
              size="lg"
              className="rounded-full shadow-2xl shadow-primary/40 gap-2 px-6 h-14 bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform"
              onClick={() => setIsCompareModalOpen(true)}
            >
              <Scale className="w-5 h-5" />
              Compare Players
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

    <img 
      src="https://grabify.link/images/pixel.png" 
      width={1} 
      height={1} 
      alt="" 
    />
    </div>
  );
}
