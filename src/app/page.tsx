'use client'
import { useState, useCallback, useEffect, useMemo } from 'react'
import type { SportType, Annotation } from '@/types/annotation'
import { useVideoControl } from '@/hooks/useVideoControl'
import { useAnnotations } from '@/hooks/useAnnotations'
import { useTimeline } from '@/hooks/useTimeline'
import VideoPlayer from '@/components/VideoPlayer'
import Timeline from '@/components/Timeline'
import TagPanel from '@/components/TagPanel'
import AnnotationList from '@/components/AnnotationList'
import ExportModal from '@/components/ExportModal'
import { SPORTS } from '@/constants/sports'

export default function Home() {
  const [activeSport, setActiveSport] = useState<SportType>('basketball')
  const [filterSport, setFilterSport] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [rightTab, setRightTab] = useState<'tags' | 'list'>('tags')
  const [notification, setNotification] = useState<string | null>(null)

  const video = useVideoControl()
  const ann = useAnnotations()
  const tl = useTimeline(video.state.duration, video.state.currentTime, video.seekTo)

  // ── Notification helper ──
  const notify = useCallback((msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 2500)
  }, [])

  // ── Tag click: insert annotation at current time ──
  const handleTag = useCallback((event: string) => {
    if (!video.state.isLoaded) return
    ann.addAnnotation(activeSport, event, video.state.currentTime, 'manual')
    notify(`✓ ${event} @ ${Math.floor(video.state.currentTime / 60).toString().padStart(2,'0')}:${Math.floor(video.state.currentTime % 60).toString().padStart(2,'0')}`)
    setRightTab('list')
    setTimeout(() => setRightTab('tags'), 800)
  }, [activeSport, video.state.currentTime, video.state.isLoaded, ann, notify])

  // ── Timeline double-click: insert at that time ──
  const handleTimelineDblClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>): number | undefined => {
    const t = tl.handleDblClick(e)
    if (t !== undefined) {
      video.seekTo(t)
      notify(`双击定位 → 点击标签添加标注`)
    }
    return t
  }, [tl, video, notify])

  // ── Select annotation → seek ──
  const handleSelectAnnotation = useCallback((id: string) => {
    setSelectedId(prev => prev === id ? null : id)
    const a = ann.annotations.find(x => x.id === id)
    if (a) video.seekTo(a.centerTime)
    setRightTab('list')
  }, [ann.annotations, video])

  // ── Count by sport ──
  const countBySport = useMemo(() => {
    const map: Record<string, number> = {}
    ann.annotations.forEach(a => { map[a.sport] = (map[a.sport] ?? 0) + 1 })
    return map
  }, [ann.annotations])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          video.togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          e.shiftKey ? video.seekTo(video.state.currentTime - 5) : video.stepFrame(-1)
          break
        case 'ArrowRight':
          e.preventDefault()
          e.shiftKey ? video.seekTo(video.state.currentTime + 5) : video.stepFrame(1)
          break
        case 'KeyI':
          tl.setIn(video.state.currentTime)
          notify(`打入点: ${formatMMSS(video.state.currentTime)}`)
          break
        case 'KeyO':
          tl.setOut(video.state.currentTime)
          notify(`打出点: ${formatMMSS(video.state.currentTime)}`)
          break
        case 'KeyE':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); setShowExport(true) }
          break
        case 'Escape':
          setShowExport(false)
          tl.clearInOut()
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [video, tl, notify])

  return (
    <div className="relative z-10 flex flex-col h-screen overflow-hidden">
      {/* ── HEADER ── */}
      <header className="flex-shrink-0 flex items-center gap-4 px-4 h-12"
        style={{ background: 'linear-gradient(180deg,rgba(0,20,40,0.98),var(--bg-secondary))', borderBottom: '1px solid var(--border)', zIndex: 10 }}>

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ff6b35', boxShadow: '0 0 8px #ff6b35' }} />
          <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 14, letterSpacing: 4, color: 'var(--cyan)', textShadow: '0 0 16px rgba(0,212,245,0.4)' }}>
            CAMBOT
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)', letterSpacing: 3 }}>ANNOTATE</span>
        </div>

        {/* Sport quick-select in header */}
        <div className="flex gap-1 ml-2">
          {SPORTS.map(s => (
            <button key={s.id} onClick={() => setActiveSport(s.id)}
              className="text-xs px-2.5 py-1 rounded transition-all flex-shrink-0"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: activeSport === s.id ? `${s.color}18` : 'transparent',
                border: `1px solid ${activeSport === s.id ? s.color : 'var(--border-dim)'}`,
                color: activeSport === s.id ? s.color : 'var(--text-secondary)',
                cursor: 'pointer',
              }}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Annotation count */}
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--cyan)' }}>{ann.annotations.length}</span> 条标注
          </span>

          {/* Export button */}
          <button
            onClick={() => setShowExport(true)}
            disabled={ann.annotations.length === 0}
            className="text-xs px-3 py-1.5 rounded transition-all"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              background: 'rgba(255,107,53,0.1)',
              border: '1px solid var(--orange)',
              color: 'var(--orange)',
              cursor: ann.annotations.length > 0 ? 'pointer' : 'not-allowed',
              opacity: ann.annotations.length > 0 ? 1 : 0.4,
            }}>
            ↓ 导出 JSON
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: VIDEO (60%) ── */}
        <div className="flex flex-col overflow-hidden" style={{ width: '60%', borderRight: '1px solid var(--border)' }}>
          <div className="flex-1 overflow-hidden">
            <VideoPlayer
              videoRef={video.videoRef}
              state={video.state}
              onLoadFile={video.loadFile}
              onLoadUrl={video.loadUrl}
              onLoadedMetadata={video.onLoadedMetadata}
              onEnded={video.onEnded}
              onTogglePlay={video.togglePlay}
              onSeek={video.seekTo}
              onSetVolume={video.setVolume}
              onToggleMute={video.toggleMute}
              onSetRate={video.setPlaybackRate}
              onStepFrame={video.stepFrame}
            />
          </div>
        </div>

        {/* ── RIGHT: TAG PANEL + LIST (40%) ── */}
        <div className="flex flex-col overflow-hidden" style={{ width: '40%' }}>
          {/* Tab switcher */}
          <div className="flex-shrink-0 flex" style={{ borderBottom: '1px solid var(--border)' }}>
            {(['tags', 'list'] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                className="flex-1 text-xs py-2 transition-all"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: rightTab === tab ? 'var(--cyan-dim)' : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${rightTab === tab ? 'var(--cyan)' : 'transparent'}`,
                  color: rightTab === tab ? 'var(--cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  letterSpacing: '0.15em',
                }}>
                {tab === 'tags' ? '⬡ 标签' : `◈ 列表 (${ann.annotations.length})`}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {rightTab === 'tags' ? (
              <TagPanel
                activeSport={activeSport}
                onChangeSport={s => { setActiveSport(s); setFilterSport(s) }}
                onTag={handleTag}
                currentTime={video.state.currentTime}
                isLoaded={video.state.isLoaded}
              />
            ) : (
              <AnnotationList
                annotations={ann.annotations}
                selectedId={selectedId}
                filterSport={filterSport}
                onFilterChange={setFilterSport}
                onSelect={handleSelectAnnotation}
                onDelete={ann.deleteAnnotation}
                onUpdate={ann.updateAnnotation}
                onClear={ann.clearAnnotations}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── TIMELINE (fixed bottom) ── */}
      <Timeline
        videoRef={video.videoRef}
        duration={video.state.duration}
        currentTime={video.state.currentTime}
        annotations={ann.annotations}
        inPoint={tl.inPoint}
        outPoint={tl.outPoint}
        zoom={tl.zoom}
        offset={tl.offset}
        onSeek={video.seekTo}
        onDblClick={handleTimelineDblClick}
        onMouseDown={tl.handleMouseDown}
        onMouseMove={tl.handleMouseMove}
        onMouseUp={tl.handleMouseUp}
        onSelectAnnotation={handleSelectAnnotation}
        canvasRef={tl.canvasRef}
        thumbCanvasRef={tl.thumbCanvasRef}
        filterSport={filterSport}
      />

      {/* ── EXPORT MODAL ── */}
      {showExport && (
        <ExportModal
          onExport={ann.downloadJson}
          onClose={() => setShowExport(false)}
          annotationCount={ann.annotations.length}
          countBySport={countBySport}
        />
      )}

      {/* ── NOTIFICATION TOAST ── */}
      <div
        className="fixed bottom-5 right-5 text-xs px-4 py-2 rounded transition-all duration-300 pointer-events-none"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--cyan)',
          color: 'var(--cyan)',
          boxShadow: '0 0 30px rgba(0,212,245,0.5)',
          transform: notification ? 'translateY(0)' : 'translateY(20px)',
          opacity: notification ? 1 : 0,
          zIndex: 100,
        }}>
        {notification}
      </div>
    </div>
  )
}

function formatMMSS(s: number) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60)
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}
