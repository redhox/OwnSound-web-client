import { useState, useEffect, useMemo } from "react";
import { CardAlbum, CardArtist, CardPlaylist } from "@/components/MiniCard";
import { fetchAllPlaylists } from "@/api/playlist";
import { fetchAlbumLike, fetchAllAlbum } from "@/api/album";
import { fetchArtistLike, fetchAllArtist } from "@/api/artist";
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 10;

export default function LikeExplorerView({
  showArtists,
  showAlbums,
  showPlaylists,
}: {
  showArtists?: boolean;
  showAlbums?: boolean;
  showPlaylists?: boolean;
}) {
  const [albums, setAlbums] = useState<any[] | null>(null);
  const [albumSource, setAlbumSource] = useState<"byList" | "all">("byList");
  const [artistsData, setArtistsData] = useState<any[] | null>(null);
  const [artistSource, setArtistSource] = useState<"byList" | "all">("byList");
  const [playlistsData, setPlaylistsData] = useState<any[] | null>(null);

  const [pageAlbums, setPageAlbums] = useState(1);
  const [pageArtists, setPageArtists] = useState(1);

  // Fetch albums
  useEffect(() => {
    if (!showAlbums) return;
    setPageAlbums(1);

    const fetchAlbums = albumSource === "byList" ? fetchAlbumLike : fetchAllAlbum;
    fetchAlbums()
      .then((data) => setAlbums(data))
      .catch(() => setAlbums([]));
  }, [albumSource, showAlbums]);

  // Fetch artists
  useEffect(() => {
    if (!showArtists) return;
    setPageArtists(1);

    const fetchArtists = artistSource === "byList" ? fetchArtistLike : fetchAllArtist;
    fetchArtists()
      .then((data) => setArtistsData(data))
      .catch(() => setArtistsData([]));
  }, [artistSource, showArtists]);

  // Fetch playlists
  useEffect(() => {
    if (!showPlaylists) return;

    fetchAllPlaylists()
      .then((data) => setPlaylistsData(data))
      .catch(() => setPlaylistsData([]));
  }, [showPlaylists]);

  // Pagination
  const paginatedAlbums = useMemo(() => {
    if (!albums) return [];
    const start = (pageAlbums - 1) * PAGE_SIZE;
    return albums.slice(start, start + PAGE_SIZE);
  }, [albums, pageAlbums]);

  const paginatedArtists = useMemo(() => {
    if (!artistsData) return [];
    const start = (pageArtists - 1) * PAGE_SIZE;
    return artistsData.slice(start, start + PAGE_SIZE);
  }, [artistsData, pageArtists]);

  // Render artists
  if (showArtists && artistsData) {
    const totalPages = Math.ceil(artistsData.length / PAGE_SIZE);
    return (
      <div className="flex flex-col w-10/12 space-y-4 mt-9">
        <h2 className="text-2xl font-bold mb-4">Artistes</h2>
        <div className="flex space-x-4">
        <Button
          variant={artistSource === "byList" ? "default" : "outline"}
          onClick={() => setArtistSource("byList")}
        >
          Artistes Likés
        </Button>

        <Button
          variant={artistSource === "all" ? "default" : "outline"}
          onClick={() => setArtistSource("all")}
        >
          Tous les artistes
        </Button>
      </div>

        <div className="grid grid-cols-5 gap-6">
          {paginatedArtists.map((artist) => (
            <CardArtist
              key={artist.id}
              artistId={artist.id}
              like={artist.like}
              image={artist.image}
              name={artist.name}
            />
          ))}
        </div>
        <div className="flex justify-center space-x-2 mt-4">
          <button disabled={pageArtists === 1} onClick={() => setPageArtists(p => p - 1)}>Précédent</button>
          <span>{pageArtists} / {totalPages}</span>
          <button disabled={pageArtists === totalPages} onClick={() => setPageArtists(p => p + 1)}>Suivant</button>
        </div>
      </div>
    );
  }

  // Render albums
  if (showAlbums && albums) {
    const totalPages = Math.ceil(albums.length / PAGE_SIZE);
    return (
      <div className="flex flex-col w-10/12 space-y-4 mt-9">
        <h2 className="text-2xl font-bold mb-4">Albums</h2>
        <div className="flex space-x-4">
  <Button
    variant={albumSource === "byList" ? "default" : "outline"}
    onClick={() => setAlbumSource("byList")}
  >
    Album Liké
  </Button>

  <Button
    variant={albumSource === "all" ? "default" : "outline"}
    onClick={() => setAlbumSource("all")}
  >
    Tous les albums
  </Button>
</div>


        <div className="grid grid-cols-5 gap-6">
          {paginatedAlbums.map((album) => (
            <CardAlbum
              key={album.id}
              image={album.cover}
              title={album.name}
              like={album.like}
              artistName={album.artistName}
              artistId={album.artistId}
              albumId={album.id}
            />
          ))}
        </div>
        <div className="flex justify-center space-x-2 mt-4">
          <button disabled={pageAlbums === 1} onClick={() => setPageAlbums(p => p - 1)}>Précédent</button>
          <span>{pageAlbums} / {totalPages}</span>
          <button disabled={pageAlbums === totalPages} onClick={() => setPageAlbums(p => p + 1)}>Suivant</button>
        </div>
      </div>
    );
  }

  // Render playlists
  if (showPlaylists && playlistsData) {
    return (
      <div className="flex flex-col w-10/12 space-y-4 mt-9">
        <h2 className="text-2xl font-bold mb-4">Playlists</h2>
        <div className="grid grid-cols-5 gap-6">
          {playlistsData.map((playlist) => (
            <CardPlaylist
              key={playlist.id}
              playlistId={playlist.id}
              name={playlist.name}
              userName={playlist.userName}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
