import { Solar } from 'lunar-javascript'
import type { ShiChen, NineStar, MoonPhase } from '@/types'
import { SHICHEN_NAMES, SHICHEN_HOURS } from '@/types'
import { SHICHEN_LIST, getCurrentPeriod } from './constants'

export const getShiChenFromHour = (hour: number): ShiChen => {
  if (hour >= 23 || hour < 1) return 'zi'
  if (hour >= 1 && hour < 3) return 'chou'
  if (hour >= 3 && hour < 5) return 'yin'
  if (hour >= 5 && hour < 7) return 'mao'
  if (hour >= 7 && hour < 9) return 'chen'
  if (hour >= 9 && hour < 11) return 'si'
  if (hour >= 11 && hour < 13) return 'wu'
  if (hour >= 13 && hour < 15) return 'wei'
  if (hour >= 15 && hour < 17) return 'shen'
  if (hour >= 17 && hour < 19) return 'you'
  if (hour >= 19 && hour < 21) return 'xu'
  return 'hai'
}

export const getShiChenName = (shichen: ShiChen): string => {
  return SHICHEN_NAMES[shichen]
}

export const getShiChenTimeRange = (shichen: ShiChen): [number, number] => {
  return SHICHEN_HOURS[shichen]
}

export const getLunarInfo = (date: Date = new Date()) => {
  try {
    const solar = Solar.fromDate(date)
    const lunar = solar.getLunar()
    const jieQiTable = lunar.getJieQiTable()
    const currentJieQi = (lunar as any).getCurrentJieQi ? (lunar as any).getCurrentJieQi() : ''
    return {
      lunarYear: lunar.getYear(),
      lunarMonth: lunar.getMonth(),
      lunarDay: lunar.getDay(),
      lunarMonthName: lunar.getMonthInChinese(),
      lunarDayName: lunar.getDayInChinese(),
      yearGanZhi: lunar.getYearInGanZhi(),
      monthGanZhi: lunar.getMonthInGanZhi(),
      dayGanZhi: lunar.getDayInGanZhi(),
      yearShengXiao: lunar.getYearShengXiao(),
      jieQi: typeof currentJieQi === 'string' ? currentJieQi : '',
      isJieQi: !!jieQiTable,
    }
  } catch (e) {
    return {
      lunarYear: date.getFullYear(),
      lunarMonth: date.getMonth() + 1,
      lunarDay: date.getDate(),
      lunarMonthName: '',
      lunarDayName: '',
      yearGanZhi: '',
      monthGanZhi: '',
      dayGanZhi: '',
      yearShengXiao: '',
      jieQi: '',
      isJieQi: false,
    }
  }
}

export const getYearStar = (year: number): NineStar => {
  const base = year - 1864
  const periodBase = Math.floor(base / 180) % 3
  const within = base % 180
  const cycle = Math.floor(within / 60)
  const offset = within % 60
  const startStar = periodBase === 0 ? 1 : periodBase === 1 ? 4 : 7
  const cycleStart = (startStar + cycle * 3 - 1) % 9 + 1
  const star = ((cycleStart - 1 - offset + 9 * 100) % 9) + 1
  return star as NineStar
}

export const getMonthStar = (year: number, month: number): NineStar => {
  const yearStar = getYearStar(year)
  const yinPosition: Record<number, number> = {
    1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1, 9: 9,
  }
  const pos = yinPosition[yearStar]
  const monthOffset = month - 1
  const star = ((pos - 1 - monthOffset + 9 * 100) % 9) + 1
  return star as NineStar
}

export const getDayStar = (date: Date): NineStar => {
  const baseDate = new Date(1900, 0, 1)
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
  const star = ((diffDays % 9) + 9) % 9 + 1
  return star as NineStar
}

export const getTimeStar = (date: Date, shichen: ShiChen): NineStar => {
  const dayStar = getDayStar(date)
  const ziPosition: Record<number, number> = {
    1: 1, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2,
  }
  const pos = ziPosition[dayStar]
  const shichenIndex = SHICHEN_LIST.indexOf(shichen)
  const star = ((pos - 1 + shichenIndex) % 9) + 1
  return star as NineStar
}

export const getMoonPhase = (date: Date = new Date()): MoonPhase => {
  const knownNewMoon = new Date(2024, 0, 11, 11, 57)
  const synodicMonth = 29.53058867
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
  const currentPhaseDays = daysSinceNewMoon % synodicMonth
  const phaseValue = currentPhaseDays / synodicMonth
  if (phaseValue < 0.0625 || phaseValue >= 0.9375) return 'new'
  if (phaseValue < 0.1875) return 'waxing-crescent'
  if (phaseValue < 0.3125) return 'first-quarter'
  if (phaseValue < 0.4375) return 'waxing-gibbous'
  if (phaseValue < 0.5625) return 'full'
  if (phaseValue < 0.6875) return 'waning-gibbous'
  if (phaseValue < 0.8125) return 'last-quarter'
  return 'waning-crescent'
}

