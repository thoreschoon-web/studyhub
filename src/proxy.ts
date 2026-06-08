export { auth as proxy } from "@/auth.proxy";

export const config = {
  // Gate everything except API routes, Next internals, static files, and the auth pages.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|register).*)"],
};
