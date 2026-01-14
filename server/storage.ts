import { type User, type InsertUser, type Contact, type InsertContact, users, contacts } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, ilike, or, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllContacts(): Promise<Contact[]>;
  getContactById(id: number): Promise<Contact | undefined>;
  searchContacts(query: string): Promise<Contact[]>;
  filterContacts(filters: {
    statut?: string;
    consultant?: string;
    scpi?: string;
    annee?: string;
  }): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  getStats(): Promise<{
    total: number;
    clients: number;
    prospects: number;
    consultants: Record<string, number>;
    scpi: Record<string, number>;
    annees: Record<string, number>;
  }>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContactById(id: number): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id));
    return result[0];
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(contacts).where(
      or(
        ilike(contacts.nom, searchTerm),
        ilike(contacts.email, searchTerm),
        ilike(contacts.telephone, searchTerm),
        ilike(contacts.mobile, searchTerm),
        ilike(contacts.adresse, searchTerm),
        ilike(contacts.commentaires, searchTerm)
      )
    );
  }

  async filterContacts(filters: {
    statut?: string;
    consultant?: string;
    scpi?: string;
    annee?: string;
  }): Promise<Contact[]> {
    const conditions = [];
    
    if (filters.statut) {
      conditions.push(eq(contacts.statut, filters.statut));
    }
    if (filters.consultant) {
      conditions.push(ilike(contacts.consultant, `%${filters.consultant}%`));
    }
    if (filters.scpi) {
      conditions.push(ilike(contacts.scpi, `%${filters.scpi}%`));
    }
    if (filters.annee) {
      conditions.push(ilike(contacts.date_creation, `%${filters.annee}%`));
    }

    if (conditions.length === 0) {
      return await this.getAllContacts();
    }

    return await db.select().from(contacts).where(and(...conditions));
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contact).returning();
    return result[0];
  }

  async getStats(): Promise<{
    total: number;
    clients: number;
    prospects: number;
    consultants: Record<string, number>;
    scpi: Record<string, number>;
    annees: Record<string, number>;
  }> {
    const allContacts = await this.getAllContacts();
    
    const stats = {
      total: allContacts.length,
      clients: allContacts.filter(c => c.statut === 'Client').length,
      prospects: allContacts.filter(c => c.statut === 'Prospect').length,
      consultants: {} as Record<string, number>,
      scpi: {} as Record<string, number>,
      annees: {} as Record<string, number>,
    };

    allContacts.forEach(contact => {
      if (contact.consultant) {
        stats.consultants[contact.consultant] = (stats.consultants[contact.consultant] || 0) + 1;
      }
      
      if (contact.scpi) {
        contact.scpi.split(' - ').forEach(s => {
          const scpiName = s.trim();
          stats.scpi[scpiName] = (stats.scpi[scpiName] || 0) + 1;
        });
      }
      
      if (contact.date_creation) {
        const yearMatch = contact.date_creation.match(/(\d{4})/);
        if (yearMatch) {
          const year = yearMatch[1];
          stats.annees[year] = (stats.annees[year] || 0) + 1;
        }
      }
    });

    return stats;
  }
}

export const storage = new DbStorage();
