import axios, { AxiosInstance } from "axios";

// Prefer runtime-injected env (window._env_) so Docker/nginx can set API URL at container start.
const runtimeEnv =
  (typeof window !== "undefined" && (window as any)._env_) || null;
const API_BASE =
  runtimeEnv?.VITE_API_BASE || import.meta.env.VITE_API_BASE || "/api";

// DEBUG: Log what API_BASE is being used
console.log("=== API Configuration Debug ===");
console.log("window._env_:", (window as any)._env_);
console.log("runtimeEnv:", runtimeEnv);
console.log("runtimeEnv?.VITE_API_BASE:", runtimeEnv?.VITE_API_BASE);
console.log("import.meta.env.VITE_API_BASE:", import.meta.env.VITE_API_BASE);
console.log("Final API_BASE being used:", API_BASE);
console.log("===============================");

const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export interface Article {
  id: string;
  title: string;
  content: string; // pure Markdown string
  status?: "draft" | "published" | "unpublished";
  authorId?: string;
  authorName?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const articleApi = {
  getAll: async (): Promise<Article[]> => {
    const { data } = await client.get("/articles");
    return data;
  },

  getPublic: async (): Promise<Article[]> => {
    const { data } = await client.get("/articles/public");
    return data;
  },

  getById: async (id: string): Promise<Article> => {
    const { data } = await client.get(`/articles/${id}`);
    return data;
  },

  create: async (article: {
    title: string;
    content: string; // markdown
    status?: "draft" | "published" | "unpublished";
  }): Promise<Article> => {
    const { data } = await client.post("/articles", article);
    return data;
  },

  update: async (
    id: string,
    article: {
      title?: string;
      content?: string; // markdown
      status?: "draft" | "published" | "unpublished";
    }
  ): Promise<Article> => {
    const { data } = await client.put(`/articles/${id}`, article);
    return data;
  },

  generate: async (): Promise<Article> => {
    const { data } = await client.post("/articles/generate");
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/articles/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<{ deleted: number }> => {
    const { data } = await client.post("/articles/bulk-delete", { ids });
    return data;
  },
};

// Authentication is handled by Clerk on the frontend and backend.
// Use Clerk hooks (`useAuth`, `useUser`) directly instead of this authApi.

export default client;
