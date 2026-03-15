import { useState } from 'react'
import type { SNSAccount } from '../types'
import PostsList from './PostsList'
import './AccountCard.css'

interface AccountCardProps {
  account: SNSAccount
}

export default function AccountCard({ account }: AccountCardProps) {
  const [showPosts, setShowPosts] = useState(false)

  const getPlatformColor = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return '#1DA1F2'
      case 'instagram':
        return '#E1306C'
      case 'facebook':
        return '#1877F2'
      default:
        return '#666'
    }
  }

  const getPlatformIcon = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return '𝕏'
      case 'instagram':
        return '📷'
      case 'facebook':
        return 'f'
      default:
        return '📱'
    }
  }

  const color = getPlatformColor(account.platform)
  const icon = getPlatformIcon(account.platform)

  return (
    <div className="account-card" style={{ borderLeftColor: color }}>
      <div className="card-header">
        <span className="platform-icon">{icon}</span>
        <h3 className="platform-name">{account.platform}</h3>
      </div>

      <div className="card-content">
        <div className="account-name">{account.accountName}</div>
        <div className="followers-info">
          <span className="followers-label">フォロワー</span>
          <span className="followers-count">{account.followers.toLocaleString()}</span>
        </div>
      </div>

      <button
        className="posts-toggle-btn"
        onClick={() => setShowPosts(!showPosts)}
      >
        {showPosts ? '投稿を隠す' : '最近の投稿を表示'}
      </button>

      {showPosts && (
        <div className="posts-section">
          <PostsList platform={account.platform as 'Twitter' | 'Instagram' | 'Facebook'} limit={3} />
        </div>
      )}

      <div className="card-footer">
        <span className="last-updated">
          更新: {new Date(account.lastUpdated).toLocaleString('ja-JP')}
        </span>
      </div>
    </div>
  )
}
