export function parseWordsInput(raw: string): string[] {
  return raw
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word.length > 0)
}
