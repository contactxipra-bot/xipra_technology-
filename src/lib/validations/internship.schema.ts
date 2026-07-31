import { z } from "zod";

export const applicationStatusEnum = z.enum([
  "PENDING",
  "REVIEWED",
  "ACCEPTED",
  "REJECTED",
]);

export const updateInternshipStatusSchema = z.object({
  status: applicationStatusEnum,
});

export type UpdateInternshipStatusInput = z.infer<
  typeof updateInternshipStatusSchema
>;
