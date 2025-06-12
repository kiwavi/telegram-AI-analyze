import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { z, ZodError } from "zod";

dotenv.config();
const app: Express = express();
const port = process.env.PORT;

import { drizzle } from "drizzle-orm/node-postgres";
import { StatusCodes } from "http-status-codes";

export const db = drizzle(process.env.DATABASE_URL!);

const searchSchema = z.array(z.string());

function validateData(schema: z.ZodArray<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body.tags);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.length ? issue.path.join(".") : "Value"} is ${
            issue.message
          }`,
        }));
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid data", details: errorMessages });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal Server Error" });
      }
    }
  };
}

app.get("/", (req: Request, res: Response) => {
  res.send("Hello there");
});

app.get(
  "/messages",
  validateData(searchSchema),
  async (req: Request, res: Response) => {
    const searchTerms: string[] = req.body;
    try {
      console.log(req.body);
      return res.status(200).json({ success: true });
    } catch (e) {
      console.log(e);
    }
  }
);

app.listen(port, () => {
  console.log(
    `[server]: Server is running at http://localhost:${port || 3000}`
  );
});
