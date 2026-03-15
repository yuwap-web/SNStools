import { useEffect } from 'react'
import { useLogStore } from '../store/logStore'
import './LogList.css'

export default function LogList() {
  const { logs, loading, error, fetchLogs } = useLogStore()

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const getStatusBadgeClass = (status: string): string => {
    return status === 'success' ? 'badge-success' : 'badge-failed'
  }

  const getStatusLabel = (status: string): string => {
    return status === 'success' ? '成功' : '失敗'
  }

  if (loading) {
    return <div className="log-list loading">読み込み中...</div>
  }

  if (error) {
    return <div className="log-list error">エラー: {error}</div>
  }

  if (logs.length === 0) {
    return <div className="log-list empty">ログはまだありません</div>
  }

  return (
    <div className="log-list">
      <div className="log-header">
        <div className="log-col col-timestamp">時刻</div>
        <div className="log-col col-action">アクション</div>
        <div className="log-col col-status">ステータス</div>
        <div className="log-col col-error">メッセージ</div>
      </div>

      <div className="log-items">
        {logs.map((log, index) => (
          <div key={index} className="log-item">
            <div className="log-col col-timestamp">
              {new Date(log.timestamp).toLocaleString('ja-JP')}
            </div>
            <div className="log-col col-action">{log.action}</div>
            <div className="log-col col-status">
              <span className={`badge ${getStatusBadgeClass(log.status)}`}>
                {getStatusLabel(log.status)}
              </span>
            </div>
            <div className="log-col col-error">
              {log.error ? <span className="error-text">{log.error}</span> : '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
