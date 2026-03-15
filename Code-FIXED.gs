/**
 * Google Apps Script - Main API Handler (FIXED VERSION)
 *
 * デプロイ方法:
 * 1. GAS エディタで Code.gs を全削除
 * 2. このコードをコピペ
 * 3. 「デプロイ」で既存デプロイを編集
 * 4. 「新しいデプロイ」でWeb appとして再デプロイ
 */

/**
 * GET リクエスト処理
 */
function doGet(e) {
  try {
    // パラメータ取得（null チェック追加）
    const action = (e && e.parameter && e.parameter.action) || '';
    const limit = (e && e.parameter && e.parameter.limit) ? parseInt(e.parameter.limit) : 20;

    let response = {};

    if (action === 'accounts') {
      response.accounts = getAccountsInfo();
    } else if (action === 'logs') {
      response.logs = getLogs(limit);
    } else if (action === 'test') {
      response.status = 'ok';
      response.message = 'GAS API is running';
    } else {
      response.status = 'error';
      response.message = 'No action specified. Use ?action=accounts, ?action=logs, or ?action=test';
    }

    return createJsonResponse(response);
  } catch (error) {
    logError('doGet Error', error.toString());
    return createJsonResponse({ error: error.toString() });
  }
}

/**
 * POST リクエスト処理
 */
function doPost(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || '';

    let response = {};

    if (action === 'saveApiKey' && e.postData && e.postData.contents) {
      try {
        const payload = JSON.parse(e.postData.contents);
        const { platform, apiKey, apiSecret } = payload;

        if (!platform || !apiKey) {
          return createJsonResponse({
            error: 'platform and apiKey are required',
            success: false
          });
        }

        saveApiKey(platform, apiKey, apiSecret);
        logAction(`API Key saved for ${platform}`, 'success');
        response.success = true;
        response.message = `${platform} API key saved successfully`;
      } catch (parseError) {
        return createJsonResponse({
          error: 'Invalid JSON in request body',
          success: false
        });
      }
    } else {
      return createJsonResponse({
        error: 'No action specified or invalid request',
        success: false
      });
    }

    return createJsonResponse(response);
  } catch (error) {
    logError('doPost Error', error.toString());
    return createJsonResponse({ error: error.toString(), success: false });
  }
}

/**
 * JSON レスポンス作成（CORS対応）
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * SNS アカウント情報を取得
 */
function getAccountsInfo() {
  try {
    const sheet = getOrCreateSheet('Accounts');
    const data = sheet.getDataRange().getValues();

    const accounts = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        accounts.push({
          platform: data[i][0] || '',
          accountName: data[i][1] || '',
          followers: parseInt(data[i][2]) || 0,
          lastUpdated: data[i][3] || new Date().toLocaleString('ja-JP')
        });
      }
    }

    return accounts;
  } catch (error) {
    logError('getAccountsInfo Error', error.toString());
    return [];
  }
}

/**
 * API キーを保存
 */
function saveApiKey(platform, apiKey, apiSecret) {
  try {
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

    const now = new Date().toLocaleString('ja-JP');

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
      accountsSheet.appendRow([platform, '', 0, now]);
    }
  } catch (error) {
    logError('saveApiKey Error', error.toString());
    throw error;
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
  try {
    const sheet = getOrCreateSheet('Logs');
    const now = new Date().toLocaleString('ja-JP');
    sheet.appendRow([now, action, status, errorMsg || '']);
  } catch (error) {
    // ロギング失敗は無視
    console.log('Log action failed:', error.toString());
  }
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
  try {
    const sheet = getOrCreateSheet('Logs');
    const data = sheet.getDataRange().getValues();

    const logs = [];
    const startIdx = Math.max(1, data.length - limit);

    for (let i = startIdx; i < data.length; i++) {
      logs.push({
        timestamp: data[i][0] || '',
        action: data[i][1] || '',
        status: data[i][2] || '',
        error: data[i][3] || ''
      });
    }

    return logs.reverse(); // 最新順
  } catch (error) {
    logError('getLogs Error', error.toString());
    return [];
  }
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
