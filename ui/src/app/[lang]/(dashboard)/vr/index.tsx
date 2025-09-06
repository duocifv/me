
import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const filePath = join(process.cwd(), "public", "vr.html");
  const html = readFileSync(filePath, "utf8");

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
