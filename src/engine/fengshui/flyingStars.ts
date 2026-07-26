import type { NineStar, FlyingStarChart, StarStatus } from '@/types'
import {
  TWENTY_FOUR_MOUNTAINS,
  TRIGRAM_STAR,
  getCurrentPeriod,
  getWangStar,
  getShengStar,
  NINE_STAR_ELEMENTS,
  ELEMENT_GENERATES,
  STAR_STATUS_WEIGHTS,
  NINE_PALACE_POSITIONS,
} from './constants'
import { getYearStar, getMonthStar, getDayStar, getTimeStar, getShiChenFromHour, getShichenEnergyBonus } from './timeSystem'
import type { ShiChen } from '@/types'

const LARGE_TAIJI_YIN: Record<number, number[]> = {
  1: [4, 3, 8],
  2: [5, 4, 9],
  3: [6, 5, 1],
  4: [7, 6, 2],
  5: [8, 7, 3],
  6: [9, 8, 4],
  7: [1, 9, 5],
  8: [2, 1, 6],
  9: [3, 2, 7],
}

const LARGE_TAIJI_YANG: Record<number, number[]> = {
  1: [8, 3, 4],
  2: [9, 4, 5],
  3: [1, 5, 6],
  4: [2, 6, 7],
  5: [3, 7, 8],
  6: [4, 8, 9],
  7: [5, 9, 1],
  8: [6, 1, 2],
  9: [7, 2, 3],
}

const getMountainFromAngle = (angle: number) => {
  const normalized = ((angle % 360) + 360) % 360
  let closest = TWENTY_FOUR_MOUNTAINS[0]
  let minDiff = 360
  for (const m of TWENTY_FOUR_MOUNTAINS) {
    let diff = Math.abs(normalized - m.angle)
    if (diff > 180) diff = 360 - diff
    if (diff < minDiff) {
      minDiff = diff
      closest = m
    }
  }
  return closest
}

const getOppositeTrigram = (trigram: string): string => {
  const opposites: Record<string, string> = {
    kan: 'li',
    li: 'kan',
    zhen: 'dui',
    dui: 'zhen',
    xun: 'qian',
    qian: 'xun',
    gen: 'kun',
    kun: 'gen',
  }
  return opposites[trigram] || trigram
}

const flyStarLuoShu = (startStar: NineStar, direction: 'shun' | 'ni'): NineStar[][] => {
  const grid: NineStar[][] = Array(3).fill(null).map(() => Array(3).fill(0))
  const path = [
    [1, 1],
    [0, 0], [0, 1], [0, 2],
    [1, 2], [2, 2], [2, 1], [2, 0], [1, 0],
  ]
  let current = startStar
  const increment = direction === 'shun' ? 1 : -1
  for (let i = 0; i < 9; i++) {
    const [row, col] = path[i]
    grid[row][col] = current
    current = (((current - 1 + increment + 9) % 9) + 1) as NineStar
  }
  return grid
}

const getMountainStarStart = (period: number, mountainStar: NineStar, yinYang: 'yin' | 'yang'): { startPos: [number, number]; direction: 'shun' | 'ni' } => {
  const yinPath = LARGE_TAIJI_YIN[period]
  const yangPath = LARGE_TAIJI_YANG[period]
  const path = yinYang === 'yang' ? yangPath : yinPath
  let idx = path.indexOf(mountainStar)
  if (idx === -1) idx = 4
  const positions: [number, number][] = [
    [2, 1],
    [1, 2], [0, 2], [0, 1],
    [0, 0], [1, 0], [2, 0], [2, 2], [1, 1],
  ]
  return {
    startPos: positions[idx],
    direction: yinYang === 'yang' ? 'shun' : 'ni',
  }
}

