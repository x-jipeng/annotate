'use client'
import { useEffect, useCallback, useRef } from 'react'
import type { Annotation } from '@/types/annotation'
import { SPORT_MAP } from '@/constants/sports'
import { formatMMSS } from '@/utils/time'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>
  duration: number
  currentTime: number
  annotations: Annotation[]
  inPoint: number | null
  outPoint: number | null
  zoom: number
  offset: number
  onSeek: (t: number) => void
  onDblClick: (e: React.MouseEvent<HTMLCanvasElement>) => number | undefined
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void
  onMouseUp: () => void
  onSelectAnnotation: (id: string) => void
  canvasRef: React.RefObject<HTMLCanvasElement>
  thumbCanvasRef: React.RefObject<HTMLCanvasElement>
  filterSport: string
}

const THUMB_H = 40
const MARKER_H = 56
const PROGRESS_H = 24
const TOTAL_H = THUMB_H + MARKER_H + PROGRESS_H

export default function Timeline({
  videoRef, duration, currentTime, annotations,
  inPoint, outPoint, zoom, offset, onSeek,
  onDblClick, onMouseDown, onMouseMove, onMouseUp,
  onSelectAnnotation, canvasRef, thumbCanvasRef, filterSport,
}: Props) {
  const dprRef = useRef(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
  const thumbsRef = useRef<Map<number, ImageBitmap>>(new Map())
  const thumbLoadingRef = useRef<Set<number>>(new Set())
  const animFrameRef = useRef<number>()

  // ── Resize canvas ──
  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = dprRef.current
    const w = canvas.parentElement?.offsetWidth ?? 800
    canvas.style.width = '100%'
    canvas.style.height = `${TOTAL_H}px`
    canvas.width = w * dpr
    canvas.height = TOTAL_H * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
  }, [canvasRef])

  useEffect(() => {
    resize()
    const ro = new ResizeObserver(resize)
    if (canvasRef.current?.parentElement) ro.observe(canvasRef.current.parentElement)
    return () => ro.disconnect()
  }, [resize, canvasRef])

  // ── Thumbnail extraction ──
  const extractThumbs = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.readyState || duration <= 0) return
    const W = canvas.offsetWidth
    const interval = Math.max(1, Math.round(1 / (zoom / W)))
    const count = Math.ceil(W / (THUMB_H * 1.78)) + 2
    const step = W / zoom / count
    for (let i = 0; i <= count; i++) {
      const t = offset + i * step
      const key = Math.floor(t * 4) / 4
      if (t > duration || thumbsRef.current.has(key) || thumbLoadingRef.current.has(key)) continue
      thumbLoadingRef.current.add(key)
      const offscreen = new OffscreenCanvas(Math.round(THUMB_H * 1.78), THUMB_H)
      const ctx2 = offscreen.getContext('2d')!
      const tmpVid = document.createElement('video')
      tmpVid.src = video.src
      tmpVid.currentTime = Math.max(0, Math.min(duration, key))
      tmpVid.muted = true
      tmpVid.preload = 'metadata'
      tmpVid.addEventListener('seeked', () => {
        ctx2.drawImage(tmpVid, 0, 0, offscreen.width, offscreen.height)
        createImageBitmap(offscreen).then(bmp => {
          thumbsRef.current.set(key, bmp)
          thumbLoadingRef.current.delete(key)
        })
      }, { once: true })
    }
  }, [videoRef, canvasRef, duration, zoom, offset])

  // ── Main draw ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.offsetWidth
    const dpr = dprRef.current
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // BG
    ctx.fillStyle = '#0c1525'
    ctx.fillRect(0, 0, W, TOTAL_H)

    // ── THUMBNAIL STRIP (top 40px) ──
    const thumbW = Math.round(THUMB_H * 1.78)
    if (duration > 0) {
      const visSeconds = W / zoom
      const thumbInterval = visSeconds / (W / thumbW)
      for (let t = Math.floor(offset / thumbInterval) * thumbInterval; t <= offset + visSeconds + thumbInterval; t += thumbInterval) {
        const x = (t - offset) * zoom
        if (x > W) break
        const key = Math.floor(t * 4) / 4
        const bmp = thumbsRef.current.get(key)
        if (bmp) {
          ctx.drawImage(bmp, x, 0, thumbW, THUMB_H)
          ctx.fillStyle = 'rgba(0,0,0,0.35)'
          ctx.fillRect(x, 0, thumbW, THUMB_H)
        } else {
          ctx.fillStyle = '#0a1520'
          ctx.fillRect(x, 0, thumbW, THUMB_H)
          ctx.fillStyle = '#00d4f5'
          ctx.font = '9px JetBrains Mono'
          ctx.fillText(formatMMSS(t), x + 4, THUMB_H / 2 + 3)
        }
      }
      // Border bottom of thumb strip
      ctx.fillStyle = 'rgba(0,212,245,0.12)'
      ctx.fillRect(0, THUMB_H - 1, W, 1)
    }

    if (duration <= 0) { ctx.restore(); return }

    // ── MARKER LAYER (40..96px) ──
    const MY = THUMB_H  // marker region top
    const MH = MARKER_H

    // In/out region
    if (inPoint !== null || outPoint !== null) {
      const i = inPoint ?? 0
      const o = outPoint ?? duration
      const ix = Math.max(0, (i - offset) * zoom)
      const ox = Math.min(W, (o - offset) * zoom)
      ctx.fillStyle = 'rgba(0,212,245,0.07)'
      ctx.fillRect(ix, MY, ox - ix, MH)
      if (inPoint !== null) {
        ctx.fillStyle = 'var(--cyan, #00d4f5)'
        ctx.fillRect((inPoint - offset) * zoom - 1, MY, 2, MH)
        ctx.font = 'bold 9px JetBrains Mono'
        ctx.fillStyle = '#00d4f5'
        ctx.fillText('I', (inPoint - offset) * zoom + 3, MY + 11)
      }
      if (outPoint !== null) {
        ctx.fillStyle = '#ff6b35'
        ctx.fillRect((outPoint - offset) * zoom - 1, MY, 2, MH)
        ctx.font = 'bold 9px JetBrains Mono'
        ctx.fillStyle = '#ff6b35'
        ctx.fillText('O', (outPoint - offset) * zoom + 3, MY + 11)
      }
    }

    // Grid ticks
    const visSeconds = W / zoom
    const tickStep = zoom >= 200 ? 1 : zoom >= 60 ? 5 : zoom >= 20 ? 10 : zoom >= 8 ? 30 : 60
    for (let t = Math.floor(offset / tickStep) * tickStep; t <= offset + visSeconds; t += tickStep) {
      const x = Math.round((t - offset) * zoom)
      if (x < 0 || x > W) continue
      const isMajor = t % (tickStep * 2) === 0 || t === 0
      ctx.fillStyle = isMajor ? 'rgba(74,112,144,0.7)' : 'rgba(74,112,144,0.3)'
      ctx.fillRect(x, MY, 1, isMajor ? 16 : 8)
      if (isMajor) {
        ctx.font = '9px JetBrains Mono'
        ctx.fillStyle = '#00d4f5'
        ctx.fillText(formatMMSS(t), x + 3, MY + 26)
      }
    }

    // Annotation highlight blocks
    const visAnns = filterSport === 'all' ? annotations : annotations.filter(a => a.sport === filterSport)
    visAnns.forEach(ann => {
      const color = SPORT_MAP[ann.sport]?.color ?? '#00d4f5'
      const sx = (ann.startTime - offset) * zoom
      const ex = (ann.endTime - offset) * zoom
      const bW = ex - sx

      // Block bg
      ctx.fillStyle = color + '22'
      ctx.fillRect(Math.max(0, sx), MY + 28, Math.min(bW, W - Math.max(0, sx)), MH - 30)

      // Block border top
      ctx.fillStyle = color + '88'
      ctx.fillRect(Math.max(0, sx), MY + 28, Math.min(bW, W - Math.max(0, sx)), 1)

      // Center line
      const cx = (ann.centerTime - offset) * zoom
      if (cx >= 0 && cx <= W) {
        ctx.save()
        ctx.shadowBlur = 8
        ctx.shadowColor = color
        ctx.fillStyle = color
        // Triangle
        ctx.beginPath()
        ctx.moveTo(cx, MY + 28)
        ctx.lineTo(cx - 5, MY + 15)
        ctx.lineTo(cx + 5, MY + 15)
        ctx.closePath()
        ctx.fill()
        // Stem
        ctx.fillRect(cx - 0.5, MY + 28, 1, MH - 30)
        ctx.restore()
        // Label
        ctx.font = '9px JetBrains Mono'
        ctx.fillStyle = color
        const label = SPORT_MAP[ann.sport]?.icon + ' ' + ann.event
        const tx = Math.max(4, Math.min(W - ctx.measureText(label).width - 4, cx - ctx.measureText(label).width / 2))
        ctx.fillText(label, tx, MY + 50)
      }
    })

    // ── PROGRESS BAR (96..120px) ──
    const PY = THUMB_H + MARKER_H
    ctx.fillStyle = 'rgba(0,212,245,0.06)'
    ctx.fillRect(0, PY, W, PROGRESS_H)
    const pProg = currentTime / duration
    ctx.fillStyle = 'rgba(0,212,245,0.3)'
    ctx.fillRect(0, PY, W * pProg, PROGRESS_H)
    // Mini annotation ticks on progress bar
    annotations.forEach(ann => {
      const color = SPORT_MAP[ann.sport]?.color ?? '#00d4f5'
      const x = Math.round((ann.centerTime / duration) * W)
      ctx.fillStyle = color
      ctx.fillRect(x - 1, PY, 2, PROGRESS_H)
    })
    // Progress line
    const px = Math.round((currentTime / duration) * W)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillRect(px, PY, 1, PROGRESS_H)

    // ── PLAYHEAD (full height) ──
    const phX = Math.round((currentTime - offset) * zoom)
    if (phX >= 0 && phX <= W) {
      ctx.save()
      ctx.shadowBlur = 12
      ctx.shadowColor = '#00d4f5'
      ctx.strokeStyle = '#00d4f5'
      ctx.lineWidth = 1.5
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(phX, THUMB_H)
      ctx.lineTo(phX, THUMB_H + MARKER_H)
      ctx.stroke()
      ctx.fillStyle = '#00d4f5'
      ctx.beginPath()
      ctx.arc(phX, THUMB_H + 6, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    ctx.restore()
  }, [canvasRef, duration, currentTime, annotations, zoom, offset, inPoint, outPoint, filterSport])

  // ── RAF draw loop ──
  useEffect(() => {
    const loop = () => {
      draw()
      animFrameRef.current = requestAnimationFrame(loop)
    }
    animFrameRef.current = requestAnimationFrame(loop)
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [draw])

  // Extract thumbs when src changes or zoom/offset changes
  useEffect(() => {
    const t = setTimeout(extractThumbs, 200)
    return () => clearTimeout(t)
  }, [extractThumbs, zoom, offset])

  // ── Hit test for annotation click ──
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || duration <= 0) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (y < THUMB_H || y > THUMB_H + MARKER_H) return
    const t = (x / canvas.offsetWidth) * (canvas.offsetWidth / zoom) + offset
    const visAnns = filterSport === 'all' ? annotations : annotations.filter(a => a.sport === filterSport)
    const hit = visAnns.find(a => Math.abs(a.centerTime - t) < 1.5)
    if (hit) onSelectAnnotation(hit.id)
  }, [canvasRef, duration, zoom, offset, annotations, filterSport, onSelectAnnotation])

  return (
    <div className="flex-shrink-0" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      {/* Zoom controls */}
      <div className="flex items-center gap-2 px-3 py-1.5" style={{ borderBottom: '1px solid var(--border-dim)' }}>
        <span className="text-xs" style={{ color: 'var(--text-secondary)', letterSpacing: '0.2em' }}>⬡ 时间轴</span>
        <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>双击添加标注 · Ctrl+滚轮缩放 · 滚轮平移</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>缩放</span>
          <input
            type="range" min="10" max="600" step="5" value={zoom}
            onChange={e => {/* zoom set externally */}}
            style={{ width: '80px' }}
            readOnly
          />
          <span className="text-xs" style={{ color: 'var(--cyan)', minWidth: '45px' }}>{zoom.toFixed(0)} px/s</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="timeline-canvas block w-full"
        style={{ height: `${TOTAL_H}px` }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={handleClick}
        onDoubleClick={onDblClick}
      />
    </div>
  )
}
