import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { channels } from "./src/db/schema.js";
import { messages } from "./src/db/schema.js";
import { sql, eq } from "drizzle-orm";

dotenv.config();
const app: Express = express();
const port = process.env.PORT;

import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!);
import bodyParser from "body-parser";
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello there");
});

app.get("/messages", async (req: Request, res: Response) => {
  try {
    const { tags } = req.body;
    const tagsJoined = tags.join(" OR ");

    const results = await db
      .select({
        messageId: messages.id,
        messageText: messages.message,
        channelName: channels.channel_name,
      })
      .from(messages)
      .innerJoin(channels, eq(messages.channel_id, channels.id))
      .where(sql`message @@@ ${tagsJoined}`);

    return res.status(200).json({ success: true, data: results });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, e });
  }
});

app.listen(port, () => {
  console.log(
    `[server]: Server is running at http://localhost:${port || 3000}`
  );
});
