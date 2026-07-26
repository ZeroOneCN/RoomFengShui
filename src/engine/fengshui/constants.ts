import type { NineStar, ShiChen } from '@/types'

export const NINE_STAR_NAMES: Record<NineStar, string> = {
  1: '一白贪狼',
  2: '二黑巨门',
  3: '三碧禄存',
  4: '四绿文曲',
  5: '五黄廉贞',
  6: '六白武曲',
  7: '七赤破军',
  8: '八白左辅',
  9: '九紫右弼',
}

export const NINE_STAR_SHORT_NAMES: Record<NineStar, string> = {
  1: '一白',
  2: '二黑',
  3: '三碧',
  4: '四绿',
  5: '五黄',
  6: '六白',
  7: '七赤',
  8: '八白',
  9: '九紫',
}

export const NINE_STAR_COLORS: Record<NineStar, string> = {
  1: '#4169E1',
  2: '#2F4F4F',
  3: '#32CD32',
  4: '#228B22',
  5: '#FFD700',
  6: '#FFFFFF',
  7: '#DC143C',
  8: '#F5DEB3',
  9: '#FF4500',
}

export const NINE_STAR_ELEMENTS: Record<NineStar, 'water' | 'earth' | 'wood' | 'metal' | 'fire'> = {
  1: 'water',
  2: 'earth',
  3: 'wood',
  4: 'wood',
  5: 'earth',
  6: 'metal',
  7: 'metal',
  8: 'earth',
  9: 'fire',
}

export const ELEMENT_NAMES: Record<string, string> = {
  water: '水',
  wood: '木',
  earth: '土',
  metal: '金',
  fire: '火',
}

export const ELEMENT_GENERATES: Record<string, string> = {
  water: 'wood',
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
}

export const ELEMENT_CONTROLS: Record<string, string> = {
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
  wood: 'earth',
  earth: 'water',
}

export const TWENTY_FOUR_MOUNTAINS = [
  { name: '壬', angle: 337.5, trigram: 'kan', yinYang: 'yang' as const, element: 'water' as const },
  { name: '子', angle: 352.5, trigram: 'kan', yinYang: 'yang' as const, element: 'water' as const },
  { name: '癸', angle: 7.5, trigram: 'kan', yinYang: 'yin' as const, element: 'water' as const },
  { name: '丑', angle: 22.5, trigram: 'gen', yinYang: 'yin' as const, element: 'earth' as const },
  { name: '艮', angle: 37.5, trigram: 'gen', yinYang: 'yang' as const, element: 'earth' as const },
  { name: '寅', angle: 52.5, trigram: 'gen', yinYang: 'yang' as const, element: 'wood' as const },
  { name: '甲', angle: 67.5, trigram: 'zhen', yinYang: 'yang' as const, element: 'wood' as const },
  { name: '卯', angle: 82.5, trigram: 'zhen', yinYang: 'yin' as const, element: 'wood' as const },
  { name: '乙', angle: 97.5, trigram: 'zhen', yinYang: 'yin' as const, element: 'wood' as const },
  { name: '辰', angle: 112.5, trigram: 'xun', yinYang: 'yang' as const, element: 'earth' as const },
  { name: '巽', angle: 127.5, trigram: 'xun', yinYang: 'yang' as const, element: 'wood' as const },
  { name: '巳', angle: 142.5, trigram: 'xun', yinYang: 'yin' as const, element: 'fire' as const },
  { name: '丙', angle: 157.5, trigram: 'li', yinYang: 'yang' as const, element: 'fire' as const },
  { name: '午', angle: 172.5, trigram: 'li', yinYang: 'yang' as const, element: 'fire' as const },
  { name: '丁', angle: 187.5, trigram: 'li', yinYang: 'yin' as const, element: 'fire' as const },
  { name: '未', angle: 202.5, trigram: 'kun', yinYang: 'yin' as const, element: 'earth' as const },
  { name: '坤', angle: 217.5, trigram: 'kun', yinYang: 'yang' as const, element: 'earth' as const },
  { name: '申', angle: 232.5, trigram: 'kun', yinYang: 'yang' as const, element: 'metal' as const },
  { name: '庚', angle: 247.5, trigram: 'dui', yinYang: 'yang' as const, element: 'metal' as const },
  { name: '酉', angle: 262.5, trigram: 'dui', yinYang: 'yin' as const, element: 'metal' as const },
  { name: '辛', angle: 277.5, trigram: 'dui', yinYang: 'yin' as const, element: 'metal' as const },
  { name: '戌', angle: 292.5, trigram: 'qian', yinYang: 'yang' as const, element: 'earth' as const },
  { name: '乾', angle: 307.5, trigram: 'qian', yinYang: 'yang' as const, element: 'metal' as const },
  { name: '亥', angle: 322.5, trigram: 'qian', yinYang: 'yin' as const, element: 'water' as const },
]

export const MOUNTAIN_TO_DIRECTION: Record<string, number> = {
  '壬': 3, '子': 2, '癸': 1,
  '丑': 6, '艮': 5, '寅': 4,
  '甲': 9, '卯': 8, '乙': 7,
  '辰': 3, '巽': 2, '巳': 1,
  '丙': 6, '午': 5, '丁': 4,
  '未': 9, '坤': 8, '申': 7,
  '庚': 3, '酉': 2, '辛': 1,
  '戌': 6, '乾': 5, '亥': 4,
}

