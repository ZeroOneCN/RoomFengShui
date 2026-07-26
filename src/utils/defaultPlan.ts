import type { FloorPlan, Wall, Window, Door, Room, Point } from '@/types'

const createWall = (x1: number, y1: number, x2: number, y2: number, thickness: number = 15): Wall => ({
  id: `wall-${Math.random().toString(36).substr(2, 9)}`,
  start: { x: x1, y: y1 },
  end: { x: x2, y: y2 },
  thickness,
})

const createWindow = (x: number, y: number, w: number, h: number, orientation: number = 0): Window => ({
  id: `window-${Math.random().toString(36).substr(2, 9)}`,
  position: { x, y },
  width: w,
  height: h,
  type: 'window',
  orientation,
})

const createDoor = (x: number, y: number, w: number, orientation: number = 0): Door => ({
  id: `door-${Math.random().toString(36).substr(2, 9)}`,
  position: { x, y },
  width: w,
  orientation,
  isOpen: false,
})

const createRoom = (name: string, type: Room['type'], points: Point[]): Room => ({
  id: `room-${Math.random().toString(36).substr(2, 9)}`,
  name,
  type,
  points,
})

export const createEmptyFloorPlan = (): FloorPlan => ({
  walls: [],
  windows: [],
  doors: [],
  rooms: [],
  orientation: 0,
  center: { x: 400, y: 300 },
})

export const createDefaultFloorPlan = (templateId: string = 'default'): FloorPlan => {
  if (templateId === '1b1') {
    return create1B1()
  }
  if (templateId === '2b1') {
    return create2B1()
  }
  if (templateId === '3b2') {
    return create3B2()
  }
  
  return createDefault()
}

const createDefault = (): FloorPlan => {
  const walls: Wall[] = [
    createWall(50, 50, 750, 50),
    createWall(750, 50, 750, 550),
    createWall(750, 550, 50, 550),
    createWall(50, 550, 50, 50),
    createWall(400, 50, 400, 250),
    createWall(400, 350, 400, 550),
    createWall(50, 300, 200, 300),
    createWall(280, 300, 400, 300),
    createWall(200, 50, 200, 220),
    createWall(200, 300, 200, 380),
    createWall(50, 220, 200, 220),
  ]

  const windows: Window[] = [
    createWindow(300, 46, 100, 8, 0),
    createWindow(754, 250, 8, 100, 90),
    createWindow(200, 554, 100, 8, 0),
  ]

  const doors: Door[] = [
    createDoor(400, 300, 80, 90),
    createDoor(160, 220, 70, 0),
    createDoor(240, 300, 80, 90),
  ]

  const rooms: Room[] = [
    createRoom('客厅', 'living', [
      { x: 50, y: 50 }, { x: 400, y: 50 }, { x: 400, y: 300 }, { x: 280, y: 300 }, { x: 200, y: 300 }, { x: 200, y: 50 }
    ]),
    createRoom('主卧', 'bedroom', [
      { x: 400, y: 50 }, { x: 750, y: 50 }, { x: 750, y: 550 }, { x: 400, y: 550 }, { x: 400, y: 350 }
    ]),
    createRoom('厨房', 'kitchen', [
      { x: 50, y: 220 }, { x: 200, y: 220 }, { x: 200, y: 300 }, { x: 50, y: 300 }
    ]),
    createRoom('卫生间', 'bathroom', [
      { x: 50, y: 300 }, { x: 200, y: 300 }, { x: 200, y: 380 }, { x: 50, y: 380 }
    ]),
  ]

  return {
    walls, windows, doors, rooms,
    orientation: 0,
    center: { x: 400, y: 300 },
  }
}

const create1B1 = (): FloorPlan => {
  const walls: Wall[] = [
    createWall(100, 100, 600, 100),
    createWall(600, 100, 600, 500),
    createWall(600, 500, 100, 500),
    createWall(100, 500, 100, 100),
    createWall(350, 100, 350, 300),
    createWall(100, 350, 220, 350),
    createWall(300, 350, 350, 350),
    createWall(220, 350, 220, 500),
  ]

  const windows: Window[] = [
    createWindow(260, 92, 120, 8, 0),
    createWindow(608, 260, 8, 120, 90),
  ]

  const doors: Door[] = [
    createDoor(350, 300, 70, 90),
    createDoor(260, 350, 70, 90),
  ]

  const rooms: Room[] = [
    createRoom('客厅', 'living', [
      { x: 100, y: 100 }, { x: 350, y: 100 }, { x: 350, y: 350 }, { x: 300, y: 350 }, { x: 100, y: 350 }
    ]),
    createRoom('卧室', 'bedroom', [
      { x: 350, y: 100 }, { x: 600, y: 100 }, { x: 600, y: 500 }, { x: 350, y: 500 }
    ]),
    createRoom('厨卫', 'kitchen', [
      { x: 100, y: 350 }, { x: 220, y: 350 }, { x: 220, y: 500 }, { x: 100, y: 500 }
    ]),
  ]

  return {
    walls, windows, doors, rooms,
    orientation: 0,
    center: { x: 350, y: 300 },
  }
}

const create2B1 = (): FloorPlan => createDefault()

const create3B2 = (): FloorPlan => {
  const walls: Wall[] = [
    createWall(50, 50, 900, 50),
    createWall(900, 50, 900, 650),
    createWall(900, 650, 50, 650),
    createWall(50, 650, 50, 50),
    createWall(400, 50, 400, 280),
    createWall(400, 380, 400, 650),
    createWall(50, 320, 180, 320),
    createWall(260, 320, 400, 320),
    createWall(650, 50, 650, 280),
    createWall(650, 380, 650, 650),
  ]

  const windows: Window[] = [
    createWindow(260, 42, 120, 8, 0),
    createWindow(525, 42, 100, 8, 0),
    createWindow(775, 42, 100, 8, 0),
    createWindow(908, 250, 8, 120, 90),
    createWindow(260, 658, 120, 8, 0),
  ]

  const doors: Door[] = [
    createDoor(400, 330, 80, 90),
    createDoor(650, 330, 80, 90),
    createDoor(220, 320, 70, 0),
  ]

  return {
    walls, windows, doors,
    rooms: [],
    orientation: 0,
    center: { x: 475, y: 350 },
  }
}
