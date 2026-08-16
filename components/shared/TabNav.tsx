import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function TabNav({
  items,
}: {
  items: Array<{ href: string; label: string; icon?: LucideIcon; active?: boolean; badge?: number }>;
}) {
  return (
    <>
      <nav className="glass hidden gap-1 overflow-x-auto rounded-xl p-1 md:flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all ${
              item.active
                ? "bg-primary text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.25)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.icon && <item.icon className="size-4" />}
            {item.label}
            {!!item.badge && item.badge > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums ${
                  item.active ? "bg-white/25 text-white" : "bg-gold/20 text-gold"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl md:hidden"
      >
        <div
          className="mx-auto grid max-w-5xl"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors ${
                item.active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="relative">
                {item.icon && <item.icon className="size-5" />}
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute -right-1.5 -top-0.5 flex size-2 rounded-full bg-gold ring-2 ring-background" />
                )}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}