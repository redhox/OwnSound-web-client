import { Card, CardContent } from "@/components/ui/card"
import { Button } from "./ui/button"
import { Play, Pause, SkipBack, SkipForward, Volume2 ,Plus ,List,Heart, MoreHorizontal} from "lucide-react";
import AlbumView from "@/components/Album";
import { useState,useEffect } from "react"
import { updateLike } from "@/api/likes";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { openAlbum,openArtist,openPlaylist } from  "@/components/onOpen"
import { triggerPlay } from "@/components/onPlay";
import { fetchGet_album,fetchAlbumsByList } from "@/api/album";
type CardAlbumProps = {
  image: string
  title: string
  like: boolean
  albumId: number
  artistId: number
  artistName: string[]
}

export function CardAlbum({
  image,
  title,
  artistName,
  albumId,
  artistId,
  like,
}: CardAlbumProps) {
  const [album, setAlbum] = useState<AlbumData | null>(null);
  const [openMenu, setOpenMenu] = useState(false);

  const handleClick = () => {
    openAlbum(albumId); // pas de '?.'
  };
  
  const handleArtistClick = () => {
    openArtist(artistId); // pas de '?.'
  };
  

  const handlePlayClick = async () => {
    const albumData = await fetchGet_album(albumId);
    setAlbum(albumData);
    if (!albumData.listMusique?.length) return;

    const firstTrack = albumData.listMusique[0];
    const allTrackIds = albumData.listMusique.map(t => t.id);

    triggerPlay(firstTrack.id, allTrackIds, "play");
  };
  const handleQueueClick = async () => {
    const albumData: AlbumData = await fetchGet_album(albumId);
    setAlbum(albumData);
    if (!albumData.listMusique?.length) return;
  
    const allTrackIds = albumData.listMusique.map(t => t.id);
  
    triggerPlay(null, allTrackIds, "queue");
  };
  const handleQueueNextClick = async () => {
    const albumData: AlbumData = await fetchGet_album(albumId);
    setAlbum(albumData);
    if (!albumData.listMusique?.length) return;
  
    const allTrackIds = albumData.listMusique.map(t => t.id);
  
    triggerPlay(null, allTrackIds, "queueNext");
  }; 
  return (
    <Card className="h-60 w-55 flex-shrink-0 p-1 rounded-sm">
      <CardContent className="p-1 flex flex-col space-y-1 relative group">
        <div className="relative h-45 w-full rounded-sm overflow-hidden cursor-pointer">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${image}')` }}
            onClick={handleClick}
          />

          {/* PLAY */}
          <button
            className="absolute bottom-2 left-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/70 hover:bg-black "
            onClick={handlePlayClick}
          >
            <Play className="w-4 h-4 text-white" />
          </button>

          {/* MENU */}
          <div className="absolute bottom-2 left-12">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/70 hover:bg-black"
              onClick={() => setOpenMenu(v => !v)}
            >
              <MoreHorizontal className="w-4 h-4 text-white" />
            </button>
            {openMenu && (
              <div className="absolute bottom-10 left-0 w-48 max-h-64 z-50">
                <Card className="shadow-lg rounded-md bg-black/80 backdrop-blur">
                    <button
                      className="w-full text-left px-2 py-1 hover:bg-white/10"
                      onClick={handleQueueNextClick}
                    >
                      ajoute a la suite
                    </button>
                    <button
                      className="w-full text-left px-2 py-1 hover:bg-white/10"
                      onClick={handleQueueClick}
                    >
                      ajoute a la liste de lecture
                    </button>

                </Card>
              </div>
            )}
          </div>
          {/* LIKE */}
          <button
            className="absolute bottom-2 left-22 w-8 h-8 flex items-center justify-center rounded-full bg-black/70 hover:bg-black transition-opacity"
            onClick={() => {
              // Basculer immédiatement l'état local
              const newLike = !(album?.like ?? like);
              setAlbum(prev => prev ? { ...prev, like: newLike } : { ...prev, like: newLike });

              // Mettre à jour le serveur en arrière-plan
              updateLike(albumId, newLike, "album").catch(err => {
                console.error(err);
                // Optionnel : revenir en arrière en cas d'erreur
                setAlbum(prev => prev ? { ...prev, like: !newLike } : { ...prev, like: !newLike });
              });
            }}
          >
            <Heart
              className="w-4 h-4 text-white"
              fill={(album?.like ?? like) ? "red" : "none"}
              stroke={(album?.like ?? like) ? "red" : "white"}
            />
          </button>



        </div>

        <span
          className="text-xs font-medium truncate cursor-pointer hover:underline"
          onClick={handleClick}
        >
          {title}
        </span>

        {artistName && (
          <span
            className="text-xs text-muted-foreground truncate cursor-pointer hover:underline"
            onClick={handleArtistClick}
          >
            {artistName}
          </span>
        )}
      </CardContent>
    </Card>
  );
}


