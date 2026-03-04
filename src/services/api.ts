import { Course, HoleScore, Round, User, UserStats } from "../types";

const API_URL = "https://server-psi-sable-92.vercel.app/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Users
export const createUser = (data: { name: string; email: string }) =>
  request<User>("/users", { method: "POST", body: JSON.stringify(data) });

export const getUser = (id: string) =>
  request<User>(`/users/${id}`);

export const getUserByEmail = (email: string) =>
  request<User>(`/users/email/${email}`);

export const updateUser = (id: string, data: Partial<Pick<User, "name" | "handicap" | "pushToken">>) =>
  request<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });

// Courses
export const getCourses = (params?: { lat?: number; lng?: number; radius?: number }) => {
  const qs = params
    ? "?" + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : "";
  return request<Course[]>(`/courses${qs}`);
};

export const getCourse = (id: string) =>
  request<Course>(`/courses/${id}`);

// Rounds
export const createRound = (data: {
  userId: string;
  courseId: string;
  totalScore: number;
  totalPar: number;
  weather?: string;
  notes?: string;
  scores: Omit<HoleScore, "id" | "roundId">[];
}) => request<Round>("/rounds", { method: "POST", body: JSON.stringify(data) });

export const getRounds = (userId: string) =>
  request<Round[]>(`/rounds?userId=${userId}`);

export const getRound = (id: string) =>
  request<Round>(`/rounds/${id}`);

// Stats
export const getUserStats = (userId: string) =>
  request<UserStats>(`/stats/${userId}`);
