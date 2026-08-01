import express from "express";
import path from "path";
import fs from "fs";

export function loadPublic(app: express.Application) {
  const publicDir = path.join(process.cwd(), "public");
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get("*", (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.method !== "GET" && req.method !== "HEAD") {
        next();
        return;
      }

      if (req.path.startsWith("/api") || req.path.startsWith("/webhook")) {
        next();
        return;
      }
      res.sendFile(path.join(publicDir, "index.html"),(err) => next(err));
    });
  }
}
