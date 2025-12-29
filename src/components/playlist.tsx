import { useMemo, useState, useEffect } from "react"
import { Play, Heart, MoreHorizontal } from "lucide-react"
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
} from "@/components/ui/dropdown-menu"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
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
        className="w-full h-8 px-2 text-sm border rounded"
        placeholder="Nouvelle playlist"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.stopPropagation()}
        onFocus={e => e.stopPropagation()}
      />
      <Button size="icon" className="h-8 w-8" onClick={handleCreate}>
        +
      </Button>
    </div>
  )
}

export default function PlaylistTracksTable({
  data = [],
  playlistId,
  albumId,
}: {
  data?: PlaylistTrack[]
  playlistId?: number
  albumId?: number
}) {
  const [sorting, setSorting] = useState<SortingState>([])
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
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={v => table.toggleAllRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={v => row.toggleSelected(!!v)}
          />
        ),
      },
      {
        id: "menu",
        header: ({ table }) => (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={`w-6 h-6 ${
                  table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
                    ? "visible"
                    : "invisible"
                }`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4} className="w-56">
              <DropdownMenuItem
                onSelect={() => {
                  const ids = table
                    .getSelectedRowModel()
                    .rows.map(r => r.original.id)
                  if (ids.length) triggerPlay(0, ids, "queueNext")
                }}
              >
                Ajouter à la suite
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  const ids = table
                    .getSelectedRowModel()
                    .rows.map(r => r.original.id)
                  if (ids.length) triggerPlay(0, ids, "queue")
                }}
              >
                Ajouter à la liste de lecture
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Ajouter à une playlist
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  <NewPlaylistInput
                    onAddToPlaylist={async newPlaylistId => {
                      const ids = table
                        .getSelectedRowModel()
                        .rows.map(r => r.original.id)
                      if (ids.length)
                        await updatePlaylistTracks(
                          newPlaylistId,
                          ids,
                          "add",
                        )
                      setPlaylists(p => [
                        ...p,
                        { id: newPlaylistId, name: "Nouvelle playlist" },
                      ])
                    }}
                  />
                  {playlists.map(p => (
                    <DropdownMenuItem
                      key={p.id}
                      onSelect={() => {
                        const ids = table
                          .getSelectedRowModel()
                          .rows.map(r => r.original.id)
                        if (ids.length)
                          updatePlaylistTracks(p.id, ids, "add")
                      }}
                    >
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {playlistId && (
                <DropdownMenuItem
                  className="text-red-500"
                  onSelect={() => {
                    const ids = table
                      .getSelectedRowModel()
                      .rows.map(r => r.original.id)
                    if (ids.length)
                      updatePlaylistTracks(playlistId, ids, "del")
                  }}
                >
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        cell: () => null,
      },
      {
        id: "play",
        cell: ({ row }) => (
          <span
            className="p-2 cursor-pointer"
            onClick={() =>
              triggerPlay(
                row.original.id,
                data.map(d => d.id),
                "play",
              )
            }
          >
            <Play className="w-4 h-4" />
          </span>
        ),
      },
      {
        id: "like",
        cell: ({ row }) => {
          const [liked, setLiked] = useState(row.original.like)
          return (
            <span
              className={`p-2 cursor-pointer ${
                liked ? "text-red-500" : "text-gray-400"
              }`}
              onClick={() => {
                setLiked(!liked)
                updateLike(row.original.id, !liked, "track")
              }}
            >
              <Heart className="w-4 h-4" fill={liked ? "red" : "none"} />
            </span>
          )
        },
      },
      {
        accessorKey: "title",
        header: () => <div className="text-left">Titre</div>,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() as string}</div>
        ),
      }

    ]
    if (!hasSingleArtist) {
      cols.push({
        id: "artist",
        header: () => <div className="text-left">Artiste</div>,
        cell: ({ row }) =>
          row.original.artistId ? (
            <div
              className="text-left cursor-pointer hover:underline"
              onClick={() => openArtist?.(row.original.artistId!)}
            >
              {row.original.artistName}
            </div>
          ) : null,
      })
    }
    
    if (!albumId) {
      cols.push({
        id: "album",
        header: () => <div className="text-left">Album</div>,
        cell: ({ row }) =>
          row.original.albumId ? (
            <div
              className="text-left cursor-pointer hover:underline"
              onClick={() => openAlbum?.(row.original.albumId!)}
            >
              {row.original.albumName}
            </div>
          ) : null,
      })
    }
    

    cols.push(
      { accessorKey: "duration", header: "Durée" },
      { accessorKey: "date", header: "Date" },
    )

    return cols
  }, [albumId, playlists, data, playlistId,hasSingleArtist])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(hg => (
          <TableRow key={hg.id}>
            {hg.headers.map(h => (
              <TableHead key={h.id}>
                {flexRender(h.column.columnDef.header, h.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
