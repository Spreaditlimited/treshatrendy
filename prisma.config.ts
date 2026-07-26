import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(directUrl || databaseUrl
    ? {
        datasource: {
          url: directUrl ?? databaseUrl,
        },
      }
    : {}),
  migrations: {
    path: "prisma/migrations",
  },
});
