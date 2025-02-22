import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

import { NowPlayingContextProvider } from "react-nowplaying";
import { DeepgramContextProvider } from "@/context/DeepgramContextProvider";
import { MicrophoneContextProvider } from "@/context/MicrophoneContextProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAG VOICE AI",
  description: "Talk to your documents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MicrophoneContextProvider>
          <NowPlayingContextProvider>
            <DeepgramContextProvider>{children}</DeepgramContextProvider>
          </NowPlayingContextProvider>
        </MicrophoneContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
