import { createClient } from "@deepgram/sdk";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;

export async function POST(request: NextRequest) {
  // gotta use the request object to invalidate the cache every request :vomit:

  console.log("here speak req");

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

  const model = "aura-zeus-en";
  const message = await request.json();

  console.log(model, message);

  const result = await deepgram.speak.request(message, { model });

  const stream = await result.getStream();
  const headers = await result.getHeaders();

  const response = new NextResponse(stream, { headers });
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set(
    "Cache-Control",
    "s-maxage=0, no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Expires", "0");

  return response;
}
