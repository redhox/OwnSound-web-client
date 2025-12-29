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
    SidebarTrigger,
    SidebarProvider
  } from "@/components/ui/sidebar";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";

export default function AppSidebar({ setView }: { setView: (v:any) => void }) {
    return (
      <Sidebar className="w-64">
      <SidebarHeader>
        <h1 className="mt-4 text-3xl font-bold">OwnSound</h1>
      </SidebarHeader>
  
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("home")}>
                  Accueil
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("likeTrack")}>
                  like track
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("artists")}>
                  like artists
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("albums")}>
                  like albums
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("playlistslike")}>
                playlistslike
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    );
  }