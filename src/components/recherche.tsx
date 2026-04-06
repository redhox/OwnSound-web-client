import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, MoreHorizontal, Music, User, Disc, Search, AlertCircle } from "lucide-react"
import { CardAlbum, CardArtist } from "@/components/MiniCard"
import PlaylistTracksTable from "@/components/playlist"
import { searchAPI } from "@/api/search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type SearchResultProps = {
  search: string;
  onPlay?: (id: number, ids: number[], mode?: "play" | "queue" | "queueNext") => void;
};

export default function SearchResultView({ search, onPlay }: SearchResultProps) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!search) {
      setTracks([]);
      setAlbums([]);
      setArtists([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const { tracks, albums, artists } = await searchAPI(search);
        setTracks(tracks || []);
        setAlbums(albums || []);
        setArtists(artists || []);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [search]);

  if (!search) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in duration-500">
        <Search className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-medium">Commencez à taper pour rechercher</h2>
        <p className="text-sm">Trouvez vos titres, artistes et albums préférés.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 py-6">
        <Skeleton className="h-10 w-64 px-1" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>
    );
  }

  const hasResults = tracks.length > 0 || albums.length > 0 || artists.length > 0;

  if (!hasResults && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in duration-500">
        <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-medium">Aucun résultat trouvé pour "{search}"</h2>
        <p className="text-sm">Vérifiez l'orthographe ou essayez d'autres mots-clés.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 py-6 pb-32">
      <div className="px-1">
        <h2 className="text-3xl font-black tracking-tighter uppercase">Résultats pour "{search}"</h2>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-8">
          <TabsTrigger value="all" className="gap-2 px-6">Tout</TabsTrigger>
          <TabsTrigger value="tracks" className="gap-2 px-6">
            <Music className="w-4 h-4" /> Titres
          </TabsTrigger>
          <TabsTrigger value="albums" className="gap-2 px-6">
            <Disc className="w-4 h-4" /> Albums
          </TabsTrigger>
          <TabsTrigger value="artists" className="gap-2 px-6">
            <User className="w-4 h-4" /> Artistes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-12 animate-in fade-in duration-300">
          {tracks.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl font-bold px-1">Meilleurs Titres</h3>
              <div className="rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
                <PlaylistTracksTable data={tracks.slice(0, 5)} onPlay={onPlay} />
              </div>
            </section>
          )}

          {artists.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl font-bold px-1">Artistes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {artists.slice(0, 6).map(artist => (
                  <CardArtist
                    key={artist.id}
                    artistId={artist.id}
                    image={artist.image}
                    name={artist.name}
                    like={artist.like}
                  />
                ))}
              </div>
            </section>
          )}

          {albums.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl font-bold px-1">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {albums.slice(0, 6).map(album => (
                  <CardAlbum
                    key={album.id}
                    image={album.cover}
                    title={album.name}
                    artistName={album.artistName}
                    artistId={album.artistId}
                    albumId={album.id}
                    like={album.like}
                  />
                ))}
              </div>
            </section>
          )}
        </TabsContent>

        <TabsContent value="tracks" className="animate-in fade-in duration-300">
          <div className="rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
            <PlaylistTracksTable data={tracks} onPlay={onPlay} />
          </div>
        </TabsContent>

        <TabsContent value="albums" className="animate-in fade-in duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {albums.map(album => (
              <CardAlbum
                key={album.id}
                image={album.cover}
                title={album.name}
                artistName={album.artistName}
                artistId={album.artistId}
                albumId={album.id}
                like={album.like}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="artists" className="animate-in fade-in duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {artists.map(artist => (
              <CardArtist
                key={artist.id}
                artistId={artist.id}
                image={artist.image}
                name={artist.name}
                like={artist.like}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}