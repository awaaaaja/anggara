import Image from "next/image";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import type { CurrentProfile } from "@/lib/auth/get-current-profile";

const roleLabel: Record<CurrentProfile["role"], string> = {
  mpm: "MPM",
  lkpka: "LKPKA",
  ormawa: "ORMAWA",
};

export function AppShell({
  profile,
  children,
}: {
  profile: CurrentProfile;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo ANGGARA"
              width={112}
              height={61}
              priority
              className="h-7 w-auto"
            />
            <span className="truncate text-sm text-muted-foreground">{profile.full_name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
              {roleLabel[profile.role]}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Keluar"
                className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}