import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Play, Heart, MoreHorizontal } from "lucide-react"
import TagsSection from "@/components/tag"
import { CardAlbum ,CardArtist ,CardTrack,CardSectionAlbum} from "@/components/MiniCard"
import { fetchTrackByListID } from "@/api/track"
type ApiTrack = {
  id: number;
  title: string;
  duration: string;
  albumName: string;
  albumId: number;
  artistId: number;
  like: boolean;
  path: string;
  coverMedium:string;
};

type ApiAlbum = {
  id: number;
  name: string;
  like: boolean
  artistId: number;
  artistName:string;
  cover:string;
};
export default function HomeMusicView({}:{}) {
  const [tracks, setTracks] = useState<ApiTrack[]>([])
  useEffect(() => {
    fetchTrackByListID([234124,2,45,1,5,150,770,32,8]).then(setTracks)
  }, [])

  return (
    <div className="flex flex-col w-10/12 space-y-8 mt-9 pb-50">

      {/* Partie 1 – 4 tuiles  */}
      <section>255
        <div className="flex flex-row gap-4 relative px-4 py-2 text-gray-400 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.2)_0,rgba(255,0,0,0.2)_10px,transparent_10px,transparent_20px)]">
          {[1, 2, 3, 4].map((i) => (
            < CardArtist key={i} image={'https://client.morgan-coulm.fr/musique/500x500-000000-80-0-0.jpg'} title={'artist name'} />
          ))}
        </div>
      </section>

      {/* Partie 2 – 9 tuiles / 3 lignes TRACK TO PLAYLIST  */}
      <section className="bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.2)_0,rgba(255,0,0,0.2)_10px,transparent_10px,transparent_20px)]">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
        {tracks.map((track) => (
            <Card key={track.id} className="rounded-sm">
              <CardTrack
                imageLink={track.coverSmall}
                trackName={track.title}
                trackId={track.id}
                artistName={track.artistName}
                artistId={track.artistId}
                data={tracks}                         // ← EXACTEMENT comme dans la table
                onPlay={(id, ids) => onPlay(id, ids)}
              />
            </Card>
          ))}
        </div>
      </section>

      {/* Partie 3 – ALBUMS */}
        <section>
        <h3 className="text-lg font-semibold">Recommandé</h3>

        <CardSectionAlbum albumsIds={[4,10,423]}/>

        </section>

      {/* Partie 4 – TAGS SECTION */}

        < TagsSection />

      {/* Partie 5 – ALBUMS */}
      <section>
        <h3 className="text-lg font-semibold">Discover</h3>
        <CardSectionAlbum albumsIds={[4,423]}/>

        </section>

      {/* Partie 6 – ALBUMS */}
      <section>
        <h3 className="text-lg font-semibold">Albums like Recommandé </h3>
        <CardSectionAlbum albumsIds={[4,423]}/>

        </section>

    </div >
  )
}

