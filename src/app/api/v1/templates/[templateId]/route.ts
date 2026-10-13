import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Templates feature has been removed." },
    { status: 404 }
  );
}
