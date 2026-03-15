# Google Apps Script セットアップガイド

SNS 管理ツールのバックエンド（Google Apps Script）をセットアップするための手順です。

## Step 1: Google Apps Script プロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存プロジェクトを選択）
3. 左メニューから「API と サービス」 → 「ライブラリ」
4. 上部検索に「Apps Script API」と入力
5. 「Apps Script API」を選択して「有効にする」をクリック

## Step 2: Google Sheets 作成

1. [Google Sheets](https://sheets.google.com/) にアクセス
2. 新しいスプレッドシート作成
3. 名前を「SNS運用管理」に変更
4. スプレッドシートの URL をコピー（後で使用）

## Step 3: Apps Script プロジェクト作成

1. スプレッドシート上部メニューから「拡張機能」 → 「Apps Script」
2. 新しい Apps Script プロジェクトが開く
3. プロジェクト名を「SNS管理ツール」に変更

## Step 4: コード配置

GAS エディタに以下のファイルを作成します。

### 4.1 Code.gs
`backend-gas-Code.gs` の内容をコピペ

1. エディタの左側「エディタ」パネルで「+」をクリック
2. 「スクリプト」を選択
3. ファイル名を `Code.gs` に変更
4. `Code.gs` の内容を削除
5. `backend-gas-Code.gs` から内容をコピペ

### 4.2 TwitterService.gs
`backend-gas-TwitterService.gs` を追加

1. 「+」→「スクリプト」で新ファイル作成
2. ファイル名を `TwitterService.gs` に変更
3. `backend-gas-TwitterService.gs` の内容をコピペ

### 4.3 InstagramService.gs
`backend-gas-InstagramService.gs` を追加

1. 「+」→「スクリプト」で新ファイル作成
2. ファイル名を `InstagramService.gs` に変更
3. `backend-gas-InstagramService.gs` の内容をコピペ

### 4.4 FacebookService.gs
`backend-gas-FacebookService.gs` を追加

1. 「+」→「スクリプト」で新ファイル作成
2. ファイル名を `FacebookService.gs` に変更
3. `backend-gas-FacebookService.gs` の内容をコピペ

## Step 5: テスト実行

1. Code.gs で `doGet()` 関数を選択
2. 上部の「▶ 実行」をクリック
3. ポップアップで「承認」をクリック（初回のみ）
4. 実行ログで `response: { "accounts": [] }` が表示されれば成功

## Step 6: Web App としてデプロイ

1. 上部メニューで「デプロイ」 → 「新しいデプロイ」をクリック
2. 設定：
   - タイプ: **Web app**
   - 実行アカウント: **自分のアカウント**
   - アクセス権限: **全員**
3. 「デプロイ」をクリック
4. 完了ダイアログから **Web app URL** をコピー

例：
```
https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercall?v1
```

## Step 7: フロントエンド環境変数設定

1. `frontend/.env.local` を開く
2. `VITE_GAS_URL` に Step 6 でコピーした URL を設定

```
VITE_GAS_URL=https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercall?v1
```

## Step 8: 初期データセットアップ

GAS エディタで以下を実行して、初期シートを作成：

1. Code.gs で `getOrCreateSheet('Accounts')` を実行
2. `getOrCreateSheet('API Keys')` を実行
3. `getOrCreateSheet('Logs')` を実行

（これらの関数は自動的に呼ばれるため、通常は不要です）

## Step 9: テスト

フロントエンド起動：
```bash
cd frontend
npm run dev
```

ブラウザで http://localhost:5173 にアクセス

### テスト項目
- [ ] ダッシュボードが読み込まれる
- [ ] 設定ページで API キー入力フォームが表示される
- [ ] Twitter API キーを入力 → 「保存」をクリック
- [ ] 「アカウント情報が保存されました」メッセージが表示される
- [ ] ダッシュボードをリロード → Twitter アカウント情報が表示される
- [ ] ログページ → `saveApiKey` アクション が記録されている

## トラブルシューティング

### エラー: "Authorization required"
**原因**: GAS の認可がまだ完了していない

**解決策**:
1. GAS エディタで `doGet()` を実行
2. ポップアップで「承認」をクリック
3. デプロイし直す

### エラー: "Cannot read property of undefined"
**原因**: Sheets にシートがない

**解決策**:
1. GAS エディタで `getOrCreateSheet('Accounts')` を実行
2. `getOrCreateSheet('API Keys')` を実行
3. `getOrCreateSheet('Logs')` を実行

### フロントエンドが GAS に接続できない
**原因**: `VITE_GAS_URL` が正しく設定されていない

**解決策**:
1. `.env.local` を確認
2. GAS デプロイ URL が正しくコピーされているか確認
3. フロント再起動: `npm run dev`

### API キーが保存されない
**原因**: GAS の権限設定が「全員」になっていない

**解決策**:
1. GAS エディタで「デプロイ」 → 配置を選択
2. 「すべてのユーザー」にアクセス権限を変更
3. 保存

## API 仕様

### GET リクエスト

#### アカウント情報取得
```
GET {GAS_URL}?action=accounts
```

レスポンス:
```json
{
  "accounts": [
    {
      "platform": "Twitter",
      "accountName": "@company",
      "followers": 5234,
      "lastUpdated": "2024-03-14 10:00:00"
    }
  ]
}
```

#### ログ取得
```
GET {GAS_URL}?action=logs&limit=20
```

レスポンス:
```json
{
  "logs": [
    {
      "timestamp": "2024-03-14 10:00:00",
      "action": "API Key saved for Twitter",
      "status": "success",
      "error": ""
    }
  ]
}
```

### POST リクエスト

#### API キー保存
```
POST {GAS_URL}?action=saveApiKey

Body:
{
  "action": "saveApiKey",
  "platform": "Twitter",
  "apiKey": "xxx",
  "apiSecret": "xxx"
}
```

## 次のステップ

- Phase 2: 投稿スケジューリング機能を追加
- Phase 3: 分析ダッシュボードを実装
- 複数ユーザー管理機能

---

最終更新: 2024年3月14日
