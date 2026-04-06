import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CardAlbum, CardArtist } from "@/components/MiniCard"
import { useState, useEffect } from "react";
import { fetchAlbumsByArtist } from "@/api/album"
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play, Heart, User, Music, Disc, Share2, MoreHorizontal, Shuffle } from "lucide-react";
import { triggerPlay } from "@/components/onPlay";
import { updateLike } from "@/api/likes";

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
  like: boolean;
};

export default function ArtistView({ artistId }: { artistId: number }) {
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handlePlayArtist = () => {
    if (!artist?.discography?.length) return;
    const firstAlbum = artist.discography[0];
    import("@/api/album").then(m => m.fetchGet_album(firstAlbum.id)).then(albumData => {
      if (albumData?.listMusique?.length) {
        const ids = albumData.listMusique.map((t: any) => t.id);
        triggerPlay(ids[0], ids, "play");
      }
    });
  };

  const handleShuffleArtist = async () => {
    if (!artist?.discography?.length) return;
    // Pick a random album to start with for variety
    const randomAlbum = artist.discography[Math.floor(Math.random() * artist.discography.length)];
    const m = await import("@/api/album");
    const albumData = await m.fetchGet_album(randomAlbum.id);
    
    if (albumData?.listMusique?.length) {
      const ids = albumData.listMusique.map((t: any) => t.id);
      const shuffledIds = [...ids].sort(() => Math.random() - 0.5);
      triggerPlay(shuffledIds[0], shuffledIds, "play");
    }
  };

  const handleToggleLike = async () => {
    if (!artist) return;
    const isCurrentlyLiked = artist.like === true || artist.like === "True";
    const newLike = !isCurrentlyLiked;
    setArtist({ ...artist, like: newLike });
    try {
      await updateLike(artist.id, newLike, "artist");
    } catch (err) {
      console.error("Failed to update artist like:", err);
      setArtist({ ...artist, like: isCurrentlyLiked });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAlbumsByArtist(artistId)
      .then((raw) => {
        const albums = Array.isArray(raw.listAlbums) ? raw.listAlbums : [];
        setArtist({
          id: raw.id,
          name: raw.name,
          image: raw.image,
          albumsCount: albums.length,
          tags: [], 
          discography: albums.map((a) => ({
            id: a.id,
            name: a.name,
            like: a.like,
            date: a.date,
            cover: a.cover,
          })),
          like: raw.like === true || raw.like === "True",
        });
      })
      .catch(() => setArtist(null))
      .finally(() => setIsLoading(false));
  }, [artistId]);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full max-w-[1200px] space-y-8 mt-9 py-6">
        <div className="flex items-end gap-8 px-2">
          <Skeleton className="w-64 h-64 rounded-full shadow-2xl shrink-0" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-4 w-48" />
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

  if (!artist) return null;

  return (
    <div className="flex flex-col w-full max-w-[1400px] space-y-12 mt-2 md:mt-6 pb-32">
      {/* Artist Profile Header */}
      <section className="relative flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 px-2 text-center md:text-left">
        <div className="relative shrink-0 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-foreground rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img
            src={artist.image || "https://client.morgan-coulm.fr/musique/500x500-000000-80-0-0.jpg"}
            alt={artist.name}
            className="relative w-48 h-48 md:w-64 md:h-64 rounded-full object-cover shadow-2xl border-4 border-background transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>

        <div className="flex flex-col items-center md:items-start gap-3 md:gap-4 pb-2">
          <div className="flex items-center gap-2 px-1">
             <div className="bg-primary/20 p-1 rounded-full">
                <User className="w-3 h-3 text-primary" />
             </div>
             <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">Artiste Vérifié</span>
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none mb-1 md:mb-2">
            {artist.name}
          </h2>
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-1"><Disc className="w-4 h-4" /> {artist.albumsCount} albums</span>
            {artist.tags.length > 0 && (
              <div className="hidden sm:flex gap-2">
                <span>•</span>
                {artist.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="px-2 py-0 h-5">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-6">
            <Button 
              size="lg" 
              className="rounded-full px-8 md:px-10 gap-2 hover:scale-105 transition-transform h-10 md:h-11"
              onClick={handlePlayArtist}
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Écouter
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="rounded-full px-8 md:px-10 gap-2 hover:scale-105 transition-transform h-10 md:h-11 border-muted-foreground/20 hover:bg-muted"
              onClick={handleShuffleArtist}
            >
              <Shuffle className="w-4 h-4 md:w-5 md:h-5" /> Aléatoire
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full h-10 w-10 md:h-12 md:w-12 border-muted-foreground/20 ${
                (artist.like === true || artist.like === "True") ? "text-red-500 border-red-500/30 bg-red-500/5" : ""
              }`}
              onClick={handleToggleLike}
            >
              <Heart 
                className="w-4 h-4 md:w-5 md:h-5" 
                fill={(artist.like === true || artist.like === "True") ? "currentColor" : "none"} 
              />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12">
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </section>

      <Separator className="bg-border/40" />

      {/* Discography Section */}
      <section className="px-2 space-y-8">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <h3 className="text-3xl font-black tracking-tight">Discographie</h3>
              <p className="text-muted-foreground">Dernières sorties et classiques</p>
           </div>
           <Button variant="ghost" size="sm">Trier par date</Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {artist.discography
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

      {/* Suggested or related content */}
      <section className="px-2 space-y-8 pt-8">
         <div className="space-y-1">
            <h3 className="text-3xl font-black tracking-tight">À propos</h3>
            <div className="bg-card/50 backdrop-blur-sm p-8 rounded-3xl border border-border/40 max-w-4xl shadow-sm">
               <p className="text-muted-foreground leading-relaxed italic text-lg">
                  Explorez le catalogue complet de {artist.name} sur OwnSound.
               </p>
            </div>
         </div>
      </section>
    </div>
  );
}