export const TRIGRAM_STAR: Record<string, NineStar> = {
  kan: 1,
  kun: 2,
  zhen: 3,
  xun: 4,
  qian: 6,
  dui: 7,
  gen: 8,
  li: 9,
}

export const PERIODS = [
  { period: 1, startYear: 1864, endYear: 1883, wangStar: 1 as NineStar },
  { period: 2, startYear: 1884, endYear: 1903, wangStar: 2 as NineStar },
  { period: 3, startYear: 1904, endYear: 1923, wangStar: 3 as NineStar },
  { period: 4, startYear: 1924, endYear: 1943, wangStar: 4 as NineStar },
  { period: 5, startYear: 1944, endYear: 1963, wangStar: 5 as NineStar },
  { period: 6, startYear: 1964, endYear: 1983, wangStar: 6 as NineStar },
  { period: 7, startYear: 1984, endYear: 2003, wangStar: 7 as NineStar },
  { period: 8, startYear: 2004, endYear: 2023, wangStar: 8 as NineStar },
  { period: 9, startYear: 2024, endYear: 2043, wangStar: 9 as NineStar },
]

export const getCurrentPeriod = (year: number = new Date().getFullYear()): number => {
  for (const p of PERIODS) {
    if (year >= p.startYear && year <= p.endYear) return p.period
  }
  if (year < 1864) return 1
  return 9
}

export const getWangStar = (period: number): NineStar => {
  return period as NineStar
}

export const getShengStar = (period: number): NineStar => {
  return ((period % 9) + 1) as NineStar
}

export const getTuiStar = (period: number): NineStar => {
  return ((period - 2 + 9) % 9) + 1 as NineStar
}

export const getShaStar = (period: number): NineStar => {
  return ((period + 4) % 9) + 1 as NineStar
}

export const SHICHEN_LIST: ShiChen[] = ['zi', 'chou', 'yin', 'mao', 'chen', 'si', 'wu', 'wei', 'shen', 'you', 'xu', 'hai']

export const SHICHEN_STAR_BONUS: Record<ShiChen, Record<NineStar, number>> = {
  zi: { 1: 1.5, 2: 0.8, 3: 0.9, 4: 0.9, 5: 0.5, 6: 1.0, 7: 0.8, 8: 1.1, 9: 1.2 },
  chou: { 1: 1.0, 2: 1.3, 3: 0.8, 4: 0.9, 5: 0.8, 6: 0.9, 7: 0.9, 8: 1.4, 9: 0.8 },
  yin: { 1: 0.9, 2: 0.9, 3: 1.4, 4: 1.3, 5: 0.7, 6: 0.8, 7: 0.8, 8: 1.0, 9: 1.0 },
  mao: { 1: 0.8, 2: 0.8, 3: 1.5, 4: 1.4, 5: 0.6, 6: 0.7, 7: 0.7, 8: 0.9, 9: 1.1 },
  chen: { 1: 0.9, 2: 1.2, 3: 1.1, 4: 1.2, 5: 0.8, 6: 0.8, 7: 0.9, 8: 1.2, 9: 0.9 },
  si: { 1: 1.0, 2: 0.9, 3: 1.0, 4: 1.3, 5: 0.9, 6: 0.9, 7: 1.1, 8: 1.0, 9: 1.3 },
  wu: { 1: 1.2, 2: 0.7, 3: 0.8, 4: 0.8, 5: 0.4, 6: 1.1, 7: 1.0, 8: 0.9, 9: 1.5 },
  wei: { 1: 1.0, 2: 1.4, 3: 0.7, 4: 0.8, 5: 0.9, 6: 0.8, 7: 1.0, 8: 1.3, 9: 0.9 },
  shen: { 1: 0.8, 2: 1.0, 3: 0.8, 4: 0.9, 5: 1.0, 6: 1.2, 7: 1.3, 8: 1.1, 9: 0.8 },
  you: { 1: 0.7, 2: 0.9, 3: 0.7, 4: 0.7, 5: 1.1, 6: 1.4, 7: 1.5, 8: 1.0, 9: 0.7 },
  xu: { 1: 0.9, 2: 1.2, 3: 0.9, 4: 0.8, 5: 1.2, 6: 1.0, 7: 1.2, 8: 1.1, 9: 0.8 },
  hai: { 1: 1.4, 2: 0.8, 3: 0.8, 4: 0.9, 5: 0.7, 6: 1.1, 7: 0.9, 8: 1.0, 9: 1.1 },
}

export const NINE_PALACE_POSITIONS = [
  { row: 0, col: 0, name: '东南', trigram: 'xun' },
  { row: 0, col: 1, name: '南', trigram: 'li' },
  { row: 0, col: 2, name: '西南', trigram: 'kun' },
  { row: 1, col: 0, name: '东', trigram: 'zhen' },
  { row: 1, col: 1, name: '中宫', trigram: 'zhong' },
  { row: 1, col: 2, name: '西', trigram: 'dui' },
  { row: 2, col: 0, name: '东北', trigram: 'gen' },
  { row: 2, col: 1, name: '北', trigram: 'kan' },
  { row: 2, col: 2, name: '西北', trigram: 'qian' },
]

export const STAR_STATUS_WEIGHTS = {
  wang: 1.5,
  sheng: 1.2,
  ping: 1.0,
  shuai: 0.7,
  si: 0.4,
  sha: 0.2,
}
