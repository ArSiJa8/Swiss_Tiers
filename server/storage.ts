import { type Player, type Analytics, type Config } from "@shared/schema";

export interface IStorage {
  getLeaderboard(): Promise<Player[]>;
  getAnalytics(): Promise<Analytics>;
  incrementPageViews(): Promise<void>;
  incrementDiscordClicks(): Promise<void>;
  getConfig(): Promise<Config>;
  updateConfig(config: Partial<Config>): Promise<Config>;
}

export class MemStorage implements IStorage {
  private cache: Player[] | null = null;
  private lastFetch: number = 0;
  private CACHE_TTL = 60 * 1000; // 1 minute cache for responsiveness
  private analyticsData: Analytics = {
    id: 1,
    pageViews: 0,
    discordClicks: 0
  };
  private configData: Config = {
    id: 1,
    maintenanceMode: "false",
    externalApiUrl: "https://swiss-tiers-bot-production.up.railway.app/api/leaderboard"
  };

  async getLeaderboard(): Promise<Player[]> {
    if (this.configData.maintenanceMode === "true") {
      return [];
    }
    const now = Date.now();
    if (this.cache && (now - this.lastFetch < this.CACHE_TTL)) {
      return this.cache;
    }

    try {
      console.log("Fetching leaderboard from external API...");
      const response = await fetch(this.configData.externalApiUrl);
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

  async getAnalytics(): Promise<Analytics> {
    return this.analyticsData;
  }

  async incrementPageViews(): Promise<void> {
    this.analyticsData.pageViews++;
  }

  async incrementDiscordClicks(): Promise<void> {
    this.analyticsData.discordClicks++;
  }

  async getConfig(): Promise<Config> {
    return this.configData;
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    this.configData = { ...this.configData, ...config };
    if (config.externalApiUrl) {
      this.cache = null; // Invalidate cache if API URL changes
    }
    return this.configData;
  }
}

export const storage = new MemStorage();
