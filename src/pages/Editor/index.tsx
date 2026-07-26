import { useState, useEffect, useCallback } from 'react'
import { Layout } from 'antd'
import { useAppStore } from '@/store'
import { useHistory } from '@/hooks/useHistory'
import FloorPlanCanvas from '@/components/Canvas/FloorPlanCanvas'
import Toolbar from '@/components/Controls/Toolbar'
import PropertiesPanel from '@/components/Panels/PropertiesPanel'
import InfoBar from '@/components/Header/InfoBar'
import { createDefaultFloorPlan } from '@/utils/defaultPlan'
import type { FloorPlan } from '@/types'

const { Content } = Layout

const EditorPage = () => {
  const { floorPlan: storePlan } = useAppStore()
  const initialPlan = storePlan.walls.length > 0 ? storePlan : createDefaultFloorPlan()
  const { state: historyState, set: setHistory, undo, redo, canUndo, canRedo, reset: resetHistory } =
    useHistory<FloorPlan>(initialPlan)

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const setHistoryWithReset = useCallback(
    (plan: FloorPlan) => {
      setHistory(plan)
    },
    [setHistory]
  )

  const handleReset = useCallback(() => {
    resetHistory(createDefaultFloorPlan())
    setSelectedId(null)
  }, [resetHistory])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          const newPlan = { ...historyState }
          newPlan.walls = newPlan.walls.filter((w) => w.id !== selectedId)
          newPlan.windows = newPlan.windows.filter((w) => w.id !== selectedId)
          newPlan.doors = newPlan.doors.filter((d) => d.id !== selectedId)
          setHistory(newPlan)
          setSelectedId(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, selectedId, historyState, setHistory])

  return (
    <Layout style={{ height: '100vh', background: '#0a0a1a' }}>
      <InfoBar />
      <Content style={{ position: 'relative', overflow: 'hidden' }}>
        <FloorPlanCanvas
          historyState={historyState}
          setHistory={setHistoryWithReset}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
        <Toolbar onUndo={undo} onRedo={redo} onReset={handleReset} canUndo={canUndo} canRedo={canRedo} />
        <PropertiesPanel />
      </Content>
    </Layout>
  )
}

export default EditorPage
