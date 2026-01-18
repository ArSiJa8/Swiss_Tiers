import { pgTable, text, serial, jsonb, integer } from "drizzle-orm/pg-core";
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

// Rank history table to track changes
export const rankHistory = pgTable("rank_history", {
  id: serial("id").primaryKey(),
  playerIdentifier: text("player_identifier").notNull().unique(), // discordId or ingameName
  lastRank: integer("last_rank").notNull(),
  lastUpdated: text("last_updated").notNull(),
});

export const PlayerSchema = z.object({
  discordId: z.string().nullable().optional(),
  discordName: z.string().nullable().optional(),
  ingameName: z.string(),
  totalPoints: z.number(),
  gamemodes: z.record(z.string(), GamemodeStatsSchema.nullable()),
  rankChange: z.number().optional(), // Added for UI tracking
});

export type Player = z.infer<typeof PlayerSchema>;

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  pageViews: integer("page_views").notNull().default(0),
  discordClicks: integer("discord_clicks").notNull().default(0),
});

// Analytics trends table
export const analyticsTrends = pgTable("analytics_trends", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  pageViews: integer("page_views").notNull().default(0),
  discordClicks: integer("discord_clicks").notNull().default(0),
});

export const insertAnalyticsTrendsSchema = createInsertSchema(analyticsTrends);
export type AnalyticsTrend = typeof analyticsTrends.$inferSelect;

// Config table for maintenance mode and other settings
export const configTable = pgTable("config", {
  id: serial("id").primaryKey(),
  maintenanceMode: text("maintenance_mode").notNull().default("false"),
  externalApiUrl: text("external_api_url").notNull().default("https://swiss-tiers-bot-production.up.railway.app/api/leaderboard"),
});

export const insertConfigSchema = createInsertSchema(configTable);
export type Config = typeof configTable.$inferSelect;
export type InsertConfig = z.infer<typeof insertConfigSchema>;
