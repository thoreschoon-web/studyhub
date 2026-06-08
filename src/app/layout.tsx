import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { auth } from "@/auth";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { ProgressBootstrap } from "@/components/progress/ProgressBootstrap";
import { UpgradeModal } from "@/components/billing/UpgradeModal";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono-jb", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "StudyHub — Deine Lernplattform",
  description: "Lernmaterial für die Wirtschaftswissenschaften · Sommersemester 2026 · Leibniz Universität Hannover.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const loggedIn = !!session?.user;

  return (
    <html lang="de" className={`${inter.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('studyhub.theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
        <SessionProvider session={session}>
          {loggedIn ? (
            <>
              <div className="lg:grid lg:grid-cols-[272px_1fr] min-h-screen">
                <Sidebar />
                <div className="flex min-h-screen flex-col">
                  <MobileTopBar />
                  <main className="flex-1">{children}</main>
                </div>
              </div>
              <ProgressBootstrap />
              <UpgradeModal />
            </>
          ) : (
            <main className="min-h-screen">{children}</main>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
