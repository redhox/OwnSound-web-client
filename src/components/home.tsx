import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import TagsSection from "@/components/tag"
import {
  CardArtist,
  CardTrack,
  CardSectionAlbum
} from "@/components/MiniCard"

import { fetchTrackByListID } from "@/api/track"
import { fetchTrackLike } from "@/api/track"
import { fetchAlbumLike, fetchGet_album,fetchAlbumsByArtist } from "@/api/album"
import { fetchArtistLike } from "@/api/artist"

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

  useEffect(() => {
    async function buildPart2Tracks() {
      const ids: number[] = []
  
      /* 1 — Track aléatoire depuis tracks likés */
      const likedTracksObj = await fetchTrackLike()
      if (likedTracksObj?.listMusique?.length > 0) {
        const track = randomItem(likedTracksObj.listMusique)
        if (track) ids.push(track.id)
      }
  
      /* 2 — 3 albums likés → 1 track chacun */
      const likedAlbums = await fetchAlbumLike()
      const albums = randomItems(likedAlbums, 3)
      for (const album of albums) {
        if (!album) continue
        const albumObj = await fetchGet_album(album.id)
        if (albumObj?.listMusique?.length > 0) {
          const t = randomItem(albumObj.listMusique)
          if (t) ids.push(t.id)
        }

      }
  
      /* 3 — 2 artistes likés → 1 album → 1 track */
      const likedArtists = await fetchArtistLike()
      const artists = randomItems(likedArtists, 2)
      for (const artist of artists) {
        if (!artist) continue
        const artistAlbums = await fetchAlbumsByArtist(artist.id)
        const album = randomItem(artistAlbums)
        if (!album) continue
        const albumObj = await fetchGet_album(album.id)
        if (albumObj?.listMusique?.length > 0) {
          const t = randomItem(albumObj.listMusique)
          if (t) ids.push(t.id)
        }
        
      }


      /* Suppression des doublons et récupération des tracks */
      const uniqueIds = [...new Set(ids)]
      const finalTracks = await fetchTrackByListID(uniqueIds)
      console.log("album",albums)
      console.log("artists",artists)
      console.log("uniqueIds",uniqueIds)
      console.log("finalTracks",finalTracks)
      setTracks(finalTracks)
    }

    buildPart2Tracks()
  }, [])
  

  return (
    <div className="flex flex-col w-10/12 space-y-8 mt-9 pb-50">

      {/* PARTIE 1 — ARTISTS */}
      <section>
        <div className="flex flex-row gap-4 px-4 py-2">
          {[1, 2, 3, 4].map((i) => (
            <CardArtist
              key={i}
              image="https://client.morgan-coulm.fr/musique/500x500-000000-80-0-0.jpg"
              title="artist name"
            />
          ))}
        </div>
      </section>

      {/* PARTIE 2 — TRACKS */}
      <section>
        <div className="grid grid-cols-3 gap-3">
          {tracks.map((track) => (
            <Card key={track.id} className="rounded-sm">
              <CardTrack
                imageLink={track.coverSmall}
                trackName={track.title}
                trackId={track.id}
                artistName={track.artistName}
                artistId={track.artistId}
                data={tracks}
                onPlay={(id, ids) => onPlay(id, ids)}
              />
            </Card>
          ))}
        </div>
      </section>

      {/* PARTIE 3 — ALBUMS */}
      <section>
        <h3 className="text-lg font-semibold">Recommandé</h3>
        <CardSectionAlbum albumsIds={[4, 10, 423]} />
      </section>

      {/* PARTIE 4 — TAGS */}
      <TagsSection />

      {/* PARTIE 5 — ALBUMS */}
      <section>
        <h3 className="text-lg font-semibold">Discover</h3>
        <CardSectionAlbum albumsIds={[4, 423]} />
      </section>

      {/* PARTIE 6 — ALBUMS */}
      <section>
        <h3 className="text-lg font-semibold">Albums like Recommandé</h3>
        <CardSectionAlbum albumsIds={[4, 423]} />
      </section>

    </div>
  )
}
