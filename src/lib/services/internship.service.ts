import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api/response";
import { sanitizeText } from "@/lib/sanitize";
import type { PaginationParams } from "@/lib/api/pagination";
import type { UpdateInternshipStatusInput } from "@/lib/validations/internship.schema";
import type { PublicInternshipInput } from "@/lib/validations/public.schema";

export async function createInternshipApplication(data: PublicInternshipInput) {
  return prisma.internshipApplication.create({
    data: {
      fullName: sanitizeText(data.fullName),
      email: data.email,
      phone: sanitizeText(data.phone),
      // The public form's "Apply For Course" maps to the existing `domain` column.
      domain: sanitizeText(data.course),
      education: data.education ? sanitizeText(data.education) : null,
      gender: data.gender ? sanitizeText(data.gender) : null,
      address: data.address ? sanitizeText(data.address) : null,
    },
  });
}

export async function listInternshipApplications({
  skip,
  take,
  search,
}: PaginationParams) {
  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { domain: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.internshipApplication.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.internshipApplication.count({ where }),
  ]);

  return { items, total };
}

export async function getInternshipApplicationById(id: string) {
  const application = await prisma.internshipApplication.findUnique({
    where: { id },
  });
  if (!application) throw new HttpError("Application not found", 404);
  return application;
}

export async function updateInternshipStatus(
  id: string,
  data: UpdateInternshipStatusInput
) {
  await getInternshipApplicationById(id);
  return prisma.internshipApplication.update({ where: { id }, data });
}

export async function deleteInternshipApplication(id: string) {
  await getInternshipApplicationById(id);
  await prisma.internshipApplication.delete({ where: { id } });
}

export async function listInternshipApplicationsForExport() {
  return prisma.internshipApplication.findMany({ orderBy: { createdAt: "desc" } });
}
