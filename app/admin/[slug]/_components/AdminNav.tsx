"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUnsavedChanges } from "./UnsavedChangesContext";

export function AdminNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const unsavedChanges = useUnsavedChanges();
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const tabs = [
    { label: "Bookings", href: `/admin/${slug}/bookings` },
    { label: "Trailers", href: `/admin/${slug}/trailers` },
  ];

  function guardNavigation(e: React.MouseEvent) {
    if (unsavedChanges?.isDirty) {
      e.preventDefault();
      setBlockedMessage("Must save changes first.");
      return false;
    }
    setBlockedMessage(null);
    return true;
  }

  async function handleLogout(e: React.MouseEvent) {
    if (!guardNavigation(e)) return;
    await fetch("/api/admin/logout", { method: "POST" });
    router.push(`/admin/${slug}`);
    router.refresh();
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between border-b border-[var(--color-accent)]/25">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={guardNavigation}
                className={`border-b-2 pb-3 text-base font-semibold transition-colors ${
                  active
                    ? "border-[var(--color-accent)] text-[var(--color-text)]"
                    : "border-transparent text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="btn btn-ghost mb-3">
          Log out
        </button>
      </div>
      {blockedMessage && (
        <p className="pt-2 text-sm text-[var(--color-danger)]">{blockedMessage}</p>
      )}
    </div>
  );
}
