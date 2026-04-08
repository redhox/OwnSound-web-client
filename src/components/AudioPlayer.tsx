import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Volume2, List, Heart, Shuffle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateLike } from "@/api/likes";
import { openAlbum, openArtist } from "@/components/onOpen";
import { fetchTrackByListID, fetchTrackUrl } from "@/api/track";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ApiTrack = {
  id: number;
  title: string;
  duration: string;
  albumName: string;
  albumId: number;
  artistId: number;
  artistName: string;
  like: boolean;
  path: string;
  coverSmall: string;
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
  const [waitingForNext, setWaitingForNext] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  // refs pour playNext fiable
  const queueIdsRef = useRef<number[]>([]);
  const currentIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => { queueIdsRef.current = queueIds; }, [queueIds]);
  useEffect(() => { currentIdRef.current = currentId; }, [currentId]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

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

      switch (mode) {
        case "play":
          setQueueIds(ids);
          setQueueTracks(tracks);
          queueIdsRef.current = ids;
          const toPlay = id != null ? tracks.find(t => t.id === id) || tracks[0] : tracks[0];
          setCurrentId(toPlay.id);
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
          const curr = currentIdRef.current;
          const q = queueIdsRef.current;
          
          const toAdd = ids.filter(id => id !== curr);
          if (!toAdd.length) break;

          const fetched = await fetchTrackByListID(toAdd);
          const map = new Map(queueTracks.map(t => [t.id, t]));
          fetched.forEach(t => map.set(t.id, t));

          const remainingQ = q.filter(id => !toAdd.includes(id));
          const newCurrentIndex = curr != null ? remainingQ.indexOf(curr) : -1;

          const newQueueIds = newCurrentIndex >= 0
            ? [...remainingQ.slice(0, newCurrentIndex + 1), ...toAdd, ...remainingQ.slice(newCurrentIndex + 1)]
            : [...toAdd, ...remainingQ];

          const newQueueTracks = newQueueIds.map(id => map.get(id)!).filter(Boolean);

          setQueueIds(newQueueIds);
          setQueueTracks(newQueueTracks);
          queueIdsRef.current = newQueueIds;

          if (curr == null && toAdd.length > 0) {
            setCurrentId(toAdd[0]);
            setIsPlaying(true);
          }
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
    if ("mediaSession" in navigator && track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artistName,
        album: track.albumName,
        artwork: [
          { src: track.coverSmall, sizes: "96x96", type: "image/jpeg" },
          { src: track.coverSmall, sizes: "128x128", type: "image/jpeg" },
          { src: track.coverSmall, sizes: "192x192", type: "image/jpeg" },
          { src: track.coverSmall, sizes: "256x256", type: "image/jpeg" },
          { src: track.coverSmall, sizes: "384x384", type: "image/jpeg" },
          { src: track.coverSmall, sizes: "512x512", type: "image/jpeg" },
        ],
      });
      document.title = `${track.title} - ${track.artistName}`;
    } else if (!track) {
      document.title = "Music Player";
    }
  }, [track]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => {
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        playPrev();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        playNext();
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const skipTime = details.seekOffset || 10;
        audioRef.current.currentTime = Math.max(audioRef.current.currentTime - skipTime, 0);
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const skipTime = details.seekOffset || 10;
        audioRef.current.currentTime = Math.min(
          audioRef.current.currentTime + skipTime,
          audioRef.current.duration
        );
      });
    }
    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("seekto", null);
        navigator.mediaSession.setActionHandler("seekbackward", null);
        navigator.mediaSession.setActionHandler("seekforward", null);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  useEffect(() => {
    if ("mediaSession" in navigator && "setPositionState" in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration || 0,
          playbackRate: audioRef.current.playbackRate || 1,
          position: currentTime || 0,
        });
      } catch (err) {
        console.warn("Could not update media session position state:", err);
      }
    }
  }, [currentTime, duration]);

  useEffect(() => {
    if (currentId == null) return;
    audioRef.current.pause();
    let cancelled = false;

    const loadTrackAndUrl = async () => {
      let found = queueTracks.find((t) => t.id === currentId);
      if (!found) {
        try {
          const list = await fetchTrackByListID([currentId]);
          if (list.length) found = list[0];
        } catch (err) {
          console.error("Failed to fetch track info", err);
        }
      }

      if (found && !cancelled) {
        setTrack(found); // Set metadata immediately

        try {
          const url = await fetchTrackUrl(found.id);
          if (!cancelled) {
            setTrack({ ...found, path: url || "" });
          }
        } catch (err) {
          console.error("Failed to fetch track URL", err);
        }
      }
    };

    loadTrackAndUrl();
    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);
  useEffect(() => {
    if (isPlaying) audioRef.current.play();
    else audioRef.current.pause();
  }, [isPlaying]);

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
    const q = queueIdsRef.current;
    const curr = currentIdRef.current;
    if (!q.length || curr == null) return;
    const index = q.indexOf(curr);
    const prev = q[index - 1];
    if (prev != null) {
      setCurrentId(prev);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    setIsPlaying((prev) => {
      if (prev) audioRef.current.pause();
      else audioRef.current.play();
      return !prev;
    });
  };

  return (
    <TooltipProvider>
      <Card className="fixed bottom-0 left-0 w-full rounded-none border-t shadow-md z-[100] p-2 md:h-24 h-auto bg-background/95 backdrop-blur">
        <CardContent className="flex flex-col md:flex-row items-center justify-between h-full p-0 px-2 md:px-4 gap-2 md:gap-4">
          
          {/* Track Info */}
          <div className="flex items-center gap-3 w-full md:min-w-[200px] md:max-w-[30%] shrink-0">
            {track?.coverSmall && (
              <img src={track.coverSmall} alt={track.title} className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover shadow-sm" />
            )}
            <div className="flex flex-col truncate flex-1">
              <span
                className="font-bold cursor-pointer hover:underline truncate text-sm md:text-base"
                onClick={() => track?.albumId && openAlbum(track.albumId)}
              >
                {track?.title ?? "Aucun titre"}
              </span>
              <span
                className="text-[10px] md:text-xs text-muted-foreground cursor-pointer hover:underline truncate"
                onClick={() => track?.artistId && openArtist(track.artistId)}
              >
                {track?.artistName ?? ""}
              </span>
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 h-8 w-8"
              onClick={async () => {
                if (!track) return;
                const newLike = !(track.like === true || track.like === "True");
                await handleLikeClick(track.id, !newLike, "track");
                setTrack(prev => prev ? { ...prev, like: newLike } : prev);
              }}
            >
              <Heart className={`w-4 h-4 ${track && (track.like === true || track.like === "True") ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>

          {/* Controls & Progress */}
          <div className="flex flex-col items-center gap-1 md:gap-2 flex-1 w-full max-w-[600px]">
            <div className="flex items-center gap-3 md:gap-6">
              <Button variant="ghost" size="icon" onClick={shuffleQueue} className="h-8 w-8 hidden sm:flex">
                <Shuffle className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={playPrev} className="h-8 w-8">
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10 rounded-full shadow-lg hover:scale-105 transition-transform"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6" /> : <Play className="h-5 w-5 md:h-6 md:w-6 ml-0.5" />}
              </Button>

              <Button variant="ghost" size="icon" onClick={playNext} className="h-8 w-8">
                <SkipForward className="h-5 w-5" />
              </Button>

              <div className="md:hidden">
                 <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <List className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-0 overflow-hidden">
                      <SheetHeader className="p-6 border-b">
                        <SheetTitle>File d'attente</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="h-full pb-20">
                        <div className="flex flex-col gap-1 p-4">
                          {queueTracks.map((t, i) => (
                            <div
                              key={`${t.id}-${i}`}
                              className={`p-3 cursor-pointer flex items-center gap-4 rounded-xl transition-colors ${
                                t.id === currentId ? "bg-primary/10 text-primary" : "hover:bg-accent"
                              }`}
                              onClick={() => setCurrentId(t.id)}
                            >
                              <img src={t.coverSmall} alt={t.title} className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex flex-col truncate flex-1">
                                <span className="font-bold text-sm truncate">{t.title}</span>
                                <span className="text-xs opacity-70 truncate">{t.artistName}</span>
                              </div>
                              <span className="text-[10px] opacity-50">{t.duration}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
              </div>
            </div>

            <div className="flex items-center w-full gap-2 px-2">
              <span className="text-[9px] md:text-[10px] text-muted-foreground w-7 md:w-8 text-right tabular-nums">
                {new Date(currentTime * 1000).toISOString().substr(14, 5)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={v => {
                  audioRef.current.currentTime = v[0];
                  setCurrentTime(v[0]);
                }}
                className="flex-1"
              />
              <span className="text-[9px] md:text-[10px] text-muted-foreground w-7 md:w-8 tabular-nums">
                {new Date(duration * 1000).toISOString().substr(14, 5)}
              </span>
            </div>
          </div>

          {/* Additional controls (Desktop only or simplified) */}
          <div className="hidden md:flex items-center justify-end gap-2 min-w-[200px] max-w-[30%]">
            <Sheet>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <List className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent><p>File d'attente</p></TooltipContent>
              </Tooltip>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>File d'attente</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
                  <div className="flex flex-col gap-1">
                    {queueTracks.map((t, i) => (
                      <div
                        key={`${t.id}-${i}`}
                        className={`p-2 cursor-pointer flex items-center gap-3 rounded-md transition-colors ${
                          t.id === currentId ? "bg-secondary" : "hover:bg-accent"
                        }`}
                        onClick={() => setCurrentId(t.id)}
                      >
                        <img src={t.coverSmall} alt={t.title} className="w-10 h-10 rounded-sm object-cover" />
                        <div className="flex flex-col truncate flex-1">
                          <span className="font-medium text-sm truncate">{t.title}</span>
                          <span className="text-xs text-muted-foreground truncate">{t.artistName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{t.duration}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 w-32 ml-2">
              <Volume2 className="h-4 w-4 shrink-0" />
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={v => {
                  setVolume(v[0]);
                  audioRef.current.volume = v[0];
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});

export default AudioPlayer;
