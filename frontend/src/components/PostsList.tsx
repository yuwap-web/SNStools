import { useState, useEffect } from 'react'
import { getPostsByPlatform } from '../api/gasApi'
import type { SNSPost } from '../types'
import '../styles/PostsList.css'

interface PostsListProps {
  platform: 'Twitter' | 'Instagram' | 'Facebook'
  limit?: number
}

export default function PostsList({ platform, limit = 3 }: PostsListProps) {
  const [posts, setPosts] = useState<SNSPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [platform])

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPostsByPlatform(platform, limit)
      setPosts(data)
    } catch (err) {
      setError(`投稿の取得に失敗しました`)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const getPostContent = (post: SNSPost): string => {
    return post.text || post.caption || post.message || '(内容なし)'
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  const getReactionLabel = (post: SNSPost): string[] => {
    const reactions: string[] = []

    if (platform === 'Twitter') {
      if (post.likes) reactions.push(`❤️ ${post.likes}`)
      if (post.retweets) reactions.push(`🔄 ${post.retweets}`)
      if (post.replies) reactions.push(`💬 ${post.replies}`)
    } else if (platform === 'Instagram') {
      if (post.likes) reactions.push(`❤️ ${post.likes}`)
      if (post.comments) reactions.push(`💬 ${post.comments}`)
    } else if (platform === 'Facebook') {
      if (post.likes) reactions.push(`👍 ${post.likes}`)
      if (post.comments) reactions.push(`💬 ${post.comments}`)
      if (post.shares) reactions.push(`↗️ ${post.shares}`)
    }

    return reactions
  }

  if (loading && posts.length === 0) {
    return <div className="posts-loading">読み込み中...</div>
  }

  if (error) {
    return <div className="posts-error">{error}</div>
  }

  if (posts.length === 0) {
    return <div className="posts-empty">投稿がありません</div>
  }

  return (
    <div className="posts-list">
      <div className="posts-header">
        <h3>最近の投稿（{posts.length}件）</h3>
        <button className="posts-refresh" onClick={fetchPosts} disabled={loading}>
          {loading ? '更新中...' : '更新'}
        </button>
      </div>
      <div className="posts-container">
        {posts.map((post, idx) => (
          <div key={post.id || idx} className="post-card">
            <div className="post-date">{formatDate(post.createdAt || post.timestamp || '')}</div>
            <div className="post-content">{getPostContent(post)}</div>
            <div className="post-reactions">
              {getReactionLabel(post).map((label, i) => (
                <span key={i} className="reaction-badge">
                  {label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
