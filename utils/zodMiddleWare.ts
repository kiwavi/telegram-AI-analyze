import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, z } from "zod";

let sources = z.enum(["params", "query", "body"]);

export function validateSchema<T>(
  schema: ZodSchema<T>,
  datasource: z.infer<typeof sources>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let result = schema.parse(req[datasource]);
      req[datasource] = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
