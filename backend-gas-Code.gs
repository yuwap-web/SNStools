/**
 * Google Apps Script - Main API Handler
 *
 * デプロイ方法:
 * 1. Google Cloud Console → Apps Script プロジェクト作成
 * 2. このコードを Code.gs にコピペ
 * 3. AccountsService.gs, TwitterService.gs など他のファイルも作成
 * 4. スプレッドシート作成・関連付け
 * 5. 「デプロイ」→「新しいデプロイ」
 * 6. Web app として、「全員」に実行許可
 */

/**
 * GET リクエスト処理
 */
function doGet(e) {
  const response = {};

  try {
    // エディタでテスト実行時の対応（パラメータが undefined）
    if (!e || !e.parameter) {
      response.status = 'test';
      response.message = 'GAS API is running (test mode)';
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const action = e.parameter.action;

    if (action === 'accounts') {
      response.accounts = getAccountsInfo();
    } else if (action === 'logs') {
      const limit = parseInt(e.parameter.limit) || 20;
      response.logs = getLogs(limit);
    } else if (action === 'posts') {
      const platform = e.parameter.platform;
      const limit = parseInt(e.parameter.limit) || 3;
      response.posts = getPostsByPlatform(platform, limit);
    } else if (action === 'test') {
      response.status = 'ok';
      response.message = 'GAS API is running';
    } else {
      response.status = 'ok';
      response.message = 'GAS API is running';
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    logError('API Error', error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST リクエスト処理
 */
function doPost(e) {
  const action = e.parameter.action;
  const payload = JSON.parse(e.postData.contents);
  const response = {};

  try {
    if (action === 'saveApiKey') {
      const { platform, apiKey, apiSecret } = payload;
      saveApiKey(platform, apiKey, apiSecret);
      logAction(`API Key saved for ${platform}`, 'success');
      response.success = true;
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    logError('POST Error', error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * SNS アカウント情報を取得
 */
function getAccountsInfo() {
  const sheet = getOrCreateSheet('Accounts');
  const data = sheet.getDataRange().getValues();

  const accounts = [];
  for (let i = 1; i < data.length; i++) {
    // ヘッダーをスキップ
    if (data[i][0]) {
      accounts.push({
        platform: data[i][0],
        accountName: data[i][1],
        followers: data[i][2] || 0,
        lastUpdated: data[i][3] || new Date().toLocaleString()
      });
    }
  }

  return accounts;
}

/**
 * API キーを保存
 */
function saveApiKey(platform, apiKey, apiSecret) {
  const sheet = getOrCreateSheet('API Keys');
  const encrypted = {
    key: Utilities.base64Encode(apiKey),
    secret: Utilities.base64Encode(apiSecret || '')
  };

  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  // 既存行を検索
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === platform) {
      rowIndex = i + 1; // Sheets は 1-indexed
      break;
    }
  }

  const now = new Date().toLocaleString();

  if (rowIndex > 0) {
    // 既存行を更新
    sheet.getRange(rowIndex, 2, 1, 2).setValues([
      [encrypted.key, encrypted.secret]
    ]);
    sheet.getRange(rowIndex, 4).setValue(now);
  } else {
    // 新規行を追加
    sheet.appendRow([platform, encrypted.key, encrypted.secret, now]);
  }

  // Accounts シートにも追加（初回の場合）
  const accountsSheet = getOrCreateSheet('Accounts');
  const accountsData = accountsSheet.getDataRange().getValues();
  let accountExists = false;

  for (let i = 1; i < accountsData.length; i++) {
    if (accountsData[i][0] === platform) {
      accountExists = true;
      break;
    }
  }

  if (!accountExists) {
    accountsSheet.appendRow([platform, '', 0, '']);
  }
}

/**
 * API キーを取得（使用時）
 */
function getApiKey(platform) {
  const sheet = getOrCreateSheet('API Keys');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === platform) {
      try {
        return {
          key: Utilities.base64Decode(data[i][1]).toString(),
          secret: Utilities.base64Decode(data[i][2]).toString()
        };
      } catch (e) {
        logError('Decrypt Error', e.toString());
        return null;
      }
    }
  }
  return null;
}

/**
 * 操作ログを記録
 */
function logAction(action, status, errorMsg = '') {
  const sheet = getOrCreateSheet('Logs');
  const now = new Date().toLocaleString();
  sheet.appendRow([now, action, status, errorMsg]);
}

/**
 * エラーログを記録
 */
function logError(action, errorMsg) {
  logAction(action, 'failed', errorMsg);
}

/**
 * 操作ログを取得
 */
function getLogs(limit = 20) {
  const sheet = getOrCreateSheet('Logs');
  const data = sheet.getDataRange().getValues();

  const logs = [];
  const startIdx = Math.max(1, data.length - limit);

  for (let i = startIdx; i < data.length; i++) {
    logs.push({
      timestamp: data[i][0],
      action: data[i][1],
      status: data[i][2],
      error: data[i][3] || ''
    });
  }

  return logs.reverse(); // 最新順
}

/**
 * プラットフォーム別に投稿を取得
 */
function getPostsByPlatform(platform, limit = 3) {
  const apiKeys = getApiKey(platform);

  if (!apiKeys) {
    logError('Posts Fetch', `No API key found for ${platform}`);
    return [];
  }

  if (platform === 'Twitter') {
    return getTwitterPosts(apiKeys.key, limit);
  } else if (platform === 'Instagram') {
    return getInstagramPosts(apiKeys.key, limit);
  } else if (platform === 'Facebook') {
    // Facebook requires pageId which should be stored with the key
    return getFacebookPostsList(apiKeys.key, apiKeys.secret, limit);
  }

  return [];
}

/**
 * シートを取得、なければ作成
 */
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);

    // ヘッダー行を追加
    if (sheetName === 'Accounts') {
      sheet.appendRow(['Platform', 'Account Name', 'Followers', 'Last Updated']);
    } else if (sheetName === 'API Keys') {
      sheet.appendRow(['Platform', 'API Key', 'API Secret', 'Updated']);
    } else if (sheetName === 'Logs') {
      sheet.appendRow(['Timestamp', 'Action', 'Status', 'Error Message']);
    }
  }

  return sheet;
}
