import { NextResponse, type NextRequest } from "next/server";

export type ListParams = {
  page: number;
  limit: number;
  search: string | null;
};

export function parseListParams(request: NextRequest): ListParams {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "10");
  const search = url.searchParams.get("search");

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    search
  };
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, init);
}

export function created<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 201 });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export function errorResponse(message: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: status,
        message,
        details
      }
    },
    { status }
  );
}
