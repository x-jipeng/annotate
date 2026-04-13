'use client'
import { useState } from 'react'
import type { SportType } from '@/types/annotation'
import { SPORTS } from '@/constants/sports'

interface Props {
  activeSport: SportType
  onChangeSport: (s: SportType) => void
  onTag: (event: string) => void
  currentTime: number
  isLoaded: boolean
}

export default function TagPanel({ activeSport, onChangeSport, onTag, currentTime, isLoaded }: Props) {
  const [custom, setCustom] = useState('')
  const sport = SPORTS.find(s => s.id === activeSport)!

  const handleCustom = () => {
    if (custom.trim()) {
      onTag(custom.trim())
      setCustom('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sport tabs */}
      <div className="flex-shrink-0 flex border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {SPORTS.map(s => (
          <button
            key={s.id}
            onClick={() => onChangeSport(s.id)}
            className="flex-shrink-0 px-3 py-2 text-xs transition-all relative"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: activeSport === s.id ? s.color : 'var(--text-secondary)',
              background: activeSport === s.id ? `${s.color}15` : 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeSport === s.id ? s.color : 'transparent'}`,
              cursor: 'pointer',
            }}>
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      {/* Tags grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-block', width: 3, height: 10, background: sport.color, borderRadius: 2 }} />
          点击标签 → 在当前时间点插入标注
        </div>

        {!isLoaded && (
          <div className="text-xs p-2 rounded mb-2" style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', color: '#ff6b35' }}>
            ⚠ 请先加载视频
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {sport.events.map(evt => (
            <button
              key={evt}
              onClick={() => onTag(evt)}
              disabled={!isLoaded}
              className="text-xs px-2.5 py-1.5 rounded transition-all"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: `${sport.color}14`,
                border: `1px solid ${sport.color}44`,
                color: sport.color,
                cursor: isLoaded ? 'pointer' : 'not-allowed',
                opacity: isLoaded ? 1 : 0.4,
              }}
              onMouseEnter={e => {
                if (!isLoaded) return
                e.currentTarget.style.background = `${sport.color}28`
                e.currentTarget.style.boxShadow = `0 0 8px ${sport.color}44`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `${sport.color}14`
                e.currentTarget.style.boxShadow = 'none'
              }}>
              {evt}
            </button>
          ))}
        </div>

        {/* Custom tag */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-dim)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>自定义标签</p>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustom()}
              placeholder="输入自定义事件..."
              disabled={!isLoaded}
              className="flex-1 text-xs px-2.5 py-1.5 rounded"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={handleCustom}
              disabled={!isLoaded || !custom.trim()}
              className="text-xs px-3 py-1.5 rounded"
              style={{
                background: 'var(--cyan-dim)',
                border: '1px solid var(--cyan)',
                color: 'var(--cyan)',
                cursor: isLoaded && custom.trim() ? 'pointer' : 'not-allowed',
                opacity: isLoaded && custom.trim() ? 1 : 0.4,
                fontFamily: 'inherit',
              }}>
              + 添加
            </button>
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-dim)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}>快捷键</p>
          {[
            ['Space', '播放/暂停'],
            ['← →', '逐帧步进'],
            ['I', '打入点'],
            ['O', '打出点'],
            ['Ctrl+E', '导出 JSON'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between mb-1">
              <span className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--cyan)', fontFamily: 'inherit' }}>
                {k}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
