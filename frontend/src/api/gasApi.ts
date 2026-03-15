import type { SNSAccount, OperationLog, SaveKeyResponse, SNSPost } from '../types'

const GAS_URL = import.meta.env.VITE_GAS_URL

/**
 * Get all SNS accounts information from GAS
 */
export async function getAccountsInfo(): Promise<SNSAccount[]> {
  try {
    const url = `${GAS_URL}?action=accounts`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.accounts || []
  } catch (error) {
    console.error('Failed to fetch accounts:', error)
    throw error
  }
}

/**
 * Get operation logs from GAS
 */
export async function getLogs(limit: number = 20): Promise<OperationLog[]> {
  try {
    const url = `${GAS_URL}?action=logs&limit=${limit}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.logs || []
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    throw error
  }
}

/**
 * Save or update API key for a platform
 */
export async function saveApiKey(
  platform: string,
  apiKey: string,
  apiSecret?: string
): Promise<SaveKeyResponse> {
  try {
    const payload = {
      action: 'saveApiKey',
      platform,
      apiKey,
      apiSecret: apiSecret || ''
    }

    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to save API key:', error)
    throw error
  }
}

/**
 * Get recent posts for a specific platform
 */
export async function getPostsByPlatform(
  platform: string,
  limit: number = 3
): Promise<SNSPost[]> {
  try {
    const url = `${GAS_URL}?action=posts&platform=${encodeURIComponent(platform)}&limit=${limit}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.posts || []
  } catch (error) {
    console.error(`Failed to fetch ${platform} posts:`, error)
    throw error
  }
}
