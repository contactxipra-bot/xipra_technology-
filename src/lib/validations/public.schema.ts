import { z } from "zod";

// Accepts international formats: digits, spaces, dashes, parens, optional leading +.
const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;

// Honeypot: accept any value so validation never reveals the trap exists.
// The route handler inspects this separately and silently drops spam.
const honeypot = z.string().optional();

// ---- Contact form ----

export const publicContactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(180),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(phoneRegex, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().max(180).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  // Honeypot — must stay empty. Bots fill it in.
  company: honeypot,
});

export type PublicContactInput = z.infer<typeof publicContactSchema>;

// ---- Internship form ----

export const publicInternshipSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(180),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid mobile number")
    .max(20)
    .regex(phoneRegex, "Enter a valid mobile number"),
  course: z.string().trim().min(1, "Please select a course").max(120),
  education: z.string().trim().max(160).optional().or(z.literal("")),
  gender: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(1000).optional().or(z.literal("")),
  company: honeypot,
});

export type PublicInternshipInput = z.infer<typeof publicInternshipSchema>;

// ---- Certificate verification ----

export const verifyCertificateSchema = z.object({
  certificateNumber: z
    .string()
    .trim()
    .min(3, "Enter a certificate number")
    .max(100, "Certificate number is too long"),
});

export type VerifyCertificateInput = z.infer<typeof verifyCertificateSchema>;
