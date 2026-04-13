'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import type { VideoState } from '@/types/annotation'
import { FPS, FRAME_DURATION } from '@/constants/sports'

const initialState: VideoState = {
  isLoaded: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  playbackRate: 1,
  isMuted: false,
  src: null,
  fileName: null,
}

export function useVideoControl() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<VideoState>(initialState)
  const animRef = useRef<number>()

  const update = useCallback((patch: Partial<VideoState>) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  // RAF loop for smooth currentTime updates
  const startLoop = useCallback(() => {
    const tick = () => {
      const v = videoRef.current
      if (v) update({ currentTime: v.currentTime })
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
  }, [update])

  const stopLoop = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
  }, [])

  useEffect(() => () => stopLoop(), [stopLoop])

  const loadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    update({ src: url, fileName: file.name, isLoaded: false })
  }, [update])

  const loadUrl = useCallback((url: string) => {
    update({ src: url, fileName: url.split('/').pop() ?? url, isLoaded: false })
  }, [update])

  const onLoadedMetadata = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    update({ isLoaded: true, duration: v.duration, currentTime: 0 })
  }, [update])

  const play = useCallback(() => {
    videoRef.current?.play()
    update({ isPlaying: true })
    startLoop()
  }, [update, startLoop])

  const pause = useCallback(() => {
    videoRef.current?.pause()
    update({ isPlaying: false })
    stopLoop()
  }, [update, stopLoop])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v || !state.isLoaded) return
    state.isPlaying ? pause() : play()
  }, [state.isPlaying, state.isLoaded, play, pause])

  const seekTo = useCallback((time: number) => {
    const v = videoRef.current
    if (!v) return
    const clamped = Math.max(0, Math.min(state.duration, time))
    v.currentTime = clamped
    update({ currentTime: clamped })
  }, [state.duration, update])

  const stepFrame = useCallback((dir: 1 | -1) => {
    const v = videoRef.current
    if (!v) return
    pause()
    seekTo(v.currentTime + dir * FRAME_DURATION)
  }, [pause, seekTo])

  const setVolume = useCallback((vol: number) => {
    const v = videoRef.current
    if (!v) return
    v.volume = vol
    update({ volume: vol, isMuted: vol === 0 })
  }, [update])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    update({ isMuted: v.muted })
  }, [update])

  const setPlaybackRate = useCallback((rate: number) => {
    const v = videoRef.current
    if (!v) return
    v.playbackRate = rate
    update({ playbackRate: rate })
  }, [update])

  const onEnded = useCallback(() => {
    stopLoop()
    update({ isPlaying: false })
  }, [update, stopLoop])

  return {
    videoRef,
    state,
    loadFile,
    loadUrl,
    onLoadedMetadata,
    onEnded,
    togglePlay,
    seekTo,
    stepFrame,
    setVolume,
    toggleMute,
    setPlaybackRate,
    play,
    pause,
  }
}
