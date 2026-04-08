import { Card, CardContent } from "@/components/ui/card"
import { Button } from "./ui/button"
import { Play, Pause, SkipBack, SkipForward, Volume2, Plus, List, Heart, MoreHorizontal, User, Disc, ListMusic } from "lucide-react";
import { useState, useEffect } from "react"
import { updateLike } from "@/api/likes";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { openAlbum, openArtist, openPlaylist } from "@/components/onOpen"
import { triggerPlay } from "@/components/onPlay";
import { fetchGet_album, fetchAlbumsByList, fetchAlbumsByArtist } from "@/api/album";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type CardAlbumProps = {
  image: string
  title: string
  like: boolean
  albumId: number
  artistId: number
  artistName: string | string[]
}

export function CardAlbum({
  image,
  title,
  artistName,
  albumId,
  artistId,
  like,
}: CardAlbumProps) {
  const [isLiked, setIsLiked] = useState(like);

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const albumData = await fetchGet_album(albumId);
    if (!albumData.listMusique?.length) return;
    const allTrackIds = albumData.listMusique.map((t: any) => t.id);
    triggerPlay(allTrackIds[0], allTrackIds, "play");
  };

  const handleQueueClick = async (e: React.MouseEvent, mode: "queue" | "queueNext") => {
    e.stopPropagation();
    const albumData = await fetchGet_album(albumId);
    if (!albumData.listMusique?.length) return;
    const allTrackIds = albumData.listMusique.map((t: any) => t.id);
    triggerPlay(null, allTrackIds, mode);
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLike = !isLiked;
    setIsLiked(newLike);
    try {
      await updateLike(albumId, newLike, "album");
    } catch (err) {
      console.error(err);
      setIsLiked(!newLike);
    }
  };

  return (
    <TooltipProvider>
      <Card className="w-full flex-shrink-0 group overflow-hidden border-none bg-transparent hover:bg-accent/10 transition-colors cursor-pointer" onClick={() => openAlbum(albumId)}>
        <CardContent className="p-0 space-y-3">
          <div className="relative aspect-square w-full rounded-md overflow-hidden shadow-lg">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url('${image}')` }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="rounded-full h-10 w-10 bg-primary text-primary-foreground hover:scale-110 transition-transform"
                    onClick={handlePlayClick}
                  >
                    <Play className="h-5 w-5 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Lire l'album</p></TooltipContent>
              </Tooltip>

              <div className="absolute bottom-3 right-3 flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={toggleLike}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}</p></TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleQueueClick(e, "queueNext")}>
                      Ajouter à la suite
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleQueueClick(e, "queue")}>
                      Ajouter à la file d'attente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex flex-col px-1 pb-2">
            <span className="font-semibold text-sm truncate group-hover:underline">
              {title}
            </span>
            <span
              className="text-xs text-muted-foreground truncate hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                openArtist(artistId);
              }}
            >
              {artistName}
            </span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

type CardArtistProps = {
  image: string
  name: string
  like: boolean
  artistId: number
}

export function CardArtist({ image, like, name, artistId }: CardArtistProps) {
  const [isLiked, setIsLiked] = useState(like);

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLike = !isLiked;
    setIsLiked(newLike);
    try {
      await updateLike(artistId, newLike, "artist");
    } catch (err) {
      console.error(err);
      setIsLiked(!newLike);
    }
  };

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const raw = await fetchAlbumsByArtist(artistId);
      const albums = Array.isArray(raw.listAlbums) ? raw.listAlbums : [];
      if (albums.length > 0) {
        const albumData = await fetchGet_album(albums[0].id);
        if (albumData?.listMusique?.length) {
          const ids = albumData.listMusique.map((t: any) => t.id);
          triggerPlay(ids[0], ids, "play");
        }
      }
    } catch (err) {
      console.error("Failed to play artist:", err);
    }
  };

  return (
    <TooltipProvider>
      <Card
        className="w-full flex-shrink-0 group overflow-hidden border-none bg-transparent hover:bg-accent/10 transition-colors cursor-pointer"
        onClick={() => openArtist(artistId)}
      >
        <CardContent className="p-0 space-y-3 flex flex-col items-center">
          <div className="relative aspect-square w-full rounded-full overflow-hidden shadow-lg">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url('${image}')` }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="rounded-full h-10 w-10 bg-primary text-primary-foreground hover:scale-110 transition-transform"
                    onClick={handlePlayClick}
                  >
                    <Play className="h-5 w-5 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Lire l'artiste</p></TooltipContent>
              </Tooltip>

              <div className="absolute bottom-3 right-3 flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={toggleLike}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="flex flex-col px-1 pb-2">
            <span className="font-semibold text-sm truncate group-hover:underline">
              {name}
            </span>
            <span className="text-xs text-muted-foreground truncate hover:underline" onClick={(e) => { e.stopPropagation(); openArtist(artistId); }}>
              Artiste
            </span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

type CardTrackProps = {
  imageLink: string
  trackName: string
  trackId: number
  artistName: string
  artistId: number
  data: { id: number }[]
  onPlay?: () => void
}

export function CardTrack({
  imageLink,
  trackName,
  trackId,
  artistId,
  artistName,
  data,
  onPlay,
}: CardTrackProps) {
  const handleClick = () => {
    if (onPlay) {
      onPlay();
    } else {
      triggerPlay(trackId, data.map(d => d.id), "play");
    }
  };

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent group transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative h-12 w-12 shrink-0 rounded overflow-hidden shadow">
        <img src={imageLink} alt={trackName} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-4 w-4 text-white fill-current" />
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
          {trackName}
        </span>
        <span
          className="text-xs text-muted-foreground truncate hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            openArtist(artistId);
          }}
        >
          {artistName}
        </span>
      </div>
    </div>
  )
}

export function CardPlaylist({
  name,
  playlistId,
  userName = "Utilisateur",
}: {
  name: string
  playlistId: number
  userName?: string
}) {
  return (
    <Card
      className="flex flex-col gap-3 group bg-transparent border-none hover:bg-accent/10 transition-colors p-3 cursor-pointer"
      onClick={() => openPlaylist(playlistId)}
    >
      <div className="relative aspect-square w-full bg-gradient-to-br from-primary/20 to-primary/80 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-[1.02] transition-transform">
        <ListMusic className="w-16 h-16 text-white/50" />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
           <Play className="w-12 h-12 text-white fill-white/20" />
        </div>
      </div>
      <div className="flex flex-col px-1">
        <span className="font-bold text-sm truncate group-hover:underline">{name}</span>
        <span className="text-xs text-muted-foreground truncate">Par {userName}</span>
      </div>
    </Card>
  )
}

export function CardSectionAlbum({
  albumsIds,
}: {
  albumsIds: number[]
}) {
  const [albums, setAlbums] = useState<any[]>([])

  useEffect(() => {
    if (!albumsIds.length) return;
    fetchAlbumsByList(albumsIds)
      .then(setAlbums)
      .catch(() => setAlbums([]));
  }, [albumsIds]);

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-6 pb-4">
        {albums.map((album, index) => (
          <div key={`${album.id}-${index}`} className="w-40 md:w-48 flex-shrink-0">
            <CardAlbum
              image={album.cover}
              title={album.name}
              like={album.like}
              artistName={album.artistName}
              artistId={album.artistId}
              albumId={album.id}
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
