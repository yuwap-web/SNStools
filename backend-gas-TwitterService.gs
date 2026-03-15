/**
 * Twitter API Service
 *
 * Twitter API v2 を使用してアカウント情報と投稿を取得
 */

/**
 * Twitter 投稿を取得
 */
function getTwitterPosts(accessToken, limit = 3) {
  try {
    // まずユーザーID を取得
    const userUrl = 'https://api.twitter.com/2/users/me?user.fields=id';
    const userOptions = {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      muteHttpExceptions: true
    };

    const userResponse = UrlFetchApp.fetch(userUrl, userOptions);
    const userStatusCode = userResponse.getResponseCode();

    if (userStatusCode !== 200) {
      throw new Error(`Twitter User API Error: ${userStatusCode}`);
    }

    const userData = JSON.parse(userResponse.getContentText());
    if (!userData.data || !userData.data.id) {
      throw new Error('Failed to get user ID');
    }

    const userId = userData.data.id;

    // ツイート取得
    const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=${limit}&tweet.fields=public_metrics,created_at`;
    const tweetsOptions = {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      muteHttpExceptions: true
    };

    const tweetsResponse = UrlFetchApp.fetch(tweetsUrl, tweetsOptions);
    const tweetsStatusCode = tweetsResponse.getResponseCode();

    if (tweetsStatusCode !== 200) {
      throw new Error(`Twitter Tweets API Error: ${tweetsStatusCode}`);
    }

    const tweetsData = JSON.parse(tweetsResponse.getContentText());

    if (tweetsData.data) {
      return tweetsData.data.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0
      }));
    } else {
      return [];
    }
  } catch (error) {
    logError('Twitter Posts Error', error.toString());
    return [];
  }
}

/**
 * Twitter ユーザー情報を取得
 */
function getTwitterUserInfo(accessToken) {
  const url = 'https://api.twitter.com/2/users/me?user.fields=public_metrics';

  const options = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      throw new Error(`Twitter API Error: ${statusCode} ${response.getContentText()}`);
    }

    const result = JSON.parse(response.getContentText());

    if (result.data) {
      return {
        username: result.data.username,
        followers: result.data.public_metrics.followers_count,
        following: result.data.public_metrics.following_count,
        tweets: result.data.public_metrics.tweet_count,
        likeCount: result.data.public_metrics.like_count
      };
    } else {
      throw new Error('Invalid response from Twitter API');
    }
  } catch (error) {
    logError('Twitter API Error', error.toString());
    return null;
  }
}

/**
 * ツイート投稿（オプション、フェーズ2）
 */
function postTweet(accessToken, content) {
  const url = 'https://api.twitter.com/2/tweets';

  const payload = {
    text: content
  };

  const options = {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (result.data) {
      return {
        success: true,
        tweetId: result.data.id,
        text: result.data.text
      };
    } else {
      throw new Error('Failed to post tweet');
    }
  } catch (error) {
    logError('Tweet Post Error', error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
