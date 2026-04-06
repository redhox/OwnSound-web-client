import { getToken } from "@/AuthContext";
type ApiTrack = {
    id: number;
    title: string;
    duration: string;
    albumName: string;
    albumId: number;
    artistId: number;
    like: boolean;
    path: string;
  };

export async function fetchTrackByListID(ids: number[]): Promise<ApiTrack[]>{
    if (!ids.length) return [];
    const token = getToken();
    if (!token) throw new Error("UNAUTHORIZED");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/trackByListID`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },      body: JSON.stringify(ids),
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
  }

export async function fetchTrackUrl(id: number): Promise<string | null> {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");
  const res = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/track/${id}/url`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  return data.url;
}

export async function fetchTrackLike() {
const token = getToken();
if (!token) throw new Error("UNAUTHORIZED");

const res = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/trackLike`, {
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

export async function fetchTracksByGenres(genreNames: string[]): Promise<ApiTrack[]> {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");
  const res = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/tracksByGenres`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ genre_names: genreNames }),
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return await res.json();
}