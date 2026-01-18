import { type Player, type Analytics, type Config, type AnalyticsTrend, analytics, configTable, analyticsTrends } from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getLeaderboard(): Promise<Player[]>;
  getAnalytics(): Promise<Analytics>;
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
      this.cache = data as Player[];
      this.lastFetch = now;
      return this.cache;
    } catch (error) {
      console.error("Fetch error:", error);
      return this.cache || [];
    }
  }

  async getAnalytics(): Promise<Analytics> {
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
