export interface Point {
  x: number
  y: number
}

export interface Wall {
  id: string
  start: Point
  end: Point
  thickness: number
}

export interface Window {
  id: string
  position: Point
  width: number
  height: number
  type: 'window' | 'floor-to-ceiling'
  orientation: number
}

export interface Door {
  id: string
  position: Point
  width: number
  orientation: number
  isOpen: boolean
}

export interface Room {
  id: string
  name: string
  type: 'bedroom' | 'living' | 'kitchen' | 'bathroom' | 'study' | 'other'
  points: Point[]
}

export interface FloorPlan {
  walls: Wall[]
  windows: Window[]
  doors: Door[]
  rooms: Room[]
  orientation: number
  center: Point
}

export type NineStar = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type StarStatus = 'wang' | 'sheng' | 'shuai' | 'si' | 'sha'

export interface FlyingStarChart {
  period: number
  mountain: number
  facing: number
  center: [NineStar, NineStar]
  grid: [[NineStar, NineStar][], [NineStar, NineStar][], [NineStar, NineStar][]]
}

export type ShiChen =
  | 'zi'
  | 'chou'
  | 'yin'
  | 'mao'
  | 'chen'
  | 'si'
  | 'wu'
  | 'wei'
  | 'shen'
  | 'you'
  | 'xu'
  | 'hai'

export const SHICHEN_NAMES: Record<ShiChen, string> = {
  zi: '子',
  chou: '丑',
  yin: '寅',
  mao: '卯',
  chen: '辰',
  si: '巳',
  wu: '午',
  wei: '未',
  shen: '申',
  you: '酉',
  xu: '戌',
  hai: '亥',
}

export const SHICHEN_HOURS: Record<ShiChen, [number, number]> = {
  zi: [23, 1],
  chou: [1, 3],
  yin: [3, 5],
  mao: [5, 7],
  chen: [7, 9],
  si: [9, 11],
  wu: [11, 13],
  wei: [13, 15],
  shen: [15, 17],
  you: [17, 19],
  xu: [19, 21],
  hai: [21, 23],
}

export type MoonPhase = 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent'

export interface AstronomyData {
  shichen: ShiChen
  lunarDate: string
  moonPhase: MoonPhase
  moonAzimuth: number
  tideLevel: number
}

export interface EnergyCell {
  position: Point
  windSpeed: number
  windDirection: number
  lightIntensity: number
  starEnergy: number
  tideBonus: number
  shichenBonus: number
  totalEnergy: number
}

export interface WindField {
  grid: number[][]
  vectors: { x: number; y: number }[][]
  inlets: Point[]
  outlets: Point[]
}

export type ToolType = 'select' | 'wall' | 'door' | 'window' | 'room' | 'erase'

export interface AppState {
  floorPlan: FloorPlan
  currentTool: ToolType
  showWindField: boolean
  showEnergy: boolean
  showLighting: boolean
  showNineStars: boolean
  isDemoMode: boolean
  isPlaying: boolean
  demoSpeed: number
  manualShichen: ShiChen | null
}
