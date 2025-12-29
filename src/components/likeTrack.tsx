import {useEffect, useMemo, useState ,useRef} from "react";
import { Button } from "@/components/ui/button";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { CardAlbum } from "@/components/MiniCard"
import PlaylistTracksTable from "@/components/playlist"
import { fetchTrackLike } from "@/api/track";





export default function LikeTrack( { }: {  }) {

  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);

  useEffect(() => {
    fetchTrackLike()
      .then(setPlaylist)
      .catch(() => setPlaylist(null));
  }, []);
  

  if (!playlist) return null;

  const totalSeconds = playlist.listMusique.reduce((acc, track) => {
    const [min, sec] = track.duration.split(":").map(Number);
    return acc + min * 60 + sec;
  }, 0);

  const totalDuration = `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60)
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="flex flex-col w-9/12 space-y-8 mt-9 pb-50">
      
      {/* Bloc présentation */}
      <section className="flex items-center space-x-4">
        <div className="flex flex-col items-start">
          <h2 className="text-2xl font-bold">{playlist.name}</h2>
          <p className="text-sm text-muted-foreground">Durée totale : {totalDuration}</p>
        </div>
      </section>

      {/* Bloc musiques */}
      <section>
        <h3 className="text-lg w-full  font-semibold mb-2">Musiques</h3>
        <PlaylistTracksTable data={playlist.listMusique} />
      </section>

    

    </div>
  );
}
