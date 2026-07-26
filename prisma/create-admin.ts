import { loadEnvFile } from "node:process";
import { AdminRole } from "@/generated/prisma/enums";
import { hashPassword } from "@/lib/password";

try {
  loadEnvFile(".env");
} catch {
  // The deployment environment may provide variables without a local .env file.
}

function readArg(name: string) {
  const prefix = `--${name}=`;
  return process.argv
    .find((arg) => arg.startsWith(prefix))
    ?.slice(prefix.length)
    .trim();
}

async function main() {
  const { prisma } = await import("@/lib/db");

  if (!prisma) {
    throw new Error("DATABASE_URL is required to create an admin user.");
  }

  const email = readArg("email")?.toLowerCase();
  const password = readArg("password");
  const name = readArg("name") ?? "Store Admin";

  if (!email || !password) {
    throw new Error(
      'Usage: npm run admin:create -- --email="admin@example.com" --password="secure password" --name="Store Admin"',
    );
  }

  if (password.length < 10) {
    throw new Error("Admin password must be at least 10 characters long.");
  }

  const admin = await prisma.adminUser.upsert({
    where: {
      email,
    },
    update: {
      name,
      passwordHash: hashPassword(password),
      role: AdminRole.OWNER,
    },
    create: {
      email,
      name,
      passwordHash: hashPassword(password),
      role: AdminRole.OWNER,
    },
    select: {
      email: true,
      name: true,
      role: true,
    },
  });

  console.log(`Admin ready: ${admin.email} (${admin.role})`);

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