export const MOON_PHASE_NAMES: Record<MoonPhase, string> = {
  'new': '新月',
  'waxing-crescent': '蛾眉月',
  'first-quarter': '上弦月',
  'waxing-gibbous': '盈凸月',
  'full': '满月',
  'waning-gibbous': '亏凸月',
  'last-quarter': '下弦月',
  'waning-crescent': '残月',
}

export const getMoonIllumination = (date: Date = new Date()): number => {
  const knownNewMoon = new Date(2024, 0, 11, 11, 57)
  const synodicMonth = 29.53058867
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
  const currentPhaseDays = daysSinceNewMoon % synodicMonth
  const phase = currentPhaseDays / synodicMonth
  return 0.5 * (1 - Math.cos(2 * Math.PI * phase))
}

export const getMoonAzimuth = (date: Date = new Date(), lat: number = 39.9, lng: number = 116.4): number => {
  const jd = date.getTime() / 86400000 + 2440587.5
  const T = (jd - 2451545.0) / 36525
  const L0 = 218.316 + 481267.8813 * T
  const M = 134.963 + 477198.8676 * T
  const F = 93.272 + 483202.0175 * T
  const lambda = L0 + 6.289 * Math.sin((M * Math.PI) / 180)
  const beta = 5.128 * Math.sin((F * Math.PI) / 180)
  const eps = 23.439 - 0.0000004 * T
  const lambdaRad = (lambda * Math.PI) / 180
  const betaRad = (beta * Math.PI) / 180
  const epsRad = (eps * Math.PI) / 180
  const ra = Math.atan2(
    Math.sin(lambdaRad) * Math.cos(epsRad) - Math.tan(betaRad) * Math.sin(epsRad),
    Math.cos(lambdaRad)
  )
  const dec = Math.asin(
    Math.sin(betaRad) * Math.cos(epsRad) + Math.cos(betaRad) * Math.sin(epsRad) * Math.sin(lambdaRad)
  )
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
  const lst = ((gmst + lng) % 360 + 360) % 360
  const ha = ((lst - (ra * 180) / Math.PI) % 360 + 360) % 360
  const haRad = (ha * Math.PI) / 180
  const latRad = (lat * Math.PI) / 180
  const az = Math.atan2(
    -Math.sin(haRad),
    Math.cos(latRad) * Math.tan(dec) - Math.sin(latRad) * Math.cos(haRad)
  )
  return ((az * 180) / Math.PI + 180) % 360
}

export const getTideLevel = (date: Date = new Date()): number => {
  const moonPhase = getMoonPhase(date)
  const illumination = getMoonIllumination(date)
  const hour = date.getHours()
  const hourFactor = Math.abs(Math.sin(((hour - 6) * Math.PI) / 12))
  let baseTide = 0.3
  if (moonPhase === 'new' || moonPhase === 'full') baseTide = 0.9
  else if (moonPhase === 'first-quarter' || moonPhase === 'last-quarter') baseTide = 0.2
  else baseTide = 0.4 + illumination * 0.3
  const tide = baseTide * 0.6 + hourFactor * 0.4
  return Math.min(1, Math.max(0, tide))
}

export const getTideEnergyBonus = (tideLevel: number): number => {
  return 0.7 + tideLevel * 0.6
}

export const getShichenEnergyBonus = (shichen: ShiChen, star: NineStar): number => {
  const baseBonus = {
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
  return baseBonus[shichen][star]
}

export const getAstronomyData = (date: Date = new Date()) => {
  const hour = date.getHours()
  const shichen = getShiChenFromHour(hour)
  const lunar = getLunarInfo(date)
  const moonPhase = getMoonPhase(date)
  const moonIllumination = getMoonIllumination(date)
  const moonAzimuth = getMoonAzimuth(date)
  const tideLevel = getTideLevel(date)
  const tideBonus = getTideEnergyBonus(tideLevel)
  const yearStar = getYearStar(date.getFullYear())
  const monthStar = getMonthStar(date.getFullYear(), date.getMonth() + 1)
  const dayStar = getDayStar(date)
  const timeStar = getTimeStar(date, shichen)
  const currentPeriod = getCurrentPeriod(date.getFullYear())
  return {
    shichen,
    shichenName: getShiChenName(shichen),
    timeRange: getShiChenTimeRange(shichen),
    lunarDate: `${lunar.yearGanZhi}年 ${lunar.monthGanZhi}月 ${lunar.dayGanZhi}日`,
    lunarMonthName: lunar.lunarMonthName,
    lunarDayName: lunar.lunarDayName,
    yearShengXiao: lunar.yearShengXiao,
    jieQi: lunar.jieQi,
    moonPhase,
    moonPhaseName: MOON_PHASE_NAMES[moonPhase],
    moonIllumination,
    moonAzimuth,
    tideLevel,
    tideBonus,
    yearStar,
    monthStar,
    dayStar,
    timeStar,
    currentPeriod,
  }
}
