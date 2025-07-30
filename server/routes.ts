import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPhotoSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create photo session
  app.post("/api/photo-sessions", async (req, res) => {
    try {
      const sessionData = insertPhotoSessionSchema.parse(req.body);
      const session = await storage.createPhotoSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create session" });
      }
    }
  });

  // Get photo session
  app.get("/api/photo-sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getPhotoSession(sessionId);
      
      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to get session" });
    }
  });

  // Update photo session
  app.patch("/api/photo-sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      
      const session = await storage.updatePhotoSession(sessionId, updates);
      
      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Delete photo session
  app.delete("/api/photo-sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const deleted = await storage.deletePhotoSession(sessionId);
      
      if (!deleted) {
        res.status(404).json({ message: "Session not found" });
        return;
      }
      
      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
