import express from "express";
import { ResponseHandler } from "./utils/response.handler";
import sourcesRouter from "./routes/sources.routes";
import { CacheManager } from "./utils/cache_manager";

const app = express();
const port = 3000;

export let cacheManager: CacheManager = new CacheManager();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/api", sourcesRouter);

app.get("/", (req, res) => {
  return ResponseHandler.success(res, {
    message: "🎉 Welcome to Uni-Scrapper API! 🎉",
    description: "A Collection of Scrappers for movies and tv shows",
    version: "1.0.0",
    status: "✅ Active",
    timestamp: new Date().toISOString(),
    documentation: {
      baseUrl: `http://localhost:${port}`,
      endpoints: {
        search: {
          method: "POST",
          url: "/api/search",
        },
        streams: {
          method: "POST",
          url: "/api/streams",
        },
        details: {
          method: "POST",
          url: "/api/details",
        },
      },
    },
  });
});

app.listen(port, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║        🚀 Uni-Scrapper API 🚀        ║
  ╠══════════════════════════════════════╣
  ║  Server Status: ✅ Running           ║
  ║  Port: ${port}                            ║
  ║  URL: http://localhost:${port}         ║
  ║                                      ║
  ║  Available Routes:                   ║
  ║  • POST /api/search                  ║
  ║  • POST /api/streams                 ║
  ║  • POST /api/details                 ║
  ║  • GET  /                            ║
  ║                                      ║
  ║  Ready to serve requests! 🎯         ║
  ╚══════════════════════════════════════╝
  `);
});
