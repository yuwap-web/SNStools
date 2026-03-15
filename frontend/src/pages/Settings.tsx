import { useState } from 'react'
import APIKeyForm from '../components/APIKeyForm'
import '../styles/Settings.css'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'Twitter' | 'Instagram' | 'Facebook'>('Twitter')

  const tabs: Array<'Twitter' | 'Instagram' | 'Facebook'> = ['Twitter', 'Instagram', 'Facebook']

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>API キー設定</h1>
        <p className="description">
          各 SNS プラットフォームの API キーを設定してください
        </p>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content">
        <APIKeyForm
          platform={activeTab}
          onSuccess={() => {
            console.log(`${activeTab} API キーが保存されました`)
          }}
        />

        <div className="api-instructions">
          <h3>API キーの取得方法</h3>
          {activeTab === 'Twitter' && (
            <div className="instructions">
              <ol>
                <li>
                  <a
                    href="https://developer.twitter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter Developer Portal
                  </a>
                  にアクセスしてください
                </li>
                <li>プロジェクトを作成し、API キーを生成します</li>
                <li>API v2 の Bearer Token を取得します</li>
                <li>上のフォームに Bearer Token を貼り付けてください</li>
              </ol>
            </div>
          )}

          {activeTab === 'Instagram' && (
            <div className="instructions">
              <ol>
                <li>
                  <a
                    href="https://developers.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook Developers
                  </a>
                  にアクセスしてください
                </li>
                <li>Instagram Graph API アプリを作成します</li>
                <li>Access Token を生成します</li>
                <li>上のフォームに Access Token を貼り付けてください</li>
              </ol>
            </div>
          )}

          {activeTab === 'Facebook' && (
            <div className="instructions">
              <ol>
                <li>
                  <a
                    href="https://developers.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook Developers
                  </a>
                  にアクセスしてください
                </li>
                <li>Graph API アプリを作成します</li>
                <li>Page Access Token を生成します</li>
                <li>上のフォームに Page Access Token を貼り付けてください</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
