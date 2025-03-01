import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // All routes are now accessible without authentication
  return;
}

export const config = {
  matcher: [],
};
