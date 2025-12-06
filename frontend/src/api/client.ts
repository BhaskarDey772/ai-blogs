import axios, { AxiosInstance } from "axios";

// Prefer runtime-injected env (window._env_) so Docker/nginx can set API URL at container start.
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

  getById: async (id: string): Promise<Article> => {
    const { data } = await client.get(`/articles/${id}`);
    return data;
  },

  create: async (article: {
    title: string;
    content: string;
  }): Promise<Article> => {
    const { data } = await client.post("/articles", article);
    return data;
  },

  update: async (
    id: string,
    article: { title?: string; content?: string; status?: string }
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
};

export const authApi = {
  signup: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>("/auth/signup", {
      email,
      password,
      firstName,
      lastName,
    });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await client.post("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>("/auth/reset-password", {
      token,
      newPassword,
      confirmPassword,
    });
    return data;
  },

  logout: async (): Promise<{ message: string }> => {
    const { data } = await client.post("/auth/logout");
    return data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const { data } = await client.get("/auth/me");
    return data;
  },

  updateProfile: async (userData: Partial<User>): Promise<AuthResponse> => {
    const { data } = await client.patch<AuthResponse>(
      "/auth/profile",
      userData
    );
    return data;
  },
};

export default client;
