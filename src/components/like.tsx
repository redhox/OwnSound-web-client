import { useState, useEffect, useMemo } from "react";
import { CardAlbum, CardArtist, CardPlaylist } from "@/components/MiniCard";
import { fetchAllPlaylists, fetchPlaylistLike } from "@/api/playlist";
import { fetchAlbumLike, fetchAllAlbum } from "@/api/album";
import { fetchArtistLike, fetchAllArtist } from "@/api/artist";
import { fetchTrackLike } from "@/api/track";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Shuffle, Heart, Music, User, Disc, ListMusic, ChevronLeft, ChevronRight } from "lucide-react";
import { triggerPlay } from "@/components/onPlay";
import PlaylistTracksTable from "@/components/playlist";

const PAGE_SIZE = 12;

export default function LikeExplorerView({
  showArtists,
  showAlbums,
  showPlaylists,
}: {
  showArtists?: boolean;
  showAlbums?: boolean;
  showPlaylists?: boolean;
}) {
  const [albums, setAlbums] = useState<any[] | null>(null);
  const [albumSource, setAlbumSource] = useState<"byList" | "all">("byList");
  const [artistsData, setArtistsData] = useState<any[] | null>(null);
  const [artistSource, setArtistSource] = useState<"byList" | "all">("byList");
  const [playlistsData, setPlaylistsData] = useState<any[] | null>(null);
  const [tracksData, setTracksData] = useState<any[] | null>(null);

  const [pageAlbums, setPageAlbums] = useState(1);
  const [pageArtists, setPageArtists] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Controlled tab state
  const initialTab = showArtists ? "artists" : showAlbums ? "albums" : showPlaylists ? "playlists" : "tracks";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update activeTab if props change (e.g. navigation from sidebar)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [showArtists, showAlbums, showPlaylists]);

  // Fetch data
  useEffect(() => {
    // Only show full loading on first mount or when multiple things change
    // For sub-filter changes, we could have more granular loading, 
    // but for now let's just make sure we don't lose the tab.
    setIsLoading(true);
    const promises = [
      (albumSource === "byList" ? fetchAlbumLike() : fetchAllAlbum()).then(setAlbums),
      (artistSource === "byList" ? fetchArtistLike() : fetchAllArtist()).then(setArtistsData),
      fetchAllPlaylists().then(setPlaylistsData),
      fetchTrackLike().then(res => setTracksData(res.listMusique || []))
    ];

    Promise.all(promises)
      .finally(() => setIsLoading(false));
  }, [albumSource, artistSource]);

  const handleShufflePlay = () => {
    if (!tracksData?.length) return;
    const ids = tracksData.map(t => t.id);
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    triggerPlay(shuffled[0], shuffled, "play");
  };

  const paginatedAlbums = useMemo(() => {
    if (!albums) return [];
    const start = (pageAlbums - 1) * PAGE_SIZE;
    return albums.slice(start, start + PAGE_SIZE);
  }, [albums, pageAlbums]);

  const paginatedArtists = useMemo(() => {
    if (!artistsData) return [];
    const start = (pageArtists - 1) * PAGE_SIZE;
    return artistsData.slice(start, start + PAGE_SIZE);
  }, [artistsData, pageArtists]);

  const PaginationControls = ({ current, total, onChange }: { current: number, total: number, onChange: (p: number) => void }) => {
    if (total <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
        <Button variant="outline" size="icon" disabled={current === 1} onClick={() => onChange(current - 1)} className="rounded-full h-8 w-8">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {start > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => onChange(1)} className="rounded-full h-8 w-8 p-0">1</Button>
            {start > 2 && <span className="text-muted-foreground px-1">...</span>}
          </>
        )}

        {pages.map(p => (
          <Button
            key={p}
            variant={p === current ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(p)}
            className="rounded-full h-8 w-8 p-0"
          >
            {p}
          </Button>
        ))}

        {end < total && (
          <>
            {end < total - 1 && <span className="text-muted-foreground px-1">...</span>}
            <Button variant="outline" size="sm" onClick={() => onChange(total)} className="rounded-full h-8 w-8 p-0">{total}</Button>
          </>
        )}

        <Button variant="outline" size="icon" disabled={current >= total} onClick={() => onChange(current + 1)} className="rounded-full h-8 w-8">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  if (isLoading && !albums && !artistsData) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 py-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 py-6 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter uppercase">Bibliothèque</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 fill-primary text-primary" /> Vos favoris et toute la collection.
          </p>
        </div>
        <Button onClick={handleShufflePlay} className="rounded-full gap-2 shadow-lg hover:scale-105 transition-transform w-fit">
          <Shuffle className="w-4 h-4" /> Lecture aléatoire
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-8">
          <TabsTrigger value="tracks" className="gap-2 px-6">
            <Music className="w-4 h-4" /> Like
          </TabsTrigger>
          <TabsTrigger value="albums" className="gap-2 px-6">
            <Disc className="w-4 h-4" /> Albums
          </TabsTrigger>
          <TabsTrigger value="artists" className="gap-2 px-6">
            <User className="w-4 h-4" /> Artists
          </TabsTrigger>
          <TabsTrigger value="playlists" className="gap-2 px-6">
            <ListMusic className="w-4 h-4" /> Playlists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="animate-in fade-in duration-300">
          <div className="rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
             <PlaylistTracksTable data={tracksData || []} />
          </div>
        </TabsContent>

        <TabsContent value="albums" className="space-y-6 animate-in fade-in duration-300">
          <div className="flex gap-2">
            <Button variant={albumSource === "byList" ? "default" : "outline"} size="sm" onClick={() => setAlbumSource("byList")} className="rounded-full">Likés</Button>
            <Button variant={albumSource === "all" ? "default" : "outline"} size="sm" onClick={() => setAlbumSource("all")} className="rounded-full">Tous</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {paginatedAlbums.map(album => (
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
          <PaginationControls
            current={pageAlbums}
            total={Math.ceil((albums?.length || 0) / PAGE_SIZE)}
            onChange={setPageAlbums}
          />
        </TabsContent>

        <TabsContent value="artists" className="space-y-6 animate-in fade-in duration-300">
          <div className="flex gap-2">
            <Button variant={artistSource === "byList" ? "default" : "outline"} size="sm" onClick={() => setArtistSource("byList")} className="rounded-full">Likés</Button>
            <Button variant={artistSource === "all" ? "default" : "outline"} size="sm" onClick={() => setArtistSource("all")} className="rounded-full">Tous</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {paginatedArtists.map(artist => (
              <CardArtist
                key={artist.id}
                artistId={artist.id}
                like={artist.like}
                image={artist.image}
                name={artist.name}
              />
            ))}
          </div>
          <PaginationControls
            current={pageArtists}
            total={Math.ceil((artistsData?.length || 0) / PAGE_SIZE)}
            onChange={setPageArtists}
          />
        </TabsContent>

        <TabsContent value="playlists" className="animate-in fade-in duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {playlistsData?.map(playlist => (
              <CardPlaylist
                key={playlist.id}
                playlistId={playlist.id}
                name={playlist.name}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
