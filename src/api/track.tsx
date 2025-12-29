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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/trackByListID`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },      body: JSON.stringify(ids),
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
  }

export async function fetchTrackLike() {
const token = getToken();
if (!token) throw new Error("UNAUTHORIZED");

const res = await fetch(`${import.meta.env.VITE_API_URL}/trackLike`, {
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