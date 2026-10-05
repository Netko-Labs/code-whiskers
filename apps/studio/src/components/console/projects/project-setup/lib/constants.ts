export const SETUP_STEPS = [
  { id: 'platform', title: 'Platform', hint: 'What sends the errors' },
  { id: 'install', title: 'Install', hint: 'The SDK, with your DSN in it' },
  { id: 'verify', title: 'Verify', hint: 'Watch the first event land' },
] as const
