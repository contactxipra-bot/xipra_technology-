export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
  take: number;
  search: string;
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT)
  );
  const search = (searchParams.get("search") || "").trim();

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
    search,
  };
}

export function buildPaginationMeta(
  total: number,
  { page, limit }: Pick<PaginationParams, "page" | "limit">
) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
