import { z } from "zod";

export const messageStatusEnum = z.enum(["UNREAD", "READ", "REPLIED"]);

export const updateContactStatusSchema = z.object({
  status: messageStatusEnum,
});

export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
