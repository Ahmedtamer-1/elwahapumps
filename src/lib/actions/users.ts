"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export interface UserFormState {
  error?: string;
  success?: string;
}

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(160),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: z.enum(["ADMIN", "STAFF"]),
});

export async function createUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "A staff account with that email already exists" };

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: parsed.data.role,
    },
  });

  revalidatePath("/admin/users");
  return { success: `${parsed.data.name} can now sign in` };
}

export async function resetUserPassword(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();

  const parsed = z
    .object({
      userId: z.string().min(1),
      password: z.string().min(8, "Password must be at least 8 characters").max(200),
    })
    .safeParse({ userId: formData.get("userId"), password: formData.get("password") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });

  revalidatePath("/admin/users");
  return { success: "Password updated" };
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === admin.userId) return; // never delete yourself

  // Keep their work; just detach it from the account being removed.
  await prisma.$transaction([
    prisma.lead.updateMany({ where: { assignedToId: userId }, data: { assignedToId: null } }),
    prisma.activity.updateMany({ where: { authorId: userId }, data: { authorId: null } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  revalidatePath("/admin/users");
}
