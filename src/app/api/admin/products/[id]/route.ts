import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { updateProductSchema } from "@/lib/validations/product.schema";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/lib/services/product.service";
import { logAudit } from "@/lib/audit";
import { getRequestMeta } from "@/lib/request-meta";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const product = await getProductById(id);
  return apiSuccess(product);
});

export const PUT = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const body = await request.json();
  const input = updateProductSchema.parse(body);
  const product = await updateProduct(id, input);
  return apiSuccess(product, { message: "Product updated" });
});

export const DELETE = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const existing = await getProductById(id);
  await deleteProduct(id);
  await logAudit({
    admin,
    action: "product.delete",
    entityType: "Product",
    entityId: id,
    metadata: { title: existing.title },
    ipAddress: getRequestMeta(request).ip,
  });
  return apiSuccess(null, { message: "Product deleted" });
});
