import { readFromStudio } from './studio-client'

export interface ReviewRule {
  body: string
  scope: string
  effect: 'blocker' | 'suggestion' | 'filter' | 'tone'
}

/** The team's standing instructions for the installation this repository belongs to. */
export async function fetchRules(repo: string): Promise<ReviewRule[]> {
  const { value } = await readFromStudio<ReviewRule[]>('rules', { repo }, [])
  return value
}

/** A rule scoped to src/billing/** has nothing to say about a PR that never touches billing. */
export function rulesForFiles(rules: ReviewRule[], files: string[]): ReviewRule[] {
  return rules.filter((rule) => {
    if (rule.scope === '**' || rule.scope === '*') return true
    const glob = new Bun.Glob(rule.scope)
    return files.some((file) => glob.match(file))
  })
}

const RULES_BUDGET_CHARS = 1_400
const EFFECT_INSTRUCTION: Record<ReviewRule['effect'], string> = {
  blocker: 'a violation is a high-severity finding',
  suggestion: 'a violation is a low or medium finding',
  filter: 'never report this',
  tone: 'how to write findings',
}

/**
 * Rules ride ahead of the PR context with their own budget: trimming history to fit must never
 * drop an instruction the team wrote on purpose.
 */
export function buildRulesContext(rules: ReviewRule[]): string {
  if (rules.length === 0) return ''
  const lines: string[] = []
  let used = 0
  for (const rule of rules) {
    const where = rule.scope === '**' || rule.scope === '*' ? 'everywhere' : `in ${rule.scope}`
    const line = `- (${rule.effect}, ${where}; ${EFFECT_INSTRUCTION[rule.effect]}) ${rule.body.replace(/\s+/g, ' ').trim()}`
    if (used + line.length > RULES_BUDGET_CHARS) break
    lines.push(line)
    used += line.length
  }
  const dropped = rules.length - lines.length
  const more = dropped > 0 ? `\n- …${dropped} more rules did not fit` : ''
  return `## Team rules for this repository — follow them over your own defaults\n\n${lines.join('\n')}${more}`
}
