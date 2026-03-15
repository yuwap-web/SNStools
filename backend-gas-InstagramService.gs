/**
 * Instagram API Service
 *
 * Instagram Graph API を使用してアカウント情報と投稿を取得
 */

/**
 * Instagram 投稿を取得（ダッシュボード用）
 */
function getInstagramPosts(accessToken, limit = 3) {
  return getInstagramMedia(accessToken, limit);
}

/**
 * Instagram ビジネスアカウント情報を取得
 */
function getInstagramAccountInfo(accessToken) {
  // まずビジネスアカウントの ID を取得
  const url = `https://graph.instagram.com/me?fields=id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`;

  const options = {
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      throw new Error(`Instagram API Error: ${statusCode} ${response.getContentText()}`);
    }

    const result = JSON.parse(response.getContentText());

    if (result.id) {
      return {
        username: result.username || result.name,
        followers: result.followers_count || 0,
        following: result.follows_count || 0,
        posts: result.media_count || 0,
        biography: result.biography || ''
      };
    } else {
      throw new Error('Invalid response from Instagram API');
    }
  } catch (error) {
    logError('Instagram API Error', error.toString());
    return null;
  }
}

/**
 * Instagram 投稿取得（オプション、フェーズ2）
 */
function getInstagramMedia(accessToken, limit = 10) {
  const url = `https://graph.instagram.com/me/media?fields=id,caption,timestamp,like_count,comments_count,media_type&limit=${limit}&access_token=${accessToken}`;

  const options = {
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (result.data) {
      return result.data.map(item => ({
        id: item.id,
        caption: item.caption || '',
        timestamp: item.timestamp,
        likes: item.like_count || 0,
        comments: item.comments_count || 0,
        type: item.media_type
      }));
    } else {
      throw new Error('Failed to fetch media');
    }
  } catch (error) {
    logError('Instagram Media Error', error.toString());
    return [];
  }
}
