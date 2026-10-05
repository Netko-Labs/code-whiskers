import { describe, expect, test } from 'bun:test'
import type { RuleDraft, RuleEditorSearchInput } from './types'
import {
  draftFromTemplate,
  draftProblem,
  draftReducer,
  inputFromDraft,
  parseRuleEditorSearch,
  previewInputOf,
} from './utils'
import { EMPTY_DRAFT } from './values'

const draft = (overrides: Partial<RuleDraft> = {}): RuleDraft => ({
  ...EMPTY_DRAFT,
  installationId: 42,
  name: 'Checkout',
  ...overrides,
})

describe('draftReducer', () => {
  test('toggles projects and destinations in and out', () => {
    const once = draftReducer(draft(), { kind: 'toggle-project', projectId: '7' })
    expect(once.projectIds).toEqual(['7'])
    expect(draftReducer(once, { kind: 'toggle-project', projectId: '7' }).projectIds).toEqual([])
    expect(
      draftReducer(draft(), { kind: 'toggle-destination', destinationId: 'd1' }).destinationIds,
    ).toEqual(['d1'])
  })

  test('triggers follow the combination rule', () => {
    const both = draftReducer(draft(), { kind: 'toggle-trigger', trigger: 'issue_regressed' })
    expect(both.triggers).toEqual(['new_issue', 'issue_regressed'])
    expect(
      draftReducer(both, { kind: 'toggle-trigger', trigger: 'review_failed' }).triggers,
    ).toEqual(['review_failed'])
  })
})

describe('draftProblem', () => {
  test('names the first thing stopping a save', () => {
    expect(draftProblem(draft({ name: '  ' }))).toBe('Name the rule')
    expect(draftProblem(draft({ installationId: null }))).toBe('Pick an installation')
    expect(draftProblem(draft({ threshold: 0 }))).toMatch(/threshold/)
    expect(draftProblem(draft({ notifyAll: false }))).toBe('Pick at least one destination')
    expect(draftProblem(draft())).toBeNull()
  })
})

describe('inputFromDraft', () => {
  test('blank filters become null; chosen destinations drop when notifying all', () => {
    expect(
      inputFromDraft(draft({ environment: ' ', release: '', destinationIds: ['d1'] })),
    ).toMatchObject({ environment: null, release: null, notifyAll: true, destinationIds: [] })
  })

  test('nothing while the draft is incomplete', () => {
    expect(inputFromDraft(draft({ windowMinutes: 0 }))).toBeNull()
  })
})

describe('previewInputOf', () => {
  test('counts the condition only: unnamed and unrouted drafts still preview', () => {
    const input = previewInputOf(draft({ name: '', notifyAll: false, destinationIds: [] }))
    expect(input).toMatchObject({ name: '', notifyAll: true, destinationIds: [] })
  })

  test('renaming does not change the preview key', () => {
    expect(previewInputOf(draft({ name: 'a' }))).toEqual(previewInputOf(draft({ name: 'b' })))
  })
})

describe('templates and search', () => {
  test('a template prefills the spike rule', () => {
    expect(draftFromTemplate('spike')).toMatchObject({
      triggers: ['issue_frequency'],
      threshold: 100,
      windowMinutes: 60,
    })
    expect(draftFromTemplate(undefined)).toEqual(EMPTY_DRAFT)
  })

  test('unknown templates are dropped from the URL', () => {
    const search = (template: string) => ({ template }) as RuleEditorSearchInput
    expect(parseRuleEditorSearch(search('regressions'))).toEqual({ template: 'regressions' })
    expect(parseRuleEditorSearch(search('nope'))).toEqual({})
  })
})
