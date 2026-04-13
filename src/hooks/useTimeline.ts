'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import { DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM } from '@/constants/sports'

export function useTimeline(duration: number, currentTime: number, onSeek: (t: number) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const thumbCanvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)   // px per second
  const [offset, setOffset] = useState(0)           // seconds scrolled from left
  const [inPoint, setInPoint] = useState<number | null>(null)
  const [outPoint, setOutPoint] = useState<number | null>(null)
  const isDraggingRef = useRef(false)
  const lastXRef = useRef(0)

  // Convert time → canvas x
  const timeToX = useCallback((t: number, canvasWidth: number): number => {
    return (t - offset) * zoom
  }, [offset, zoom])

  // Convert canvas x → time
  const xToTime = useCallback((x: number): number => {
    return Math.max(0, Math.min(duration, x / zoom + offset))
  }, [offset, zoom, duration])

  // Auto-scroll: keep playhead visible
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.offsetWidth
    const playheadX = timeToX(currentTime, w)
    if (playheadX < 20 || playheadX > w - 20) {
      setOffset(Math.max(0, currentTime - w / zoom / 2))
    }
  }, [currentTime, timeToX, zoom])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const timeAtMouse = xToTime(mouseX)

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const factor = e.deltaY < 0 ? 1.15 : 0.87
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor))
      setZoom(newZoom)
      // Keep time under mouse stable
      setOffset(Math.max(0, timeAtMouse - mouseX / newZoom))
    } else {
      // Horizontal scroll
      const delta = e.deltaX || e.deltaY
      setOffset(prev => Math.max(0, Math.min(Math.max(0, duration - canvas.offsetWidth / zoom), prev + delta / zoom)))
    }
  }, [xToTime, zoom, duration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true
    lastXRef.current = e.clientX
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const t = xToTime(e.clientX - rect.left)
    onSeek(t)
  }, [xToTime, onSeek])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const t = xToTime(e.clientX - rect.left)
    onSeek(t)
    lastXRef.current = e.clientX
  }, [xToTime, onSeek])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const handleDblClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    return xToTime(e.clientX - rect.left)
  }, [xToTime])

  const setIn = useCallback((t: number) => setInPoint(t), [])
  const setOut = useCallback((t: number) => setOutPoint(t), [])
  const clearInOut = useCallback(() => { setInPoint(null); setOutPoint(null) }, [])

  return {
    canvasRef,
    thumbCanvasRef,
    zoom,
    setZoom,
    offset,
    setOffset,
    inPoint,
    outPoint,
    setIn,
    setOut,
    clearInOut,
    timeToX,
    xToTime,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDblClick,
  }
}
