// src/api/playlist.ts
import { getToken } from "@/AuthContext";



export async function fetchGetPlaylist(playlistId: number) {
  if (!playlistId) return null;

  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/get_playlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ playlist_id: playlistId }),
  });

  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

  return res.json();
}

export type PlaylistAction = "add" | "del";

export async function updatePlaylistTracks(
  playlist_id: number,
  track_ids: number[],
  action: PlaylistAction
) {
  const token = getToken();
  if (!token) throw new Error("UNAUTHORIZED");
  const response = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/playlist/update_tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      playlist_id,
      track_ids,
      action,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Playlist update failed");
  }

  return response.json();
}


// src/api/playlist.ts

export async function fetchAllPlaylists() {
  const token = getToken();
  const response = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/listplaylists`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch playlists");
    }
  
    return response.json(); // Renvoie un tableau de { id, name }
  }

/* CREATE PLAYLIST */
export async function createPlaylist(name: string) {
  const token = getToken();
  const response = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/playlist/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },      body: JSON.stringify({ name }),
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Playlist creation failed");
    }
  
    return response.json(); // { playlist_id }
    }

    export async function fetchPlaylistLike() {
    const token = getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const res = await fetch(`${import.meta.env.VITE_API_URL || "/api-backend"}/playlistLike`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    });

    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) return []; // Fallback to empty list instead of crashing

    return res.json();
    }