import type { StateCreator } from 'zustand'
import { upgradePhaseService } from '@/services'
import type { AppState, UpgradePhaseSlice } from '../types'

export const createUpgradePhaseSlice: StateCreator<AppState, [], [], UpgradePhaseSlice> = (set, get) => ({
  upgradePhases: [],
  addUpgradePhase: async (input) => {
    const phase = await upgradePhaseService.create(input)
    set({ upgradePhases: [...get().upgradePhases, phase] })
    return phase
  },
  editUpgradePhase: async (id, patch) => {
    const updated = await upgradePhaseService.update(id, patch)
    if (!updated) return
    set({ upgradePhases: get().upgradePhases.map((phase) => (phase.id === id ? updated : phase)) })
  },
  removeUpgradePhase: async (id) => {
    await upgradePhaseService.remove(id)
    set({
      upgradePhases: get().upgradePhases.filter((phase) => phase.id !== id),
      upgradeItems: get().upgradeItems.filter((item) => item.phaseId !== id),
    })
  },
})
