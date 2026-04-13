import type { SportConfig, SportType } from '@/types/annotation'

export const SPORTS: SportConfig[] = [
  {
    id: 'basketball',
    name: '篮球',
    nameEn: 'basketball',
    color: '#ff7043',
    icon: '⛹',
    events: ['扣篮', '三分球', '盖帽', '抢断', '助攻', '压哨球', '空接', '快攻', '连续得分', '硬对抗得分'],
  },
  {
    id: 'football',
    name: '足球',
    nameEn: 'football',
    color: '#66bb6a',
    icon: '⚽',
    events: ['进球', '精彩扑救', '任意球', '角球', '点球', '过人', '远射', '红牌', '黄牌', '越位判罚'],
  },
  {
    id: 'tennis',
    name: '网球',
    nameEn: 'tennis',
    color: '#29b6f6',
    icon: '🎾',
    events: ['发球得分', '制胜球', '破发点', '双误', '网前截击', '精彩对拉', '底线暴力球', '鱼跃救球', '赛点'],
  },
  {
    id: 'baseball',
    name: '棒球',
    nameEn: 'baseball',
    color: '#ce93d8',
    icon: '⚾',
    events: ['本垒打', '三振出局', '双杀', '盗垒', '精彩守备', '满贯全垒打', '精彩接杀', '触身球'],
  },
  {
    id: 'badminton',
    name: '羽毛球',
    nameEn: 'badminton',
    color: '#ffd54f',
    icon: '🏸',
    events: ['扣杀', '网前小球', '高远球', '吊球', '追身球', '精彩对攻', '超级防守', '快攻', '后场暴扣'],
  },
]

export const SPORT_MAP = Object.fromEntries(SPORTS.map(s => [s.id, s])) as Record<SportType, SportConfig>

export const FPS = 30
export const FRAME_DURATION = 1 / FPS
export const HIGHLIGHT_HALF = 1 // seconds each side → total 3s window

export const DEFAULT_ZOOM = 80   // px per second at 1× zoom
export const MIN_ZOOM = 10
export const MAX_ZOOM = 600
