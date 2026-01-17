import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import path from "path";
import fs from "fs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve about-us.md
  app.get("/about-us.md", (req, res) => {
    const filePath = path.join(process.cwd(), "about-us.md");
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Not Found");
    }
  });

  app.get(api.leaderboard.list.path, async (req, res) => {
    try {
      const data = await storage.getLeaderboard();
      res.json(data);
    } catch (error) {
      console.error("Route error:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/analytics/page-view", async (req, res) => {
    await storage.incrementPageViews();
    res.sendStatus(200);
  });

  app.post("/api/analytics/discord-click", async (req, res) => {
    await storage.incrementDiscordClicks();
    res.sendStatus(200);
  });

  app.get("/api/config", async (req, res) => {
    const data = await storage.getConfig();
    res.json({ maintenanceMode: data.maintenanceMode });
  });

  app.get("/api/admin/analytics", async (req, res) => {
    const password = req.query.password;
    if (password !== "Navlis_11") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await storage.getAnalytics();
    res.json(data);
  });

  app.get("/api/admin/config", async (req, res) => {
    const password = req.query.password;
    if (password !== "Navlis_11") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await storage.getConfig();
    res.json(data);
  });

  app.get("/api/admin/about", async (req, res) => {
    const password = req.query.password;
    if (password !== "Navlis_11") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const content = await storage.getAboutUs();
    res.json({ content });
  });

  app.post("/api/admin/about", async (req, res) => {
    const password = req.query.password;
    if (password !== "Navlis_11") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await storage.updateAboutUs(req.body.content);
    res.sendStatus(200);
  });

  app.post("/api/admin/config", async (req, res) => {
    const password = req.query.password;
    if (password !== "Navlis_11") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const config = req.body;
    const data = await storage.updateConfig(config);
    res.json(data);
  });

  return httpServer;
}
