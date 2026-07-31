import { z } from "zod";

export const certificateStatusEnum = z.enum(["ACTIVE", "REVOKED", "EXPIRED"]);

export const createCertificateSchema = z.object({
  certificateNumber: z.string().trim().min(3, "Certificate number is required"),
  studentName: z.string().trim().min(2, "Student name is required"),
  course: z.string().trim().min(2, "Course is required"),
  duration: z.string().trim().min(1, "Duration is required"),
  issueDate: z.coerce.date({ message: "Valid issue date is required" }),
  status: certificateStatusEnum.default("ACTIVE"),
  remarks: z.string().trim().optional().nullable(),
});

export const updateCertificateSchema = createCertificateSchema.partial();

export const sendCertificateEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email address is required"),
  customMessage: z.string().trim().max(2000).optional(),
});

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
export type UpdateCertificateInput = z.infer<typeof updateCertificateSchema>;
export type SendCertificateEmailInput = z.infer<typeof sendCertificateEmailSchema>;
