import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  email: text("email"),
  telephone: text("telephone"),
  mobile: text("mobile"),
  adresse: text("adresse"),
  statut: text("statut"),
  consultant: text("consultant"),
  commentaires: text("commentaires"),
  date_creation: text("date_creation"),
  scpi: text("scpi"),
  marketing: text("marketing"),
  montant: integer("montant"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
