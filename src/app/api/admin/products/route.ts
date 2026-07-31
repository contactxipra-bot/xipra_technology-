import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createProductSchema } from "@/lib/validations/product.schema";
import { listProducts, createProduct } from "@/lib/services/product.service";

export const GET = withApiHandler(async (request: NextRequest) => {
  await requireAdmin();

  const pagination = parsePagination(request.nextUrl.searchParams);
  const { items, total } = await listProducts(pagination);

  return apiSuccess(items, { meta: buildPaginationMeta(total, pagination) });
});

export const POST = withApiHandler(async (request: NextRequest) => {
  await requireAdmin();

  const body = await request.json();
  const input = createProductSchema.parse(body);
  const product = await createProduct(input);

  return apiSuccess(product, { message: "Product created", status: 201 });
});
