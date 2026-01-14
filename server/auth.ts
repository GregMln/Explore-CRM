import crypto from "crypto";
import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import connectPgSimple from "connect-pg-simple";
import { pool, db } from "./db";
import { magicLinkTokens } from "@shared/schema";
import { eq, and, isNull, gt } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    isAuthenticated: boolean;
    userEmail: string;
  }
}

const PgSession = connectPgSimple(session);

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "crm-secret-key-change-in-production";
  
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days for persistent session
      },
    })
  );
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.status(401).json({ error: "Non authentifié" });
}

// Allowed emails that can receive magic links
const ALLOWED_EMAILS = [
  "tech@sereniteo.fr",
  // Add more allowed emails here
];

export function isEmailAllowed(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.trim().toLowerCase());
}

export function generateMagicToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

export async function createMagicLinkToken(email: string): Promise<string | null> {
  const { token, tokenHash } = generateMagicToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  try {
    await db.insert(magicLinkTokens).values({
      email: email.trim().toLowerCase(),
      tokenHash,
      expiresAt,
    });
    return token;
  } catch (error) {
    console.error("Failed to create magic link token:", error);
    return null;
  }
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  try {
    const result = await db
      .select()
      .from(magicLinkTokens)
      .where(
        and(
          eq(magicLinkTokens.tokenHash, tokenHash),
          isNull(magicLinkTokens.consumedAt),
          gt(magicLinkTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const tokenRecord = result[0];

    // Mark token as consumed
    await db
      .update(magicLinkTokens)
      .set({ consumedAt: new Date() })
      .where(eq(magicLinkTokens.id, tokenRecord.id));

    return tokenRecord.email;
  } catch (error) {
    console.error("Failed to verify magic token:", error);
    return null;
  }
}
