import { describe, expect, test } from 'bun:test'
import type { LlmFinding } from '@code-whiskers/whiskers-domain'
import { buildFileManifest, groundFindings } from './grounding'

const DIFF = `diff --git a/src/scan.ts b/src/scan.ts
index 1111111..2222222 100644
--- a/src/scan.ts
+++ b/src/scan.ts
@@ -1,3 +1,4 @@
 const reactions = await list()
-const login = reactions[0].user
+for (const reaction of reactions) {
+  if (await isTrusted(reaction.user.login)) return reaction.user.login
 }
diff --git a/README.md b/README.md
new file mode 100644
--- /dev/null
+++ b/README.md
@@ -0,0 +1 @@
+# Hello
`

function finding(file: string, evidence: string): LlmFinding {
  return {
    file,
    line: 3,
    severity: 'high',
    category: 'security',
    title: 't',
    body: '',
    suggestion: null,
    evidence,
  }
}

describe('groundFindings', () => {
  test('keeps a finding that quotes a new-side line of its own file', () => {
    const result = groundFindings(
      [
        finding(
          'src/scan.ts',
          '  if (await isTrusted(reaction.user.login))  return reaction.user.login',
        ),
      ],
      DIFF,
    )
    expect(result.kept).toHaveLength(1)
  })

  test('drops findings on files outside the slice, and ones whose quote is not there', () => {
    const result = groundFindings(
      [
        finding('src/other.ts', 'anything'),
        finding('src/scan.ts', 'const login = reactions[0].user'),
        finding('src/scan.ts', ''),
        finding('src/scan.ts', 'db.delete(users) }'),
      ],
      DIFF,
    )
    expect(result.kept).toHaveLength(0)
    expect(result.outsideSlice).toBe(1)
    expect(result.unquoted).toBe(3)
  })
})

describe('buildFileManifest', () => {
  test('lists every file with what happened to it', () => {
    const manifest = buildFileManifest(DIFF)
    expect(manifest).toContain('(2)')
    expect(manifest).toContain('- src/scan.ts (+2 −1)')
    expect(manifest).toContain('- README.md (added)')
  })

  test('says nothing for an empty diff', () => {
    expect(buildFileManifest('')).toBe('')
  })
})
