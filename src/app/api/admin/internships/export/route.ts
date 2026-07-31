import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { listInternshipApplicationsForExport } from "@/lib/services/internship.service";

function toCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const GET = withApiHandler(async () => {
  await requireAdmin();

  const applications = await listInternshipApplicationsForExport();

  const columns = [
    "id",
    "fullName",
    "email",
    "phone",
    "domain",
    "collegeName",
    "duration",
    "status",
    "createdAt",
  ] as const;

  const rows = [
    columns.join(","),
    ...applications.map((app) =>
      columns
        .map((col) => toCsvValue(col === "createdAt" ? app[col].toISOString() : app[col]))
        .join(",")
    ),
  ];

  return new NextResponse(rows.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="internship-applications.csv"`,
    },
  });
});
