import { getToken } from "@/AuthContext";
export async function fetchGet_album(albumId: number) {
    try {
    const token = getToken();
    if (!token) throw new Error("UNAUTHORIZED");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/get_album`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        body: JSON.stringify({ album_id: albumId })
      });
  
      if (!res.ok) {
        throw new Error(`Erreur API: ${res.status}`);
      }
  
      const data = await res.json();
      return data; 
    } catch (err) {
      console.error("fetchAlbum failed:", err);
      throw err;
    }
  }
  
export async function fetchAlbumsByArtist(artistId: number) {
const token = getToken();
if (!token) throw new Error("UNAUTHORIZED");

const res = await fetch(`${import.meta.env.VITE_API_URL}/albumByArtistID`, {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ artist_id: artistId }),
});

if (res.status === 401) throw new Error("UNAUTHORIZED");
if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
return res.json();
}
 
// api.ts

export async function fetchAlbumsByList(albumsIds: number[]) {
  if (!albumsIds.length) return [];

  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${import.meta.env.VITE_API_URL}/albumByListId`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ album_ids: albumsIds }),
  });

  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

  const data = await res.json();
  return data.albums;
}

export async function fetchAlbumLike() {
    const token = getToken();
    if (!token) throw new Error("UNAUTHORIZED");
  
    const res = await fetch(`${import.meta.env.VITE_API_URL}/albumLike`, {
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

export async function fetchAllAlbum() {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${import.meta.env.VITE_API_URL}/allAlbum`, {
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
