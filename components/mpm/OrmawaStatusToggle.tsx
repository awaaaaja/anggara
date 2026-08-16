"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleOrmawaStatusAction } from "@/lib/db/queries/mpm";
import { Button } from "@/components/ui/button";

export function OrmawaStatusToggle({ ormawaId, status }: { ormawaId: string; status: "aktif" | "nonaktif" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={status === "aktif" ? "outline" : "default"}
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleOrmawaStatusAction(ormawaId);
          router.refresh();
        })
      }
    >
      {pending ? "Menyimpan..." : status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
    </Button>
  );
}
