import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Volume2, List, Heart ,Shuffle} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateLike } from "@/api/likes";
import { openAlbum,openArtist } from  "@/components/onOpen"
import { fetchTrackByListID } from "@/api/track";
type ApiTrack = {
  id: number;
  title: string;
  duration: string;
  albumName: string;
  albumId: number;
  artistId: number;
  like: boolean;
  path: string;
};



export type AudioPlayerHandle = {
  playTrack: (id: number | null, ids: number[], mode?: "play" | "queue" | "queueNext") => void;
};

const AudioPlayer = forwardRef<AudioPlayerHandle>(({ }, ref) => {
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [queueIds, setQueueIds] = useState<number[]>([]);
  const [queueTracks, setQueueTracks] = useState<ApiTrack[]>([]);
  const [track, setTrack] = useState<ApiTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showQueue, setShowQueue] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  // refs pour playNext fiable
  const queueIdsRef = useRef<number[]>([]);
  const currentIdRef = useRef<number | null>(null);

  useEffect(() => { queueIdsRef.current = queueIds; }, [queueIds]);
  useEffect(() => { currentIdRef.current = currentId; }, [currentId]);

  async function handleLikeClick(id: number, currentLike: boolean, type: "track" | "album" | "artist") {
    try {
      const updated = await updateLike(id, !currentLike, type);
      console.log("Like updated:", updated);
    } catch (err) {
      console.error(err);
    }
  }


  useImperativeHandle(ref, () => ({
    playTrack: async (id: number | null, ids: number[], mode: "play" | "queue" | "queueNext" = "play") => {
      if (!ids?.length) return;
      const tracks = await fetchTrackByListID(ids);
      if (!tracks.length) return;

      switch(mode) {
        case "play":
          setQueueIds(ids);
          setQueueTracks(tracks);
          queueIdsRef.current = ids;
          const toPlay = id != null ? tracks.find(t => t.id === id) || tracks[0] : tracks[0];
          setCurrentId(toPlay.id);
          setTrack(toPlay);
          setIsPlaying(true);
          break;

        case "queue":
          setQueueIds(prevIds => {
            const toAdd = ids.filter(i => !prevIds.includes(i));
            const newQueueIds = [...prevIds, ...toAdd];
            fetchTrackByListID(toAdd).then(fetched => {
              setQueueTracks(prevTracks => {
                const map = new Map(prevTracks.map(t => [t.id, t]));
                fetched.forEach(t => map.set(t.id, t));
                return [...newQueueIds.map(id => map.get(id)!).filter(Boolean)];
              });
              queueIdsRef.current = newQueueIds;
            });
            return newQueueIds;
          });
          break;

        case "queueNext": {
          const currentIndex = currentId != null ? queueIds.indexOf(currentId) : -1;
          const toAdd = ids.filter(i => !queueIds.includes(i));
          if (!toAdd.length) break;

          const fetched = await fetchTrackByListID(toAdd);
          const newQueueIds = currentIndex >= 0
            ? [...queueIds.slice(0, currentIndex + 1), ...toAdd, ...queueIds.slice(currentIndex + 1)]
            : [...queueIds, ...toAdd];

          const map = new Map(queueTracks.map(t => [t.id, t]));
          fetched.forEach(t => map.set(t.id, t));
          const newQueueTracks = newQueueIds.map(id => map.get(id)!).filter(Boolean);

          setQueueIds(newQueueIds);
          setQueueTracks(newQueueTracks);
          queueIdsRef.current = newQueueIds;
          break;
        }
      }
    },
  }));

  const shuffleQueue = () => {
    if (!queueIds.length || currentId == null) return;
    const currentIndex = queueIds.indexOf(currentId);
    const before = queueIds.slice(0, currentIndex);
    const after = queueIds.slice(currentIndex + 1);

    const shuffleArray = (array: number[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const newQueueIds = [...shuffleArray(before), currentId, ...shuffleArray(after)];
    const trackMap = new Map(queueTracks.map(t => [t.id, t]));
    const newQueueTracks = newQueueIds.map(id => trackMap.get(id)!);

    setQueueIds(newQueueIds);
    setQueueTracks([...newQueueTracks]);
    queueIdsRef.current = newQueueIds;
  };

  useEffect(() => {
    if (currentId == null) return;
    const found = queueTracks.find(t => t.id === currentId);
    if (found) { setTrack(found); return; }

    let cancelled = false;
    fetchTracks([currentId]).then(list => { if (!cancelled && list.length) setTrack(list[0]); });
    return () => { cancelled = true; };
  }, [currentId, queueTracks]);

  useEffect(() => {
    if (!track?.path) return;
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.src = track.path;
    audio.volume = volume;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setDur = () => setDuration(audio.duration);
    const onEnd = () => playNext();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setDur);
    audio.addEventListener("ended", onEnd);

    if (isPlaying) audio.play();
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setDur);
      audio.removeEventListener("ended", onEnd);
    };
  }, [track?.path]);

  useEffect(() => { audioRef.current.volume = volume; }, [volume]);
  useEffect(() => { if (isPlaying) audioRef.current.play(); else audioRef.current.pause(); }, [isPlaying]);

  const playNext = () => {
    const q = queueIdsRef.current;
    const curr = currentIdRef.current;
    if (!q.length || curr == null) return;

    const index = q.indexOf(curr);
    const next = q[index + 1];
    if (next != null) {
      setCurrentId(next);
      setIsPlaying(true);
    } else {
      setWaitingForNext(true);
      setIsPlaying(false);
    }
  };

  const playPrev = () => {
    if (!queueIds.length || currentId == null) return;
    const index = queueIds.indexOf(currentId);
    const prev = queueIds[index - 1];
    if (prev != null) setCurrentId(prev);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(v => !v);
  };

  return (
    <Card className="fixed bottom-0 left-0 w-full rounded-none shadow-md z-40 p-2">
      <CardContent className="flex flex-col md:flex-row items-center justify-between p-0">
        <div className="flex flex-col w-100 rounded-sm">
          <div className="font-bold cursor-pointer rounded-sm" onClick={() => track?.albumId && openAlbum(track.albumId)}>
            {track?.title ?? ""}
          </div>
          <div className="text-sm cursor-pointer" onClick={() => track?.artistId && openArtist(track.artistId)}>
            {track?.albumName ?? ""}
          </div>
        </div>

        <div className="flex flex-col w-64">
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              if (!track) return;
              const newLike = !(track.like === true || track.like === "True");
              await handleLikeClick(track.id, !newLike, "track");
              setTrack(prev => prev ? { ...prev, like: newLike } : prev);
            }}
          >
            <Heart className="w-4 h-4" fill={track && (track.like === true || track.like === "True") ? "red" : "none"} />
          </Button>
        </div>

        <Button variant="ghost" onClick={shuffleQueue}><Shuffle /></Button>

        <div className="flex space-x-4 ml-5 mr-5">
          <Button variant="ghost" onClick={playPrev}><SkipBack className="w-5 h-5" /></Button>
          <Button variant="ghost" onClick={togglePlay}>{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</Button>
          <Button variant="ghost" onClick={playNext}><SkipForward className="w-5 h-5" /></Button>
        </div>

        <Slider value={[currentTime]} max={duration || 100} onValueChange={v => { audioRef.current.currentTime = v[0]; setCurrentTime(v[0]); }} />

        <Button variant="ghost" onClick={() => setShowQueue(s => !s)}><List className="w-5 h-5 ml-5 mr-5" /></Button>

        <div className="flex items-center w-70 pr-10 space-x-2">
          <Volume2 className="w-5 h-5" />
          <Slider value={[volume]} min={0} max={1} step={0.01} onValueChange={v => { setVolume(v[0]); audioRef.current.volume = v[0]; }} />
        </div>
      </CardContent>

      {showQueue && (
        <div className="absolute bottom-32 right-10 w-100 max-h-96">
          <Card className="shadow-lg rounded-md">
            <ScrollArea className="h-96 p-1">
              {queueTracks.map(t => (
                <div key={t.id} className="p-2 cursor-pointer flex bg-neutral-900 m-1 rounded-sm">
                  <div className="font-medium truncate" onClick={() => setCurrentId(t.id)}>{t.title}</div>
                  <div className="text-sm truncate ml-auto" onClick={() => t.albumId && openAlbum(t.albumId)}>{t.albumName}</div>
                </div>
              ))}
            </ScrollArea>
          </Card>
        </div>
      )}
    </Card>
  );
});

export default AudioPlayer;
