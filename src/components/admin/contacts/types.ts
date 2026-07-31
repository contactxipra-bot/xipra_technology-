export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "UNREAD" | "READ" | "REPLIED";
  createdAt: string;
};
