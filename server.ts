import express from "express";
import path from "path";
import fetch from "node-fetch";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Proxy Route
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'SwiftRead-RSVP/1.0 (Gutendex integration)'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch from target: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      const content = await response.text();

      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      res.send(content);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch content from the provided URL" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
