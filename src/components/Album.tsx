import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Heart, MoreHorizontal, Clock, Disc, User, Calendar, ListMusic, Shuffle, Tag } from "lucide-react";
import { CardAlbum, CardSectionAlbum } from "@/components/MiniCard"
import PlaylistTracksTable from "@/components/playlist"
import { openArtist, openGenre } from "@/components/onOpen";
import { fetchGet_album, fetchAlbumsByArtist, fetchAlbumsByGenre } from "@/api/album";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { triggerPlay } from "@/components/onPlay";
import { updateLike } from "@/api/likes";

export default function AlbumView({ albumId }: { albumId: number }) {
  const [album, setAlbum] = useState<any | null>(null);
  const [albumsArtist, setAlbumsArtist] = useState<number[]>([]);
  const [genreSuggestions, setGenreSuggestions] = useState<{genreName: string, album: any}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handlePlayAlbum = () => {
    if (!album?.listMusique?.length) return;
    const allIds = album.listMusique.map((t: any) => t.id);
    triggerPlay(allIds[0], allIds, "play");
  };

  const handleShuffleAlbum = () => {
    if (!album?.listMusique?.length) return;
    const allIds = album.listMusique.map((t: any) => t.id);
    const shuffledIds = [...allIds].sort(() => Math.random() - 0.5);
    triggerPlay(shuffledIds[0], shuffledIds, "play");
  };

  const handleToggleLike = async () => {
    if (!album) return;
    const isCurrentlyLiked = album.like === true || album.like === "True";
    const newLike = !isCurrentlyLiked;
    setAlbum({ ...album, like: newLike });
    try {
      await updateLike(album.id, newLike, "album");
    } catch (err) {
      console.error("Failed to update album like:", err);
      setAlbum({ ...album, like: isCurrentlyLiked });
    }
  };

  useEffect(() => {
    if (!albumId) return;
    setIsLoading(true);
    fetchGet_album(albumId)
      .then(res => {
        setAlbum(res);
        setIsLoading(false);
      })
      .catch(() => {
        setAlbum(null);
        setIsLoading(false);
      });
  }, [albumId]);

  useEffect(() => {
    if (!album?.artistId) return;
    fetchAlbumsByArtist(album.artistId)
      .then(res => {
        const ids = (res.listAlbums ?? [])
          .map((a: any) => a.id)
          .filter((id: number) => id !== album.id);
        setAlbumsArtist(ids);
      })
  }, [album?.artistId, album?.id]);

  useEffect(() => {
    if (!album?.genres?.length) return;
    
    // Pick up to 5 random genres
    const shuffledGenres = [...album.genres].sort(() => Math.random() - 0.5).slice(0, 5);
    
    const fetchSuggestions = async () => {
      const suggestions: {genreName: string, album: any}[] = [];
      
      for (const genre of shuffledGenres) {
        try {
          const res = await fetchAlbumsByGenre(genre.id);
          const otherAlbums = (res.listAlbums || []).filter((a: any) => 
            a.id !== album.id && a.artistId !== album.artistId
          );
          
          if (otherAlbums.length > 0) {
            const randomAlbum = otherAlbums[Math.floor(Math.random() * otherAlbums.length)];
            suggestions.push({
              genreName: genre.name,
              album: randomAlbum
            });
          }
        } catch (err) {
          console.error(`Failed to fetch suggestions for genre ${genre.name}:`, err);
        }
      }
      setGenreSuggestions(suggestions);
    };

    fetchSuggestions();
  }, [album?.genres, album?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full max-w-[1200px] space-y-8 mt-9">
        <div className="flex items-end gap-6">
          <Skeleton className="w-52 h-52 rounded-md shadow-2xl" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
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

  if (!album) return null;

  const totalSeconds = album.listMusique.reduce((acc: number, track: any) => {
    const [min, sec] = track.duration.split(":").map(Number);
    return acc + min * 60 + sec;
  }, 0);

  const totalDuration = `${Math.floor(totalSeconds / 60)} min ${totalSeconds % 60} s`;

  return (
    <div className="flex flex-col w-full max-w-[1400px] space-y-12 mt-2 md:mt-6 pb-32">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 px-2">
        <div className="relative group shrink-0">
          <img
            src={album.cover}
            alt={album.name}
            className="w-48 h-48 md:w-64 md:h-64 rounded-lg object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
             <Disc className="w-12 h-12 md:w-16 md:h-16 text-white/50 animate-spin-slow" />
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start gap-3 md:gap-4 pb-2 text-center md:text-left">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary px-1">Album</span>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none mb-1 md:mb-2">
            {album.name}
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-xs md:text-sm font-medium">
            <Button variant="link" className="p-0 h-auto text-foreground hover:text-primary font-bold" onClick={() => openArtist(album.artistId)}>
              {album.artistName}
            </Button>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{album.listMusique.length} titres</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {totalDuration}
            </span>
            </div>

          {album.genres && album.genres.length > 0 && (
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
              {album.genres.map((genre: {id: number, name: string}, index: number) => (
                <button 
                  key={index}
                  onClick={() => openGenre(genre.id)}
                  className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}

            <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-4">

            <Button 
              size="lg" 
              className="rounded-full px-6 md:px-8 gap-2 hover:scale-105 transition-transform h-10 md:h-11"
              onClick={handlePlayAlbum}
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Écouter
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="rounded-full px-6 md:px-8 gap-2 hover:scale-105 transition-transform h-10 md:h-11 border-muted-foreground/20 hover:bg-muted"
              onClick={handleShuffleAlbum}
            >
              <Shuffle className="w-4 h-4 md:w-5 md:h-5" /> Aléatoire
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full h-10 w-10 md:h-12 md:w-12 border-muted-foreground/20 ${
                (album.like === true || album.like === "True") ? "text-red-500 border-red-500/30 bg-red-500/5" : ""
              }`}
              onClick={handleToggleLike}
            >
              <Heart 
                className="w-4 h-4 md:w-5 md:h-5" 
                fill={(album.like === true || album.like === "True") ? "currentColor" : "none"} 
              />
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
          <ListMusic className="w-5 h-5" />
          <h3 className="text-xl font-bold text-foreground">Liste des titres</h3>
        </div>
        <PlaylistTracksTable data={album.listMusique} albumId={albumId} artistId={album.artistId} />
      </section>

      <Separator className="bg-border/40" />

      {/* Artist Other Albums */}
      {albumsArtist.length > 0 && (
        <section className="px-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">Plus de {album.artistName}</h3>
              <p className="text-sm text-muted-foreground">D'autres albums qui pourraient vous plaire</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => openArtist(album.artistId)}>Voir tout</Button>
          </div>
          <CardSectionAlbum albumsIds={albumsArtist} />
        </section>
      )}

      {/* Suggested Content */}
      {genreSuggestions.length > 0 && (
        <section className="px-2 space-y-8 pt-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight">Découvertes par genre</h3>
            <p className="text-sm text-muted-foreground">Des albums similaires basés sur les genres de cet album</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {genreSuggestions.map((suggestion, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                   <Tag className="w-3 h-3 text-primary" />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-primary truncate max-w-full">
                     {suggestion.genreName}
                   </span>
                </div>
                <CardAlbum
                  albumId={suggestion.album.id}
                  title={suggestion.album.name}
                  image={suggestion.album.cover}
                  artistName={suggestion.album.artistName}
                  artistId={suggestion.album.artistId}
                  like={suggestion.album.like}
                />
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
