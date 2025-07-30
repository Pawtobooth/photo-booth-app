import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const photoSessions = pgTable("photo_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull().unique(),
  printFormat: text("print_format").notNull(), // '4r-grid' | 'photo-strip'
  backgroundColor: text("background_color").notNull(), // 'white' | 'black'
  copyCount: integer("copy_count").notNull().default(1),
  photos: jsonb("photos").notNull(), // Array of photo data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPhotoSessionSchema = createInsertSchema(photoSessions).pick({
  sessionId: true,
  printFormat: true,
  backgroundColor: true,
  copyCount: true,
  photos: true,
});

export type InsertPhotoSession = z.infer<typeof insertPhotoSessionSchema>;
export type PhotoSession = typeof photoSessions.$inferSelect;
