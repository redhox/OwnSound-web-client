import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Heart, Clock, Music, Shuffle } from "lucide-react";
import PlaylistTracksTable from "@/components/playlist"
import { fetchTrackLike } from "@/api/track";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { triggerPlay } from "@/components/onPlay";

export default function LikeTrack() {
  const [playlist, setPlaylist] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchTrackLike()
      .then(res => {
        setPlaylist(res);
        setIsLoading(false);
      })
      .catch(() => {
        setPlaylist(null);
        setIsLoading(false);
      });
  }, []);

  const handleShufflePlay = () => {
    if (!playlist?.listMusique?.length) return;
    const ids = playlist.listMusique.map((t: any) => t.id);
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    triggerPlay(shuffled[0], shuffled, "play");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full max-w-[1200px] space-y-8 mt-9">
        <div className="flex items-end gap-6 px-2">
          <Skeleton className="w-64 h-64 rounded-lg shadow-2xl" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="space-y-4 px-2">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>
    );
  }

  if (!playlist) return null;

  const totalSeconds = playlist.listMusique.reduce((acc: number, track: any) => {
    const [min, sec] = track.duration.split(":").map(Number);
    return acc + min * 60 + sec;
  }, 0);

  const totalDuration = `${Math.floor(totalSeconds / 60)} min ${totalSeconds % 60} s`;

  return (
    <div className="flex flex-col w-full max-w-[1400px] space-y-12 mt-2 md:mt-6 pb-32">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 px-2 text-center md:text-left">
        <div className="relative group shrink-0">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-lg bg-gradient-to-br from-red-500/80 to-red-900 flex items-center justify-center shadow-[0_20px_50px_rgba(239,68,68,0.3)]">
            <Heart className="w-24 h-24 md:w-32 md:h-32 text-white fill-white/20" />
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start gap-3 md:gap-4 pb-2">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary px-1">Collection</span>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none mb-1 md:mb-2">
            Titres likés
          </h2>
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
            <span className="text-foreground font-bold">{playlist.name || "Ma Bibliothèque"}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{playlist.listMusique.length} titres</span>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {totalDuration}
            </span>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-4">
            <Button size="lg" className="rounded-full px-6 md:px-8 gap-2 hover:scale-105 transition-transform h-10 md:h-11" onClick={() => triggerPlay(playlist.listMusique[0]?.id, playlist.listMusique.map((t:any)=>t.id), "play")}>
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Écouter
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-6 md:px-8 gap-2 border-muted-foreground/20 hover:bg-muted h-10 md:h-11" onClick={handleShufflePlay}>
              <Shuffle className="w-4 h-4 md:w-5 md:h-5" /> Aléatoire
            </Button>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="px-2">
        <div className="flex items-center gap-2 mb-6 text-muted-foreground border-b border-border/40 pb-4">
          <Music className="w-5 h-5" />
          <h3 className="text-xl font-bold text-foreground">Titres favoris</h3>
        </div>
        <PlaylistTracksTable data={playlist.listMusique} />
      </section>

      <Separator className="bg-border/40" />
      
      <section className="px-2 py-8 text-center bg-muted/20 rounded-3xl border border-dashed border-border/60">
         <p className="text-muted-foreground italic">Ajoutez plus de titres à vos favoris pour enrichir votre collection !</p>
      </section>

    </div>
  );
}
