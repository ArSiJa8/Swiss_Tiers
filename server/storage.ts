import { type Player } from "@shared/schema";

export interface IStorage {
  getLeaderboard(): Promise<Player[]>;
}

export class MemStorage implements IStorage {
  private cache: Player[] | null = null;
  private lastFetch: number = 0;
  private CACHE_TTL = 60 * 1000; // 1 minute cache for responsiveness

  async getLeaderboard(): Promise<Player[]> {
    const now = Date.now();
    if (this.cache && (now - this.lastFetch < this.CACHE_TTL)) {
      return this.cache;
    }

    try {
      console.log("Fetching leaderboard from external API...");
      const response = await fetch("https://swiss-tiers-bot-production.up.railway.app/api/leaderboard");
      if (!response.ok) {
        throw new Error(`External API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      this.cache = data as Player[];
      this.lastFetch = now;
      return this.cache!;
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      // Return stale cache if available, otherwise empty array
      return this.cache || [];
    }
  }
}

export const storage = new MemStorage();
