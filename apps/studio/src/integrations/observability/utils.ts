/** A response the server sent, so the server's own error hook already saw what went wrong. */
export class ResponseError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ResponseError'
  }
}

/** Keeps what never got an answer: network failures, schema drift, render bugs. */
export const isReportableQueryError = (error: unknown): boolean => !(error instanceof ResponseError)
