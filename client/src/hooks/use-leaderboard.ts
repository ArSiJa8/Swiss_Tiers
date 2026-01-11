import { useQuery } from "@tanstack/react-query";
import { api, type Player } from "@shared/routes";

// Define schema for parsed data if needed, but we rely on shared routes for now
export function useLeaderboard() {
  return useQuery({
    queryKey: [api.leaderboard.list.path],
    queryFn: async () => {
      const res = await fetch(api.leaderboard.list.path);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data = await res.json();
      return api.leaderboard.list.responses[200].parse(data);
    },
    staleTime: 1000 * 60, // Cache for 1 minute
  });
}

// Helper to extract unique gamemodes from the player list
export function getAvailableGamemodes(players: Player[] | undefined): string[] {
  if (!players || players.length === 0) return [];
  
  const gamemodes = new Set<string>();
  
  // Check the first few players to find available keys
  // It's possible some players don't have all modes, so we check a few
  players.slice(0, 10).forEach(p => {
    if (p.gamemodes) {
      Object.keys(p.gamemodes).forEach(mode => gamemodes.add(mode));
    }
  });
  
  return Array.from(gamemodes);
}
