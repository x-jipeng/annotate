'use client'
import { useState } from 'react'
import type { Annotation, SportType } from '@/types/annotation'
import { SPORT_MAP, SPORTS } from '@/constants/sports'
import { formatHHMMSS, formatMMSS } from '@/utils/time'

interface Props {
  annotations: Annotation[]
  selectedId: string | null
  filterSport: string
  onFilterChange: (s: string) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: Partial<Annotation>) => void
  onClear: () => void
}

export default function AnnotationList({
  annotations, selectedId, filterSport, onFilterChange,
  onSelect, onDelete, onUpdate, onClear,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editEvent, setEditEvent] = useState('')

  const filtered = filterSport === 'all'
    ? annotations
    : annotations.filter(a => a.sport === filterSport)

  const startEdit = (ann: Annotation) => {
    setEditingId(ann.id)
    setEditEvent(ann.event)
  }

  const commitEdit = (id: string) => {
    if (editEvent.trim()) onUpdate(id, { event: editEvent.trim() })
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5">
          <span style={{ display: 'inline-block', width: 3, height: 10, background: 'var(--cyan)', borderRadius: 2 }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)', letterSpacing: '0.2em' }}>
            标注列表
          </span>
          <span className="text-xs px-1.5 rounded ml-1"
            style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid rgba(0,212,245,0.2)' }}>
            {filtered.length}
          </span>
        </div>
        {annotations.length > 0 && (
          <button
            onClick={() => { if (confirm('确认清空所有标注？')) onClear() }}
            className="text-xs px-2 py-0.5 rounded transition-all"
            style={{ border: '1px solid rgba(239,83,80,0.3)', color: '#ef5350', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            清空
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex-shrink-0 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--border-dim)' }}>
        <button
          onClick={() => onFilterChange('all')}
          className="text-xs px-2 py-0.5 rounded flex-shrink-0"
          style={{
            fontFamily: 'inherit',
            background: filterSport === 'all' ? 'var(--cyan-dim)' : 'transparent',
            border: `1px solid ${filterSport === 'all' ? 'var(--cyan)' : 'var(--border-dim)'}`,
            color: filterSport === 'all' ? 'var(--cyan)' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}>
          全部
        </button>
        {SPORTS.map(s => (
          <button
            key={s.id}
            onClick={() => onFilterChange(s.id)}
            className="text-xs px-2 py-0.5 rounded flex-shrink-0"
            style={{
              fontFamily: 'inherit',
              background: filterSport === s.id ? `${s.color}18` : 'transparent',
              border: `1px solid ${filterSport === s.id ? s.color : 'var(--border-dim)'}`,
              color: filterSport === s.id ? s.color : 'var(--text-secondary)',
              cursor: 'pointer',
            }}>
            {s.icon}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <span style={{ fontSize: 28, opacity: 0.3 }}>◎</span>
            <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              暂无标注<br />
              <span style={{ color: 'var(--text-muted)' }}>点击标签面板中的事件类型添加</span>
            </p>
          </div>
        ) : (
          filtered.map(ann => {
            const sp = SPORT_MAP[ann.sport]
            const isEditing = editingId === ann.id
            const isSel = selectedId === ann.id
            return (
              <div
                key={ann.id}
                onClick={() => onSelect(ann.id)}
                className="flex items-start gap-2 p-2 rounded mb-1.5 cursor-pointer transition-all"
                style={{
                  background: isSel ? `${sp.color}10` : 'var(--bg-tertiary)',
                  border: `1px solid ${isSel ? sp.color + '55' : 'transparent'}`,
                }}>
                {/* Color dot */}
                <div className="flex-shrink-0 mt-0.5"
                  style={{ width: 6, height: 6, borderRadius: '50%', background: sp.color, boxShadow: `0 0 5px ${sp.color}88` }} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs" style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono' }}>
                      {formatMMSS(ann.centerTime)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatHHMMSS(ann.startTime)}–{formatHHMMSS(ann.endTime)}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={editEvent}
                      onChange={e => setEditEvent(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitEdit(ann.id)
                        if (e.key === 'Escape') setEditingId(null)
                        e.stopPropagation()
                      }}
                      onBlur={() => commitEdit(ann.id)}
                      onClick={e => e.stopPropagation()}
                      className="w-full text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--cyan)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }}
                    />
                  ) : (
                    <p className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{ann.event}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs" style={{ color: sp.color }}>{sp.icon} {sp.name}</span>
                    <span className="text-xs px-1 rounded"
                      style={{
                        background: ann.source === 'ai' ? 'rgba(0,230,118,0.1)' : 'var(--cyan-dim)',
                        color: ann.source === 'ai' ? '#00e676' : 'var(--cyan)',
                        border: `1px solid ${ann.source === 'ai' ? 'rgba(0,230,118,0.25)' : 'rgba(0,212,245,0.2)'}`,
                      }}>
                      {ann.source === 'ai' ? 'AI' : '手动'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); startEdit(ann) }}
                    className="text-xs px-1.5 py-0.5 rounded transition-all"
                    style={{ border: '1px solid var(--border-dim)', color: 'var(--text-secondary)', background: 'none', cursor: 'pointer' }}
                    title="编辑">
                    ✎
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(ann.id) }}
                    className="text-xs px-1.5 py-0.5 rounded transition-all"
                    style={{ border: '1px solid rgba(239,83,80,0.2)', color: '#ef5350', background: 'none', cursor: 'pointer' }}
                    title="删除">
                    ×
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
