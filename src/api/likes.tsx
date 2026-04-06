// src/api/likes.ts
import { getToken } from "@/AuthContext";

export type LikeTarget = "track" | "album" | "artist";

export async function updateLike(id: number, like: boolean, type: LikeTarget) {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");
  
  const response = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/updateLike`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ id, like, type }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update like");
  }

  return response.json();
}
