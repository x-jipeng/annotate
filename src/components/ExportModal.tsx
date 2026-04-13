'use client'
import { useState, useMemo } from 'react'
import type { SportType } from '@/types/annotation'
import { SPORTS } from '@/constants/sports'

interface Props {
  onExport: (sport?: SportType) => void
  onClose: () => void
  annotationCount: number
  countBySport: Record<string, number>
}

export default function ExportModal({ onExport, onClose, annotationCount, countBySport }: Props) {
  const [selected, setSelected] = useState<'all' | SportType>('all')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(4,7,15,0.88)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-80 rounded-lg p-5 relative"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 0 40px rgba(0,212,245,0.1)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span style={{ display: 'inline-block', width: 3, height: 12, background: 'var(--orange)', borderRadius: 2 }} />
            <span className="text-sm" style={{ color: 'var(--text-primary)', letterSpacing: '0.15em' }}>导出 JSON</span>
          </div>
          <button onClick={onClose}
            className="text-base w-6 h-6 flex items-center justify-center rounded transition-all"
            style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        {/* Options */}
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>选择导出范围</p>

        <div className="flex flex-col gap-1.5 mb-4">
          {/* All */}
          <label className="flex items-center gap-2 p-2 rounded cursor-pointer"
            style={{
              background: selected === 'all' ? 'var(--cyan-dim)' : 'var(--bg-tertiary)',
              border: `1px solid ${selected === 'all' ? 'var(--cyan)' : 'var(--border-dim)'}`,
            }}>
            <input type="radio" className="hidden" checked={selected === 'all'} onChange={() => setSelected('all')} />
            <div className="w-3 h-3 rounded-full flex items-center justify-center"
              style={{ border: `1px solid ${selected === 'all' ? 'var(--cyan)' : 'var(--text-secondary)'}` }}>
              {selected === 'all' && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyan)' }} />}
            </div>
            <span className="text-xs flex-1" style={{ color: selected === 'all' ? 'var(--cyan)' : 'var(--text-primary)' }}>全部</span>
            <span className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid rgba(0,212,245,0.2)' }}>
              {annotationCount}
            </span>
          </label>

          {SPORTS.map(s => {
            const cnt = countBySport[s.id] ?? 0
            if (cnt === 0) return null
            return (
              <label key={s.id} className="flex items-center gap-2 p-2 rounded cursor-pointer"
                style={{
                  background: selected === s.id ? `${s.color}12` : 'var(--bg-tertiary)',
                  border: `1px solid ${selected === s.id ? s.color + '55' : 'var(--border-dim)'}`,
                }}>
                <input type="radio" className="hidden" checked={selected === s.id} onChange={() => setSelected(s.id)} />
                <div className="w-3 h-3 rounded-full flex items-center justify-center"
                  style={{ border: `1px solid ${selected === s.id ? s.color : 'var(--text-secondary)'}` }}>
                  {selected === s.id && <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />}
                </div>
                <span className="text-xs flex-1" style={{ color: selected === s.id ? s.color : 'var(--text-primary)' }}>
                  {s.icon} {s.name}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}35` }}>
                  {cnt}
                </span>
              </label>
            )
          })}
        </div>

        {/* Format preview */}
        <div className="rounded p-2 mb-4 text-xs overflow-x-auto"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', lineHeight: 1.6 }}>
          {`[\n  {\n    "sport": "basketball",\n    "event": "扣篮",\n    "time": "00:00:18-00:00:21",\n    "timestamp_start": 18.0,\n    "timestamp_end": 21.0,\n    "source": "manual"\n  }\n]`}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 text-xs py-2 rounded transition-all"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            取消
          </button>
          <button
            onClick={() => { onExport(selected === 'all' ? undefined : selected as SportType); onClose() }}
            className="flex-1 text-xs py-2 rounded transition-all"
            style={{ background: 'rgba(255,107,53,0.12)', border: '1px solid var(--orange)', color: 'var(--orange)', cursor: 'pointer', fontFamily: 'inherit' }}>
            ↓ 下载 JSON
          </button>
        </div>
      </div>
    </div>
  )
}
