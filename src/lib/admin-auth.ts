import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "treshatrendy_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type AdminSession = {
  adminId: string;
  email: string;
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is required for admin authentication.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function encodeSession(session: AdminSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeSession(cookieValue?: string): AdminSession | null {
  if (!cookieValue) {
    return null;
  }

  const [payload, signature] = cookieValue.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(signature);

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;

    if (!session.adminId || !session.email || Date.now() > session.exp) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function createAdminSession(admin: {
  id: string;
  email: string;
}) {
  const cookieStore = await cookies();
  const expires = Date.now() + SESSION_TTL_SECONDS * 1000;

  cookieStore.set(
    SESSION_COOKIE,
    encodeSession({
      adminId: admin.id,
      email: admin.email,
      exp: expires,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    },
  );
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin() {
  if (!prisma) {
    return null;
  }

  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: {
      id: session.adminId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
