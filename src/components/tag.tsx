import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2 } from "lucide-react"
import { fetchAllGenres } from "@/api/genre";
import { fetchTracksByGenres } from "@/api/track";
import { triggerPlay } from "@/components/onPlay";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Genre = {
  id: number;
  name: string;
};

export default function TagsSection() {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isLoadingGenres, setIsLoadingGenres] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
      async function loadGenres() {
        try {
          const data = await fetchAllGenres();
          setGenres(data);
        } catch (err) {
          console.error("Failed to load genres:", err);
        } finally {
          setIsLoadingGenres(false);
        }
      }
      loadGenres();
    }, []);

    const toggleTag = (tagName: string) => {
      setSelectedTags(prev =>
        prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
      );
    };

    const handlePlay = async () => {
      if (selectedTags.length === 0) return;
      setIsPlaying(true);
      try {
        const tracks = await fetchTracksByGenres(selectedTags);
        if (tracks.length > 0) {
          const ids = tracks.map(t => t.id);
          triggerPlay(ids[0], ids, "play");
        } else {
          console.warn("Aucun morceau trouvé pour ces genres");
          alert("Aucun morceau trouvé pour cette combinaison de genres.");
        }
      } catch (err) {
        console.error("Failed to play genres:", err);
      } finally {
        setIsPlaying(false);
      }
    };
  
    if (isLoadingGenres) {
      return (
        <div className="flex flex-wrap gap-2 my-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-9 w-20 rounded-md" />)}
        </div>
      );
    }

    return (
      <section className="my-6">
        <div className="flex items-start space-x-3 mb-4">
          <Button
            onClick={handlePlay}
            disabled={selectedTags.length === 0 || isPlaying}
            size="icon"
            className="rounded-full h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shrink-0 mt-1"
          >
            {isPlaying ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
          </Button>
          <div className="flex flex-wrap gap-2 min-h-[48px] max-h-[200px] overflow-y-auto py-1">
            {selectedTags.length === 0 && <span className="text-muted-foreground text-sm italic py-2">Sélectionnez des genres pour lancer une playlist</span>}
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="px-3 py-1 animate-in zoom-in-50 duration-300 h-fit">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
  
        <ScrollArea className="w-full rounded-md border border-border/20 bg-muted/20 h-[260px]">
          <div className="flex flex-col gap-2 p-4 w-max">
            {[0, 1, 2, 3, 4].map(rowIndex => (
              <div key={rowIndex} className="flex gap-2">
                {genres.filter((_, i) => i % 5 === rowIndex).map(genre => {
                  const isSelected = selectedTags.includes(genre.name);
                  return (
                    <Button
                      key={genre.id}
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => toggleTag(genre.name)}
                      className={`shrink-0 w-max h-9 ${isSelected ? "bg-primary text-primary-foreground border-primary" : "hover:bg-primary/10 transition-colors"}`}
                    >
                      {genre.name}
                    </Button>
                  );
                })}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>
    );
  }