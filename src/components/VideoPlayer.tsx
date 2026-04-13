'use client'
import { useCallback, useState, useRef } from 'react'
import type { VideoState } from '@/types/annotation'
import { formatTimeCode, formatMMSS } from '@/utils/time'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>
  state: VideoState
  onLoadFile: (f: File) => void
  onLoadUrl: (url: string) => void
  onLoadedMetadata: () => void
  onEnded: () => void
  onTogglePlay: () => void
  onSeek: (t: number) => void
  onSetVolume: (v: number) => void
  onToggleMute: () => void
  onSetRate: (r: number) => void
  onStepFrame: (dir: 1 | -1) => void
}

const RATES = [0.25, 0.5, 1, 1.5, 2]

export default function VideoPlayer({
  videoRef, state, onLoadFile, onLoadUrl, onLoadedMetadata, onEnded,
  onTogglePlay, onSeek, onSetVolume, onToggleMute, onSetRate, onStepFrame,
}: Props) {
  const [urlInput, setUrlInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) onLoadFile(file)
  }, [onLoadFile])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onLoadFile(file)
  }, [onLoadFile])

  const handleUrlLoad = useCallback(() => {
    if (urlInput.trim()) {
      onLoadUrl(urlInput.trim())
      setShowUrlInput(false)
      setUrlInput('')
    }
  }, [urlInput, onLoadUrl])

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0

  return (
    <div className="flex flex-col h-full">
      {/* Video area */}
      <div
        className="relative flex-1 bg-black flex items-center justify-center overflow-hidden group"
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Grid lines overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)' }}
        />

        {/* Drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex items-center justify-center flex-col gap-3"
            style={{ background: 'rgba(0,212,245,0.06)', border: '2px dashed var(--cyan)' }}>
            <span className="text-2xl" style={{ color: 'var(--cyan)' }}>▼</span>
            <span className="text-sm tracking-widest" style={{ color: 'var(--cyan)' }}>释放以加载视频</span>
          </div>
        )}

        {/* Placeholder */}
        {!state.src && !isDragging && (
          <div className="flex flex-col items-center gap-5 select-none">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                ▶
              </div>
              <div className="absolute inset-[-12px] rounded-full animate-ping"
                style={{ border: '1px solid var(--border-dim)', animationDuration: '3s' }} />
            </div>
            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>拖拽视频文件至此，或</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary text-xs px-4 py-2 rounded"
                  style={{ background: 'var(--cyan-dim)', border: '1px solid var(--cyan)', color: 'var(--cyan)' }}>
                  本地文件
                </button>
                <button
                  onClick={() => setShowUrlInput(true)}
                  className="text-xs px-4 py-2 rounded transition-all"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--cyan)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  在线URL
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>MP4 · MOV · WebM · AVI</p>
            </div>
          </div>
        )}

        {/* URL input overlay */}
        {showUrlInput && (
          <div className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ background: 'rgba(4,7,15,0.92)' }}>
            <div className="flex flex-col gap-3 w-80 p-5 rounded-lg"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-xs tracking-widest" style={{ color: 'var(--cyan)' }}>输入视频直链</p>
              <input
                autoFocus
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUrlLoad()}
                placeholder="https://example.com/video.mp4"
                className="text-xs p-2 rounded w-full"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              />
              <div className="flex gap-2">
                <button onClick={handleUrlLoad}
                  className="flex-1 text-xs py-2 rounded"
                  style={{ background: 'var(--cyan-dim)', border: '1px solid var(--cyan)', color: 'var(--cyan)' }}>
                  加载
                </button>
                <button onClick={() => setShowUrlInput(false)}
                  className="flex-1 text-xs py-2 rounded"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video element */}
        <video
          ref={videoRef}
          src={state.src ?? undefined}
          className="w-full h-full object-contain"
          style={{ display: state.src ? 'block' : 'none' }}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
          onClick={onTogglePlay}
          preload="metadata"
        />

        {/* Overlay timecode */}
        {state.isLoaded && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs"
            style={{ background: 'rgba(4,7,15,0.75)', color: 'var(--cyan)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
            {formatTimeCode(state.currentTime)}
          </div>
        )}

        {/* Play/pause big icon */}
        {state.src && !state.isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-5xl" style={{ color: 'rgba(0,212,245,0.6)' }}>▶</div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
      </div>

      {/* Controls bar */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2"
        style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        {/* Play/pause */}
        <CtrlBtn onClick={onTogglePlay} title="播放/暂停 (Space)">
          {state.isPlaying ? '⏸' : '▶'}
        </CtrlBtn>
        {/* Frame step */}
        <CtrlBtn onClick={() => onStepFrame(-1)} title="上一帧 (←)">‹</CtrlBtn>
        <CtrlBtn onClick={() => onStepFrame(1)} title="下一帧 (→)">›</CtrlBtn>

        {/* Progress */}
        <div className="flex-1 relative h-1.5 rounded cursor-pointer"
          style={{ background: 'var(--border)' }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            onSeek(pct * state.duration)
          }}>
          <div className="absolute left-0 top-0 h-full rounded transition-none"
            style={{ width: `${progress}%`, background: 'var(--cyan)' }} />
        </div>

        {/* Timecode */}
        <span className="text-xs whitespace-nowrap flex-shrink-0"
          style={{ color: 'var(--cyan)', minWidth: '105px', letterSpacing: '0.08em' }}>
          {formatTimeCode(state.currentTime)} / {formatMMSS(state.duration)}
        </span>

        {/* Volume */}
        <button onClick={onToggleMute} className="text-sm flex-shrink-0"
          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {state.isMuted ? '🔇' : '🔊'}
        </button>
        <input type="range" min="0" max="1" step="0.05"
          value={state.isMuted ? 0 : state.volume}
          onChange={e => onSetVolume(parseFloat(e.target.value))}
          className="flex-shrink-0" style={{ width: '64px' }} />

        {/* Speed */}
        <div className="flex gap-0.5 flex-shrink-0">
          {RATES.map(r => (
            <button key={r}
              onClick={() => onSetRate(r)}
              className="text-xs px-1.5 py-0.5 rounded transition-all"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: state.playbackRate === r ? 'var(--cyan-dim)' : 'transparent',
                border: `1px solid ${state.playbackRate === r ? 'var(--cyan)' : 'var(--border-dim)'}`,
                color: state.playbackRate === r ? 'var(--cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}>
              {r}×
            </button>
          ))}
        </div>

        {/* Load buttons */}
        <div className="flex gap-1 flex-shrink-0 ml-1">
          <button onClick={() => fileInputRef.current?.click()}
            className="text-xs px-2 py-1 rounded"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            本地
          </button>
          <button onClick={() => setShowUrlInput(true)}
            className="text-xs px-2 py-1 rounded"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            URL
          </button>
        </div>
      </div>
    </div>
  )
}

function CtrlBtn({ onClick, title, children }: { onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center text-sm rounded flex-shrink-0 transition-all"
      style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'none', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
      {children}
    </button>
  )
}
