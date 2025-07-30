import { type PhotoSession, type InsertPhotoSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createPhotoSession(session: InsertPhotoSession): Promise<PhotoSession>;
  getPhotoSession(sessionId: string): Promise<PhotoSession | undefined>;
  updatePhotoSession(sessionId: string, updates: Partial<InsertPhotoSession>): Promise<PhotoSession | undefined>;
  deletePhotoSession(sessionId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, PhotoSession>;

  constructor() {
    this.sessions = new Map();
  }

  async createPhotoSession(insertSession: InsertPhotoSession): Promise<PhotoSession> {
    const id = randomUUID();
    const session: PhotoSession = {
      ...insertSession,
      id,
      copyCount: insertSession.copyCount || 1,
      createdAt: new Date(),
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  async getPhotoSession(sessionId: string): Promise<PhotoSession | undefined> {
    return Array.from(this.sessions.values()).find(
      (session) => session.sessionId === sessionId,
    );
  }

  async updatePhotoSession(sessionId: string, updates: Partial<InsertPhotoSession>): Promise<PhotoSession | undefined> {
    const session = await this.getPhotoSession(sessionId);
    if (!session) return undefined;

    const updatedSession: PhotoSession = { ...session, ...updates };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async deletePhotoSession(sessionId: string): Promise<boolean> {
    const session = await this.getPhotoSession(sessionId);
    if (!session) return false;
    
    this.sessions.delete(sessionId);
    return true;
  }
}

export const storage = new MemStorage();
