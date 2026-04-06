import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import TagsSection from "@/components/tag"
import {
  CardArtist,
  CardTrack,
  CardSectionAlbum
} from "@/components/MiniCard"

import { fetchTrackByListID, fetchTrackLike, fetchTracksByGenres } from "@/api/track"
import { fetchAlbumLike, fetchGet_album, fetchRecommendedAlbums, fetchGenresAlbums } from "@/api/album"
import { fetchUserHistory } from "@/api/user"
import { getToken } from "@/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, History, Radio, Flame } from "lucide-react"
import { triggerPlay } from "@/components/onPlay"

/* =======================
   TYPES
======================= */

type ApiTrack = {
  id: number
  title: string
  duration: string
  albumId: number
  albumName: string
  artistId: number
  artistName: string
  like: boolean
  path: string
  coverSmall: string
}

type ApiAlbum = {
  id: number
  name: string
  artistId: number
  artistName: string
  cover: string
  like: boolean
}

/* =======================
   UTILS
======================= */

function randomItem<T>(list: T[]): T | null {
  if (!Array.isArray(list) || list.length === 0) return null
  return list[Math.floor(Math.random() * list.length)]
}

function randomItems<T>(list: T[], count: number): T[] {
  return [...list].sort(() => 0.5 - Math.random()).slice(0, count)
}

/* =======================
   COMPONENT
======================= */

