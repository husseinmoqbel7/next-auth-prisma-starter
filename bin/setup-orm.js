// scripts/setup-orm.js
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

const setupPrisma = async (targetDir) => {
  // Create prisma directory and schema
  const prismaDir = path.join(targetDir, "prisma");
  await fs.ensureDir(prismaDir);

  // Write schema.prisma
  await fs.writeFile(
    path.join(prismaDir, "schema.prisma"),
    `datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    
    generator client {
      provider = "prisma-client-js"
    }
    
    model User {
      id            String    @id @default(cuid())
      name          String?
      email         String?   @unique
      emailVerified DateTime?
      image         String?
      accounts      Account[]
      sessions      Session[]
    }
    
    model Account {
      id                String  @id @default(cuid())
      userId            String
      type              String
      provider          String
      providerAccountId String
      refresh_token     String? @db.Text
      access_token      String? @db.Text
      expires_at        Int?
      token_type        String?
      scope             String?
      id_token         String? @db.Text
      session_state    String?
      user             User    @relation(fields: [userId], references: [id], onDelete: Cascade)
      @@unique([provider, providerAccountId])
    }
    
    model Session {
      id           String   @id @default(cuid())
      sessionToken String   @unique
      userId       String
      expires      DateTime
      user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    }`
  );

  // Create db.ts
  await fs.writeFile(
    path.join(targetDir, "src/lib/db.ts"),
    `import { PrismaClient } from '@prisma/client'

    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined
    }
    
    export const prisma = globalForPrisma.prisma ?? new PrismaClient()
    
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma`
  );

  // Initialize Prisma
  execSync("npx prisma generate", { cwd: targetDir, stdio: "inherit" });
};

const setupDrizzle = async (targetDir) => {
  // Create drizzle directory and schema
  const drizzleDir = path.join(targetDir, "drizzle");
  await fs.ensureDir(drizzleDir);

  // Write schema.ts
  await fs.writeFile(
    path.join(drizzleDir, "schema.ts"),
    `import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
    
    export const users = sqliteTable('users', {
      id: text('id').primaryKey(),
      name: text('name'),
      email: text('email').unique(),
      emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
      image: text('image'),
    });
    
    export const accounts = sqliteTable('accounts', {
      id: text('id').primaryKey(),
      userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
      type: text('type').notNull(),
      provider: text('provider').notNull(),
      providerAccountId: text('providerAccountId').notNull(),
      refresh_token: text('refresh_token'),
      access_token: text('access_token'),
      expires_at: integer('expires_at'),
      token_type: text('token_type'),
      scope: text('scope'),
      id_token: text('id_token'),
      session_state: text('session_state'),
    });
    
    export const sessions = sqliteTable('sessions', {
      id: text('id').primaryKey(),
      sessionToken: text('sessionToken').notNull().unique(),
      userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
      expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
    });`
  );

  // Create db.ts
  await fs.writeFile(
    path.join(targetDir, "src/lib/db.ts"),
    `import { drizzle } from 'drizzle-orm/libsql';
    import { createClient } from '@libsql/client';
    
    const client = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    
    export const db = drizzle(client);`
  );

  // Create drizzle config
  await fs.writeFile(
    path.join(targetDir, "drizzle.config.ts"),
    `import type { Config } from 'drizzle-kit';
    
    export default {
      schema: './drizzle/schema.ts',
      out: './drizzle/migrations',
      driver: 'turso',
      dbCredentials: {
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_AUTH_TOKEN!,
      },
    } satisfies Config;`
  );
};

const setupEnvFile = async (targetDir, orm) => {
  const envContent =
    orm === "prisma"
      ? 'DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"\n'
      : 'DATABASE_URL="libsql://your-database.turso.io"\nDATABASE_AUTH_TOKEN="your-token"\n';

  await fs.writeFile(path.join(targetDir, ".env"), envContent);
  await fs.writeFile(path.join(targetDir, ".env.example"), envContent);
};

module.exports = async function setupORM(targetDir, orm) {
  try {
    if (orm === "prisma") {
      await setupPrisma(targetDir);
    } else {
      await setupDrizzle(targetDir);
    }
    await setupEnvFile(targetDir, orm);
  } catch (error) {
    console.error("Error setting up ORM:", error);
    throw error;
  }
};
