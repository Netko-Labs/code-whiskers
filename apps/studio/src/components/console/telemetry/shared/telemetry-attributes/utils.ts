/** Attributes worth a glance, sorted, with structured values as compact JSON. */
export function attributeEntries(attributes: Record<string, unknown>): [string, string][] {
  return Object.entries(attributes)
    .map(([key, value]): [string, string] => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    ])
    .sort(([a], [b]) => a.localeCompare(b))
}
