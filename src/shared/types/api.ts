export interface UserRead {
  id: number
  email: string
  username: string
  avatar: string
  scopes: string[]
}

export interface PlayGameSet {
  id: number
  name: string
  daily: boolean
  miss_count: number | null
  start_time: string | null
  end_time: string | null
}

export interface WordRead {
  id: number
  word: string
}

export interface WordsetRead {
  id: number
  category: string
  difficulty: number
  words: WordRead[]
}

export interface GameStatus {
  game_name: string
  start_time: string
  end_time: string | null
  words_remaining: string[]
  wordsets_completed: WordsetRead[]
  miss_count: number
  turn_count: number
}

export interface PlayResult {
  game_id: number
  game_status: GameStatus
  result_message: string | null
}

export interface GameSetRead {
  id: number
  date: string
  daily_date: string | null
  name: string
  wordsets: WordsetRead[]
}

export interface GameSetWrite {
  name: string
  daily_date: string | null
  date?: string
  wordsets: number[]
}

export interface WordsetWrite {
  category: string
  difficulty: number
  words: string[]
}

export interface UserWrite {
  email: string
  username: string
  password: string
  scopes?: string
}

export interface ApiValidationError {
  detail?: Array<{
    loc: Array<string | number>
    msg: string
    type: string
  }>
}

export interface AnnouncementRead {
  id: number
  user_id: number | null
  announced_at: string
  content: string
}
