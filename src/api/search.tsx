// api.ts
import { getToken } from "@/AuthContext";

export interface SearchResult {
    tracks: {
      id: number;
      title: string;
      artist: string;
      album: string;
      duration: number;
      date: string;
      like: boolean;
    }[];
    albums: any[];
    artists: any[];
  }
  
  export async function searchAPI(query: string): Promise<SearchResult> {
    try {
        const token = getToken();
        if (!token) throw new Error("UNAUTHORIZED");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        body: JSON.stringify({ q: query }),
      });
  
      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
  
      const data = await res.json();
  
      const tracks = (data.tracks || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        artist: t.artistName,
        album: t.albumName,
        duration: t.duration,
        date: t.date,
        like: t.like,
      }));
  
      return {
        tracks,
        albums: data.albums || [],
        artists: data.artists || [],
      };
    } catch (err) {
      console.error("searchAPI failed:", err);
      throw err;
    }
  }
  