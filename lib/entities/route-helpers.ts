// Tiny helpers shared by every entity API route. Keeps each route file
// to ~30 lines so the patterns stay obvious.

import { NextResponse } from "next/server"
import { ValidationError } from "./store-base"

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status })
}

export function jsonOk<T>(payload: T, status = 200): NextResponse {
  return NextResponse.json(payload, { status })
}

/// Wraps a route body to convert known errors into HTTP responses.
/// Lets each route stay free of try/catch boilerplate.
export async function withRouteErrors<T>(
  fn: () => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof ValidationError) {
      return jsonError(err.message, 400, { field: err.field })
    }
    if (err instanceof SyntaxError) {
      return jsonError("invalid_json", 400)
    }
    console.error("route_error", err)
    return jsonError("internal_error", 500)
  }
}

/// Best-effort body reader. Returns null if the body isn't JSON or is
/// empty — caller decides whether that's an error.
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}
