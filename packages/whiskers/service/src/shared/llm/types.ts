export type TokenTally = {
  calls: number
  input: number
  cachedInput: number
  output: number
  reasoning: number
  turns: number
  costUsd: number
}

export type TokenSpend = Partial<Omit<TokenTally, 'calls'>>
