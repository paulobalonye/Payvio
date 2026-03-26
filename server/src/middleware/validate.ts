import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod/v4";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const err = new Error("Validation failed");
      err.name = "ZodError";
      (err as any).issues = result.error.issues;
      next(err);
      return;
    }
    req[source] = result.data;
    next();
  };
}
