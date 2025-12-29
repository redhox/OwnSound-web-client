import {useEffect, useMemo, useState ,useRef} from "react";
import { Button } from "@/components/ui/button";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { CardAlbum,CardSectionAlbum } from "@/components/MiniCard"
import PlaylistTracksTable from "@/components/playlist"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { openAlbum,openArtist } from "@/components/onOpen";
import { triggerPlay } from "@/components/onPlay";
import { fetchGet_album ,fetchAlbumsByArtist} from "@/api/album";

type Track = {
  id: number;
  title: string;
  duration: string;
};


export function AlbumTracksTable({ data }: { data: Track[] }) {
  
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Track, any>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center space-x-2 w-1"> {/* largeur fixe */}
          {/* Checkbox "Tout sélectionner" */}
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={value => table.toggleAllRowsSelected(!!value)}
            aria-label="Select all"
          />
          {/* Bouton 3 points réservé */}
          <div className="w-8 h-8 flex justify-center items-center">
            {(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && (
              <Button size="icon" variant="ghost">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 w-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
          {/* espace invisible pour le bouton */}
          <div className="w-8 h-8" />
        </div>
      ),
    },
    {
      id: "play",
      header: "",
      cell: () => <Button size="icon" variant="ghost"><Play className="w-12 h-4" /></Button>,
    },
    
    {
      accessorKey: "id",
      header: info => (
        <div className="flex items-center cursor-pointer select-none" onClick={info.column.getToggleSortingHandler()}>
          ID
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "title",
      header: info => (
        <div className="flex items-center cursor-pointer select-none flex-1" onClick={info.column.getToggleSortingHandler()}>
          Titre
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "duration",
      header: info => (
        <div className="flex items-center cursor-pointer select-none w-20" onClick={info.column.getToggleSortingHandler()}>
          Durée
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "like",
      header: "",
      cell: () => <Button size="icon" variant="ghost"><Heart className="w-4 h-4" /></Button>,
    },
    {
      id: "options",
      header: "",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Ajouter à la playlist</DropdownMenuItem>
            <DropdownMenuItem>Partager</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}






export default function AlbumView( {albumId}: {  albumId: number}) {
  const [album, setAlbum] = useState<AlbumData | null>(null);
  
  const handleArtistClick = () => {
    if (!album || !openArtist) return;
    openArtist(album.artistId);
  };
  
  const [albumsArtist, setAlbumsArtist] = useState<AlbumData[]>([]);
  useEffect(() => {
    if (!albumId) return;
  
    fetchGet_album(albumId)
      .then(setAlbum)
      .catch(() => setAlbum(null));
      
  }, [albumId]); // ← se déclenche à chaque changement d'albumId

  useEffect(() => {
    if (!album?.artistId) return;
    fetchAlbumsByArtist(album.artistId)
      .then(res => {
        const ids = (res.listAlbums ?? [])
          .map((a: any) => a.id)
          .filter((id: number) => id !== album.id);
        setAlbumsArtist(ids);
      })
      
  }, [album?.artistId]);
  
  
  if (!album) return null;

  const totalSeconds = album.listMusique.reduce((acc, track) => {
    const [min, sec] = track.duration.split(":").map(Number);
    return acc + min * 60 + sec;
  }, 0);

  const totalDuration = `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60)
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="flex flex-col w-9/12   space-y-8 mt-9 pb-50">
      
      {/* Bloc présentation */}
      <section className="flex items-center space-x-4">
        <img
          src={album.cover}
          alt="Pochette album"
          className="w-32 h-32 rounded-md object-cover"
        />
        <div className="flex flex-col items-start">
          <h2 className="text-2xl font-bold">{album.name}</h2>
          <p className="text-muted-foreground cursor-pointer hover:underline" onClick={handleArtistClick}>{album.artistName}</p>
          <p className="text-sm text-muted-foreground">Durée totale : {totalDuration}</p>
        </div>
      </section>

      {/* Bloc musiques */}
      <section>
        <h3 className="text-lg w-full  font-semibold mb-2">Musiques</h3>
        <PlaylistTracksTable data={album.listMusique } albumId={albumId} />


      </section>
      {/* Bloc album artist */}
      <section className="w-full max-w-[1200px] overflow-x-auto">
        <h3 className="text-lg font-semibold">album artiste</h3>
        <CardSectionAlbum albumsIds={albumsArtist} />
      </section>

      {/* Bloc suggestions */}
      <section className="w-full max-w-[1200px] overflow-x-auto">
        <h3 className="text-lg font-semibold">Propositions album </h3>
        <CardSectionAlbum albumsIds={albumsArtist} />
      </section>

    </div>
  );
}
