// src/navigation/openContent.ts

// -------------------- Album --------------------
type OpenAlbumHandler = (albumId: number) => void;
let albumHandler: OpenAlbumHandler | null = null;

export function registerOpenAlbum(fn: OpenAlbumHandler) {
  albumHandler = fn;
}

export function openAlbum(albumId: number) {
  if (!albumHandler) return;
  albumHandler(albumId);
}

// -------------------- Artist --------------------
type OpenArtistHandler = (artistId: number) => void;
let artistHandler: OpenArtistHandler | null = null;

export function registerOpenArtist(fn: OpenArtistHandler) {
  artistHandler = fn;
}

export function openArtist(artistId: number) {
  if (!artistHandler) return;
  artistHandler(artistId);
}

// -------------------- Playlist --------------------
type OpenPlaylistHandler = (playlistId: number) => void;
let playlistHandler: OpenPlaylistHandler | null = null;

export function registerOpenPlaylist(fn: OpenPlaylistHandler) {
  playlistHandler = fn;
}

export function openPlaylist(playlistId: number) {
  playlistHandler?.(playlistId);
}

// -------------------- Genre --------------------
type OpenGenreHandler = (genreId: number) => void;
let genreHandler: OpenGenreHandler | null = null;

export function registerOpenGenre(fn: OpenGenreHandler) {
  genreHandler = fn;
}

export function openGenre(genreId: number) {
  genreHandler?.(genreId);
}
