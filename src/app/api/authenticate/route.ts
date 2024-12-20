import { NextResponse, type NextRequest } from "next/server";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  return NextResponse.json({
    key: process.env.DEEPGRAM_API_KEY ?? "",
  });
}
