import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
const app: Express = express();
const port = process.env.PORT;

import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!);

app.get("/", (req: Request, res: Response) => {
  res.send("");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
