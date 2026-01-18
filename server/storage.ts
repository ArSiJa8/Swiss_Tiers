import { type Player, type analytics, type Config, type AnalyticsTrend, analytics, configTable, analyticsTrends, rankHistory } from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, inArray } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getLeaderboard(): Promise<Player[]>;
  getAnalytics(): Promise<typeof analytics.$inferSelect>;
  getAnalyticsTrends(): Promise<AnalyticsTrend[]>;
  incrementPageViews(): Promise<void>;
  incrementDiscordClicks(): Promise<void>;
  getConfig(): Promise<Config>;
  updateConfig(config: Partial<Config>): Promise<Config>;
  getAboutUs(): Promise<string>;
  updateAboutUs(content: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private cache: Player[] | null = null;
  private lastFetch: number = 0;
  private CACHE_TTL = 60 * 1000;

  async getLeaderboard(): Promise<Player[]> {
    const config = await this.getConfig();
    if (config.maintenanceMode === "true") return [];
    
    const now = Date.now();
    if (this.cache && (now - this.lastFetch < this.CACHE_TTL)) return this.cache;

    try {
      const response = await fetch(config.externalApiUrl);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      let players = data as Player[];

      // Calculate current ranks
      const sortedPlayers = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
      const currentRanks = new Map<string, number>();
      sortedPlayers.forEach((p, idx) => {
        currentRanks.set(p.discordId || p.ingameName, idx + 1);
      });

      // Fetch last known ranks
      const playerIds = Array.from(currentRanks.keys());
      const lastRanksRows = playerIds.length > 0 
        ? await db.select().from(rankHistory).where(inArray(rankHistory.playerIdentifier, playerIds))
        : [];
      
      const lastRanks = new Map<string, number>();
      lastRanksRows.forEach(row => lastRanks.set(row.playerIdentifier, row.lastRank));

      // Attach rank change info
      players = players.map(p => {
        const id = p.discordId || p.ingameName;
        const currentRank = currentRanks.get(id) || 0;
        const lastRank = lastRanks.get(id);
        
        return {
          ...p,
          rankChange: lastRank ? lastRank - currentRank : 0
        };
      });

      // Update rank history in background
      const today = new Date().toISOString().split('T')[0];
      const rankEntries = Array.from(currentRanks.entries());
      for (const [id, rank] of rankEntries) {
        await db.insert(rankHistory)
          .values({ playerIdentifier: id, lastRank: rank, lastUpdated: today })
          .onConflictDoUpdate({
            target: rankHistory.playerIdentifier,
            set: { lastRank: rank, lastUpdated: today }
          });
      }

      this.cache = players;
      this.lastFetch = now;
      return this.cache;
    } catch (error) {
      console.error("Fetch error:", error);
      return this.cache || [];
    }
  }

  async getAnalytics(): Promise<typeof analytics.$inferSelect> {
    try {
      const [row] = await db.select().from(analytics).where(eq(analytics.id, 1));
      if (!row) {
        const [newRow] = await db.insert(analytics).values({ id: 1, pageViews: 0, discordClicks: 0 }).onConflictDoNothing().returning();
        if (!newRow) {
          const [existing] = await db.select().from(analytics).where(eq(analytics.id, 1));
          return existing;
        }
        return newRow;
      }
      return row;
    } catch (error) {
      console.error("getAnalytics error:", error);
      const [existing] = await db.select().from(analytics).where(eq(analytics.id, 1));
      return existing;
    }
  }

  async getAnalyticsTrends(): Promise<AnalyticsTrend[]> {
    return await db.select().from(analyticsTrends).orderBy(desc(analyticsTrends.date)).limit(30);
  }

  private async updateTrend(field: 'page_views' | 'discord_clicks'): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    try {
      await db.insert(analyticsTrends)
        .values({ 
          date: today, 
          pageViews: field === 'page_views' ? 1 : 0, 
          discordClicks: field === 'discord_clicks' ? 1 : 0 
        })
        .onConflictDoUpdate({
          target: analyticsTrends.date,
          set: { [field === 'page_views' ? 'pageViews' : 'discordClicks']: sql`${sql.identifier(field)} + 1` }
        });
    } catch (error) {
      console.error("updateTrend error:", error);
    }
  }

  async incrementPageViews(): Promise<void> {
    await db.update(analytics).set({ pageViews: sql`page_views + 1` }).where(eq(analytics.id, 1));
    await this.updateTrend('page_views');
  }

  async incrementDiscordClicks(): Promise<void> {
    await db.update(analytics).set({ discordClicks: sql`discord_clicks + 1` }).where(eq(analytics.id, 1));
    await this.updateTrend('discord_clicks');
  }

  async getConfig(): Promise<Config> {
    try {
      const [row] = await db.select().from(configTable).where(eq(configTable.id, 1));
      if (!row) {
        const [newRow] = await db.insert(configTable).values({ id: 1 }).onConflictDoNothing().returning();
        if (!newRow) {
          const [existing] = await db.select().from(configTable).where(eq(configTable.id, 1));
          return existing;
        }
        return newRow;
      }
      return row;
    } catch (error) {
      console.error("getConfig error:", error);
      const [existing] = await db.select().from(configTable).where(eq(configTable.id, 1));
      return existing;
    }
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    const [updated] = await db.update(configTable).set(config).where(eq(configTable.id, 1)).returning();
    if (config.externalApiUrl) this.cache = null;
    return updated;
  }

  async getAboutUs(): Promise<string> {
    const filePath = path.join(process.cwd(), "about-us.md");
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch {
      return "# About Us\n\nEdit this content in the admin dashboard.";
    }
  }

  async updateAboutUs(content: string): Promise<void> {
    const filePath = path.join(process.cwd(), "about-us.md");
    await fs.writeFile(filePath, content, "utf-8");
  }
}

export const storage = new DatabaseStorage();
