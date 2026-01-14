import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { isAuthenticated, verifyCredentials } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
      }

      const isValid = await verifyCredentials(email, password);
      
      if (isValid) {
        req.session.isAuthenticated = true;
        req.session.userEmail = email;
        res.json({ success: true, email });
      } else {
        res.status(401).json({ error: "Identifiants invalides" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Erreur de connexion" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Erreur de déconnexion" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    res.json({
      isAuthenticated: !!req.session.isAuthenticated,
      email: req.session.userEmail || null,
    });
  });

  app.get("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const { search, statut, consultant, scpi, annee } = req.query;
      
      let result;
      
      if (search && typeof search === 'string') {
        result = await storage.searchContacts(search);
      } else if (statut || consultant || scpi || annee) {
        result = await storage.filterContacts({
          statut: statut as string | undefined,
          consultant: consultant as string | undefined,
          scpi: scpi as string | undefined,
          annee: annee as string | undefined,
        });
      } else {
        result = await storage.getAllContacts();
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  app.get("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContactById(id);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      res.json(contact);
    } catch (error) {
      console.error('Error fetching contact:', error);
      res.status(500).json({ error: 'Failed to fetch contact' });
    }
  });

  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  app.post("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(400).json({ error: 'Invalid contact data' });
    }
  });

  return httpServer;
}
