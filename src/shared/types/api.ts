export interface UserRead {
  id: number
  email: string
  username: string
  scopes: string[]
}

export interface PlayGameSet {
  id: number
  name: string
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
  start_time: string
  end_time: string | null
  words_remaining: string[]
  wordsets_completed: WordsetRead[]
  turn_count: number
}

export interface PlayResult {
  game_id: number
  game_status: GameStatus
  result_message: string | null
}

export interface ApiValidationError {
  detail?: Array<{
    loc: Array<string | number>
    msg: string
    type: string
  }>
}
