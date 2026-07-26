import { create } from 'zustand'
import type { AppState, FloorPlan, ToolType, ShiChen } from '@/types'

const createEmptyFloorPlan = (): FloorPlan => ({
  walls: [],
  windows: [],
  doors: [],
  rooms: [],
  orientation: 0,
  center: { x: 400, y: 300 },
})

interface AppStore extends AppState {
  setCurrentTool: (tool: ToolType) => void
  setFloorPlan: (plan: Partial<FloorPlan>) => void
  toggleWindField: () => void
  toggleEnergy: () => void
  toggleLighting: () => void
  toggleNineStars: () => void
  setDemoMode: (mode: boolean) => void
  setPlaying: (playing: boolean) => void
  setDemoSpeed: (speed: number) => void
  setManualShichen: (shichen: ShiChen | null) => void
  setWindDirection: (dir: number) => void
  setWindStrength: (strength: number) => void
  setCurrentTime: (date: Date) => void
  setAutoTime: (auto: boolean) => void
  reset: () => void
  windDirection: number
  windStrength: number
  currentTime: Date
  autoTime: boolean
}

export const useAppStore = create<AppStore>((set) => ({
  floorPlan: createEmptyFloorPlan(),
  currentTool: 'select',
  showWindField: false,
  showEnergy: false,
  showLighting: false,
  showNineStars: true,
  isDemoMode: false,
  isPlaying: false,
  demoSpeed: 1,
  manualShichen: null,
  windDirection: 0,
  windStrength: 0.5,
  currentTime: new Date(),
  autoTime: true,

  setCurrentTool: (tool) => set({ currentTool: tool }),
  setFloorPlan: (plan) =>
    set((state) => ({ floorPlan: { ...state.floorPlan, ...plan } })),
  toggleWindField: () => set((state) => ({ showWindField: !state.showWindField })),
  toggleEnergy: () => set((state) => ({ showEnergy: !state.showEnergy })),
  toggleLighting: () => set((state) => ({ showLighting: !state.showLighting })),
  toggleNineStars: () => set((state) => ({ showNineStars: !state.showNineStars })),
  setDemoMode: (mode) => set({ isDemoMode: mode }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setDemoSpeed: (speed) => set({ demoSpeed: speed }),
  setManualShichen: (shichen) => set({ manualShichen: shichen }),
  setWindDirection: (dir) => set({ windDirection: dir }),
  setWindStrength: (strength) => set({ windStrength: strength }),
  setCurrentTime: (date) => set({ currentTime: date }),
  setAutoTime: (auto) => set({ autoTime: auto }),
  reset: () =>
    set({
      floorPlan: createEmptyFloorPlan(),
      currentTool: 'select',
      showWindField: false,
      showEnergy: false,
      showLighting: false,
      showNineStars: true,
      isDemoMode: false,
      isPlaying: false,
      demoSpeed: 1,
      manualShichen: null,
      windDirection: 0,
      windStrength: 0.5,
      currentTime: new Date(),
      autoTime: true,
    }),
}))
