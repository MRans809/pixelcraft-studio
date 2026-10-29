import type { Asset, CreationTask, Template, User } from "./types";

export const DEMO_USER_ID = "demo-user-001";

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "X-User-Id": DEMO_USER_ID,
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ code: "NETWORK_ERROR", message: "请求失败" }));
    throw new ApiError(body.code ?? "REQUEST_FAILED", body.message ?? "请求失败", response.status);
  }
  return response.json() as Promise<T>;
}

export const api = {
  listTemplates: (category?: string) =>
    request<Template[]>(`/api/templates${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  getTemplate: (id: string) => request<Template>(`/api/templates/${id}`),
  listTasks: () => request<CreationTask[]>("/api/tasks"),
  getTask: (id: string) => request<CreationTask>(`/api/tasks/${id}`),
  getMe: () => request<User>("/api/me"),
  uploadAssets: async (templateId: string, files: File[]) => {
    const data = new FormData();
    data.append("templateId", templateId);
    files.forEach((file) => data.append("files", file));
    return request<Asset[]>("/api/assets", { method: "POST", body: data });
  },
  createTask: (templateId: string, assetIds: string[], simulateFailureStage: string) =>
    request<CreationTask>("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ templateId, assetIds, simulateFailureStage: simulateFailureStage || null }),
    }),
};