export default function HomeMusicView() {
  const [tracks, setTracks] = useState<ApiTrack[]>([])
  const [historyTracks, setHistoryTracks] = useState<ApiTrack[]>([])
  const [recommendedAlbums, setRecommendedAlbums] = useState<ApiAlbum[]>([])
  const [genreAlbums, setGenreAlbums] = useState<ApiAlbum[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function buildPart2Tracks() {
      setIsLoading(true)
      try {
        const token = getToken()
        const ids: number[] = []

        /* 1 — 2 tracks depuis les 10 derniers likes & 3 depuis tous les likes */
        const likedTracksObj = await fetchTrackLike()
        const likedTracks = likedTracksObj?.listMusique || []
        
        if (likedTracks.length > 0) {
          // Les plus récents sont à la fin de la liste
          const last10Likes = likedTracks.slice(-10)
          const chosenFromLast10 = randomItems(last10Likes, 2)
          ids.push(...chosenFromLast10.map(t => t.id))
          
          // 3 tracks depuis tous les likes (en évitant les doublons si possible)
          const otherLikes = likedTracks.filter(t => !ids.includes(t.id))
          const chosenFromAllLikes = randomItems(otherLikes.length > 0 ? otherLikes : likedTracks, 3)
          ids.push(...chosenFromAllLikes.map(t => t.id))
        }
    
        /* 2 — 2 tracks depuis l'historique */
        if (token) {
          const hist = await fetchUserHistory(token)
          setHistoryTracks(hist)
          
          // L'historique est déjà trié du plus récent au plus ancien (index 0 est le plus récent)
          const recentHistory = hist.slice(0, 20)
          const chosenFromHistory = randomItems(recentHistory.filter(t => !ids.includes(t.id)), 2)
          ids.push(...chosenFromHistory.map(t => t.id))

          const recAlbums = await fetchRecommendedAlbums()
          setRecommendedAlbums(recAlbums)

          const gAlbums = await fetchGenresAlbums()
          setGenreAlbums(gAlbums)
        }
    
        /* 3 — 2 albums likés → 1 track chacun */
        const likedAlbums = await fetchAlbumLike()
        const albums = randomItems(likedAlbums, 2)
        for (const album of albums) {
          if (!album) continue
          const albumObj = await fetchGet_album(album.id)
          if (albumObj?.listMusique?.length > 0) {
            const tracksInAlbum = albumObj.listMusique.filter((t: any) => !ids.includes(t.id))
            const t = randomItem(tracksInAlbum.length > 0 ? tracksInAlbum : albumObj.listMusique)
            if (t) ids.push(t.id)
          }
        }

        const uniqueIds = [...new Set(ids)]
        if (uniqueIds.length > 0) {
          const finalTracks = await fetchTrackByListID(uniqueIds)
          setTracks(finalTracks)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    buildPart2Tracks()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col w-full space-y-12 mt-6 animate-in fade-in duration-500">
        <section className="space-y-4">
           <Skeleton className="h-8 w-48" />
           <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-48 w-48 rounded-xl shrink-0" />)}
           </div>
        </section>
        <section className="space-y-4">
           <Skeleton className="h-8 w-48" />
           <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
           </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full space-y-16 mt-6 pb-32 animate-in fade-in duration-700">

      {/* TRACKS / Quick Picks */}
      {tracks.length > 0 && (
        <section className="px-1">
          <div className="flex items-center gap-2 mb-6">
             <Sparkles className="w-5 h-5 text-primary" />
             <h3 className="text-2xl font-black tracking-tighter uppercase">Sélection pour vous</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
            {tracks.map((track) => (
              <CardTrack
                key={track.id}
                imageLink={track.coverSmall}
                trackName={track.title}
                trackId={track.id}
                artistName={track.artistName}
                artistId={track.artistId}
                data={tracks}
                onPlay={async () => {
                  try {
                    const album = await fetchGet_album(track.albumId);
                    const firstGenre = album.genres?.[0]?.name;
                    if (firstGenre) {
                      const genreTracks = await fetchTracksByGenres([firstGenre]);
                      const ids = genreTracks.map(t => t.id);
                      // On place le morceau cliqué en premier, suivi des autres du même genre
                      const finalIds = [track.id, ...ids.filter(id => id !== track.id)];
                      triggerPlay(track.id, finalIds, "play");
                    } else {
                      triggerPlay(track.id, tracks.map(t => t.id), "play");
                    }
                  } catch (err) {
                    console.error("Genre playlist failed", err);
                    triggerPlay(track.id, tracks.map(t => t.id), "play");
                  }
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommandations Albums */}
      <section className="px-1">
        <div className="flex items-center gap-2 mb-6">
           <Flame className="w-5 h-5 text-primary" />
           <h3 className="text-2xl font-black tracking-tighter uppercase">Albums Recommandés</h3>
        </div>
        {recommendedAlbums.length > 0 ? (
            <CardSectionAlbum albumsIds={recommendedAlbums.map(album => album.id)} />
          ) : (
            <p>Aucun album recommandé trouvé.</p>
          )}
      </section>

      {/* Albums récents de l'historique */}
      {historyTracks.length > 0 && (
        <section className="px-1">
          <div className="flex items-center gap-2 mb-6">
             <History className="w-5 h-5 text-primary" />
             <h3 className="text-2xl font-black tracking-tighter uppercase">Reprendre l'écoute</h3>
          </div>
          <CardSectionAlbum 
            albumsIds={Array.from(new Set(historyTracks.map(t => t.albumId))).slice(0, 5)} 
          />
        </section>
      )}

      {/* TAGS */}
      <section className="px-1">
        <div className="flex items-center gap-2 mb-2">
           <Radio className="w-5 h-5 text-primary" />
           <h3 className="text-2xl font-black tracking-tighter uppercase">Explorer par genre</h3>
        </div>
        <TagsSection />
      </section>

      {/* Top Genres Albums */}
      {genreAlbums.length > 0 && (
        <section className="px-1">
          <div className="flex items-center gap-2 mb-6">
             <Sparkles className="w-5 h-5 text-primary" />
             <h3 className="text-2xl font-black tracking-tighter uppercase">Incontournables de vos genres préférés</h3>
          </div>
          <CardSectionAlbum albumsIds={genreAlbums.map(album => album.id)} />
        </section>
      )}

    </div>
  )
}
