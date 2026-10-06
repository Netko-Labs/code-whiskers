export interface GitOptions {
  authToken?: string
  noSymlinks?: boolean
}

export interface ExecResult {
  code: number
  stdout: string
  stderr: string
}
