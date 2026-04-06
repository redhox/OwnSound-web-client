import { useEffect, useState } from "react";
import { History, Play, Trash2, Clock, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchUserHistory } from "@/api/user";
import { getToken } from "@/AuthContext";
import PlaylistTracksTable from "@/components/playlist";
import { Skeleton } from "@/components/ui/skeleton";
import { triggerPlay } from "@/components/onPlay";

export default function HistoryView() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetchUserHistory(token)
      .then(setHistory)
      .catch((err) => console.error("Failed to fetch history:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePlayHistory = () => {
    if (!history.length) return;
    const allIds = history.map((t) => t.id);
    triggerPlay(allIds[0], allIds, "play");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full max-w-[1200px] space-y-8 mt-9">
        <div className="flex items-end gap-6">
          <Skeleton className="w-48 h-48 rounded-md shadow-2xl" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-3/4" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[1400px] space-y-12 mt-2 md:mt-6 pb-32">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 px-2">
        <div className="relative group shrink-0">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-lg bg-gradient-to-br from-primary/20 to-primary/80 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.02]">
            <History className="w-24 h-24 md:w-32 md:h-32 text-white/50" />
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start gap-3 md:gap-4 pb-2 text-center md:text-left">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary px-1">
            Playlist
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none mb-1 md:mb-2">
            Historique
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-xs md:text-sm font-medium">
            <span className="text-muted-foreground font-bold">Votre historique d'écoute</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{history.length} titres</span>
          </div>

          <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-4">
            <Button
              size="lg"
              className="rounded-full px-6 md:px-8 gap-2 hover:scale-105 transition-transform h-10 md:h-11"
              onClick={handlePlayHistory}
              disabled={history.length === 0}
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Écouter
            </Button>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="px-2">
        <div className="flex items-center gap-2 mb-6 text-muted-foreground">
          <ListMusic className="w-5 h-5" />
          <h3 className="text-xl font-bold text-foreground">Titres écoutés récemment</h3>
        </div>
        <PlaylistTracksTable data={history} />
      </section>
    </div>
  );
}
