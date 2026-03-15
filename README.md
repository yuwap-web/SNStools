# SNS 管理ツール

複数のSNS（Twitter/X, Instagram, Facebook）を一括管理できるウェブアプリケーション。

## プロジェクト構成

```
sns-management-tool/
├── frontend/           # React + Vite フロントエンド
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── store/
│   │   ├── types/
│   │   └── styles/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── backend/            # Google Apps Script バックエンド（別途作成）
│   ├── Code.gs
│   ├── AccountsService.gs
│   ├── TwitterService.gs
│   ├── InstagramService.gs
│   ├── FacebookService.gs
│   └── Utilities.gs
└── README.md
```

## セットアップ手順

### フロントエンド（React + Vite）

1. **依存性インストール**
   ```bash
   cd frontend
   npm install
   ```

2. **環境変数設定**
   ```bash
   cp .env.example .env.local
   ```
   `.env.local` に GAS のデプロイ URL を設定：
   ```
   VITE_GAS_URL=https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercall?v1
   ```

3. **開発サーバー起動**
   ```bash
   npm run dev
   ```
   http://localhost:5173 でアクセス

### バックエンド（Google Apps Script）

1. **GAS プロジェクト作成**
   - Google Cloud Console で新しい Apps Script プロジェクトを作成

2. **コード作成**
   - `Code.gs` - メイン API（doGet, doPost）
   - `AccountsService.gs` - アカウント情報取得
   - `TwitterService.gs` - Twitter API 連携
   - `InstagramService.gs` - Instagram API 連携
   - `FacebookService.gs` - Facebook API 連携
   - `Utilities.gs` - ユーティリティ（暗号化、ログ）

3. **Google Sheets セットアップ**
   - GAS プロジェクトにスプレッドシート（`SNS運用管理`）を関連付け
   - 以下のシートを作成：
     - `Accounts` - SNSアカウント情報
     - `API Keys` - 暗号化されたトークン
     - `Logs` - 操作ログ

4. **デプロイ**
   - GAS エディタで「デプロイ」→「新しいデプロイ」
   - タイプ: Web app
   - 実行: 自分の Google アカウント
   - アクセス: 全員

5. **デプロイ URL を確認**
   - デプロイ完了後、Web app URL をコピー
   - フロントエンド `.env.local` に設定

## 機能

- **複数SNS管理**: Twitter/X, Instagram, Facebook のアカウント一括管理
- **ダッシュボード**: アカウント情報をカード形式で表示
- **API キー設定**: 各SNS の API キーを安全に管理
- **操作ログ**: すべての操作をログに記録

## 技術スタック

| レイヤー | 技術 |
|--------|------|
| フロントエンド | React + TypeScript + Vite |
| 状態管理 | Zustand |
| ルーティング | React Router v6 |
| バックエンド | Google Apps Script |
| データベース | Google Sheets |

## 使用方法

### 1. ダッシュボード
登録されているSNSアカウントの情報を表示。フォロワー数は自動更新（30秒ごと）。

### 2. 設定ページ
各SNS（Twitter, Instagram, Facebook）の API キーを追加・更新。

### 3. ログページ
すべての操作（API キー保存、データ取得など）の履歴を表示。

## セキュリティ

- API キーは GAS で Base64 エンコード（簡易保護）
- 本番環境では Crypto ライブラリ使用を推奨
- GAS は「全員実行可」でデプロイ（操作は限定）
- すべての操作を Sheets ログに記録

## 今後の拡張予定

- [ ] 投稿スケジューリング機能
- [ ] 分析ダッシュボード（エンゲージメント率等）
- [ ] 複数ユーザー承認フロー
- [ ] AI による投稿提案
- [ ] トレンド分析

## トラブルシューティング

### GAS が 401 エラーを返す
- GAS がデプロイされているか確認
- アクセス権限が「全員」に設定されているか確認

### API キーが保存されない
- フロント側の `.env.local` に GAS URL が正しく設定されているか確認
- GAS の Sheets に `API Keys` シートが存在するか確認

### ブラウザコンソールに CORS エラーが出る
- GAS は CORS を自動許可するため、このエラーは無視できます
- API は動作しているはずです

## サポート

問題が発生した場合、以下を確認してください：
1. ブラウザの開発者ツール（F12） → Console タブでエラーを確認
2. GAS エディタの実行ログで GAS 側のエラーを確認
3. Google Sheets の `Logs` シートで操作ログを確認

---

更新日: 2024年3月14日
