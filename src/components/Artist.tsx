import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CardAlbum ,CardArtist } from "@/components/MiniCard"
import { useState, useEffect } from "react";
import { fetchAlbumsByArtist } from "@/api/album"
type Album = {
  id: number;
  name: string;
  like: boolean
  date: string;
  cover: string;
};

type ArtistData = {
  id: number;
  name: string;
  image: string;
  albumsCount: number;
  tags: string[];
  discography: Album[];
};
export default function ArtistView({ artistId }: { artistId: number }) {
  const [artist, setArtist] = useState<ArtistData | null>(null);

  useEffect(() => {


    fetchAlbumsByArtist(artistId)
      .then((raw) => {
        const albums = Array.isArray(raw.listAlbums) ? raw.listAlbums : [];

        setArtist({
          id: raw.id,
          name: raw.name,
          image: raw.image,
          albumsCount: albums.length,
          tags: [], // ajouter si disponible
          discography: albums.map((a) => ({
            id: a.id,
            name: a.name,
            like:a.like,
            date: a.date,
            cover: a.cover,
          })),
        });
      })
      .catch(() => setArtist(null));
  }, [artistId]);

  if (!artist) return null;


  
  return (
    <div className="flex flex-col w-9/12 space-y-8 mt-9 pb-50">

      {/* Partie 1 */}
      <section className="flex items-center space-x-4">
        <img
          src={artist.image}
          alt={artist.name}
          className="w-32 h-32 rounded-md object-cover"
        />
        <div className="flex flex-col items-start">
          <h2 className="text-2xl font-bold">{artist.name}</h2>
          <p className="text-muted-foreground">{artist.albumsCount} albums</p>
          <div className="flex space-x-2 mt-2">
            {artist.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Partie 2 */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Discographie</h3>
        <div className="flex flex-row flex-wrap gap-4 pr-4">
          {artist.discography
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((album) => (
              <CardAlbum
                key={album.id}
                image={album.cover}
                title={album.name}
                like={album.like}
                artistName={artist.name}
                artistId={artist.id}
                albumId={album.id}
              />
            ))}
        </div>
      </section>

      <Separator />

      {/* Partie 3 */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Artistes similaires</h3>
        <div className="flex flex-row flex-wrap gap-4 pr-4">
          {/* {artist.similar.map((simArtist) => (
            < CardArtist key={simArtist.name} image={simArtist.image} title={simArtist.name} />

          ))} */}
        </div>
      </section>

    </div>
  )
}
