import { API_BASE_URL } from "./endpoints";
import type { APIResponse } from "./types";

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new APIError(
      errorBody.error || `API Error: ${res.status}`,
      res.status,
    );
  }

  const json: APIResponse<T> = await res.json();
  if (!json.success || !json.data) {
    throw new APIError(json.error || "Unknown API error", 500);
  }
  return json.data;
}
