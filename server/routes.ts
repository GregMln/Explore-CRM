import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { isAuthenticated, isEmailAllowed, createMagicLinkToken, verifyMagicToken } from "./auth";
import { sendMagicLinkEmail } from "./email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Magic link authentication
  app.post("/api/auth/magic-link", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Email requis" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      
      // Always return success to prevent email enumeration
      if (!isEmailAllowed(normalizedEmail)) {
        console.log(`Magic link request for non-allowed email: ${normalizedEmail}`);
        return res.json({ success: true, message: "Si cet email est autorisé, vous recevrez un lien de connexion." });
      }

      const token = await createMagicLinkToken(normalizedEmail);
      
      if (!token) {
        return res.status(500).json({ error: "Erreur lors de la création du lien" });
      }

      const baseUrl = process.env.APP_BASE_URL || `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
      const magicLink = `${baseUrl}/magic?token=${token}`;
      
      const emailSent = await sendMagicLinkEmail(normalizedEmail, magicLink);
      
      if (!emailSent) {
        console.error("Failed to send magic link email");
      }

      res.json({ success: true, message: "Si cet email est autorisé, vous recevrez un lien de connexion." });
    } catch (error) {
      console.error("Magic link error:", error);
      res.status(500).json({ error: "Erreur lors de l'envoi du lien" });
    }
  });

  app.post("/api/auth/magic-link/verify", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: "Token requis" });
      }

      const email = await verifyMagicToken(token);
      
      if (!email) {
        return res.status(401).json({ error: "Lien invalide ou expiré" });
      }

      req.session.isAuthenticated = true;
      req.session.userEmail = email;
      
      res.json({ success: true, email });
    } catch (error) {
      console.error("Magic link verify error:", error);
      res.status(500).json({ error: "Erreur de vérification" });
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
