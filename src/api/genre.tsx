import { getToken } from "@/AuthContext";

export async function fetchAllGenres() {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");
  const res = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/allGenres`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return await res.json();
}
