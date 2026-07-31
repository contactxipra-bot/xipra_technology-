import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api/response";
import { sanitizeText } from "@/lib/sanitize";
import type { PaginationParams } from "@/lib/api/pagination";
import type { UpdateContactStatusInput } from "@/lib/validations/contact.schema";
import type { PublicContactInput } from "@/lib/validations/public.schema";

export async function createContactMessage(data: PublicContactInput) {
  return prisma.contactMessage.create({
    data: {
      name: sanitizeText(data.name),
      email: data.email,
      phone: data.phone ? sanitizeText(data.phone) : null,
      subject: data.subject ? sanitizeText(data.subject) : null,
      message: sanitizeText(data.message),
    },
  });
}

export async function listContactMessages({ skip, take, search }: PaginationParams) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { subject: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.count({ where }),
  ]);

  return { items, total };
}

export async function getContactMessageById(id: string) {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw new HttpError("Message not found", 404);
  return message;
}

export async function updateContactStatus(id: string, data: UpdateContactStatusInput) {
  await getContactMessageById(id);
  return prisma.contactMessage.update({ where: { id }, data });
}

export async function deleteContactMessage(id: string) {
  await getContactMessageById(id);
  await prisma.contactMessage.delete({ where: { id } });
}
