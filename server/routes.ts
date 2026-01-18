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
    const trends = await storage.getAnalyticsTrends();
    res.json({ ...data, trends });
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

  app.get("/sitemap.xml", async (req, res) => {
    try {
      const players = await storage.getLeaderboard();
      const baseUrl = `https://${req.get("host")}`;
      
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  ${players.map(player => `
  <url>
    <loc>${baseUrl}/?player=${encodeURIComponent(player.ingameName)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Sitemap error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  return httpServer;
}
