export type ApiMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

class ApiRequestError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function parseResponse<T>(res: Response): Promise<{ data: T; meta?: ApiMeta }> {
  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    const message = json?.error?.message || `Request failed (${res.status})`;
    throw new ApiRequestError(message, res.status, json?.error?.details);
  }

  return { data: json.data as T, meta: json.meta as ApiMeta | undefined };
}

export async function apiGet<T>(url: string): Promise<{ data: T; meta?: ApiMeta }> {
  const res = await fetch(url, { method: "GET" });
  return parseResponse<T>(res);
}

export async function apiSend<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const { data } = await parseResponse<T>(res);
  return data;
}

export async function apiUpload<T>(url: string, formData: FormData): Promise<T> {
  const res = await fetch(url, { method: "POST", body: formData });
  const { data } = await parseResponse<T>(res);
  return data;
}

export { ApiRequestError };
