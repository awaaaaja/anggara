import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ANGGARA — Anggaran Kegiatan ORMAWA",
    template: "%s · ANGGARA",
  },
  description: "Sistem pengelolaan penganggaran kegiatan ORMAWA Universitas Adzkia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}