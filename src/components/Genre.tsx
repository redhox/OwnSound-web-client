import { Separator } from "@/components/ui/separator"
import { CardAlbum } from "@/components/MiniCard"
import { useState, useEffect } from "react";
import { fetchAlbumsByGenre } from "@/api/album"
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play, Tag, Shuffle } from "lucide-react";
import { triggerPlay } from "@/components/onPlay";

type Album = {
  id: number;
  name: string;
  like: boolean;
  artistName: string;
  artistId: number;
  cover: string;
};

type GenreData = {
  id: number;
  name: string;
  listAlbums: Album[];
};

export default function GenreView({ genreId }: { genreId: number }) {
  const [genre, setGenre] = useState<GenreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handlePlayGenre = async () => {
    if (!genre?.listAlbums?.length) return;
    const firstAlbum = genre.listAlbums[0];
    const m = await import("@/api/album");
    const albumData = await m.fetchGet_album(firstAlbum.id);
    if (albumData?.listMusique?.length) {
      const ids = albumData.listMusique.map((t: any) => t.id);
      triggerPlay(ids[0], ids, "play");
    }
  };

  const handleShuffleGenre = async () => {
    if (!genre?.listAlbums?.length) return;
    const randomAlbum = genre.listAlbums[Math.floor(Math.random() * genre.listAlbums.length)];
    const m = await import("@/api/album");
    const albumData = await m.fetchGet_album(randomAlbum.id);
    
    if (albumData?.listMusique?.length) {
      const ids = albumData.listMusique.map((t: any) => t.id);
      const shuffledIds = [...ids].sort(() => Math.random() - 0.5);
      triggerPlay(shuffledIds[0], shuffledIds, "play");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAlbumsByGenre(genreId)
      .then((raw) => {
        setGenre({
          id: raw.id,
          name: raw.name,
          listAlbums: raw.listAlbums || [],
        });
      })
      .catch(() => setGenre(null))
      .finally(() => setIsLoading(false));
  }, [genreId]);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full max-w-[1200px] space-y-8 mt-9 py-6">
        <div className="flex items-end gap-8 px-2">
          <Skeleton className="w-48 h-48 rounded-2xl shadow-2xl shrink-0" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mt-12 px-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!genre) return null;

  return (
    <div className="flex flex-col w-full max-w-[1400px] space-y-12 mt-2 md:mt-6 pb-32">
      {/* Genre Header */}
      <section className="relative flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 px-2 text-center md:text-left">
        <div className="relative shrink-0 group">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-gradient-to-br from-primary/80 to-primary-foreground/20 flex items-center justify-center shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
             <Tag className="w-24 h-24 md:w-32 md:h-32 text-white/50" />
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start gap-3 md:gap-4 pb-2">
          <div className="flex items-center gap-2 px-1">
             <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">Genre Musical</span>
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none mb-1 md:mb-2">
            {genre.name}
          </h2>
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-1">{genre.listAlbums.length} albums</span>
          </div>

          <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-6">
            <Button 
              size="lg" 
              className="rounded-full px-8 md:px-10 gap-2 hover:scale-105 transition-transform h-10 md:h-11"
              onClick={handlePlayGenre}
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Écouter
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="rounded-full px-8 md:px-10 gap-2 hover:scale-105 transition-transform h-10 md:h-11 border-muted-foreground/20 hover:bg-muted"
              onClick={handleShuffleGenre}
            >
              <Shuffle className="w-4 h-4 md:w-5 md:h-5" /> Aléatoire
            </Button>
          </div>
        </div>
      </section>

      <Separator className="bg-border/40" />

      {/* Albums Section */}
      <section className="px-2 space-y-8">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <h3 className="text-3xl font-black tracking-tight">Albums {genre.name}</h3>
              <p className="text-muted-foreground">Découvrez le meilleur de ce genre</p>
           </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {genre.listAlbums.map((album) => (
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
      </section>
    </div>
  );
}
