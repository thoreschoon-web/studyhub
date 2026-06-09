"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGateCard } from "@/components/billing/AuthGate";

const KEY = "studyhub.anonTopics";
const LIMIT = 3;

/**
 * Client-side soft gate for anonymous users: after viewing LIMIT distinct topic
 * pages, the next NEW topic shows a blocking sign-in overlay. Re-visits are free.
 * Tracked in localStorage — circumvention by refresh/clear is acceptable by design.
 * Mounted only on the anonymous branch of the topic page.
 */
export function AnonTopicGate({ topicId }: { topicId: string }) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let list: string[] = [];
    try {
      const raw = localStorage.getItem(KEY);
      list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }
    if (list.includes(topicId)) return; // re-visit is free
    if (list.length >= LIMIT) {
      // Einmaliger Post-Hydration-Sync aus localStorage (SSR kennt den Zähler nicht).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBlocked(true);
      return;
    }
    list.push(topicId);
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }, [topicId]);

  // Lock background scroll while the gate is shown.
  useEffect(() => {
    if (!blocked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [blocked]);

  if (!blocked) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <AuthGateCard
        title="Weiterlernen?"
        body={
          <>
            Du hast dir <strong className="text-text">3 Themen kostenlos</strong> angesehen.
            Melde dich kostenlos an, um alle Themen, Quiz, Karteikarten und Aufgaben zu nutzen.
          </>
        }
        footer={
          <Link href="/" className="mt-2 inline-block w-full text-center text-sm text-muted transition-colors hover:text-text">
            Zurück zur Übersicht
          </Link>
        }
      />
    </div>
  );
}
