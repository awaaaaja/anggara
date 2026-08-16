"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/auth/actions";

const loginFormSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    const result = await loginAction(null, formData);
    if (result && "error" in result && result.error) setServerError(result.error);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="anim-fade-up flex flex-col items-center gap-4 text-center">
        <Image
          src="/logo.png"
          alt="Logo ANGGARA"
          width={224}
          height={122}
          priority
          className="anim-float h-16 w-auto drop-shadow-[0_10px_30px_oklch(0.3_0.09_250/0.45)] sm:h-20"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            ANGGARA <span className="gold-text">Universitas Adzkia</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sistem penganggaran kegiatan ORMAWA, transparan sejak proposal hingga LPJ
          </p>
        </div>
      </div>

      <Card
        className="anim-fade-up w-full max-w-sm"
        style={{ animationDelay: "120ms" }}
      >
        <CardHeader>
          <CardTitle className="text-base">Masuk</CardTitle>
          <CardDescription>Gunakan akun yang diberikan oleh MPM.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@anggara.test"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Memeriksa..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}