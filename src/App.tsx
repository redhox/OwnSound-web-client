import { useState, useRef, useEffect  } from "react";
import { useAuth } from "@/AuthContext"
import {
  SidebarProvider
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import './App.css'
import { registerOpenAlbum ,registerOpenArtist,registerOpenPlaylist} from "@/components/onOpen";
import {registerPlay} from "@/components/onPlay"
import { ThemeProvider } from "@/components/theme-provider"
import AudioPlayer from "@/components/AudioPlayer";
import type { AudioPlayerHandle } from "@/components/AudioPlayer";
import PlaylistTracksTable from "./components/playlist";
import AlbumView from "@/components/Album";
import HomeMusicView from "./components/home";
import ArtistView  from "./components/Artist";
import PlaylistView from "./components/playlistView"
import SearchResultView  from "./components/recherche";
import LikeExplorerView from "./components/like";
import LikeTrack from "@/components/likeTrack"
import AppSidebar  from "@/components/Sidebar";




export default function App() {
  const { user, logout } = useAuth()

  const [search, setSearch] = useState("");

  const audioRef = useRef<AudioPlayerHandle>(null);
  useEffect(() => {
    registerPlay((id, ids, mode) => {
      audioRef.current?.playTrack(id, ids, mode);
    });
  }, []);

  const [view, setView] = useState<"albumview" |"album" | "playlist" | "home" | "artist" | "search" | "albums" | "artists" | "playlistslike" | "playlistsView" | "artistview" | "likeTrack" >("home")

  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null)
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null)

  useEffect(() => {
    registerOpenAlbum((albumId) => {
      setSelectedAlbumId(albumId);
      setView("albumview");
    });

    registerOpenArtist((artistId) => {
      setSelectedArtistId(artistId);
      setView("artistview");
    });
  }, []);
  useEffect(() => {
    registerOpenPlaylist((id) => {
      setSelectedPlaylistId(id);
      setView("playlistsView");
    });
  }, []);

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark">
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar className="z-0" setView={setView} />
          <main className="flex-1 flex flex-col items-start justify-start p-6 relative z-10">
            {/* Zone de recherche collée en haut à gauche */}
            <div className="flex items-center w-full justify-between">
  {/* Zone gauche : recherche */}
  <div className="flex items-center space-x-2">
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") setView("search");
      }}
      placeholder="Recherche..."
      className="w-80" // largeur fixe
    />
    <Button variant="secondary" className="p-2" onClick={() => setView("search")}>
      <Search className="w-4 h-4" />
    </Button>
  </div>

  <div className="flex items-center gap-4">
  {user && (
    <div className="text-sm text-muted-foreground">
      {user.username} · #{user.id}
    </div>
  )}
<Button
  variant="destructive"
  onClick={() => {
    logout()
  }}
>
  Déconnexion
</Button>
</div>

</div>



            {view === "likeTrack"  && <LikeTrack />}

            {view === "playlist" && <PlaylistTracksTable />}
            {view === "home"    && <HomeMusicView />}
            {view === "search" && <SearchResultView search={search} />}

            {view === "artists" && <LikeExplorerView showArtists />}
            {view === "artistview" && selectedArtistId !== null && ( <ArtistView artistId={selectedArtistId} />
            )}

            {view === "albums" && <LikeExplorerView showAlbums />}
            {view === "albumview"   && <AlbumView key={selectedAlbumId}  albumId={selectedAlbumId} />}


            {view === "playlistslike" && <LikeExplorerView showPlaylists />}
            {view === "playlistsView"  && <PlaylistView  playlistId={selectedPlaylistId} />}


            <AudioPlayer  ref={audioRef}  />
          </main>

        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
