/**
 * Facebook API Service
 *
 * Facebook Graph API を使用してページ情報と投稿を取得
 */

/**
 * Facebook ページ投稿を取得（ダッシュボード用）
 * pageId は apiSecret に保存される想定
 */
function getFacebookPostsList(accessToken, pageId, limit = 3) {
  if (!pageId) {
    return [];
  }
  return getFacebookPosts(accessToken, pageId, limit);
}

/**
 * Facebook ページ情報を取得
 */
function getFacebookPageInfo(accessToken, pageId) {
  const url = `https://graph.facebook.com/v18.0/${pageId}?fields=id,name,fan_count,followers_count,talking_about_count,picture&access_token=${accessToken}`;

  const options = {
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      throw new Error(`Facebook API Error: ${statusCode} ${response.getContentText()}`);
    }

    const result = JSON.parse(response.getContentText());

    if (result.id) {
      return {
        pageId: result.id,
        pageName: result.name,
        followers: result.fan_count || 0,
        followers_alt: result.followers_count || 0,
        talkingAbout: result.talking_about_count || 0,
        picture: result.picture?.data?.url || ''
      };
    } else {
      throw new Error('Invalid response from Facebook API');
    }
  } catch (error) {
    logError('Facebook API Error', error.toString());
    return null;
  }
}

/**
 * Facebook ページ投稿取得（オプション、フェーズ2）
 */
function getFacebookPosts(accessToken, pageId, limit = 10) {
  const url = `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,story,created_time,type,likes.summary(true).limit(0),comments.summary(true).limit(0),shares&limit=${limit}&access_token=${accessToken}`;

  const options = {
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (result.data) {
      return result.data.map(item => ({
        id: item.id,
        message: item.message || item.story || '',
        createdTime: item.created_time,
        type: item.type,
        likes: item.likes?.summary?.total_count || 0,
        comments: item.comments?.summary?.total_count || 0,
        shares: item.shares?.count || 0
      }));
    } else {
      throw new Error('Failed to fetch posts');
    }
  } catch (error) {
    logError('Facebook Posts Error', error.toString());
    return [];
  }
}
