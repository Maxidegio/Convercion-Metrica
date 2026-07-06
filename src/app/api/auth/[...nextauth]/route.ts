import { handlers } from "@/lib/auth";

// bcrypt y Prisma requieren el runtime de Node.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
