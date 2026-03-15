import { create } from 'zustand'
import type { SNSAccount } from '../types'
import { getAccountsInfo, saveApiKey } from '../api/gasApi'

interface AccountStore {
  accounts: SNSAccount[]
  loading: boolean
  error: string | null
  fetchAccounts: () => Promise<void>
  updateAccount: (platform: string, apiKey: string, apiSecret?: string) => Promise<void>
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null })
    try {
      const accounts = await getAccountsInfo()
      set({ accounts, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch accounts',
        loading: false
      })
    }
  },

  updateAccount: async (platform: string, apiKey: string, apiSecret?: string) => {
    set({ loading: true, error: null })
    try {
      await saveApiKey(platform, apiKey, apiSecret)
      // Refresh accounts after update
      const accounts = await getAccountsInfo()
      set({ accounts, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update account',
        loading: false
      })
    }
  }
}))
