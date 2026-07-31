import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  success: false;
  error: {
    message: string;
    details?: unknown;
  };
};

export function apiSuccess<T>(
  data: T,
  options?: { message?: string; meta?: Record<string, unknown>; status?: number }
) {
  const body: ApiSuccess<T> = { success: true, data };
  if (options?.message) body.message = options.message;
  if (options?.meta) body.meta = options.meta;
  return NextResponse.json(body, { status: options?.status ?? 200 });
}

export function apiError(
  message: string,
  status = 400,
  details?: unknown
) {
  const body: ApiFailure = { success: false, error: { message, details } };
  return NextResponse.json(body, { status });
}

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Wraps a Route Handler so every endpoint returns the same JSON envelope
 * and error status codes, instead of repeating try/catch everywhere.
 */
export function withApiHandler<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return apiError("Validation failed", 422, err.flatten());
      }
      if (err instanceof HttpError) {
        return apiError(err.message, err.status, err.details);
      }
      if (err instanceof SyntaxError) {
        // Thrown by request.json() on a malformed/empty body — a client
        // mistake, not a server fault.
        return apiError("Invalid JSON in request body", 400);
      }
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code: unknown }).code === "string" &&
        (err as { code: string }).code.startsWith("P")
      ) {
        // Prisma known request errors — these represent normal, foreseeable
        // outcomes of admin actions (duplicate value, stale reference, missing
        // row), never a server fault, so none of them should surface as a 500.
        const prismaErr = err as { code: string; meta?: { target?: string[]; field_name?: string } };
        const code = prismaErr.code;
        const field = prismaErr.meta?.target?.join(", ") || prismaErr.meta?.field_name;

        if (code === "P2002") {
          return apiError(
            field ? `A record with this ${field} already exists` : "A record with this value already exists",
            409
          );
        }
        if (code === "P2025") {
          return apiError("Record not found", 404);
        }
        if (code === "P2003") {
          return apiError(
            field
              ? `This action is blocked because "${field}" is still referenced by other records`
              : "This action is blocked because the record is still referenced by other data",
            409
          );
        }
        if (code === "P2011" || code === "P2012") {
          return apiError(
            field ? `"${field}" is required` : "A required field is missing",
            422
          );
        }
        if (code === "P2000") {
          return apiError(
            field ? `The value provided for "${field}" is too long` : "A field value is too long",
            422
          );
        }
        // Any other Prisma request error is still a normal (non-crash) outcome —
        // report it as a client-facing conflict rather than an opaque 500.
        console.error("[prisma-error]", code, err);
        return apiError("The request could not be completed", 409);
      }

      if (err instanceof Error && err.name === "PrismaClientValidationError") {
        console.error("[prisma-validation-error]", err.message);
        return apiError("Database schema mismatch. Please restart your dev server.", 422);
      }

      console.error("[api-error]", err);
      return apiError("Internal server error", 500);
    }
  };
}
