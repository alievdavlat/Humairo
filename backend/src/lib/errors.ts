import { ZodError } from "zod";
import { AppError } from "./error-response";

// Postgres driver error codes -> AppError config.
const PG_ERRORS: Record<
  string,
  { message: string; status: number; code: string }
> = {
  "23505": {
    message: "This record already exists",
    status: 409,
    code: "DUPLICATE",
  },
  "23503": {
    message: "Related record not found",
    status: 400,
    code: "FOREIGN_KEY_VIOLATION",
  },
  "23502": {
    message: "A required field is missing",
    status: 400,
    code: "NOT_NULL_VIOLATION",
  },
};

function hasPgCode(err: unknown): err is { code: string; detail?: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    typeof (err as { code?: unknown }).code === "string"
  );
}

// Convert any thrown value into a single AppError. Early return per case.
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    return new AppError("Validation failed", 422, {
      code: "VALIDATION_ERROR",
      details: err.flatten().fieldErrors,
    });
  }

  if (hasPgCode(err) && PG_ERRORS[err.code]) {
    const pg = PG_ERRORS[err.code];
    return new AppError(pg.message, pg.status, {
      code: pg.code,
      details: err.detail,
    });
  }

  const message =
    err instanceof Error ? err.message : "Unexpected server error";
  return new AppError(message, 500, {
    code: "INTERNAL_ERROR",
    isOperational: false,
  });
}

