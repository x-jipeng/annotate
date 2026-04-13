import { FPS } from '@/constants/sports'

export function formatTimeCode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const f = Math.floor((seconds % 1) * FPS)
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
    String(f).padStart(2, '0'),
  ].join(':')
}

export function formatMMSS(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatExportTime(start: number, end: number): string {
  return `${formatHHMMSS(start)}-${formatHHMMSS(end)}`
}

export function formatHHMMSS(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [String(h).padStart(2, '0'), String(m).padStart(2, '0'), String(s).padStart(2, '0')].join(':')
}

export function parseSeconds(mmss: string): number {
  const parts = mmss.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] ?? 0
}
