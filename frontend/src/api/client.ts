import axios, { AxiosInstance } from "axios";

// Prefer runtime-injected env (window._env_)
const runtimeEnv =
  (typeof window !== "undefined" && (window as any)._env_) || null;
const API_BASE =
  runtimeEnv?.VITE_API_BASE || import.meta.env.VITE_API_BASE || "/api";


const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


let getTokenFunction: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (
  getToken: () => Promise<string | null>
): void => {
  getTokenFunction = getToken;
};

client.interceptors.request.use(
  async (config) => {
    if (getTokenFunction) {
      try {
        const token = await getTokenFunction();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("Added Clerk token to request");
        } else {
          console.log("No Clerk token available");
        }
      } catch (error) {
        console.error("Error getting Clerk token:", error);
      }
    } else {
      console.log("No token getter function set");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed - 401 Unauthorized");
    }
    return Promise.reject(error);
  }
);

export interface Article {
  id: string;
  title: string;
  content: string;
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

  getPublicById: async (id: string): Promise<Article> => {
    const { data } = await client.get(`/articles/public/${id}`);
    return data;
  },

  getById: async (id: string): Promise<Article> => {
    const { data } = await client.get(`/articles/${id}`);
    return data;
  },

  create: async (article: {
    title: string;
    content: string;
    status?: "draft" | "published" | "unpublished";
  }): Promise<Article> => {
    const { data } = await client.post("/articles", article);
    return data;
  },

  update: async (
    id: string,
    article: {
      title?: string;
      content?: string;
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

export default client;
