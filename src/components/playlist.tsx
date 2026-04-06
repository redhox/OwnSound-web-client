import { useMemo, useState, useEffect } from "react"
import { Play, Heart, MoreHorizontal, Clock, Plus, Trash2, ListPlus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { updateLike } from "@/api/likes"
import {
  updatePlaylistTracks,
  fetchAllPlaylists,
  createPlaylist,
} from "@/api/playlist"
import { Button } from "@/components/ui/button"
import { openAlbum, openArtist } from "@/components/onOpen"
import { triggerPlay } from "@/components/onPlay"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type PlaylistTrack = {
  id: number
  title: string
  artistId?: number
  artistName?: string
  albumId?: number
  albumName?: string
  duration: string
  date?: string
  like: boolean
}

type Playlist = {
  id: number
  name: string
}

function NewPlaylistInput({
  onAddToPlaylist,
}: {
  onAddToPlaylist?: (playlistId: number) => void
}) {
  const [name, setName] = useState("")

  const handleCreate = async () => {
    const v = name.trim()
    if (!v) return
    const result = await createPlaylist(v)
    const newId = result.playlist_id
    setName("")
    onAddToPlaylist?.(newId)
  }

  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <input
        className="w-full h-8 px-2 text-sm border rounded bg-background"
        placeholder="Nouvelle playlist..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          e.stopPropagation();
          if (e.key === "Enter") handleCreate();
        }}
      />
      <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleCreate}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function PlaylistTracksTable({
  data = [],
  playlistId,
  albumId,
  artistId,
}: {
  data?: PlaylistTrack[]
  playlistId?: number
  albumId?: number
  artistId?: number
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  useEffect(() => {
    fetchAllPlaylists().then(setPlaylists).catch(() => setPlaylists([]))
  }, [])

  const hasSingleArtist = useMemo(() => {
    if (!data.length) return false
    const first = data[0].artistId
    return data.every(t => t.artistId === first)
  }, [data])

  const columns = useMemo<ColumnDef<PlaylistTrack>[]>(() => {
    const cols: ColumnDef<PlaylistTrack>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <div className="px-1">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className="translate-y-[2px]"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-1" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="translate-y-[2px]"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "bulk",
        header: ({ table }) => {
          const selectedRows = table.getSelectedRowModel().rows;
          const selectedIds = selectedRows.map(r => r.original.id);
          const hasSelection = selectedIds.length > 0;

          if (!hasSelection) return null;

          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary shrink-0 animate-in fade-in zoom-in-95">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => triggerPlay(selectedIds[0], selectedIds, "play")}>
                  <Play className="mr-2 h-4 w-4" /> Lire la sélection
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => triggerPlay(null, selectedIds, "queueNext")}>
                  <Play className="mr-2 h-4 w-4" /> Lire ensuite ({selectedIds.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => triggerPlay(null, selectedIds, "queue")}>
                  <ListPlus className="mr-2 h-4 w-4" /> Ajouter à la file ({selectedIds.length})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter à une playlist
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56">
                    <NewPlaylistInput
                      onAddToPlaylist={async newPlaylistId => {
                        await updatePlaylistTracks(newPlaylistId, selectedIds, "add")
                        fetchAllPlaylists().then(setPlaylists)
                        setRowSelection({})
                      }}
                    />
                    <DropdownMenuSeparator />
                    {playlists.map(p => (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePlaylistTracks(p.id, selectedIds, "add")
                          setRowSelection({})
                        }}
                      >
                        {p.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {playlistId && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await updatePlaylistTracks(playlistId, selectedIds, "del");
                        setRowSelection({});
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer de la playlist ({selectedIds.length})
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        cell: () => null,
      },
      {
        id: "index",
        header: () => <div className="w-4 text-center text-xs font-bold hidden sm:block">#</div>,
        cell: ({ row }) => <div className="w-4 text-center text-xs text-muted-foreground font-medium hidden sm:block">{row.index + 1}</div>,
      },
      {
        id: "play",
        cell: ({ row }) => (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() =>
              triggerPlay(
                row.original.id,
                data.map(d => d.id),
                "play",
              )
            }
          >
            <Play className="w-4 h-4 fill-current" />
          </Button>
        ),
      },
      {
        accessorKey: "title",
        header: () => <div className="text-left font-bold">Titre</div>,
        cell: ({ row }) => (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
              {row.original.title}
            </span>
          </div>
        ),
      },
    ]

    // Only show artist column if not in an album view, or if there's a track with a different artist
    const showArtistColumn = !albumId || data.some(t => t.artistId !== artistId);
    if (showArtistColumn) {
      cols.push({
        id: "artist",
        header: () => <div className="text-left font-bold hidden md:table-cell">Artiste</div>,
        cell: ({ row }) => (
          <div
            className="hidden md:table-cell text-xs text-muted-foreground truncate hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (row.original.artistId) openArtist(row.original.artistId);
            }}
          >
            {row.original.artistName}
          </div>
        ),
      });
    }

    // Only show album column if not in an album view
    if (!albumId) {
      cols.push({
        id: "album",
        header: () => <div className="text-left font-bold hidden lg:table-cell">Album</div>,
        cell: ({ row }) => (
          <div
            className="hidden lg:table-cell text-xs text-muted-foreground truncate hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (row.original.albumId) openAlbum(row.original.albumId);
            }}
          >
            {row.original.albumName}
          </div>
        ),
      });
    }

    cols.push(
      {
        accessorKey: "duration",
        header: () => <Clock className="w-4 h-4" />,
        cell: ({ getValue }) => <div className="text-xs text-muted-foreground tabular-nums">{getValue() as string}</div>
      },
      {
        id: "like",
        cell: ({ row }) => {
          const [liked, setLiked] = useState(row.original.like)
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLiked(!liked)
                      updateLike(row.original.id, !liked, "track")
                    }}
                  >
                    <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{liked ? "Retirer des favoris" : "Ajouter aux favoris"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        },
      },
      {
        id: "menu",
        cell: ({ row }) => (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); triggerPlay(row.original.id, [row.original.id], "queueNext"); }}>
                <Play className="mr-2 h-4 w-4" /> Lire ensuite
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); triggerPlay(null, [row.original.id], "queue"); }}>
                <ListPlus className="mr-2 h-4 w-4" /> Ajouter à la file d'attente
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter à une playlist
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56" onClick={(e) => e.stopPropagation()}>
                  <NewPlaylistInput
                    onAddToPlaylist={async newPlaylistId => {
                      await updatePlaylistTracks(newPlaylistId, [row.original.id], "add")
                      fetchAllPlaylists().then(setPlaylists)
                    }}
                  />
                  <DropdownMenuSeparator />
                  {playlists.map(p => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={(e) => { e.stopPropagation(); updatePlaylistTracks(p.id, [row.original.id], "add"); }}
                    >
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {playlistId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => { e.stopPropagation(); updatePlaylistTracks(playlistId, [row.original.id], "del"); }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer de la playlist
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }
    )

    return cols
  }, [albumId, playlists, data, playlistId, hasSingleArtist])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="rounded-md border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map(hg => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map(h => (
                <TableHead key={h.id} className="h-10 text-xs uppercase tracking-wider font-bold">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow 
              key={row.id} 
              className="group h-12 transition-colors hover:bg-muted/40 cursor-default"
              onClick={() => triggerPlay(row.original.id, data.map(d => d.id), "play")}
            >
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} className="py-0">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
