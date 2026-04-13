'use client'
import { useCallback, useReducer } from 'react'
import type { Annotation, SportType, ExportAnnotation } from '@/types/annotation'
import { HIGHLIGHT_HALF, SPORT_MAP } from '@/constants/sports'
import { formatTimeCode, formatExportTime } from '@/utils/time'

type Action =
  | { type: 'ADD'; payload: Omit<Annotation, 'id' | 'startTime' | 'endTime' | 'createdAt'> }
  | { type: 'UPDATE'; id: string; patch: Partial<Annotation> }
  | { type: 'DELETE'; id: string }
  | { type: 'CLEAR' }

let _idCounter = 0
const genId = () => `ann_${Date.now()}_${++_idCounter}`

function reducer(state: Annotation[], action: Action): Annotation[] {
  switch (action.type) {
    case 'ADD': {
      const { centerTime, ...rest } = action.payload
      const startTime = Math.max(0, centerTime - HIGHLIGHT_HALF)
      const endTime = centerTime + HIGHLIGHT_HALF
      const ann: Annotation = {
        ...rest,
        id: genId(),
        centerTime,
        startTime,
        endTime,
        createdAt: Date.now(),
      }
      return [...state, ann].sort((a, b) => a.centerTime - b.centerTime)
    }
    case 'UPDATE':
      return state.map(a => a.id === action.id ? { ...a, ...action.patch } : a)
    case 'DELETE':
      return state.filter(a => a.id !== action.id)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function useAnnotations() {
  const [annotations, dispatch] = useReducer(reducer, [])

  const addAnnotation = useCallback((
    sport: SportType,
    event: string,
    centerTime: number,
    source: 'manual' | 'ai' = 'manual'
  ) => {
    dispatch({ type: 'ADD', payload: { sport, event, centerTime, source } })
  }, [])

  const updateAnnotation = useCallback((id: string, patch: Partial<Annotation>) => {
    dispatch({ type: 'UPDATE', id, patch })
  }, [])

  const deleteAnnotation = useCallback((id: string) => {
    dispatch({ type: 'DELETE', id })
  }, [])

  const clearAnnotations = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const exportAnnotations = useCallback((filterSport?: SportType): ExportAnnotation[] => {
    const list = filterSport ? annotations.filter(a => a.sport === filterSport) : annotations
    return list.map(a => ({
      sport: a.sport,
      event: a.event,
      time: formatExportTime(a.startTime, a.endTime),
      timestamp_start: parseFloat(a.startTime.toFixed(3)),
      timestamp_end: parseFloat(a.endTime.toFixed(3)),
      source: a.source,
    }))
  }, [annotations])

  const downloadJson = useCallback((filterSport?: SportType) => {
    const data = exportAnnotations(filterSport)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const suffix = filterSport ?? 'all'
    a.download = `annotations_${suffix}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [exportAnnotations])

  return {
    annotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearAnnotations,
    exportAnnotations,
    downloadJson,
  }
}
