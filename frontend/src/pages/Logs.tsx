import LogList from '../components/LogList'
import '../styles/Logs.css'

export default function Logs() {
  return (
    <div className="logs-page">
      <div className="logs-header">
        <h1>操作ログ</h1>
        <p className="description">
          すべての操作履歴を表示しています。自動的に最新 20 件が表示されます
        </p>
      </div>

      <LogList />
    </div>
  )
}
