export type CheckoutDir = {
  dir: string
  root: string
  destroy(): Promise<void>
}

export type OutputTail = {
  push(text: string): void
  text(): string
}
