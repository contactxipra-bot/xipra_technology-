export type InternshipApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  domain: string;
  collegeName: string | null;
  duration: string | null;
  education: string | null;
  gender: string | null;
  address: string | null;
  resumeUrl: string | null;
  message: string | null;
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED";
  createdAt: string;
};
