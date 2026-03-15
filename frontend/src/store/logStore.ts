import { create } from 'zustand'
import type { OperationLog } from '../types'
import { getLogs } from '../api/gasApi'

interface LogStore {
  logs: OperationLog[]
  loading: boolean
  error: string | null
  fetchLogs: (limit?: number) => Promise<void>
}

export const useLogStore = create<LogStore>((set) => ({
  logs: [],
  loading: false,
  error: null,

  fetchLogs: async (limit: number = 20) => {
    set({ loading: true, error: null })
    try {
      const logs = await getLogs(limit)
      set({ logs, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch logs',
        loading: false
      })
    }
  }
}))
