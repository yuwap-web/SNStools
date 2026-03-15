import { useEffect } from 'react'
import { useAccountStore } from '../store/accountStore'
import AccountCard from '../components/AccountCard'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const { accounts, loading, error, fetchAccounts } = useAccountStore()

  useEffect(() => {
    fetchAccounts()
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAccounts()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchAccounts])

  const handleRefresh = () => {
    fetchAccounts()
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>SNS アカウント一覧</h1>
        <button
          className="btn-refresh"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? '更新中...' : '更新'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && accounts.length === 0 ? (
        <div className="loading">読み込み中...</div>
      ) : accounts.length === 0 ? (
        <div className="empty-state">
          <p>アカウントがまだ登録されていません</p>
          <p>設定ページで API キーを追加してください</p>
        </div>
      ) : (
        <div className="account-grid">
          {accounts.map((account) => (
            <AccountCard key={account.platform} account={account} />
          ))}
        </div>
      )}
    </div>
  )
}
