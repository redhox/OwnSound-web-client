import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/AuthContext"
import {
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LogOut, User, Settings, Bell, Shield } from "lucide-react";
import './App.css'
import { registerOpenAlbum, registerOpenArtist, registerOpenPlaylist, registerOpenGenre } from "@/components/onOpen";
import { registerPlay } from "@/components/onPlay"
import { ThemeProvider } from "@/components/theme-provider"
import AudioPlayer from "@/components/AudioPlayer";
import type { AudioPlayerHandle } from "@/components/AudioPlayer";
import PlaylistTracksTable from "./components/playlist";
import AlbumView from "@/components/Album";
import HomeMusicView from "./components/home";
import ArtistView from "./components/Artist";
import GenreView from "@/components/Genre";
import PlaylistView from "./components/playlistView"
import HistoryView from "./components/HistoryView";
import SearchResultView from "./components/recherche";
import LikeExplorerView from "./components/like";
import LikeTrack from "@/components/likeTrack"
import AppSidebar from "@/components/Sidebar";
import UserManagementView from "@/components/UserManagementView";
import AdminSettingsView from "@/components/AdminSettingsView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator";

export default function App() {
  const { user, token, logout } = useAuth()
  
  if (!user || !token) {
    logout()
    return null
  }

  const [search, setSearch] = useState("");
  const audioRef = useRef<AudioPlayerHandle>(null);

  useEffect(() => {
    registerPlay((id, ids, mode) => {
      audioRef.current?.playTrack(id, ids, mode);
    });
  }, []);

  const [view, setView] = useState<"albumview" | "album" | "playlist" | "home" | "artist" | "search" | "albums" | "artists" | "playlistslike" | "playlistsView" | "artistview" | "likeTrack" | "account" | "adminSettings" | "genreview" | "history">("home")

  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null)
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null)
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null)

  useEffect(() => {
    registerOpenAlbum((albumId) => {
      setSelectedAlbumId(albumId);
      setView("albumview");
    });

    registerOpenArtist((artistId) => {
      setSelectedArtistId(artistId);
      setView("artistview");
    });

    registerOpenGenre((genreId) => {
      setSelectedGenreId(genreId);
      setView("genreview");
    });
  }, []);

  useEffect(() => {
    registerOpenPlaylist((id) => {
      setSelectedPlaylistId(id);
      setView("playlistsView");
    });
  }, []);

  return (
    <ThemeProvider storageKey="data-theme" defaultTheme="dark">
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans antialiased">
          <AppSidebar className="z-20 border-r border-border/40" setView={setView} />
          
          <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
            {/* Header / Search Bar */}
            <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border/40 bg-background/95 backdrop-blur shrink-0 z-20 gap-2">
              <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-xl">
                <SidebarTrigger className="md:hidden" />
                <div className="relative w-full group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setView("search");
                    }}
                    placeholder="Artistes, titres..."
                    className="pl-10 w-full bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary h-9 md:h-10 rounded-full text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
                  <Bell className="w-5 h-5" />
                </Button>

                <Separator orientation="vertical" className="h-8 hidden sm:block" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full p-0 overflow-hidden border border-border/40 hover:bg-muted transition-colors">
                       <div className="bg-primary/20 w-full h-full flex items-center justify-center font-bold text-primary text-xs md:text-sm">
                          {user.username[0].toUpperCase()}
                       </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          ID: #{user?.id} · {user?.role}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setView("account")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon compte</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setView("account")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem onClick={() => setView("adminSettings")}>
                        <Shield className="mr-2 h-4 w-4 text-primary" />
                        <span className="font-bold text-primary">Paramètres Admin</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-32 md:pb-36 custom-scrollbar">
              <div className="max-w-[1600px] mx-auto w-full">
                {view === "likeTrack" && <LikeTrack />}
                {view === "playlist" && <PlaylistTracksTable />}
                {view === "home" && <HomeMusicView />}
                {view === "history" && <HistoryView />}
                {view === "search" && <SearchResultView search={search} />}

                {view === "artists" && <LikeExplorerView showArtists />}
                {view === "artistview" && selectedArtistId !== null && (
                  <ArtistView artistId={selectedArtistId} />
                )}

                {view === "albums" && <LikeExplorerView showAlbums />}
                {view === "albumview" && (
                  <AlbumView key={selectedAlbumId} albumId={selectedAlbumId!} />
                )}

                {view === "playlistslike" && <LikeExplorerView showPlaylists />}
                {view === "playlistsView" && <PlaylistView playlistId={selectedPlaylistId!} />}

                {view === "genreview" && selectedGenreId !== null && (
                  <GenreView genreId={selectedGenreId} />
                )}

                {view === "account" && <UserManagementView />}
                {view === "adminSettings" && <AdminSettingsView />}
              </div>
            </div>
          </main>

          <AudioPlayer ref={audioRef} />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
