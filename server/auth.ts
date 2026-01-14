import bcrypt from "bcrypt";
import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

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
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
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

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = (process.env.ADMIN_EMAIL || "tech@sereniteo.fr").trim();
  // Hash for password: Xk9#mTp2$vLq7@Rn5W
  const adminPasswordHash = "$2b$12$Av5smn8VO0MaUxr5XSU7XuM5JcFB2Fcha2GhhxQdJP2vYBzs.jMcy";

  if (email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
    console.log("Email mismatch");
    return false;
  }

  try {
    const result = await bcrypt.compare(password, adminPasswordHash);
    if (!result) {
      console.log("Password mismatch");
    }
    return result;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}
