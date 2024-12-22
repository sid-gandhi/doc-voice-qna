import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    key: process.env.DEEPGRAM_API_KEY ?? "",
  });
}
