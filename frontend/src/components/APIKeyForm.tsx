import { useState } from 'react'
import { useAccountStore } from '../store/accountStore'
import './APIKeyForm.css'

interface APIKeyFormProps {
  platform: 'Twitter' | 'Instagram' | 'Facebook'
  onSuccess?: () => void
}

export default function APIKeyForm({ platform, onSuccess }: APIKeyFormProps) {
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const { updateAccount, loading, error } = useAccountStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      alert('API キーを入力してください')
      return
    }

    try {
      await updateAccount(platform, apiKey.trim(), apiSecret.trim())
      setApiKey('')
      setApiSecret('')
      alert(`${platform} の API キーを保存しました`)
      onSuccess?.()
    } catch (err) {
      console.error('Failed to save API key:', err)
    }
  }

  const getPlaceholder = (): string => {
    switch (platform) {
      case 'Twitter':
        return 'Twitter API Bearer Token または Access Token'
      case 'Instagram':
        return 'Instagram Access Token'
      case 'Facebook':
        return 'Facebook Access Token'
      default:
        return 'API キー'
    }
  }

  const getSecretLabel = (): string => {
    switch (platform) {
      case 'Twitter':
        return 'API Secret (オプション)'
      case 'Instagram':
        return '(この項目は使用しません)'
      case 'Facebook':
        return '(この項目は使用しません)'
      default:
        return 'Secret'
    }
  }

  const showSecretField = platform === 'Twitter'

  return (
    <div className="api-key-form">
      <h3 className="form-title">{platform} API キー設定</h3>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={`${platform}-key`}>API キー *</label>
          <input
            id={`${platform}-key`}
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={loading}
            required
          />
          <small className="form-help">
            {platform === 'Twitter' && 'Twitter API v2 の Bearer Token を入力してください'}
            {platform === 'Instagram' && 'Instagram Graph API の Access Token を入力してください'}
            {platform === 'Facebook' && 'Facebook Graph API の Access Token を入力してください'}
          </small>
        </div>

        {showSecretField && (
          <div className="form-group">
            <label htmlFor={`${platform}-secret`}>{getSecretLabel()}</label>
            <input
              id={`${platform}-secret`}
              type={showSecret ? 'text' : 'password'}
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="API Secret (オプション)"
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? '非表示' : '表示'}
            </button>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
