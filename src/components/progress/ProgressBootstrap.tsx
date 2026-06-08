"use client";

import { useEffect } from "react";
import { hydrate } from "@/lib/store";

/** Loads the signed-in user's progress once on mount. Renders nothing. */
export function ProgressBootstrap() {
  useEffect(() => {
    hydrate();
  }, []);
  return null;
}
