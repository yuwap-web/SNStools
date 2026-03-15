// SNS Account Information
export interface SNSAccount {
  platform: 'Twitter' | 'Instagram' | 'Facebook'
  accountName: string
  followers: number
  lastUpdated: string
}

// SNS Post/Media
export interface SNSPost {
  id: string
  text?: string // Twitter, Facebook
  caption?: string // Instagram
  message?: string // Facebook
  createdAt: string
  timestamp?: string // Instagram, Facebook
  likes: number
  comments?: number
  retweets?: number // Twitter
  replies?: number // Twitter
  shares?: number // Facebook
  type?: string // Instagram, Facebook
}

// Operation Log
export interface OperationLog {
  timestamp: string
  action: string
  status: 'success' | 'failed'
  error: string
}

// API Response
export interface AccountsResponse {
  accounts: SNSAccount[]
}

export interface LogsResponse {
  logs: OperationLog[]
}

export interface PostsResponse {
  posts: SNSPost[]
}

export interface SaveKeyResponse {
  success: boolean
  error?: string
}
