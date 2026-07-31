"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, type ApiMeta } from "@/lib/admin-api";

const DEFAULT_META: ApiMeta = { total: 0, page: 1, limit: 10, totalPages: 1 };
// Collapses rapid keystrokes into one request instead of firing a DB query
// per character — the input itself stays fully controlled/instant either way.
const SEARCH_DEBOUNCE_MS = 350;

export function useAdminList<T>(endpoint: string, limit = 10) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<ApiMeta>(DEFAULT_META);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (debouncedSearch) params.set("search", debouncedSearch);

    apiGet<T[]>(`${endpoint}?${params.toString()}`)
      .then(({ data, meta }) => {
        if (cancelled) return;
        setItems(data);
        setMeta(meta ?? DEFAULT_META);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, page, debouncedSearch, limit, reloadToken]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return { items, meta, search, setSearch, page, setPage, loading, error, refresh };
}
