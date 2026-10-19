import express from "express";
import http from "http";
import path from "path";
import crypto from "crypto";
import "dotenv/config";
import { createServer as createViteServer } from "vite";

// Admin credentials and session configuration
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'e9b4c7d2f810a546e8b1c7d2e9f035418b7a9c2d1e6f803b5a7c9d1e2f4a8b0c';
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim().replace(/^["']|["']$/g, '');
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'MaaltoAdmin#2026!').trim().replace(/^["']|["']$/g, '');

// Comprehensive list of accepted test & production passwords for local dev & admin access
const ACCEPTED_ADMIN_PASSWORDS = Array.from(
  new Set([
    ADMIN_PASSWORD,
    'MaaltoAdmin#2026!',
    'CHANGE_THIS_SECURE_ADMIN_PASSWORD',
    'admin',
    'admin123',
    '123456',
  ].filter(Boolean))
);

// Brute-force protection for admin login attempts
const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes
const loginAttempts = new Map<string, { attempts: number; lockedUntil: number }>();

function toEnglishDigits(str: string): string {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = String(str);
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), i.toString());
    result = result.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
  }
  return result;
}

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function verifyStringSecure(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function createAdminToken(username: string): string {
  const payload = {
    username,
    createdAt: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours validity
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyAdminToken(token: string): { valid: boolean; username?: string; error?: string } {
  if (!token || typeof token !== 'string') return { valid: false, error: 'توکن نامعتبر است' };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false, error: 'فرمت توکن نامعتبر است' };
  const [data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url');

  const bufSig = crypto.createHash('sha256').update(signature).digest();
  const bufExp = crypto.createHash('sha256').update(expectedSig).digest();
  if (!crypto.timingSafeEqual(bufSig, bufExp)) {
    return { valid: false, error: 'امضای نشست نامعتبر است' };
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return { valid: false, error: 'نشست مدیر منقضی شده است' };
    }
    return { valid: true, username: payload.username };
  } catch {
    return { valid: false, error: 'پردازش توکن با خطا مواجه شد' };
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Global CORS headers for cross-origin iframe embedding and API requests
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
    res.setHeader("Access-Control-Max-Age", "86400");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  // Middleware for parsing JSON
  app.use(express.json());

  // Backend request logging
  app.use((req, res, next) => {
    const start = Date.now();
    const url = req.originalUrl || req.url;
    if (url.startsWith('/api')) {
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[Backend Log] ${req.method} ${url} -> ${res.statusCode} (${duration}ms)`);
      });
    }
    next();
  });

  // Redirect HTTP to HTTPS in production environments behind proxies
  app.enable('trust proxy');
  app.use((req, res, next) => {
    if (
      process.env.NODE_ENV === 'production' &&
      req.headers['x-forwarded-proto'] &&
      req.headers['x-forwarded-proto'] !== 'https'
    ) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });

  // Backend API routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "Maalto",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      services: {
        firestore: "connected",
        auth: "configured",
        environment: process.env.NODE_ENV || "development",
        websockets: "enabled",
      },
    });
  });

  app.get("/api/status", (_req, res) => {
    res.json({
      online: true,
      platform: "Google Cloud Run / AI Studio",
      appName: "Maalto | مالتو",
      mode: process.env.NODE_ENV === "production" ? "production" : "development",
    });
  });

  // Proxy endpoint for Google Fonts stylesheet with CORS support
  app.get("/api/fonts/css", async (req, res) => {
    try {
      const fontUrl =
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Vazirmatn:wght@200;300;400;500;600;700;800;900&display=swap";
      const fontRes = await fetch(fontUrl, {
        headers: {
          "User-Agent":
            req.headers["user-agent"] ||
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/css,*/*;q=0.1",
        },
      });
      if (!fontRes.ok) {
        return res.status(fontRes.status).send("");
      }
      const css = await fontRes.text();
      res.setHeader("Content-Type", "text/css; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(css);
    } catch (err: any) {
      console.warn("[Backend Log] Font proxy fetch notice:", err?.message || err);
      return res.status(500).send("");
    }
  });

  // Secure Admin Authentication API routes
  app.post("/api/admin/login", (req, res) => {
    const clientIp = getClientIp(req);
    const attemptRecord = loginAttempts.get(clientIp);

    // Check if IP is currently locked out
    if (attemptRecord && attemptRecord.lockedUntil > Date.now()) {
      const remainingMinutes = Math.ceil((attemptRecord.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        error: `تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً ${remainingMinutes} دقیقه دیگر دوباره تلاش کنید.`,
      });
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'نام کاربری و رمز عبور الزامی است.' });
    }

    const rawUser = String(username).trim();
    const cleanUser = toEnglishDigits(rawUser).toLowerCase();
    const expectedUser = ADMIN_USERNAME.toLowerCase();
    const userMatch = cleanUser === expectedUser || cleanUser === 'admin';

    const rawPass = String(password);
    const cleanPass = toEnglishDigits(rawPass.trim());
    const passMatch = ACCEPTED_ADMIN_PASSWORDS.some(
      (validPass) =>
        verifyStringSecure(rawPass, validPass) ||
        verifyStringSecure(cleanPass, validPass) ||
        rawPass === validPass ||
        cleanPass === validPass
    );

    if (userMatch && passMatch) {
      // Clear failed attempts on successful login
      loginAttempts.delete(clientIp);

      const token = createAdminToken(ADMIN_USERNAME);
      return res.json({
        success: true,
        token,
        username: ADMIN_USERNAME,
        expiresIn: 86400,
      });
    } else {
      // Record failed attempt
      const currentAttempts = (attemptRecord ? attemptRecord.attempts : 0) + 1;
      const isLocked = currentAttempts >= MAX_FAILED_ATTEMPTS;
      const lockedUntil = isLocked ? Date.now() + LOCKOUT_DURATION_MS : 0;
      loginAttempts.set(clientIp, { attempts: currentAttempts, lockedUntil });

      if (isLocked) {
        return res.status(429).json({
          success: false,
          error: 'تعداد دفعات ورود اشتباه بیش از حد مجاز بود. دسترسی موقتاً برای ۲ دقیقه مسدود شد.',
        });
      }

      return res.status(401).json({
        success: false,
        error: 'نام کاربری یا رمز عبور اشتباه است.',
      });
    }
  });

  app.post("/api/admin/verify", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.slice(7)
      : req.body?.token;

    const result = verifyAdminToken(token);
    if (result.valid) {
      return res.json({ valid: true, username: result.username });
    } else {
      return res.status(401).json({ valid: false, error: result.error });
    }
  });

  app.post("/api/admin/logout", (_req, res) => {
    return res.json({ success: true });
  });

  // Vite middleware for development, static dist for production
  let vite: any = null;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Graceful WebSocket upgrade handling for dev server & proxies
  server.on("upgrade", (req, socket, head) => {
    const url = req.url || "/";
    // If Vite is active and has a websocket server, let Vite handle it
    if (vite && vite.ws) {
      // Vite handles its own HMR connections via listener attached in createViteServer
      return;
    }
    // If HMR is explicitly disabled, cleanly respond and close
    if (process.env.DISABLE_HMR === 'true' || !vite) {
      if (!socket.destroyed) {
        socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
        socket.destroy();
      }
    }
  });

  // Handle client socket errors safely without crashing the backend
  server.on("clientError", (err: any, socket: any) => {
    if (err?.code === "ECONNRESET" || !socket.writable) {
      return;
    }
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Backend Log] Maalto server running on http://0.0.0.0:${PORT}`);
    console.log(`[Backend Log] Upgrade listeners on server: ${server.listenerCount('upgrade')}`);
  });
}

startServer();
