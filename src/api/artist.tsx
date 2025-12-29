// api.ts
import { getToken } from "@/AuthContext";

export async function fetchArtistLike() {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${import.meta.env.VITE_API_URL}/artistLike`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

  return res.json();
}

export async function fetchAllArtist() {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${import.meta.env.VITE_API_URL}/allArtist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

  return res.json();
}
