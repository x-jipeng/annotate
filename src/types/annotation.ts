export type SportType = 'basketball' | 'football' | 'tennis' | 'baseball' | 'badminton'
export type AnnotationSource = 'manual' | 'ai'

export interface Annotation {
  id: string
  sport: SportType
  event: string
  centerTime: number   // seconds – the point user clicked
  startTime: number    // centerTime - 1
  endTime: number      // centerTime + 1
  source: AnnotationSource
  createdAt: number
}

export interface ExportAnnotation {
  sport: SportType
  event: string
  time: string             // "HH:MM:SS-HH:MM:SS"
  timestamp_start: number
  timestamp_end: number
  source: AnnotationSource
}

export interface SportConfig {
  id: SportType
  name: string
  nameEn: string
  color: string
  icon: string
  events: string[]
}

export interface VideoState {
  isLoaded: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  isMuted: boolean
  src: string | null
  fileName: string | null
}

export interface TimelineState {
  zoom: number          // pixels per second
  offset: number        // scroll offset in seconds
  isDragging: boolean
  isScrubbingFrames: boolean
  inPoint: number | null
  outPoint: number | null
}