export const generateFlyingStarChart = (orientation: number, period: number = getCurrentPeriod()): FlyingStarChart => {
  const facingAngle = orientation
  const sittingAngle = (orientation + 180) % 360
  const facingMountain = getMountainFromAngle(facingAngle)
  const sittingMountain = getMountainFromAngle(sittingAngle)
  const facingStar = TRIGRAM_STAR[getOppositeTrigram(sittingMountain.trigram)]
  const sittingStar = TRIGRAM_STAR[sittingMountain.trigram]
  const mountainYinYang = sittingMountain.yinYang
  const facingYinYang = facingMountain.yinYang
  const periodStar = period as NineStar
  const periodGrid = flyStarLuoShu(periodStar, 'shun')
  const mountainStart = getMountainStarStart(period, sittingStar, mountainYinYang)
  const facingStart = getMountainStarStart(period, facingStar, facingYinYang)
  const mountainGrid: NineStar[][] = Array(3).fill(null).map(() => Array(3).fill(0))
  const facingGrid: NineStar[][] = Array(3).fill(null).map(() => Array(3).fill(0))
  const path = [
    [1, 1], [0, 0], [0, 1], [0, 2],
    [1, 2], [2, 2], [2, 1], [2, 0], [1, 0],
  ]
  const flyFromStart = (startPos: [number, number], direction: 'shun' | 'ni', grid: NineStar[][], baseStar: NineStar) => {
    let startIdx = -1
    for (let i = 0; i < path.length; i++) {
      if (path[i][0] === startPos[0] && path[i][1] === startPos[1]) {
        startIdx = i
        break
      }
    }
    if (startIdx === -1) startIdx = 0
    const inc = direction === 'shun' ? 1 : -1
    for (let i = 0; i < 9; i++) {
      const pathIdx = (startIdx + i) % 9
      const [r, c] = path[pathIdx]
      const star = (((baseStar - 1 + inc * i + 90) % 9) + 1) as NineStar
      grid[r][c] = star
    }
  }
  flyFromStart(mountainStart.startPos, mountainStart.direction, mountainGrid, sittingStar)
  flyFromStart(facingStart.startPos, facingStart.direction, facingGrid, facingStar)
  const actualGrid: FlyingStarChart['grid'] = [
    [[mountainGrid[0][0], facingGrid[0][0]], [mountainGrid[0][1], facingGrid[0][1]], [mountainGrid[0][2], facingGrid[0][2]]],
    [[mountainGrid[1][0], facingGrid[1][0]], [mountainGrid[1][1], facingGrid[1][1]], [mountainGrid[1][2], facingGrid[1][2]]],
    [[mountainGrid[2][0], facingGrid[2][0]], [mountainGrid[2][1], facingGrid[2][1]], [mountainGrid[2][2], facingGrid[2][2]]],
  ]
  return {
    period,
    mountain: sittingStar,
    facing: facingStar,
    center: [mountainGrid[1][1], facingGrid[1][1]],
    grid: actualGrid,
    periodGrid,
  } as FlyingStarChart & { periodGrid: NineStar[][] }
}

export const getStarStatus = (star: NineStar, period: number): StarStatus => {
  const wangStar = getWangStar(period)
  const shengStar = getShengStar(period)
  const tuiStar = ((period + 6) % 9) + 1 as NineStar
  const shaStar = ((period + 3) % 9) + 1 as NineStar
  const siStar = ((period + 4) % 9) + 1 as NineStar
  if (star === wangStar) return 'wang'
  if (star === shengStar) return 'sheng'
  if (star === shaStar || star === siStar || star === 5) return star === 5 ? 'sha' : 'si'
  if (star === tuiStar) return 'shuai'
  return 'ping'
}

export const getStarStatusName = (status: StarStatus): string => {
  const names: Record<StarStatus, string> = {
    wang: '旺',
    sheng: '生',
    ping: '平',
    shuai: '衰',
    si: '死',
    sha: '煞',
  }
  return names[status]
}

export const getStarEnergyWeight = (star: NineStar, period: number): number => {
  const status = getStarStatus(star, period)
  return STAR_STATUS_WEIGHTS[status]
}

export const getWangDirection = (chart: FlyingStarChart): { mountain: { pos: [number, number]; star: NineStar }; facing: { pos: [number, number]; star: NineStar } } => {
  const wangStar = getWangStar(chart.period) as NineStar
  let mountainPos: [number, number] = [1, 1]
  let facingPos: [number, number] = [1, 1]
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (chart.grid[r][c][0] === wangStar) mountainPos = [r, c]
      if (chart.grid[r][c][1] === wangStar) facingPos = [r, c]
    }
  }
  return {
    mountain: { pos: mountainPos, star: wangStar },
    facing: { pos: facingPos, star: wangStar },
  }
}

export const getShengDirection = (chart: FlyingStarChart): { positions: [number, number][]; star: NineStar } => {
  const shengStar = getShengStar(chart.period) as NineStar
  const positions: [number, number][] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (chart.grid[r][c][0] === shengStar || chart.grid[r][c][1] === shengStar) {
        positions.push([r, c])
      }
    }
  }
  return { positions, star: shengStar }
}

export const getShaDirection = (chart: FlyingStarChart): { positions: [number, number][]; stars: NineStar[] } => {
  const period = chart.period
  const positions: [number, number][] = []
  const stars: NineStar[] = []
  const shaStar = ((period + 4) % 9) + 1 as NineStar
  const fiveYellow = 5 as NineStar
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const [m, f] = chart.grid[r][c]
      if (m === shaStar || m === fiveYellow || f === shaStar || f === fiveYellow) {
        positions.push([r, c])
        if (!stars.includes(m)) stars.push(m)
        if (!stars.includes(f)) stars.push(f)
      }
    }
  }
  return { positions, stars }
}

