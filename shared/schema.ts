import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Cache table to store the external API response
export const leaderboardCache = pgTable("leaderboard_cache", {
  id: serial("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertLeaderboardCacheSchema = createInsertSchema(leaderboardCache);
export type LeaderboardCache = typeof leaderboardCache.$inferSelect;
export type InsertLeaderboardCache = z.infer<typeof insertLeaderboardCacheSchema>;

// API Response Types matching the external API
export const GamemodeStatsSchema = z.object({
  rank: z.string(),
  points: z.number(),
  extra: z.any().optional(),
});

export const PlayerSchema = z.object({
  discordName: z.string().nullable().optional(),
  ingameName: z.string(),
  totalPoints: z.number(),
  gamemodes: z.record(z.string(), GamemodeStatsSchema.nullable()),
});

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  pageViews: serial("page_views"),
  discordClicks: serial("discord_clicks"),
});

export const insertAnalyticsSchema = createInsertSchema(analytics);
// Config table for maintenance mode and other settings
export const configTable = pgTable("config", {
  id: serial("id").primaryKey(),
  maintenanceMode: text("maintenance_mode").notNull().default("false"),
  externalApiUrl: text("external_api_url").notNull().default("https://swiss-tiers-bot-production.up.railway.app/api/leaderboard"),
});

export const insertConfigSchema = createInsertSchema(configTable);
export type Config = typeof configTable.$inferSelect;
export type InsertConfig = z.infer<typeof insertConfigSchema>;