type CardArtistProps = {
  image: string
  name: string
  like:boolean
  artistId: number
}

export function CardArtist({ image,like, name,artistId}: CardArtistProps) {
  const handleClick = () => {
    if (openArtist) openArtist(artistId)
  }
  const [artist, setArtist] = useState<ArtistData | null>(null);

  return (
    <Card className="flex flex-col items-center w-54 p-1 mr-1 cursor-pointer">
      <CardContent className="p-0 relative h-45">
        <div
          className="h-45 w-45 mt-3 bg-muted rounded-xl flex items-center justify-center relative bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
          onClick={handleClick}
        >
        </div>
        <button
            className="absolute bottom-2 left-1 w-8 h-8 flex items-center justify-center rounded-full bg-black/70 hover:bg-black transition-opacity"
            onClick={() => {
              // Basculer immédiatement l'état local
              const newLike = !(artist?.like ?? like);
              setArtist(prev => prev ? { ...prev, like: newLike } : { ...prev, like: newLike });

              // Mettre à jour le serveur en arrière-plan
              updateLike(artistId, newLike, "artist").catch(err => {
                console.error(err);
                // Optionnel : revenir en arrière en cas d'erreur
                setArtist(prev => prev ? { ...prev, like: !newLike } : { ...prev, like: !newLike });
              });
            }}
          >
            <Heart
              className="w-4 h-4 text-white"
              fill={(artist?.like ?? like) ? "red" : "none"}
              stroke={(artist?.like ?? like) ? "red" : "white"}
            />
          </button>
      </CardContent>
      <span className="font-medium text-sm mt-2 text-center truncate">{name}</span>
    </Card>
  )
}


type CardTrackProps = {
  imageLink: string
  trackName: string
  trackId: number
  artistName: string
  artistId: number
  data: { id: number }[]         // ← équivalent de "data" de la table
}

export function CardTrack({
  imageLink,
  trackName,
  trackId,
  artistId,
  artistName,
  data,
}: CardTrackProps) {

  return (
    <CardContent className="p-1 flex items-center space-x-2 h-0">
      <div
        className="w-12 h-12 bg-muted rounded-sm bg-cover bg-center cursor-pointer"
        style={{ backgroundImage: `url('${imageLink}')` }}
        onClick={() => triggerPlay(trackId, [trackId],"play")}

      />

      <div className="flex flex-col items-start leading-none">
        <span
          className="text-sm font-medium cursor-pointer hover:underline"
          onClick={() => triggerPlay(trackId, [trackId],"play")}>
          {trackName}
        </span>
        <span
          className="text-xs text-muted-foreground cursor-pointer hover:underline "
          onClick={() => openArtist(artistId)}>
          {artistName}
        </span>
      </div>
    </CardContent>
  )
}

type CardPlaylistProps = {
  name: string
  playlistId: number
}

export function CardPlaylist({ name,playlistId}: CardPlaylistProps) {
  const handleClick = () => {
    if (openPlaylist) openPlaylist(playlistId)
  }
  return (
    <Card className="flex flex-col items-center w-54 p-1 mr-1 cursor-pointer">
      <CardContent className="p-0 relative h-45" onClick={handleClick}>
        <div
          className="h-52 w-52 bg-muted rounded-full flex items-center justify-center relative bg-cover bg-center"
          
        >
        </div>
      </CardContent>
      <span className="font-medium text-sm mt-2 text-center truncate">{name}</span>
    </Card>
  )
}

type Album = {
  id: number
  name: string
  cover: string
  like: boolean
  artistName: string
  artistId: number
}

type CardSectionAlbumProps = {
  albumsIds: number[]
}

export function CardSectionAlbum({
  albumsIds,
}: CardSectionAlbumProps) {
  const [albums, setAlbums] = useState<Album[]>([])

  useEffect(() => {
    if (!albumsIds.length) return;
    fetchAlbumsByList(albumsIds)
      .then(setAlbums)
      .catch(() => setAlbums([]));
  }, [albumsIds]);
  

  return (
    <ScrollArea className="w-full ">
      <div className="flex space-x-4 min-w-max">
        {albums.map(album => (
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
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
