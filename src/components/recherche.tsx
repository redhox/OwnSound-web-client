import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, MoreHorizontal } from "lucide-react"
import { CardAlbum, CardArtist } from "@/components/MiniCard"
import PlaylistTracksTable from "@/components/playlist"
import { searchAPI } from "@/api/search";
type SearchResultProps = {
  search: string;
  onPlay?: (id: number, ids: number[], mode?: "play" | "queue" | "queueNext" ) => void;
};

export default function SearchResultView({ search ,onPlay}: SearchResultProps) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    if (!search) {
      setTracks([]);
      setAlbums([]);
      setArtists([]);
      return;
    }

    const fetchResults = async () => {
      try {
        const { tracks, albums, artists } = await searchAPI(search);
        setTracks(tracks);
        setAlbums(albums);
        setArtists(artists);
      } catch (err) {
        console.error("Search fetch error:", err);
      }
    };

    fetchResults();
  }, [search]);

  return (
    <div className="flex flex-col space-y-8 w-full pb-50">
      <section>
        <h3 className="text-lg font-semibold mb-2">Artistes</h3>
        <div className="flex space-x-4 overflow-x-auto">
          {artists.map(artist => (
            <CardArtist
            key={artist.id}
            artistId={artist.id}
            image={artist.image}
            name={artist.name}
          />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Albums</h3>
        <div className="flex space-x-4 overflow-x-auto">
          {albums.map(album => (
            <CardAlbum
            key={album.id}
            image={album.cover}
            title={album.name}
            artistName={album.artistName}
            artistId={album.artistId}
            albumId={album.id}
            onPlay={onPlay}
          />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Titres</h3>
        <PlaylistTracksTable data={tracks} onPlay={onPlay} />
      </section>
    </div>
  );
}