import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supportedLocales = ["en", "de"];

  const pathnameParts = pathname.split("/");
  const firstSegment = pathnameParts[1];

  if (!supportedLocales.includes(firstSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next).*)"],
};
