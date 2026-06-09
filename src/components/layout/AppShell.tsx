"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { Footer } from "@/components/layout/Footer";
import { ProgressBootstrap } from "@/components/progress/ProgressBootstrap";
import { UpgradeModal } from "@/components/billing/UpgradeModal";

// Routes that render WITHOUT the app shell (sidebar/nav).
const BARE_ROUTES = new Set(["/login", "/register", "/passwort-vergessen", "/passwort-reset", "/verifizieren"]);

/**
 * Decides bare vs. app-shell layout client-side (so anonymous browsing pages get
 * the shell, while /login and /register stay bare). The `loggedIn` prop is the
 * server-rendered seed (avoids hydration mismatch); useSession() takes over after.
 * Progress hydration + the free-tier UpgradeModal mount only for logged-in users.
 */
export function AppShell({ loggedIn, children }: { loggedIn: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated" ? true : status === "unauthenticated" ? false : loggedIn;

  if (pathname && BARE_ROUTES.has(pathname)) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-[272px_1fr] min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-col">
          <MobileTopBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
      {isLoggedIn && (
        <>
          <ProgressBootstrap />
          <UpgradeModal />
        </>
      )}
    </>
  );
}
