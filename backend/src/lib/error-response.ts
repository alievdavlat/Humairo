export type ErrorStatus = "fail" | "error";

interface AppErrorOptions {
  code?: string;
  details?: unknown;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: ErrorStatus;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    options: AppErrorOptions = {},
  ) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = options.isOperational ?? true;
    this.code = options.code;
    this.details = options.details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — malformed / invalid request */
export class BadRequestError extends AppError {
  constructor(message = "Bad request", options?: AppErrorOptions) {
    super(message, 400, { code: "BAD_REQUEST", ...options });
  }
}

/** 401 — not authenticated / invalid token */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", options?: AppErrorOptions) {
    super(message, 401, { code: "UNAUTHORIZED", ...options });
  }
}

/** 403 — authenticated but not allowed */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", options?: AppErrorOptions) {
    super(message, 403, { code: "FORBIDDEN", ...options });
  }
}

/** 404 — resource not found */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", options?: AppErrorOptions) {
    super(message, 404, { code: "NOT_FOUND", ...options });
  }
}

/** 409 — conflict (e.g. email already taken, out of stock) */
export class ConflictError extends AppError {
  constructor(message = "Conflict", options?: AppErrorOptions) {
    super(message, 409, { code: "CONFLICT", ...options });
  }
}

/** 422 — validation failed */
export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 422, { code: "VALIDATION_ERROR", details });
  }
}

/** 402 — payment required / payment failed (ecommerce) */
export class PaymentRequiredError extends AppError {
  constructor(message = "Payment failed", options?: AppErrorOptions) {
    super(message, 402, { code: "PAYMENT_REQUIRED", ...options });
  }
}

/** 429 — too many requests */
export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests", options?: AppErrorOptions) {
    super(message, 429, { code: "TOO_MANY_REQUESTS", ...options });
  }
}

/** 500 — internal server error */
export class InternalServerError extends AppError {
  constructor(message = "Internal server error", options?: AppErrorOptions) {
    super(message, 500, {
      code: "INTERNAL_ERROR",
      isOperational: false,
      ...options,
    });
  }
}

/** 502 - bad gate away error */
export class BadGatewayError extends AppError {
  constructor(message = "Service unavailable", options?: AppErrorOptions) {
    super(message, 503, { code: "BAD_GATEAWAY", ...options });
  }
}
/** 503 — service unavailable */
export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", options?: AppErrorOptions) {
    super(message, 503, { code: "SERVICE_UNAVAILABLE", ...options });
  }
}
