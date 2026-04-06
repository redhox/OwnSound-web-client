import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Heart, MoreHorizontal, Clock, ListMusic, Music, Share2, Trash2, Shuffle } from "lucide-react";
import PlaylistTracksTable from "@/components/playlist"
import { fetchGetPlaylist } from "@/api/playlist";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { triggerPlay } from "@/components/onPlay";
import { updateLike } from "@/api/likes";

export default function PlaylistView({ playlistId }: { playlistId: number }) {
  const [playlist, setPlaylist] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handlePlayPlaylist = () => {
    if (!playlist?.listMusique?.length) return;
    const allIds = playlist.listMusique.map((t: any) => t.id);
    triggerPlay(allIds[0], allIds, "play");
  };

  const handleShufflePlaylist = () => {
    if (!playlist?.listMusique?.length) return;
    const allIds = playlist.listMusique.map((t: any) => t.id);
    const shuffledIds = [...allIds].sort(() => Math.random() - 0.5);
    triggerPlay(shuffledIds[0], shuffledIds, "play");
  };

  useEffect(() => {
    if (!playlistId) return;
    setIsLoading(true);
    fetchGetPlaylist(playlistId)
      .then(res => {
        setPlaylist(res);
        setIsLoading(false);
      })
      .catch(() => {
        setPlaylist(null);
        setIsLoading(false);
      });
  }, [playlistId]);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full max-w-[1200px] space-y-8 mt-9">
        <div className="flex items-end gap-6">
          <Skeleton className="w-52 h-52 rounded-md shadow-2xl" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
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
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-lg bg-gradient-to-br from-primary/20 to-primary/80 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <ListMusic className="w-24 h-24 md:w-32 md:h-32 text-white/50" />
          </div>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
             <Music className="w-12 h-12 md:w-16 md:h-16 text-white/50 animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start gap-3 md:gap-4 pb-2">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary px-1">Playlist</span>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none mb-1 md:mb-2">
            {playlist.name}
          </h2>
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
            <span className="text-foreground font-bold">{playlist.artistName || "Utilisateur"}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{playlist.listMusique.length} titres</span>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {totalDuration}
            </span>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-4">
            <Button 
              size="lg" 
              className="rounded-full px-6 md:px-8 gap-2 hover:scale-105 transition-transform h-10 md:h-11"
              onClick={handlePlayPlaylist}
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Écouter
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="rounded-full px-6 md:px-8 gap-2 hover:scale-105 transition-transform h-10 md:h-11 border-muted-foreground/20 hover:bg-muted"
              onClick={handleShufflePlaylist}
            >
              <Shuffle className="w-4 h-4 md:w-5 md:h-5" /> Aléatoire
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12 border-muted-foreground/20">
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12">
              <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="px-2">
        <div className="flex items-center gap-2 mb-6 text-muted-foreground">
          <Music className="w-5 h-5" />
          <h3 className="text-xl font-bold text-foreground">Contenu de la playlist</h3>
        </div>
        <PlaylistTracksTable data={playlist.listMusique} playlistId={playlistId} />
      </section>

      <Separator className="bg-border/40" />

      {/* Potential section for suggested content based on playlist tags/genre */}
      <section className="px-2 space-y-6">
        <h3 className="text-2xl font-bold tracking-tight">Suggestions pour vous</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <p className="text-muted-foreground italic text-sm">Bientôt disponible...</p>
        </div>
      </section>

    </div>
  );
}
