// Every git subprocess gets a deadline — a hung clone must not pin an in-flight slot.
export const GIT_TIMEOUT_MS = 180_000
