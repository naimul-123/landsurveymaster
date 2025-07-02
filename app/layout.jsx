"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-1 h-screen flex-col bg-[#F5F5F5]">
          <QueryClientProvider client={queryClient}>
            <main className="flex grow w-full">
              <Navbar />
              {children}

            </main>
          </QueryClientProvider>

          <footer className="flex py-4 bg-[#FCFCFC] gap-[24px] flex-wrap items-center justify-center">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Learn
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              Examples
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />
              Go to nextjs.org →
            </a>
          </footer>
        </div>
        <Toaster position="top-right" toastOptions={{
          // ✅ শুধুমাত্র error toast এর জন্য styling
          error: {
            duration: 4000,
            icon: '🚫',
            style: {
              fontSize: '14px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #f87171',
              background: '#fef2f2',
              color: '#b91c1c',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            },
          },
        }} />
      </body>
    </html>
  );
}
