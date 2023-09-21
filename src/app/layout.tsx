import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ModalsProvider } from "@/components/providers/ModalsProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import "./globals.css";

type RootLayoutProps = {
  children: ReactNode;
};

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Discord Clone",
  description: "Application for communicating with friends and family.",
};

const RootLayout = ({ children }: RootLayoutProps) => (
  <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={cn(font.className, "bg-white dark:bg-[#313338]")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SocketProvider>
            {children} <ModalsProvider />
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  </ClerkProvider>
);

export default RootLayout;
