import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.leaderboard.list.path, async (req, res) => {
    try {
      const data = await storage.getLeaderboard();
      res.json(data);
    } catch (error) {
      console.error("Route error:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  return httpServer;
}
