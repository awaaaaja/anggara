import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";
import { ormawa, profiles, type JenisOrmawa, type Role } from "../lib/db/schema";
import * as schema from "../lib/db/schema";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool, { schema });

type SeedUser = {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  ormawa?: { nama: string; jenis: JenisOrmawa; deskripsi: string };
};

const SEEDS: SeedUser[] = [
  {
    email: "mpm@anggara.test",
    password: "Mpm2026!",
    fullName: "MPM Universitas Adzkia",
    role: "mpm",
  },
  {
    email: "lkpka@anggara.test",
    password: "Lkpka2026!",
    fullName: "LKPKA Universitas Adzkia",
    role: "lkpka",
  },
  {
    email: "bem@anggara.test",
    password: "Bem2026!",
    fullName: "BEM KM Adzkia",
    role: "ormawa",
    ormawa: {
      nama: "BEM KM Adzkia",
      jenis: "bem",
      deskripsi: "Badan Eksekutif Mahasiswa Keluarga Mahasiswa Universitas Adzkia",
    },
  },
  {
    email: "hima@anggara.test",
    password: "Hima2026!",
    fullName: "HIMA Informatika",
    role: "ormawa",
    ormawa: {
      nama: "HIMA Informatika",
      jenis: "hima",
      deskripsi: "Himpunan Mahasiswa Program Studi Informatika",
    },
  },
];

async function getUserByEmail(email: string) {
  const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  return data.users.find((u) => u.email === email) ?? null;
}

async function main() {
  const mpm = SEEDS[0];
  let mpmUser = await getUserByEmail(mpm.email);
  if (!mpmUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: mpm.email,
      password: mpm.password,
      email_confirm: true,
    });
    if (error) throw error;
    mpmUser = data.user;
  }
  console.log("MPM user:", mpmUser.email, mpmUser.id);

  const existingMpmProfile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.id, mpmUser!.id),
  });
  if (!existingMpmProfile) {
    await db.insert(profiles).values({ id: mpmUser!.id, role: "mpm", full_name: mpm.fullName });
  }

  const mpmProfile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.id, mpmUser!.id),
  });
  if (!mpmProfile) throw new Error("profil MPM tidak ditemukan");

  for (const seed of SEEDS.slice(1)) {
    let user = await getUserByEmail(seed.email);
    if (!user) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: seed.email,
        password: seed.password,
        email_confirm: true,
      });
      if (error) throw error;
      user = data.user;
    }
    console.log("User:", seed.email, user.id);

    let ormawaId: string | null = null;
    if (seed.ormawa) {
      let row = await db.query.ormawa.findFirst({
        where: (o, { eq }) => eq(o.nama, seed.ormawa!.nama),
      });
      if (!row) {
        const rows = await db
          .insert(ormawa)
          .values({
            nama: seed.ormawa.nama,
            jenis: seed.ormawa.jenis,
            deskripsi: seed.ormawa.deskripsi,
            status: "aktif",
            dibuat_oleh: mpmProfile.id,
          })
          .returning();
        row = rows[0];
        if (!row) throw new Error("gagal insert ormawa");
      }
      console.log("Ormawa:", row.nama, row.id);
      ormawaId = row.id;
    }

    const existingProfile = await db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.id, user!.id),
    });
    if (!existingProfile) {
      await db.insert(profiles).values({
        id: user!.id,
        role: seed.role,
        full_name: seed.fullName,
        ormawa_id: ormawaId,
      });
    }
  }

  console.log("Seed selesai.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});