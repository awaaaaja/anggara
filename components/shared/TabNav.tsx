import Link from "next/link";

export function TabNav({
  items,
}: {
  items: Array<{ href: string; label: string; active?: boolean; badge?: number }>;
}) {
  return (
    <nav className="glass flex gap-1 overflow-x-auto rounded-xl p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all ${
            item.active
              ? "bg-primary text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.25)]"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          }`}
        >
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
  );
}