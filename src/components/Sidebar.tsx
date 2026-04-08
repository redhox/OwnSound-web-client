import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Home, Heart, User, Disc, Music, ListMusic, Radio, Search, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAllPlaylists } from "@/api/playlist";
import { openPlaylist } from "@/components/onOpen";

export default function AppSidebar({ setView, className }: { setView: (v: any) => void, className?: string }) {
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    fetchAllPlaylists().then(setPlaylists).catch(() => setPlaylists([]));
  }, []);

  const menuItems = [
    { label: "Accueil", icon: Home, view: "home" },
    { label: "Historique", icon: History, view: "history" },
    { label: "Like", icon: Heart, view: "likeTrack" },
    { label: "Artists", icon: User, view: "artists" },
    { label: "Albums", icon: Disc, view: "albums" },
    { label: "Playlists", icon: ListMusic, view: "playlistslike" },
  ];

  return (
    <Sidebar className={cn("border-r bg-card", className)}>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-lg p-2">
            <Radio className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">OwnSound</h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-24">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Bibliothèque
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    onClick={() => setView(item.view)}
                    className="flex items-center gap-3 px-4 py-6 rounded-md transition-all hover:bg-accent group"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 mx-4" />
        
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Vos Playlists
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {playlists.map((playlist) => (
                <SidebarMenuItem key={playlist.id}>
                  <SidebarMenuButton
                    onClick={() => openPlaylist(playlist.id)}
                    className="flex items-center gap-3 px-4 py-2"
                  >
                    <ListMusic className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{playlist.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-xl bg-accent/50 p-4">
          <p className="text-xs text-muted-foreground font-medium">Connecté en tant que</p>
          <p className="text-sm font-bold truncate">Utilisateur</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}