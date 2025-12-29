// src/components/onPlay.ts
type PlayHandler = (id: number | null, ids: number[], mode?: "play" | "queue" | "queueNext") => void;
let playHandler: PlayHandler | null = null;

export function registerPlay(fn: PlayHandler) {
  playHandler = fn;
}

export function triggerPlay(id: number | null, ids: number[], mode?: "play" | "queue" | "queueNext") {
  playHandler?.(id, ids, mode);
}