export const generateYearChart = (year: number): NineStar[][] => {
  const yearStar = getYearStar(year)
  return flyStarLuoShu(yearStar, 'ni')
}

export const generateMonthChart = (year: number, month: number): NineStar[][] => {
  const monthStar = getMonthStar(year, month)
  return flyStarLuoShu(monthStar, 'shun')
}

export const generateDayChart = (date: Date): NineStar[][] => {
  const dayStar = getDayStar(date)
  return flyStarLuoShu(dayStar, 'shun')
}

export const generateTimeChart = (date: Date, shichen: ShiChen): NineStar[][] => {
  const timeStar = getTimeStar(date, shichen)
  return flyStarLuoShu(timeStar, 'shun')
}

export interface CellEnergy {
  position: [number, number]
  palaceName: string
  baseEnergy: number
  mountainStar: NineStar
  facingStar: NineStar
  periodStar: NineStar
  mountainStatus: StarStatus
  facingStatus: StarStatus
  mountainEnergy: number
  facingEnergy: number
  totalEnergy: number
  shichenBonus: number
  tideBonus: number
  finalEnergy: number
}

export const calculateCellEnergy = (
  chart: FlyingStarChart & { periodGrid?: NineStar[][] },
  date: Date = new Date(),
  shichenOverride?: ShiChen,
  tideLevel: number = 0.5
): CellEnergy[] => {
  const hour = date.getHours()
  const shichen = shichenOverride || getShiChenFromHour(hour)
  const tideBonus = 0.7 + tideLevel * 0.6
  const cells: CellEnergy[] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const pos = NINE_PALACE_POSITIONS[r * 3 + c]
      const [mountainStar, facingStar] = chart.grid[r][c]
      const periodStar = chart.periodGrid ? chart.periodGrid[r][c] : (chart.period as NineStar)
      const mountainStatus = getStarStatus(mountainStar, chart.period)
      const facingStatus = getStarStatus(facingStar, chart.period)
      const mountainWeight = STAR_STATUS_WEIGHTS[mountainStatus]
      const facingWeight = STAR_STATUS_WEIGHTS[facingStatus]
      const mElement = NINE_STAR_ELEMENTS[mountainStar]
      const fElement = NINE_STAR_ELEMENTS[facingStar]
      const pElement = NINE_STAR_ELEMENTS[periodStar]
      let elementBonus = 1.0
      if (ELEMENT_GENERATES[pElement] === mElement) elementBonus += 0.15
      if (ELEMENT_GENERATES[pElement] === fElement) elementBonus += 0.15
      if (mElement === fElement) elementBonus += 0.1
      const mountainShichenBonus = getShichenEnergyBonus(shichen, mountainStar)
      const facingShichenBonus = getShichenEnergyBonus(shichen, facingStar)
      const avgShichenBonus = (mountainShichenBonus + facingShichenBonus) / 2
      const baseEnergy = (mountainWeight * 0.5 + facingWeight * 0.5) * elementBonus
      const totalEnergy = baseEnergy * avgShichenBonus * tideBonus
      cells.push({
        position: [r, c],
        palaceName: pos.name,
        baseEnergy,
        mountainStar,
        facingStar,
        periodStar,
        mountainStatus,
        facingStatus,
        mountainEnergy: mountainWeight * mountainShichenBonus,
        facingEnergy: facingWeight * facingShichenBonus,
        totalEnergy: baseEnergy * avgShichenBonus,
        shichenBonus: avgShichenBonus,
        tideBonus,
        finalEnergy: totalEnergy,
      })
    }
  }
  return cells
}

export const getOrientationFromAngle = (angle: number) => {
  const normalized = ((angle % 360) + 360) % 360
  const directions = [
    { name: '北', min: 337.5, max: 360 },
    { name: '北', min: 0, max: 22.5 },
    { name: '东北', min: 22.5, max: 67.5 },
    { name: '东', min: 67.5, max: 112.5 },
    { name: '东南', min: 112.5, max: 157.5 },
    { name: '南', min: 157.5, max: 202.5 },
    { name: '西南', min: 202.5, max: 247.5 },
    { name: '西', min: 247.5, max: 292.5 },
    { name: '西北', min: 292.5, max: 337.5 },
  ]
  for (const dir of directions) {
    if (normalized >= dir.min && normalized < dir.max) {
      return dir.name
    }
  }
  return '北'
}
